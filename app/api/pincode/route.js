import { NextResponse } from 'next/server';
import { checkPincode } from '@/lib/pincode';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const pincode = searchParams.get('pincode') || '';
  const result = checkPincode(pincode);
  return NextResponse.json({ success: result.serviceable, ...result });
}
