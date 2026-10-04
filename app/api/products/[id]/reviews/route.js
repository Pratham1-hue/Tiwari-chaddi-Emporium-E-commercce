import { NextResponse } from 'next/server';
import { connectDB, Product, Review } from '@/lib/db';
import { requireUser } from '@/lib/auth';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    await connectDB();
    const reviews = await Review.find({ productId: id }).sort({ createdAt: -1 }).limit(50).lean();
    return NextResponse.json({ success: true, reviews });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const user = await requireUser(request);
    if (!user) return NextResponse.json({ success: false, message: 'Please log in to rate this product.' }, { status: 401 });
    const { rating, title, comment } = await request.json();
    const r = Number(rating);
    if (!r || r < 1 || r > 5) {
      return NextResponse.json({ success: false, message: 'Rating must be between 1 and 5.' }, { status: 400 });
    }
    const { id } = await params;
    await connectDB();
    const review = await Review.findOneAndUpdate(
      { productId: id, userId: user._id },
      { userName: user.name, rating: r, title: title || '', comment: comment || '' },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    );
    // Recompute aggregate
    const agg = await Review.aggregate([
      { $match: { productId: review.productId } },
      { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);
    if (agg[0]) {
      await Product.findByIdAndUpdate(id, {
        rating: Math.round(agg[0].avg * 10) / 10,
        reviews: agg[0].count,
      });
    }
    return NextResponse.json({ success: true, review });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
