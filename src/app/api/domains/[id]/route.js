import { NextResponse } from 'next/server';
import { domainService } from '@/services/domainService';
import { authenticate, authorize, ROLES } from '@/lib/middleware';
import { handleApiError } from '@/lib/errors';

export async function DELETE(request, { params }) {
  try {
    const user = await authenticate(request);
    authorize(ROLES.OWNER)(user);
    const { id } = await params;
    await domainService.delete(id, user.tenant_id);
    return NextResponse.json({ success: true, message: 'Domain removed' });
  } catch (error) {
    return handleApiError(error);
  }
}
