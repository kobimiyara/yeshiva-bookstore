
import { MongoClient, Db } from 'mongodb';

// Define the expected structure from the frontend
interface RequestPayload {
  studentName: string;
  cart: { id: number; title: string; price: number; }[];
  total: number;
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

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ message: 'Method Not Allowed' }), { status: 405 });
  }

  let step = 'initializing';
  try {
    const { NEDARIM_API_NAME, NEDARIM_API_PASSWORD } = process.env;
    if (!NEDARIM_API_NAME || !NEDARIM_API_PASSWORD) {
      console.error("Nedarim Plus API credentials are not set on the server.");
      return new Response(JSON.stringify({ message: 'Payment provider is not configured.' }), { status: 500 });
    }

    step = 'parsing-request-body';
    const { studentName, cart, total }: RequestPayload = await req.json();

    step = 'validating-order-data';
    if (!studentName || !cart || cart.length === 0 || total <= 0) {
      return new Response(JSON.stringify({ message: 'Invalid order data.' }), { status: 400 });
    }

    step = 'connecting-to-database';
    const db = await connectToDatabase();
    const ordersCollection = db.collection('orders');

    // 1. Create a 'pending' order in our database first
    step = 'inserting-order-to-db';
    const newOrder = {
      studentName,
      cart,
      total,
      status: 'pending' as const,
      createdAt: new Date(),
      paymentProvider: 'NedarimPlus' as const,
    };
    const insertResult = await ordersCollection.insertOne(newOrder);
    const orderId = insertResult.insertedId.toString();
    
    // 2. Prepare the request for Nedarim Plus API
    step = 'preparing-nedarim-payload';
    const baseUrl = new URL(req.url).origin;
    
    const nedarimPayload = {
      ApiName: NEDARIM_API_NAME,
      ApiPassword: NEDARIM_API_PASSWORD,
      Amount: total,
      SaleId: orderId, // Use our MongoDB order ID as their SaleId
      PaymentSuccessRedirectUrl: `${baseUrl}/payment/success`,
      PaymentFailedRedirectUrl: `${baseUrl}/payment/failure`,
      CallBackUrl: `${baseUrl}/api/payment-webhook`,
      FullName: studentName,
      PayWhatYouWant: false,
    };
    
    // 3. Call Nedarim Plus to get a payment link
    step = 'calling-nedarim-api';
    const apiResponse = await fetch('https://www.matara.pro/nedarimplus/V6/CreateSaleLink', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nedarimPayload)
    });

    if (!apiResponse.ok) {
        throw new Error(`Nedarim Plus API responded with status ${apiResponse.status}`);
    }

    const responseData = await apiResponse.json();

    if (responseData.ResultCode !== 0) {
        console.error("Nedarim Plus Error:", responseData.ResultMessage);
        throw new Error(`Failed to create payment link: ${responseData.ResultMessage}`);
    }

    // 4. Return the sale link to the frontend
    step = 'returning-sale-link';
    return new Response(JSON.stringify({ saleLink: responseData.SaleLink }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error(`Error at step [${step}]:`, error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(JSON.stringify({ message: 'Internal Server Error', error: errorMessage }), { status: 500 });
  }
}
