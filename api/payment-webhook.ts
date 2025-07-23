
// This serverless function handles the automated callback (webhook) from Nedarim Plus.
// It verifies the transaction and updates the order status in the database.
import { ObjectId } from 'mongodb';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectToDatabase } from './lib/mongodb.js';
import type { Order } from '../types.js';

interface NedarimWebhookPayload {
    SaleId: string; // This is OUR order ID
    ResultCode: number; // 0 for success
    ResultMessage: string;
    ConfirmationCode: string; // Credit card company's approval code
    NdsSaleId: string; // Nedarim Plus's internal ID
    Amount: number;
    // ... other fields from Nedarim Plus we might not need to store
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).send('Method Not Allowed');
  }

  try {
    const payload: NedarimWebhookPayload = req.body;
    const orderId = payload.SaleId;

    // SECURITY: Validate the received Order ID before processing.
    if (!orderId || !ObjectId.isValid(orderId)) {
        console.warn(`Webhook received with invalid or missing SaleId: ${orderId}`);
        return res.status(400).send('Bad Request: Invalid or missing SaleId');
    }
    
    const db = await connectToDatabase();
    const ordersCollection = db.collection<Order>('orders');

    const filter = { _id: new ObjectId(orderId), status: 'pending' as const };
    const order = await ordersCollection.findOne(filter);

    if (!order) {
        console.warn(`Webhook for order ${orderId} received, but no matching pending order was found. It might already be processed or never existed.`);
        // Return 200 to prevent Nedarim from retrying.
        return res.status(200).send('OK (Order not found or already processed)');
    }

    // SECURITY CHECK: Verify that the amount from the webhook matches the order total.
    if (order.total !== payload.Amount) {
        console.error(`SECURITY ALERT: Amount mismatch for order ${orderId}. DB total: ${order.total}, Webhook amount: ${payload.Amount}`);
        // Update status to 'failed' to indicate a problem.
        await ordersCollection.updateOne(filter, { $set: { status: 'failed', providerTransactionId: payload.NdsSaleId } });
        return res.status(400).send('Bad Request: Amount mismatch');
    }

    let updateDoc;
    if (payload.ResultCode === 0) {
        // Payment successful
        updateDoc = {
            $set: {
                status: 'completed' as const,
                providerTransactionId: payload.NdsSaleId,
                providerConfirmationCode: payload.ConfirmationCode,
            },
        };
    } else {
        // Payment failed
        updateDoc = {
            $set: {
                status: 'failed' as const,
                providerTransactionId: payload.NdsSaleId,
            },
        };
    }
    
    await ordersCollection.updateOne(filter, updateDoc);

    // Respond to Nedarim Plus that we have received the webhook.
    return res.status(200).send('OK');

  } catch (error) {
    console.error('Webhook handler error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown webhook error';
    // We should still return 200 to Nedarim Plus to prevent retries, while logging the error.
    return res.status(200).send(`Error processing webhook: ${errorMessage}`);
  }
}
