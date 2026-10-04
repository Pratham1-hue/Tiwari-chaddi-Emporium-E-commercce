import { NextResponse } from 'next/server';
import { connectDB, Order, Product, User } from '@/lib/db';
import { requireUser } from '@/lib/auth';

export async function GET(request) {
  try {
    const user = await requireUser(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Admin access required.' }, { status: 403 });
    }
    await connectDB();
    const [revenueAgg, ordersByStatus, productCount, userCount, recentOrders, lowStock] = await Promise.all([
      Order.aggregate([{ $match: { status: { $nin: ['CANCELLED'] } } }, { $group: { _id: null, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } }]),
      Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Product.countDocuments(),
      User.countDocuments(),
      Order.find({}).sort({ createdAt: -1 }).limit(8).lean(),
      Product.find({ stock: { $lte: 5 } }).sort({ stock: 1 }).limit(10).lean(),
    ]);
    return NextResponse.json({
      success: true,
      stats: {
        revenue: revenueAgg[0]?.total || 0,
        orderCount: revenueAgg[0]?.count || 0,
        productCount,
        userCount,
        ordersByStatus,
        recentOrders,
        lowStock,
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
