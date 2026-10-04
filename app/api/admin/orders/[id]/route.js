import { NextResponse } from 'next/server';
import { connectDB, Order } from '@/lib/db';
import { requireUser } from '@/lib/auth';

const ALLOWED = ['PLACED', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'RETURN_REQUESTED', 'RETURNED'];

export async function PATCH(request, { params }) {
  try {
    const user = await requireUser(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Admin access required.' }, { status: 403 });
    }
    const { status, note } = await request.json();
    if (!ALLOWED.includes(status)) {
      return NextResponse.json({ success: false, message: 'Invalid status.' }, { status: 400 });
    }
    const { id } = await params;
    await connectDB();
    const order = await Order.findById(id);
    if (!order) return NextResponse.json({ success: false, message: 'Order not found.' }, { status: 404 });
    order.status = status;
    if (!Array.isArray(order.statusHistory)) order.statusHistory = [];
    order.statusHistory.push({ status, at: new Date(), note: note || `Updated by ${user.email}` });
    await order.save();
    return NextResponse.json({ success: true, order });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
