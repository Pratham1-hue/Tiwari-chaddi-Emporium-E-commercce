import { NextResponse } from 'next/server';
import { connectDB, Order } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import { normalizeOrders } from '@/lib/orders';

export async function GET(request) {
  try {
    const user = await requireUser(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Admin access required.' }, { status: 403 });
    }
    await connectDB();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const filter = status && status !== 'ALL' ? { status } : {};
    const orders = await Order.find(filter).sort({ createdAt: -1 }).limit(200).lean();
    return NextResponse.json({ success: true, orders: normalizeOrders(orders) });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
