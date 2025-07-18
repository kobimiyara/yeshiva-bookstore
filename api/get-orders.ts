// This file is intended to be deployed as a serverless function.
// It requires environment variables `MONGO_URI`, `MONGO_DB_NAME`, and `ADMIN_PASSWORD`.

import { MongoClient, Db } from 'mongodb';

let cachedDb: Db | null = null;

async function connectToDatabase() {
  if (cachedDb) {
    return cachedDb;
  }
  const uri = process.env.MONGO_URI;
  const dbName = process.env.MONGO_DB_NAME;

  if (!uri || !dbName) {
    throw new Error('Please define the MONGO_URI and MONGO_DB_NAME environment variables');
  }

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);
  
  cachedDb = db;
  return db;
}

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ message: 'Method Not Allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', 'Allow': 'POST' },
    });
  }

  try {
    const { password } = await req.json();
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      throw new Error('ADMIN_PASSWORD environment variable is not set on the server.');
    }

    if (password !== adminPassword) {
      return new Response(JSON.stringify({ message: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const db = await connectToDatabase();
    const collection = db.collection('orders');

    // Fetch all orders, sort by creation date descending
    const orders = await collection.find({}).sort({ createdAt: -1 }).toArray();

    return new Response(JSON.stringify(orders), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Failed to get orders:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(JSON.stringify({ message: 'Internal Server Error', error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}