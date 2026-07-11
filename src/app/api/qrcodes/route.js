import { NextResponse } from 'next/server';
import { qrCodeService } from '@/services/qrCodeService';
import { authenticate, authorize, ROLES } from '@/lib/middleware';
import { handleApiError, ValidationError } from '@/lib/errors';

export async function GET(request) {
  try {
    const user = await authenticate(request);
    authorize(ROLES.MANAGER)(user);
    const qrCode = await qrCodeService.findRestaurantQr(user.tenant_id);
    return NextResponse.json({ success: true, data: qrCode });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request) {
  try {
    const user = await authenticate(request);
    authorize(ROLES.MANAGER)(user);
    const body = await request.json();

    if (body.tableId) {
      throw new ValidationError('Restaurant QR codes cannot be linked to a table');
    }
    if (!body.url) {
      throw new ValidationError('URL is required');
    }

    const qrCode = await qrCodeService.upsertRestaurantQr(user.tenant_id, {
      url: body.url,
      label: body.label,
    });
    return NextResponse.json({ success: true, data: qrCode }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
