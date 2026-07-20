import { NextResponse } from 'next/server';
import { reportService } from '@/services/reportService';
import { authenticate, authorize, ROLES } from '@/lib/middleware';
import { handleApiError } from '@/lib/errors';

export async function GET(request) {
  try {
    const user = await authenticate(request);
    authorize(ROLES.MANAGER)(user);
    const { searchParams } = new URL(request.url);
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    const summary = await reportService.expensesSummary(user.tenant_id, dateFrom, dateTo);
    return NextResponse.json({ success: true, data: summary });
  } catch (error) {
    return handleApiError(error);
  }
}
