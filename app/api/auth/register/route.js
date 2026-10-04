import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB, User } from '@/lib/db';
import { signToken, authCookie } from '@/lib/auth';

export async function POST(request) {
  try {
    const { name, email, password } = await request.json();
    if (!name?.trim() || !email?.trim() || !password) {
      return NextResponse.json({ success: false, message: 'Name, email and password are required.' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ success: false, message: 'Password must be at least 6 characters.' }, { status: 400 });
    }
    await connectDB();
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return NextResponse.json({ success: false, message: 'An account with this email already exists. Please log in.' }, { status: 409 });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      role: 'customer',
    });
    const token = signToken(user);
    const res = NextResponse.json({
      success: true,
      user: { _id: String(user._id), name: user.name, email: user.email, role: user.role, addresses: [] },
    });
    res.headers.set('Set-Cookie', authCookie(token));
    return res;
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
