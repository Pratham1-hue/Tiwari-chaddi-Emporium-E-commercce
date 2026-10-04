import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';

export async function GET(request) {
  const user = await requireUser(request);
  if (!user) return NextResponse.json({ success: false, user: null });
  return NextResponse.json({ success: true, user });
}
