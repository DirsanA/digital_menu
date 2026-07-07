import { NextResponse } from 'next/server';
import { authService } from '@/services/authService';
import { authenticate } from '@/lib/middleware';
import { handleApiError } from '@/lib/errors';

export async function GET(request) {
  try {
    const user = await authenticate(request);
    const profile = await authService.getCurrentUser(user.sub);
    return NextResponse.json({ success: true, data: profile });
  } catch (error) {
    return handleApiError(error);
  }
}
