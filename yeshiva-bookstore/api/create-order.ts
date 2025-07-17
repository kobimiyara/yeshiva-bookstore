// This file is intended to be deployed as a serverless function, for example on Vercel.
// It requires the 'mongodb' package to be installed.
// Environment variables `MONGO_URI` and `MONGO_DB_NAME` must be configured in the deployment environment.

import { MongoClient, Db } from 'mongodb';

// Define the expected structure of the order data
interface OrderPayload {
  studentName: string;
  cart: { id: number; title:string; price: number; }[];
  total: number;
  paymentReference: string;
  receipt: {
    name: string;
    type: string;
    data: string; // base64 encoded string
  };
}

let cachedDb: Db | null = null;

// Function to connect to the database, reusing the connection if already established
async function connectToDatabase() {
  if (cachedDb) {
    return cachedDb;
  }
  const uri = process.env.MONGO_URI;
  const dbName = process.env.MONGO_DB_NAME;

  if (!uri) {
    throw new Error('Please define the MONGO_URI environment variable');
  }
   if (!dbName) {
    throw new Error('Please define the MONGO_DB_NAME environment variable');
  }

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);
  
  cachedDb = db;
  return db;
}

// The main serverless function handler
// Note: The function signature might need to be adapted based on the specific hosting provider (e.g., Vercel, Netlify).
// This is a generic example assuming a Request/Response-like interface.
export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ message: 'Method Not Allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', 'Allow': 'POST' },
    });
  }

  try {
    const orderData: OrderPayload = await req.json();

    // Basic validation
    if (!orderData.studentName || !orderData.cart || !orderData.paymentReference || !orderData.receipt) {
       return new Response(JSON.stringify({ message: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const db = await connectToDatabase();
    const collection = db.collection('orders');

    const result = await collection.insertOne({
      ...orderData,
      createdAt: new Date(),
    });

    return new Response(JSON.stringify({ success: true, orderId: result.insertedId }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Failed to create order:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(JSON.stringify({ message: 'Internal Server Error', error: errorMessage }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
