import { NextResponse } from 'next/server';
import { categoryService } from '@/services/categoryService';
import { resolveTenant } from '@/lib/tenant';
import { authenticate, authorize, ROLES } from '@/lib/middleware';
import { handleApiError } from '@/lib/errors';

export async function GET(request) {
  try {
    const tenant = await resolveTenant(request);
    const categories = await categoryService.findByTenant(tenant.id);
    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request) {
  try {
    const user = await authenticate(request);
    authorize(ROLES.MANAGER)(user);
    const body = await request.json();
    const category = await categoryService.create(user.tenant_id, body);
    return NextResponse.json({ success: true, data: category }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
