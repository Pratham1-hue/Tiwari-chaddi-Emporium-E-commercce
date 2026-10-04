import { NextResponse } from 'next/server';
import { connectDB, Order } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import { normalizeOrders } from '@/lib/orders';

// Past orders for the logged-in user
export async function GET(request) {
  try {
    const user = await requireUser(request);
    if (!user) return NextResponse.json({ success: false, message: 'Please log in to view orders.' }, { status: 401 });
    await connectDB();
    const orders = await Order.find({ userId: user._id }).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, orders: normalizeOrders(orders) });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
