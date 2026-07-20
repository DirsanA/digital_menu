import { NextResponse } from 'next/server';
import { pricingPlanService } from '@/services/pricingPlanService';
import { authenticate, authorize, ROLES } from '@/lib/middleware';
import { handleApiError } from '@/lib/errors';

export async function PUT(request, { params }) {
  try {
    const user = await authenticate(request);
    authorize(ROLES.SUPER_ADMIN)(user);
    const { id } = await params;
    const body = await request.json();
    const plan = await pricingPlanService.update(id, body);
    return NextResponse.json({ success: true, data: plan });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = await authenticate(request);
    authorize(ROLES.SUPER_ADMIN)(user);
    const { id } = await params;
    await pricingPlanService.delete(id);
    return NextResponse.json({ success: true, message: 'Pricing plan deleted' });
  } catch (error) {
    return handleApiError(error);
  }
}
