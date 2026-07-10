import { NextResponse } from 'next/server';
import { qrCodeService } from '@/services/qrCodeService';
import { authenticate, authorize, ROLES } from '@/lib/middleware';
import { handleApiError } from '@/lib/errors';

export async function GET(request) {
  try {
    const user = await authenticate(request);
    authorize(ROLES.OWNER)(user);
    const qrCodes = await qrCodeService.findByTenant(user.tenant_id);
    return NextResponse.json({ success: true, data: qrCodes });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request) {
  try {
    const user = await authenticate(request);
    authorize(ROLES.OWNER)(user);
    const body = await request.json();
    const qrCode = await qrCodeService.create(user.tenant_id, body);
    return NextResponse.json({ success: true, data: qrCode }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
