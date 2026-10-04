import mongoose from 'mongoose';

const MONGO_URI =
  process.env.MONGODB_URI ||
  'mongodb+srv://pratham:eGZfJsHDLgeWjnen@cluster0.nntkpvd.mongodb.net/chaddi_emporium?retryWrites=true&w=majority&appName=Cluster0';

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGO_URI, { bufferCommands: false }).then((m) => m);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

// ---------- Product ----------
const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    price: { type: Number, required: true },
    mrp: Number,
    stock: { type: Number, default: 50 },
    category: { type: String, default: 'Other' },
    description: String,
    rating: { type: Number, default: 4.2 },
    reviews: { type: Number, default: 0 },
    badge: String,
    emoji: { type: String, default: '🎽' },
    sizes: { type: [String], default: ['S', 'M', 'L', 'XL', 'XXL'] },
    fabric: { type: String, default: '100% combed cotton' },
  },
  { timestamps: true }
);
export const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

// ---------- User ----------
const addressSchema = new mongoose.Schema(
  {
    label: { type: String, default: 'Home' },
    fullName: String,
    phone: String,
    line1: String,
    line2: String,
    city: String,
    state: String,
    pincode: String,
  },
  { _id: true }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
    addresses: { type: [addressSchema], default: [] },
  },
  { timestamps: true }
);
export const User = mongoose.models.User || mongoose.model('User', userSchema);

// ---------- Order ----------
const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String,
    emoji: String,
    size: { type: String, default: 'M' },
    quantity: Number,
    priceAtPurchase: Number,
  },
  { _id: false }
);

const statusHistorySchema = new mongoose.Schema(
  {
    status: String,
    at: { type: Date, default: Date.now },
    note: String,
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    userEmail: String,
    items: { type: [orderItemSchema], default: [] },
    subtotal: Number,
    shipping: { type: Number, default: 0 },
    totalAmount: Number,
    address: { type: Object, default: {} },
    pincode: String,
    etaDays: { type: Number, default: 4 },
    payment: {
      method: { type: String, enum: ['UPI', 'CARD', 'COD'], default: 'UPI' },
      transactionId: String,
      status: { type: String, enum: ['SUCCESS', 'PENDING', 'FAILED'], default: 'SUCCESS' },
      last4: String,
    },
    status: {
      type: String,
      enum: ['PLACED', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'RETURN_REQUESTED', 'RETURNED'],
      default: 'PLACED',
    },
    statusHistory: { type: [statusHistorySchema], default: [] },
    returnReason: String,
  },
  { timestamps: true }
);
export const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

// ---------- Review ----------
const reviewSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userName: String,
    rating: { type: Number, min: 1, max: 5, required: true },
    title: String,
    comment: String,
  },
  { timestamps: true }
);
reviewSchema.index({ productId: 1, userId: 1 }, { unique: true });
export const Review = mongoose.models.Review || mongoose.model('Review', reviewSchema);

export { mongoose };
