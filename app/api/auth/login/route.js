import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB, User } from '@/lib/db';
import { signToken, authCookie } from '@/lib/auth';

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    if (!email?.trim() || !password) {
      return NextResponse.json({ success: false, message: 'Email and password are required.' }, { status: 400 });
    }
    await connectDB();
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return NextResponse.json({ success: false, message: 'No account found with this email.' }, { status: 401 });
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return NextResponse.json({ success: false, message: 'Incorrect password.' }, { status: 401 });
    }
    const token = signToken(user);
    const res = NextResponse.json({
      success: true,
      user: {
        _id: String(user._id),
        name: user.name,
        email: user.email,
        role: user.role,
        addresses: user.addresses || [],
      },
    });
    res.headers.set('Set-Cookie', authCookie(token));
    return res;
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
