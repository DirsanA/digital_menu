import { NextResponse } from 'next/server';
import { invoiceService } from '@/services/invoiceService';
import { authenticate, authorize, ROLES } from '@/lib/middleware';
import { handleApiError } from '@/lib/errors';

export async function PUT(request, { params }) {
  try {
    const user = await authenticate(request);
    authorize(ROLES.OWNER, ROLES.MANAGER)(user);
    const { id } = await params;
    const body = await request.json();
    const invoice = await invoiceService.update(id, user.tenant_id, body);
    return NextResponse.json({ success: true, data: invoice });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request, { params }) {
  try {
    const user = await authenticate(request);
    authorize(ROLES.OWNER, ROLES.MANAGER)(user);
    const { id } = await params;
    const { action } = await request.json();

    if (action === 'mark-paid') {
      const invoice = await invoiceService.markPaid(id, user.tenant_id);
      return NextResponse.json({ success: true, data: invoice });
    }

    return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return handleApiError(error);
  }
}
