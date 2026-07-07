import { NextResponse } from 'next/server';
import { orderService } from '@/services/orderService';
import { resolveTenant, transformOrder } from '@/lib/tenant';
import { handleApiError } from '@/lib/errors';

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const tenant = await resolveTenant(request);
    const { status } = await request.json();
    const order = await orderService.updateStatus(id, tenant.id, status);
    return NextResponse.json({ success: true, data: transformOrder(order) });
  } catch (error) {
    return handleApiError(error);
  }
}
