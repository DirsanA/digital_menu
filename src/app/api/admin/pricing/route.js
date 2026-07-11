import { NextResponse } from 'next/server';
import { pricingPlanService } from '@/services/pricingPlanService';
import { authenticate, authorize, ROLES } from '@/lib/middleware';
import { handleApiError } from '@/lib/errors';

export async function GET(request) {
  try {
    const user = await authenticate(request);
    authorize(ROLES.SUPER_ADMIN)(user);
    const plans = await pricingPlanService.findAll();
    return NextResponse.json({ success: true, data: plans });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request) {
  try {
    const user = await authenticate(request);
    authorize(ROLES.SUPER_ADMIN)(user);
    const body = await request.json();
    const plan = await pricingPlanService.create(body);
    return NextResponse.json({ success: true, data: plan }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
