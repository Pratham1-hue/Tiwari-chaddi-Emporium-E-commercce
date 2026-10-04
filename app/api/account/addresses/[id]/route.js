import { NextResponse } from 'next/server';
import { connectDB, User } from '@/lib/db';
import { requireUser } from '@/lib/auth';

export async function DELETE(request, { params }) {
  try {
    const user = await requireUser(request);
    if (!user) return NextResponse.json({ success: false, message: 'Please log in.' }, { status: 401 });
    const { id } = await params;
    await connectDB();
    const dbUser = await User.findById(user._id);
    dbUser.addresses = dbUser.addresses.filter((a) => String(a._id) !== String(id));
    await dbUser.save();
    return NextResponse.json({ success: true, addresses: dbUser.addresses });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
