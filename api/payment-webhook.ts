
// This serverless function handles the automated callback (webhook) from Nedarim Plus.
// It verifies the transaction and updates the order status in the database.
import { MongoClient, Db, ObjectId } from 'mongodb';

interface NedarimWebhookPayload {
    SaleId: string; // This is OUR order ID
    ResultCode: number; // 0 for success
    ResultMessage: string;
    ConfirmationCode: string; // Credit card company's approval code
    NdsSaleId: string; // Nedarim Plus's internal ID
    Amount: number;
    // ... other fields from Nedarim Plus we might not need to store
}

let cachedDb: Db | null = null;

async function connectToDatabase() {
  if (cachedDb) return cachedDb;

  const uri = process.env.MONGO_URI;
  const dbName = process.env.MONGO_DB_NAME;

  if (!uri || !dbName) {
    throw new Error('Database environment variables are not configured.');
  }

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);
  cachedDb = db;
  return db;
}

// Function to verify the transaction by calling back to Nedarim Plus API
async function verifyTransaction(saleId: string): Promise<any> {
    const { NEDARIM_API_NAME, NEDARIM_API_PASSWORD } = process.env;
    if (!NEDARIM_API_NAME || !NEDARIM_API_PASSWORD) {
        throw new Error("Nedarim Plus API credentials are not set on the server.");
    }

    const response = await fetch('https://www.matara.pro/nedarimplus/V6/GetSaleById', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            ApiName: NEDARIM_API_NAME,
            ApiPassword: NEDARIM_API_PASSWORD,
            SaleId: saleId,
        }),
    });

    if (!response.ok) {
        throw new Error(`Verification failed: API responded with status ${response.status}`);
    }

    return response.json();
}


export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const payload: NedarimWebhookPayload = await req.json();
    const orderId = payload.SaleId;

    // SECURITY: Validate the received Order ID before processing.
    if (!orderId || !ObjectId.isValid(orderId)) {
        console.warn(`Webhook received with invalid or missing SaleId: ${orderId}`);
        return new Response('Bad Request: Invalid or missing SaleId', { status: 400 });
    }
    
    // SECURITY: Verify the transaction details with Nedarim Plus directly
    const verifiedData = await verifyTransaction(orderId);

    if (verifiedData.SaleId !== orderId) {
        console.error(`Webhook validation failed: ID mismatch. Webhook: ${orderId}, API: ${verifiedData.SaleId}`);
        return new Response('Unauthorized: ID mismatch', { status: 401 });
    }

    const db = await connectToDatabase();
    const ordersCollection = db.collection('orders');

    const filter = { _id: new ObjectId(orderId), status: 'pending' };
    
    let updateDoc;
    // Check the verified result code from the direct API call
    if (verifiedData.ResultCode === 0) {
        // Payment successful
        updateDoc = {
            $set: {
                status: 'completed' as const,
                providerTransactionId: verifiedData.NdsSaleId,
                providerConfirmationCode: verifiedData.ConfirmationCode,
            },
        };
    } else {
        // Payment failed
        updateDoc = {
            $set: {
                status: 'failed' as const,
                providerTransactionId: verifiedData.NdsSaleId,
            },
        };
    }
    
    const result = await ordersCollection.updateOne(filter, updateDoc);

    if (result.matchedCount === 0) {
        console.warn(`Webhook for order ${orderId} received, but no matching pending order was found. It might already be processed.`);
    }

    // Respond to Nedarim Plus that we have received the webhook.
    return new Response('OK', { status: 200 });

  } catch (error) {
    console.error('Webhook handler error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown webhook error';
    // We should still return 200 to Nedarim Plus to prevent retries, while logging the error.
    return new Response(`Error processing webhook: ${errorMessage}`, { status: 200 });
  }
}
