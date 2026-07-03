import { NextResponse } from 'next/server';
import { getMenu, addMenuItem } from '@/lib/db';

export async function GET() {
  return NextResponse.json({ success: true, data: getMenu() });
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const name = formData.get('name');
    const price = parseFloat(formData.get('price'));
    const category = formData.get('category');
    const description = formData.get('description') || '';
    const tags = formData.get('tags') ? formData.get('tags').split(',').map(t => t.trim()).filter(Boolean) : [];
    const available = formData.get('available') === 'true';

    let imageUrl = '/images/default_food.jpg';
    
    const file = formData.get('image');
    if (file && file instanceof File) {
      // Convert file to Base64 data URL
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      imageUrl = `data:${file.type};base64,${buffer.toString('base64')}`;
    } else if (typeof file === 'string' && file.trim() !== '') {
      imageUrl = file;
    }

    const newItem = addMenuItem({
      name,
      price,
      category,
      description,
      tags,
      available,
      image: imageUrl
    });

    return NextResponse.json({ success: true, data: newItem }, { status: 201 });
  } catch (error) {
    console.error('Error creating menu item:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
