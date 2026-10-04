import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB, Product, User } from '@/lib/db';
import { catalog } from '@/lib/catalog';

// Dev helper: POST /api/seed loads catalog + a demo admin & customer.
export async function POST() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ success: false, message: 'Seeding is disabled in production.' }, { status: 403 });
  }

  try {
    await connectDB();

    const ops = catalog.map((item) => {
      const product = { ...item };
      const { stock } = product;
      delete product._id;
      delete product.stock;
      return {
        updateOne: {
          filter: { name: product.name },
          update: { $set: product, $setOnInsert: { stock } },
          upsert: true,
        },
      };
    });
    const result = await Product.bulkWrite(ops);

    // Demo accounts (password: admin123 / customer123)
    const ensure = async (name, email, password, role) => {
      const existing = await User.findOne({ email });
      if (existing) {
        existing.role = role;
        await existing.save();
        return false;
      }
      await User.create({ name, email, passwordHash: await bcrypt.hash(password, 10), role });
      return true;
    };
    const adminNew = await ensure('Store Admin', 'admin@chaddi.com', 'admin123', 'admin');
    const custNew = await ensure('Demo Customer', 'customer@demo.com', 'customer123', 'customer');

    return NextResponse.json({
      success: true,
      inserted: result.upsertedCount,
      updated: result.modifiedCount,
      total: catalog.length,
      accounts: {
        admin: { email: 'admin@chaddi.com', password: 'admin123', created: adminNew },
        customer: { email: 'customer@demo.com', password: 'customer123', created: custNew },
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
