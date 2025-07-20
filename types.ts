
export interface Book {
  id: number;
  title: string;
  author: string;
  price: number;
}

export interface CartItem extends Book {
  quantity: number;
}

export interface Order {
  _id: string;
  studentName: string;
  cart: CartItem[];
  total: number;
  paymentReference: string;
  receipt: {
    name: string;
    type: string;
    data: string; // base64
  };
  createdAt: string; // ISO Date string
}