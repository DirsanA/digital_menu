import { NextResponse } from 'next/server';
import { domainService } from '@/services/domainService';
import { authenticate, authorize, ROLES } from '@/lib/middleware';
import { handleApiError } from '@/lib/errors';

export async function GET(request) {
  try {
    const user = await authenticate(request);
    authorize(ROLES.OWNER)(user);
    const domains = await domainService.findByTenant(user.tenant_id);
    return NextResponse.json({ success: true, data: domains });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request) {
  try {
    const user = await authenticate(request);
    authorize(ROLES.OWNER)(user);
    const body = await request.json();
    const domain = await domainService.create(user.tenant_id, body.domain);
    return NextResponse.json({ success: true, data: domain }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
