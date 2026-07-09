import { NextResponse } from 'next/server';
import { menuService } from '@/services/menuService';
import { resolveTenant, transformMenuItem } from '@/lib/tenant';
import { uploadImage } from '@/lib/cloudinary';
import { handleApiError } from '@/lib/errors';

export async function GET(request) {
  try {
    const tenant = await resolveTenant(request);
    const items = await menuService.findByTenant(tenant.id);
    return NextResponse.json({ success: true, data: items.map(transformMenuItem) });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request) {
  try {
    const tenant = await resolveTenant(request);
    const contentType = request.headers.get('content-type') || '';

    let data;
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();

      data = {
        name: formData.get('name'),
        price: parseFloat(formData.get('price')),
        category: formData.get('category'),
        description: formData.get('description') || '',
        tags: formData.get('tags')
          ? formData.get('tags').split(',').map((t) => t.trim()).filter(Boolean)
          : [],
        available: formData.get('available') === 'true',
      };

      let imageUrl = '/images/default_food.jpg';
      const file = formData.get('image');
      if (file && file instanceof File) {
        imageUrl = await uploadImage(file);
      } else if (typeof file === 'string' && file.trim() !== '') {
        imageUrl = file;
      }
      data.imageUrl = imageUrl;
    } else {
      const body = await request.json();
      data = {
        name: body.name,
        price: parseFloat(body.price),
        category: body.category,
        description: body.description || '',
        tags: Array.isArray(body.tags) ? body.tags : [],
        available: body.available ?? true,
        imageUrl: body.imageUrl || '/images/default_food.jpg',
      };
    }

    const item = await menuService.create(tenant.id, data);
    return NextResponse.json({ success: true, data: transformMenuItem(item) }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
