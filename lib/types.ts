export type Product = {
  _id: string;
  name: string;
  price: number;
  stock: number;
  mrp?: number;
  category?: string;
  description?: string;
  rating?: number;
  reviews?: number;
  badge?: string;
  emoji?: string;
  sizes?: string[];
  fabric?: string;
};

export type CartLine = { productId: string; size: string; quantity: number };
export type CartMap = Record<string, number>; // legacy qty by product id (no size)
export type CartKey = string; // `${productId}__${size}`

export type CartItemDetailed = {
  key: CartKey;
  productId: string;
  size: string;
  quantity: number;
};

export type Address = {
  _id?: string;
  label: string;
  fullName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
};

export type OrderItem = {
  productId: string;
  name: string;
  emoji?: string;
  size: string;
  quantity: number;
  priceAtPurchase: number;
};

export type OrderStatus =
  | 'PLACED'
  | 'PACKED'
  | 'SHIPPED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RETURN_REQUESTED'
  | 'RETURNED';

export type Order = {
  _id: string;
  userEmail?: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  totalAmount: number;
  address: Address;
  pincode: string;
  etaDays: number;
  payment: { method: 'UPI' | 'CARD' | 'COD'; transactionId: string; status: string; last4?: string };
  status: OrderStatus;
  statusHistory: { status: string; at: string; note?: string }[];
  returnReason?: string;
  createdAt: string;
};

export type Review = {
  _id: string;
  productId: string;
  userName: string;
  rating: number;
  title?: string;
  comment?: string;
  createdAt: string;
};

export type CardMessage = { success: boolean; text: string };

export type SessionUser = {
  _id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin';
  addresses: Address[];
};
