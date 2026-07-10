import { NextResponse } from 'next/server';
import { qrCodeService } from '@/services/qrCodeService';
import { authenticate, authorize, ROLES } from '@/lib/middleware';
import { handleApiError } from '@/lib/errors';

export async function PUT(request, { params }) {
  try {
    const user = await authenticate(request);
    authorize(ROLES.OWNER)(user);
    const { id } = await params;
    const body = await request.json();
    const qrCode = await qrCodeService.update(id, user.tenant_id, body);
    return NextResponse.json({ success: true, data: qrCode });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = await authenticate(request);
    authorize(ROLES.OWNER)(user);
    const { id } = await params;
    await qrCodeService.delete(id, user.tenant_id);
    return NextResponse.json({ success: true, message: 'QR code deleted' });
  } catch (error) {
    return handleApiError(error);
  }
}
