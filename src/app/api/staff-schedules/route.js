import { NextResponse } from 'next/server';
import { staffScheduleService } from '@/services/staffScheduleService';
import { authenticate, authorize, ROLES } from '@/lib/middleware';
import { handleApiError } from '@/lib/errors';

export async function GET(request) {
  try {
    const user = await authenticate(request);
    authorize(ROLES.OWNER, ROLES.MANAGER)(user);
    const { searchParams } = new URL(request.url);
    const filters = {};
    if (searchParams.get('userId')) filters.userId = searchParams.get('userId');
    if (searchParams.get('dayOfWeek')) filters.dayOfWeek = parseInt(searchParams.get('dayOfWeek'));

    const schedules = await staffScheduleService.findByTenant(user.tenant_id, filters);
    return NextResponse.json({ success: true, data: schedules });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request) {
  try {
    const user = await authenticate(request);
    authorize(ROLES.OWNER, ROLES.MANAGER)(user);
    const body = await request.json();
    const schedule = await staffScheduleService.create(user.tenant_id, body);
    return NextResponse.json({ success: true, data: schedule }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
