import { NextResponse } from 'next/server';
import { orderService } from '@/services/orderService';
import { resolveTenant, transformOrder } from '@/lib/tenant';
import { handleApiError } from '@/lib/errors';

export async function GET(request) {
  try {
    const tenant = await resolveTenant(request);
    const { searchParams } = new URL(request.url);
    const filters = {};
    if (searchParams.get('status')) filters.status = searchParams.get('status');
    if (searchParams.get('tableNumber')) filters.tableNumber = parseInt(searchParams.get('tableNumber'));

    const orders = await orderService.findByTenant(tenant.id, filters);
    return NextResponse.json({ success: true, data: orders.map(transformOrder) });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request) {
  try {
    const tenant = await resolveTenant(request);
    const body = await request.json();
    const order = await orderService.create(tenant.id, body);
    return NextResponse.json({ success: true, data: transformOrder(order) }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
