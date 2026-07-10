import { NextResponse } from 'next/server';
import { invoiceService } from '@/services/invoiceService';
import { authenticate, authorize, ROLES } from '@/lib/middleware';
import { handleApiError } from '@/lib/errors';

export async function GET(request) {
  try {
    const user = await authenticate(request);
    authorize(ROLES.OWNER, ROLES.MANAGER)(user);
    const { searchParams } = new URL(request.url);
    const filters = {};
    if (searchParams.get('status')) filters.status = searchParams.get('status');

    const invoices = await invoiceService.findByTenant(user.tenant_id, filters);
    return NextResponse.json({ success: true, data: invoices });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request) {
  try {
    const user = await authenticate(request);
    authorize(ROLES.OWNER, ROLES.MANAGER)(user);
    const body = await request.json();
    const invoice = await invoiceService.create(user.tenant_id, body);
    return NextResponse.json({ success: true, data: invoice }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
