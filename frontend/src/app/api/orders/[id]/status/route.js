import { NextResponse } from 'next/server';
import { updateOrderStatus } from '@/lib/db';

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;
    
    if (!status) return NextResponse.json({ success: false, message: 'Status is required' }, { status: 400 });

    const updated = updateOrderStatus(id, status);
    if (!updated) return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
    
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
