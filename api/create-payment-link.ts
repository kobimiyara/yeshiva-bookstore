
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { connectToDatabase } from './lib/mongodb.js';


// Define the expected structure from the frontend
interface RequestPayload {
  studentName: string;
  cart: { id: number; title: string; price: number; }[];
  total: number;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  let step = 'initializing';
  try {
    const { NEDARIM_API_NAME, NEDARIM_API_PASSWORD } = process.env;
    if (!NEDARIM_API_NAME || !NEDARIM_API_PASSWORD) {
      console.error("Nedarim Plus API credentials are not set on the server.");
      return res.status(500).json({ message: 'Payment provider is not configured.' });
    }

    step = 'parsing-request-body';
    const { studentName, cart, total }: RequestPayload = req.body;

    step = 'validating-order-data';
    if (!studentName || !cart || cart.length === 0 || total <= 0) {
      return res.status(400).json({ message: 'Invalid order data.' });
    }

    step = 'connecting-to-database';
    const db = await connectToDatabase();
    const ordersCollection = db.collection('orders');

    // 1. Create a 'pending' order in our database first
    step = 'inserting-order-to-db';
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
    
    // 2. Prepare the request for Nedarim Plus API
    step = 'preparing-nedarim-payload';
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const host = req.headers['host'];
    if (!host) {
      throw new Error("Could not determine the host from request headers.");
    }
    const baseUrl = `${protocol}://${host}`;
    
    const nedarimPayload = {
      ApiName: NEDARIM_API_NAME,
      ApiPassword: NEDARIM_API_PASSWORD,
      Amount: total,
      Currency: 1, // Add currency: 1 for ILS (Shekel)
      SaleId: orderId, // Use our MongoDB order ID as their SaleId
      PaymentSuccessRedirectUrl: `${baseUrl}/payment/success`,
      PaymentFailedRedirectUrl: `${baseUrl}/payment/failure`,
      CallBackUrl: `${baseUrl}/api/payment-webhook`,
      FullName: studentName,
      SaleDesc: `רכישת ספרים עבור ${studentName}`, // Add a description
      PayWhatYouWant: false,
    };
    
    // 3. Call Nedarim Plus to get a payment link
    step = 'calling-nedarim-api';
    // FIX: Changed endpoint from CreateSaleLink to CreateSale as per API documentation
    const apiResponse = await fetch('https://www.matara.pro/nedarimplus/V6/CreateSale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nedarimPayload)
    });

    // Improved error handling: Read as text first to avoid JSON parse error on HTML responses.
    const responseText = await apiResponse.text();
    let responseData;
    
    try {
      responseData = JSON.parse(responseText);
    } catch (parseError) {
      console.error("Nedarim Plus API response was not valid JSON. Status:", apiResponse.status);
      console.error("Response Body:", responseText);
      // This more specific error will be surfaced to the user instead of "Internal Server Error"
      throw new Error("The payment provider returned an invalid response.");
    }

    // Check for API-level errors indicated in the JSON response
    if (responseData.ResultCode !== 0) {
        console.error("Nedarim Plus Error:", responseData.ResultMessage);
        throw new Error(`Failed to create payment link: ${responseData.ResultMessage}`);
    }
    
    if (!responseData.SaleLink) {
        console.error("Nedarim Plus response missing SaleLink:", responseData);
        throw new Error("Payment provider response was successful but did not include a payment link.");
    }

    // 4. Return the sale link to the frontend
    step = 'returning-sale-link';
    return res.status(200).json({ saleLink: responseData.SaleLink });

  } catch (error) {
    console.error(`Error at step [${step}]:`, error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    // Return the specific error message to the frontend.
    return res.status(500).json({ message: errorMessage });
  }
}
