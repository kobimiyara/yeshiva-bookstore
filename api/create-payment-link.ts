import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectToDatabase } from './lib/mongodb.js';
import type { Order, CartItem } from '../types.js';

interface RequestPayload {
  studentName: string;
  cart: CartItem[];
  total: number;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  let step = 'initializing';
  try {
    step = 'parsing-request-body';
    const { studentName, cart, total }: RequestPayload = req.body;

    step = 'validating-order-data';
    if (!studentName || !cart || cart.length === 0 || total <= 0) {
      return res.status(400).json({ message: 'Invalid order data.' });
    }

    step = 'connecting-to-database';
    const db = await connectToDatabase();
    const ordersCollection = db.collection<Order>('orders');

    step = 'inserting-pending-order-to-db';
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
    
    step = 'returning-order-id';
    return res.status(200).json({ orderId });

  } catch (error) {
    console.error(`Error at step [${step}]:`, error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return res.status(500).json({ message: errorMessage });
  }
}