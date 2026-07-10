import { NextResponse } from 'next/server';
import { paymentService } from '@/services/paymentService';
import { authenticate, authorize, ROLES } from '@/lib/middleware';
import { handleApiError } from '@/lib/errors';

export async function POST(request, { params }) {
  try {
    const user = await authenticate(request);
    authorize(ROLES.OWNER, ROLES.MANAGER, ROLES.CASHIER)(user);
    const { id } = await params;
    const payment = await paymentService.refund(id, user.tenant_id);
    return NextResponse.json({ success: true, data: payment });
  } catch (error) {
    return handleApiError(error);
  }
}
