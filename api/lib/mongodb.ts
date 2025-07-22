
// /api/lib/mongodb.ts
import { MongoClient, Db } from 'mongodb';

/**
 * A global instance of the database connection.
 * Caching the connection across function invocations is a performance optimization
 * for serverless environments like Vercel, as it avoids reconnecting on every request.
 */
let cachedDb: Db | null = null;

/**
 * Connects to the MongoDB database.
 * It uses a cached connection if one is already available.
 * @returns {Promise<Db>} A promise that resolves to the database instance.
 * @throws {Error} If environment variables `MONGO_URI` or `MONGO_DB_NAME` are not set.
 */
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