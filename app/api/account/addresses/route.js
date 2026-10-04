import { NextResponse } from 'next/server';
import { connectDB, User } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import { checkPincode } from '@/lib/pincode';

export async function GET(request) {
  const user = await requireUser(request);
  if (!user) return NextResponse.json({ success: false, message: 'Please log in.' }, { status: 401 });
  return NextResponse.json({ success: true, addresses: user.addresses || [] });
}

export async function POST(request) {
  try {
    const user = await requireUser(request);
    if (!user) return NextResponse.json({ success: false, message: 'Please log in.' }, { status: 401 });
    const body = await request.json();
    for (const f of ['fullName', 'phone', 'line1', 'city', 'state', 'pincode']) {
      if (!String(body[f] || '').trim()) {
        return NextResponse.json({ success: false, message: `Missing ${f}.` }, { status: 400 });
      }
    }
    const pin = checkPincode(body.pincode);
    if (!pin.serviceable) {
      return NextResponse.json({ success: false, message: pin.reason }, { status: 400 });
    }
    await connectDB();
    const dbUser = await User.findById(user._id);
    dbUser.addresses.push({
      label: body.label || 'Home',
      fullName: body.fullName.trim(),
      phone: body.phone.trim(),
      line1: body.line1.trim(),
      line2: (body.line2 || '').trim(),
      city: body.city.trim(),
      state: body.state.trim(),
      pincode: String(body.pincode).trim(),
    });
    await dbUser.save();
    return NextResponse.json({ success: true, addresses: dbUser.addresses });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
