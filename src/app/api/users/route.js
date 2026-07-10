import { NextResponse } from 'next/server';
import { userService } from '@/services/userService';
import { authenticate, authorize, ROLES } from '@/lib/middleware';
import { handleApiError } from '@/lib/errors';
import { assertCanAssignStaffRole } from '@/lib/staffPermissions';

export async function GET(request) {
  try {
    const user = await authenticate(request);
    authorize(ROLES.OWNER, ROLES.MANAGER)(user);
    const users = await userService.findByTenant(user.tenant_id);
    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request) {
  try {
    const user = await authenticate(request);
    authorize(ROLES.OWNER, ROLES.MANAGER)(user);
    const body = await request.json();
    assertCanAssignStaffRole(user, body.role);
    const newUser = await userService.create(user.tenant_id, body);
    return NextResponse.json({ success: true, data: newUser }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
