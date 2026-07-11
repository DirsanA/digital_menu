import { NextResponse } from 'next/server';
import { staffScheduleService } from '@/services/staffScheduleService';
import { authenticate, authorize, ROLES } from '@/lib/middleware';
import { handleApiError } from '@/lib/errors';

export async function PUT(request, { params }) {
  try {
    const user = await authenticate(request);
    authorize(ROLES.OWNER, ROLES.MANAGER)(user);
    const { id } = await params;
    const body = await request.json();
    const schedule = await staffScheduleService.update(id, user.tenant_id, body);
    return NextResponse.json({ success: true, data: schedule });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = await authenticate(request);
    authorize(ROLES.OWNER, ROLES.MANAGER)(user);
    const { id } = await params;
    await staffScheduleService.delete(id, user.tenant_id);
    return NextResponse.json({ success: true, message: 'Schedule deleted' });
  } catch (error) {
    return handleApiError(error);
  }
}
