import { NextResponse } from 'next/server';
import { authService } from '@/services/authService';
import { handleApiError } from '@/lib/errors';

export async function POST(request) {
  try {
    const { refreshToken } = await request.json();

    if (!refreshToken) {
      return NextResponse.json(
        { success: false, message: 'refreshToken is required' },
        { status: 400 }
      );
    }

    const result = await authService.refresh(refreshToken);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return handleApiError(error);
  }
}
