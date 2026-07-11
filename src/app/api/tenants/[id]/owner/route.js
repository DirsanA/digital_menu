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
    const owner = await userService.findOwnerByTenant(id);
    return NextResponse.json({ success: true, data: owner });
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
    const owner = await userService.createOwner(id, body);
    return NextResponse.json({ success: true, data: owner }, { status: 201 });
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
    const existingOwner = await userService.findOwnerByTenant(id);
    if (!existingOwner) {
      return NextResponse.json(
        { success: false, message: 'No owner assigned to this restaurant' },
        { status: 404 }
      );
    }
    const body = await request.json();
    const owner = await userService.update(existingOwner.id, body);
    return NextResponse.json({ success: true, data: owner });
  } catch (error) {
    return handleApiError(error);
  }
}
