import { NextResponse } from 'next/server';
import { featureFlagService } from '@/services/featureFlagService';
import { authenticate, authorize, ROLES } from '@/lib/middleware';
import { handleApiError } from '@/lib/errors';

export async function GET(request) {
  try {
    const user = await authenticate(request);
    authorize(ROLES.SUPER_ADMIN)(user);
    const flags = await featureFlagService.findAll();
    return NextResponse.json({ success: true, data: flags });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request) {
  try {
    const user = await authenticate(request);
    authorize(ROLES.SUPER_ADMIN)(user);
    const body = await request.json();
    const flag = await featureFlagService.create(body);
    return NextResponse.json({ success: true, data: flag }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
