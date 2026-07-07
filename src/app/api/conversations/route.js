import { NextResponse } from 'next/server';
import { conversationService } from '@/services/conversationService';
import { resolveTenant } from '@/lib/tenant';
import { handleApiError } from '@/lib/errors';

export async function GET(request) {
  try {
    const tenant = await resolveTenant(request);
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { success: false, message: 'sessionId query parameter is required' },
        { status: 400 }
      );
    }

    const conversation = await conversationService.findBySession(tenant.id, sessionId);
    return NextResponse.json({ success: true, data: conversation || { messages: [] } });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request) {
  try {
    const tenant = await resolveTenant(request);
    const body = await request.json();
    const { sessionId, role, content } = body;

    if (!sessionId || !role || !content) {
      return NextResponse.json(
        { success: false, message: 'sessionId, role, and content are required' },
        { status: 400 }
      );
    }

    const conversation = await conversationService.appendMessage(
      tenant.id,
      sessionId,
      role,
      content
    );

    return NextResponse.json({ success: true, data: conversation }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
