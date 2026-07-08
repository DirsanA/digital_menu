import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/middleware';
import { uploadImage } from '@/lib/cloudinary';
import { handleApiError } from '@/lib/errors';

export async function POST(request) {
  try {
    await authenticate(request);

    const formData = await request.formData();
    const file = formData.get('image');

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { success: false, message: 'Image file is required' },
        { status: 400 },
      );
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, message: 'File must be an image' },
        { status: 400 },
      );
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, message: 'Image must be under 5MB' },
        { status: 400 },
      );
    }

    const url = await uploadImage(file);
    return NextResponse.json({ success: true, data: { url } }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
