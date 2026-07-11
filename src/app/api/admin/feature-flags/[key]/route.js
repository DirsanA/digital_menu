import { NextResponse } from 'next/server';
import { featureFlagService } from '@/services/featureFlagService';
import { authenticate, authorize, ROLES } from '@/lib/middleware';
import { handleApiError } from '@/lib/errors';

export async function PUT(request, { params }) {
  try {
    const user = await authenticate(request);
    authorize(ROLES.SUPER_ADMIN)(user);
    const { key } = await params;
    const body = await request.json();
    const flag = await featureFlagService.update(key, body);
    return NextResponse.json({ success: true, data: flag });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = await authenticate(request);
    authorize(ROLES.SUPER_ADMIN)(user);
    const { key } = await params;
    await featureFlagService.delete(key);
    return NextResponse.json({ success: true, message: 'Feature flag deleted' });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request, { params }) {
  try {
    const user = await authenticate(request);
    authorize(ROLES.SUPER_ADMIN)(user);
    const { key } = await params;
    const { tenantId, enabled } = await request.json();

    if (tenantId) {
      const flag = await featureFlagService.setTenantOverride(key, tenantId, enabled);
      return NextResponse.json({ success: true, data: flag });
    }

    const flag = await featureFlagService.update(key, { enabled });
    return NextResponse.json({ success: true, data: flag });
  } catch (error) {
    return handleApiError(error);
  }
}
