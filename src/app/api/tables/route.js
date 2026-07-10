import { NextResponse } from 'next/server';
import { tableService } from '@/services/tableService';
import { authenticate, authorize, ROLES } from '@/lib/middleware';
import { handleApiError } from '@/lib/errors';

export async function GET(request) {
  try {
    const user = await authenticate(request);
    authorize(ROLES.OWNER, ROLES.MANAGER, ROLES.WAITER)(user);
    const tables = await tableService.findByTenant(user.tenant_id);
    return NextResponse.json({ success: true, data: tables });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request) {
  try {
    const user = await authenticate(request);
    authorize(ROLES.OWNER, ROLES.MANAGER)(user);
    const body = await request.json();
    const table = await tableService.create(user.tenant_id, body);
    return NextResponse.json({ success: true, data: table }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
