import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const data = searchParams.get('data');
    const size = searchParams.get('size') || '600';

    if (!data) {
      return NextResponse.json({ success: false, message: 'data parameter is required' }, { status: 400 });
    }

    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}`;
    const response = await fetch(qrUrl);

    if (!response.ok) {
      return NextResponse.json({ success: false, message: 'Failed to fetch QR image' }, { status: 502 });
    }

    const buffer = await response.arrayBuffer();
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('QR proxy error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
