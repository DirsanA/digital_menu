import { NextResponse } from 'next/server';
import { orderService } from '@/services/orderService';
import { resolveTenant, transformOrder } from '@/lib/tenant';
import { handleApiError } from '@/lib/errors';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const tenant = await resolveTenant(request);
    const order = await orderService.findById(id, tenant.id);
    return NextResponse.json({ success: true, data: transformOrder(order) });
  } catch (error) {
    return handleApiError(error);
  }
}
