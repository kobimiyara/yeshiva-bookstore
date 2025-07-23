
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectToDatabase } from './lib/mongodb.js';
import { ObjectId } from 'mongodb';
import type { Order } from '../types.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { orderId } = req.query;

    if (typeof orderId !== 'string' || !ObjectId.isValid(orderId)) {
      return res.status(400).json({ message: 'A valid orderId is required.' });
    }

    const db = await connectToDatabase();
    const collection = db.collection<Order>('orders');

    // Find the order but only return the 'status' field for security and efficiency
    const order = await collection.findOne(
      { _id: new ObjectId(orderId) },
      { projection: { status: 1 } }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    return res.status(200).json({ status: order.status });

  } catch (error) {
    console.error('Failed to get order status:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return res.status(500).json({ message: 'Internal Server Error', error: errorMessage });
  }
}
