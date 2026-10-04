import { NextResponse } from 'next/server';
import { connectDB, Product, Review } from '@/lib/db';
import { requireUser } from '@/lib/auth';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    await connectDB();
    const product = await Product.findById(id).lean();
    if (!product) return NextResponse.json({ success: false, message: 'Product not found.' }, { status: 404 });
    const reviews = await Review.find({ productId: id }).sort({ createdAt: -1 }).limit(20).lean();
    return NextResponse.json({ success: true, product, reviews });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const user = await requireUser(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Admin access required.' }, { status: 403 });
    }
    const { id } = await params;
    await connectDB();
    const body = await request.json();
    const allowed = ['name', 'price', 'mrp', 'stock', 'category', 'description', 'badge', 'emoji', 'sizes', 'fabric'];
    const update = {};
    for (const k of allowed) if (body[k] !== undefined) update[k] = body[k];
    const product = await Product.findByIdAndUpdate(id, update, { returnDocument: 'after' });
    if (!product) return NextResponse.json({ success: false, message: 'Product not found.' }, { status: 404 });
    return NextResponse.json({ success: true, product });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 400 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = await requireUser(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Admin access required.' }, { status: 403 });
    }
    const { id } = await params;
    await connectDB();
    await Product.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
