import { NextResponse } from 'next/server';
import { authService } from '@/services/authService';
import { handleApiError } from '@/lib/errors';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'email and password are required' },
        { status: 400 }
      );
    }

    const result = await authService.login(email, password);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return handleApiError(error);
  }
}
