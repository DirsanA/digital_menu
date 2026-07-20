import { NextResponse } from 'next/server';
import { subscriptionService } from '@/services/subscriptionService';
import { authenticate, authorize, ROLES } from '@/lib/middleware';
import { handleApiError } from '@/lib/errors';

export async function PUT(request, { params }) {
  try {
    const user = await authenticate(request);
    authorize(ROLES.SUPER_ADMIN)(user);
    const { id } = await params;
    const body = await request.json();
    const subscription = await subscriptionService.update(id, body);
    return NextResponse.json({ success: true, data: subscription });
  } catch (error) {
    return handleApiError(error);
  }
}
