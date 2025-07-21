
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
  _id: string; // From MongoDB
  studentName: string;
  cart: CartItem[];
  total: number;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string; // ISO Date string
  
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
