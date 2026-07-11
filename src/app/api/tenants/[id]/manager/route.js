import { NextResponse } from 'next/server';
import { tenantService } from '@/services/tenantService';
import { userService } from '@/services/userService';
import { authenticate, authorize, ROLES } from '@/lib/middleware';
import { handleApiError } from '@/lib/errors';

export async function GET(request, { params }) {
  try {
    const user = await authenticate(request);
    authorize(ROLES.SUPER_ADMIN)(user);
    const { id } = await params;
    await tenantService.findById(id);
    const manager = await userService.findPrimaryManagerByTenant(id);
    return NextResponse.json({ success: true, data: manager });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request, { params }) {
  try {
    const user = await authenticate(request);
    authorize(ROLES.SUPER_ADMIN)(user);
    const { id } = await params;
    await tenantService.findById(id);
    const body = await request.json();
    const manager = await userService.createPrimaryManager(id, body);
    return NextResponse.json({ success: true, data: manager }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request, { params }) {
  try {
    const user = await authenticate(request);
    authorize(ROLES.SUPER_ADMIN)(user);
    const { id } = await params;
    await tenantService.findById(id);
    const existingManager = await userService.findPrimaryManagerByTenant(id);
    if (!existingManager) {
      return NextResponse.json(
        { success: false, message: 'No primary manager assigned to this restaurant' },
        { status: 404 }
      );
    }
    const body = await request.json();
    const manager = await userService.update(existingManager.id, body);
    return NextResponse.json({ success: true, data: manager });
  } catch (error) {
    return handleApiError(error);
  }
}
