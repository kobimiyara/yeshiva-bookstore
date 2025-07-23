
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectToDatabase } from './lib/mongodb.js';
import { ObjectId } from 'mongodb';
import type { CartItem, Order } from '../types.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { orderId, bookId, password } = req.body;
    
    // --- Authentication ---
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) throw new Error('ADMIN_PASSWORD is not set on the server.');
    if (password !== adminPassword) return res.status(401).json({ message: 'Unauthorized' });

    // --- Validation ---
    if (!orderId || !ObjectId.isValid(orderId)) {
        return res.status(400).json({ message: 'A valid orderId is required.' });
    }
    if (typeof bookId !== 'number') {
        return res.status(400).json({ message: 'A valid bookId (number) is required.' });
    }

    const db = await connectToDatabase();
    const collection = db.collection<Order>('orders');

    const order = await collection.findOne({ _id: new ObjectId(orderId) });

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    const bookToRemove = order.cart.find((item: CartItem) => item.id === bookId);

    if (!bookToRemove) {
      return res.status(404).json({ message: 'Book not found in this order.' });
    }

    const newTotal = order.total - bookToRemove.price * bookToRemove.quantity;

    const updateResult = await collection.updateOne(
      { _id: new ObjectId(orderId) },
      {
        $pull: { cart: { id: bookId } },
        $set: { total: newTotal < 0 ? 0 : newTotal }
      }
    );

    if (updateResult.modifiedCount === 0) {
        return res.status(404).json({ message: 'Could not update the order.' });
    }

    const updatedOrder = await collection.findOne({ _id: new ObjectId(orderId) });

    return res.status(200).json({ message: 'Book removed successfully.', updatedOrder });

  } catch (error) {
    console.error('Failed to delete book from order:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return res.status(500).json({ message: 'Internal Server Error', error: errorMessage });
  }
}
