import { ObjectId } from 'mongodb';

export interface Book {
  id: number;
  title: string;
  author: string;
  price: number;
  groupId?: string;
}

export interface CartItem extends Book {
  quantity: number;
}

export interface Order {
  _id?: string | ObjectId; // Allow both for backend (ObjectId) and frontend (string). Made optional.
  studentName: string;
  cart: CartItem[];
  total: number;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string | Date; // Allow both for backend (Date) and frontend (string)
  
  // Nedarim Plus specific fields
  paymentProvider?: 'NedarimPlus';
  providerTransactionId?: string; // Nedarim Plus's own ID for the sale
  providerConfirmationCode?: string; // The approval code from the credit card company
}

export interface BookSummary {
  id: number;
  title: string;
  author: string;
  quantity: number;
  totalRevenue: number;
}