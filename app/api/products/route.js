import { NextResponse } from 'next/server';
import { connectDB, Product } from '@/lib/db';
import { requireUser } from '@/lib/auth';

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const q = searchParams.get('q');
    const filter = {};
    if (category && category !== 'All') filter.category = category;
    if (q) filter.name = { $regex: q, $options: 'i' };
    const products = await Product.find(filter).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, products });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// Admin: add a product
export async function POST(request) {
  try {
    const user = await requireUser(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ success: false, message: 'Admin access required.' }, { status: 403 });
    }
    const body = await request.json();
    if (!body.name || body.price == null) {
      return NextResponse.json({ success: false, message: 'Name and price are required.' }, { status: 400 });
    }
    await connectDB();
    const product = await Product.create({
      name: body.name,
      price: Number(body.price),
      mrp: body.mrp != null ? Number(body.mrp) : undefined,
      stock: body.stock != null ? Number(body.stock) : 50,
      category: body.category || 'Other',
      description: body.description || '',
      badge: body.badge || undefined,
      emoji: body.emoji || '🎽',
      sizes: Array.isArray(body.sizes) && body.sizes.length ? body.sizes : ['S', 'M', 'L', 'XL', 'XXL'],
      fabric: body.fabric || '100% combed cotton',
    });
    return NextResponse.json({ success: true, product });
  } catch (error) {
    const msg = error.code === 11000 ? 'A product with this name already exists.' : error.message;
    return NextResponse.json({ success: false, message: msg }, { status: 400 });
  }
}
