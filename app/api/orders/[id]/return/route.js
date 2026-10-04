import { NextResponse } from 'next/server';
import { connectDB, Order } from '@/lib/db';
import { requireUser } from '@/lib/auth';

export async function POST(request, { params }) {
  try {
    const user = await requireUser(request);
    if (!user) return NextResponse.json({ success: false, message: 'Please log in.' }, { status: 401 });
    const { reason } = await request.json();
    if (!reason?.trim()) {
      return NextResponse.json({ success: false, message: 'Please tell us the return reason.' }, { status: 400 });
    }
    const { id } = await params;
    await connectDB();
    const order = await Order.findById(id);
    if (!order) return NextResponse.json({ success: false, message: 'Order not found.' }, { status: 404 });
    if (String(order.userId) !== String(user._id) && user.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Not your order.' }, { status: 403 });
    }
    if (!['DELIVERED', 'SHIPPED', 'OUT_FOR_DELIVERY'].includes(order.status)) {
      return NextResponse.json({ success: false, message: `Returns can only be requested after dispatch. Current status: ${order.status}.` }, { status: 400 });
    }
    order.status = 'RETURN_REQUESTED';
    order.returnReason = reason.trim();
    if (!Array.isArray(order.statusHistory)) order.statusHistory = [];
    order.statusHistory.push({ status: 'RETURN_REQUESTED', at: new Date(), note: reason.trim() });
    await order.save();
    return NextResponse.json({ success: true, message: 'Return requested. Our team will arrange a pickup in 2–3 days.', order });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
