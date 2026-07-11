import { NextResponse } from 'next/server';
import { categoryService } from '@/services/categoryService';
import { authenticate, authorize, ROLES } from '@/lib/middleware';
import { handleApiError } from '@/lib/errors';

export async function PUT(request, { params }) {
  try {
    const user = await authenticate(request);
    authorize(ROLES.MANAGER, ROLES.OWNER)(user);
    const { id } = await params;
    const body = await request.json();
    const category = await categoryService.update(id, user.tenant_id, body);
    return NextResponse.json({ success: true, data: category });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = await authenticate(request);
    authorize(ROLES.MANAGER, ROLES.OWNER)(user);
    const { id } = await params;
    await categoryService.delete(id, user.tenant_id);
    return NextResponse.json({ success: true, message: 'Category deleted' });
  } catch (error) {
    return handleApiError(error);
  }
}
