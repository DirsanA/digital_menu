import { NextResponse } from 'next/server';
import { tableService } from '@/services/tableService';
import { authenticate, authorize, ROLES } from '@/lib/middleware';
import { handleApiError } from '@/lib/errors';

export async function PUT(request, { params }) {
  try {
    const user = await authenticate(request);
    authorize(ROLES.MANAGER)(user);
    const { id } = await params;
    const body = await request.json();
    const table = await tableService.update(id, user.tenant_id, body);
    return NextResponse.json({ success: true, data: table });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = await authenticate(request);
    authorize(ROLES.MANAGER)(user);
    const { id } = await params;
    await tableService.delete(id, user.tenant_id);
    return NextResponse.json({ success: true, message: 'Table deleted' });
  } catch (error) {
    return handleApiError(error);
  }
}
