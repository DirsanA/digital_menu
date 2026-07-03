import { NextResponse } from 'next/server';
import { getOrders, addOrder } from '@/lib/db';

export async function GET() {
  return NextResponse.json({ success: true, data: getOrders() });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { tableNumber, items, notes } = body;
    
    if (!tableNumber || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, message: 'Invalid order data' }, { status: 400 });
    }

    const newOrder = addOrder({ tableNumber, items, notes });
    return NextResponse.json({ success: true, data: newOrder }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
