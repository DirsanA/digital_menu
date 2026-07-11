import { NextResponse } from 'next/server';
import { orderService } from '@/services/orderService';
import { authenticate, authorize, ROLES } from '@/lib/middleware';
import { transformOrder } from '@/lib/tenant';
import { handleApiError } from '@/lib/errors';

export async function GET(request) {
  try {
    const user = await authenticate(request);
    authorize(ROLES.KITCHEN_STAFF, ROLES.MANAGER)(user);

    const orders = await orderService.findByTenant(user.tenant_id, { status: 'approved' });

    return NextResponse.json({ success: true, data: orders.map(transformOrder) });
  } catch (error) {
    return handleApiError(error);
  }
}
