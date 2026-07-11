import { NextResponse } from 'next/server';
import { reportService } from '@/services/reportService';
import { authenticate, authorize, ROLES } from '@/lib/middleware';
import { handleApiError } from '@/lib/errors';

export async function GET(request) {
  try {
    const user = await authenticate(request);
    authorize(ROLES.MANAGER)(user);
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    const report = await reportService.dailyRevenue(user.tenant_id, date);
    return NextResponse.json({ success: true, data: report });
  } catch (error) {
    return handleApiError(error);
  }
}
