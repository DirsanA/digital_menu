import { NextResponse } from 'next/server';
import { userService } from '@/services/userService';
import { authenticate, authorize, ROLES } from '@/lib/middleware';
import { handleApiError } from '@/lib/errors';

export async function GET(request, { params }) {
  try {
    const user = await authenticate(request);
    authorize(ROLES.ADMIN, ROLES.MANAGER)(user);
    const { id } = await params;
    const staff = await userService.findById(id);

    if (staff.tenantId !== user.tenant_id) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    const { passwordHash, ...safe } = staff;
    return NextResponse.json({ success: true, data: safe });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request, { params }) {
  try {
    const user = await authenticate(request);
    authorize(ROLES.ADMIN)(user);
    const { id } = await params;
    const body = await request.json();
    const staff = await userService.findById(id);

    if (staff.tenantId !== user.tenant_id) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    const updated = await userService.update(id, body);
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = await authenticate(request);
    authorize(ROLES.ADMIN)(user);
    const { id } = await params;
    const staff = await userService.findById(id);

    if (staff.tenantId !== user.tenant_id) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    await userService.delete(id);
    return NextResponse.json({ success: true, message: 'User deleted' });
  } catch (error) {
    return handleApiError(error);
  }
}
