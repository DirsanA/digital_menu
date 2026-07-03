import { NextResponse } from 'next/server';
import { getOrderById } from '@/lib/db';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const order = getOrderById(id);
    
    if (!order) return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
