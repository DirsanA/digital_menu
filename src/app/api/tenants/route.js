import { NextResponse } from 'next/server';
import { tenantService } from '@/services/tenantService';
import { userService } from '@/services/userService';
import { authenticate, authorize, ROLES } from '@/lib/middleware';
import { handleApiError } from '@/lib/errors';

export async function GET(request) {
  try {
    const user = await authenticate(request);
    authorize(ROLES.SUPER_ADMIN)(user);
    const tenants = await tenantService.findAll();
    return NextResponse.json({ success: true, data: tenants });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request) {
  try {
    const user = await authenticate(request);
    authorize(ROLES.SUPER_ADMIN)(user);
    const body = await request.json();
    const { manager, ...tenantData } = body;
    const tenant = await tenantService.create(tenantData);

    if (manager?.email && manager?.password) {
      await userService.createPrimaryManager(tenant.id, manager);
    }

    const tenants = await tenantService.findAll();
    const created = tenants.find((t) => t.id === tenant.id) || tenant;
    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
