import { NextResponse } from 'next/server';
import { expenseService } from '@/services/expenseService';
import { authenticate, authorize, ROLES } from '@/lib/middleware';
import { handleApiError } from '@/lib/errors';

export async function GET(request) {
  try {
    const user = await authenticate(request);
    authorize(ROLES.MANAGER)(user);
    const { searchParams } = new URL(request.url);
    const filters = {};
    if (searchParams.get('category')) filters.category = searchParams.get('category');
    if (searchParams.get('dateFrom')) filters.dateFrom = searchParams.get('dateFrom');
    if (searchParams.get('dateTo')) filters.dateTo = searchParams.get('dateTo');

    const expenses = await expenseService.findByTenant(user.tenant_id, filters);
    return NextResponse.json({ success: true, data: expenses });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request) {
  try {
    const user = await authenticate(request);
    authorize(ROLES.MANAGER)(user);
    const body = await request.json();
    const expense = await expenseService.create(user.tenant_id, {
      ...body,
      createdBy: user.sub,
    });
    return NextResponse.json({ success: true, data: expense }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
