// /api/lib/mongodb.ts
import { MongoClient, Db } from 'mongodb';

let cachedDb: Db | null = null;

export async function connectToDatabase(): Promise<Db> {
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
  
  // Validation to prevent "Invalid namespace" error from MongoDB.
  if (dbName.includes(' ')) {
      throw new Error('MongoDB database name cannot contain spaces. Please update the MONGO_DB_NAME environment variable.');
  }

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);

  cachedDb = db;
  return db;
}
