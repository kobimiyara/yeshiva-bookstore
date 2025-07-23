import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectToDatabase } from './lib/mongodb.js';
import { ObjectId } from 'mongodb';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { orderId, password } = req.body;
    
    // --- Authentication ---
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) throw new Error('ADMIN_PASSWORD is not set on the server.');
    if (password !== adminPassword) return res.status(401).json({ message: 'Unauthorized' });

    // --- Validation ---
    if (!orderId || !ObjectId.isValid(orderId)) {
        return res.status(400).json({ message: 'A valid orderId is required.' });
    }

    const db = await connectToDatabase();
    const collection = db.collection('orders');

    const deleteResult = await collection.deleteOne({ _id: new ObjectId(orderId) });

    if (deleteResult.deletedCount === 0) {
        return res.status(404).json({ message: 'Order not found or already deleted.' });
    }

    return res.status(200).json({ message: 'Order deleted successfully.' });

  } catch (error) {
    console.error('Failed to delete order:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return res.status(500).json({ message: 'Internal Server Error', error: errorMessage });
  }
}
