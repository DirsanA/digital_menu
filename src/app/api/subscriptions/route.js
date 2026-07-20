import { NextResponse } from 'next/server';
import { subscriptionService } from '@/services/subscriptionService';
import { authenticate, authorize, ROLES } from '@/lib/middleware';
import { handleApiError } from '@/lib/errors';

export async function GET(request) {
  try {
    const user = await authenticate(request);
    if (user.role === ROLES.SUPER_ADMIN) {
      const subscriptions = await subscriptionService.findAll();
      return NextResponse.json({ success: true, data: subscriptions });
    }
    authorize(ROLES.MANAGER)(user);
    const subscription = await subscriptionService.findByTenant(user.tenant_id);
    return NextResponse.json({ success: true, data: subscription });
  } catch (error) {
    return handleApiError(error);
  }
}
