import { NextResponse } from 'next/server';
import { paymentService } from '@/services/paymentService';
import { authenticate, authorize, ROLES } from '@/lib/middleware';
import { handleApiError } from '@/lib/errors';

export async function GET(request) {
  try {
    const user = await authenticate(request);
    authorize(ROLES.MANAGER, ROLES.CASHIER)(user);
    const { searchParams } = new URL(request.url);
    const filters = {};
    if (searchParams.get('orderId')) filters.orderId = searchParams.get('orderId');
    if (searchParams.get('status')) filters.status = searchParams.get('status');
    if (searchParams.get('method')) filters.method = searchParams.get('method');

    const payments = await paymentService.findByTenant(user.tenant_id, filters);
    return NextResponse.json({ success: true, data: payments });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request) {
  try {
    const user = await authenticate(request);
    authorize(ROLES.MANAGER, ROLES.CASHIER)(user);
    const body = await request.json();
    const payment = await paymentService.create(user.tenant_id, {
      ...body,
      processedBy: user.sub,
    });
    return NextResponse.json({ success: true, data: payment }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
