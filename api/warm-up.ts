// api/warm-up.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectToDatabase } from './lib/mongodb.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    // The sole purpose of this endpoint is to "warm up" the serverless function
    // and the database connection pool.
    await connectToDatabase();
    return res.status(200).json({ message: 'המערכת אותחלה ומוכנה לפעולה.' });
  } catch (error) {
    console.error('Warm-up failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return res.status(500).json({ message: 'Internal Server Error', error: errorMessage });
  }
}
