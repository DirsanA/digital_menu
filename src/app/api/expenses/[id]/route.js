import { NextResponse } from 'next/server';
import { expenseService } from '@/services/expenseService';
import { authenticate, authorize, ROLES } from '@/lib/middleware';
import { handleApiError } from '@/lib/errors';

export async function PUT(request, { params }) {
  try {
    const user = await authenticate(request);
    authorize(ROLES.OWNER, ROLES.MANAGER)(user);
    const { id } = await params;
    const body = await request.json();
    const expense = await expenseService.update(id, user.tenant_id, body);
    return NextResponse.json({ success: true, data: expense });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = await authenticate(request);
    authorize(ROLES.OWNER, ROLES.MANAGER)(user);
    const { id } = await params;
    await expenseService.delete(id, user.tenant_id);
    return NextResponse.json({ success: true, message: 'Expense deleted' });
  } catch (error) {
    return handleApiError(error);
  }
}
