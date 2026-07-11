import { NextResponse } from 'next/server';
import { tenantService } from '@/services/tenantService';
import { authenticate, authorize, ROLES } from '@/lib/middleware';
import { handleApiError } from '@/lib/errors';

export async function GET(request, { params }) {
  try {
    const user = await authenticate(request);
    authorize(ROLES.SUPER_ADMIN)(user);
    const { id } = await params;
    const tenant = await tenantService.findById(id);
    return NextResponse.json({ success: true, data: tenant });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request, { params }) {
  try {
    const user = await authenticate(request);
    authorize(ROLES.SUPER_ADMIN)(user);
    const { id } = await params;
    const body = await request.json();
    const tenant = await tenantService.update(id, body);
    return NextResponse.json({ success: true, data: tenant });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = await authenticate(request);
    authorize(ROLES.SUPER_ADMIN)(user);
    const { id } = await params;
    await tenantService.delete(id);
    return NextResponse.json({ success: true, message: 'Tenant deleted' });
  } catch (error) {
    return handleApiError(error);
  }
}
