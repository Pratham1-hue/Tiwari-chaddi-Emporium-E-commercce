import { NextResponse } from 'next/server';
import { connectDB, Order } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import { normalizeOrder } from '@/lib/orders';

export async function GET(request, { params }) {
  try {
    const user = await requireUser(request);
    if (!user) return NextResponse.json({ success: false, message: 'Please log in.' }, { status: 401 });
    const { id } = await params;
    await connectDB();
    const order = await Order.findById(id).lean();
    if (!order) return NextResponse.json({ success: false, message: 'Order not found.' }, { status: 404 });
    const mine = String(order.userId) === String(user._id);
    if (!mine && user.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Not your order.' }, { status: 403 });
    }
    return NextResponse.json({ success: true, order: normalizeOrder(order) });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
