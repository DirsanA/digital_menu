import { NextResponse } from 'next/server';
import { menuService } from '@/services/menuService';
import { resolveTenant, transformMenuItem } from '@/lib/tenant';
import { authenticate, authorize, ROLES } from '@/lib/middleware';
import { uploadImage } from '@/lib/cloudinary';
import { handleApiError } from '@/lib/errors';

export async function GET(request) {
  try {
    const tenant = await resolveTenant(request);
    const items = await menuService.findByTenant(tenant.id);
    const transformedItems = items.map(transformMenuItem);
    return NextResponse.json({ success: true, data: transformedItems });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request) {
  try {
    const user = await authenticate(request);
    authorize(ROLES.MANAGER)(user);
    const tenant = await resolveTenant(request);
    const contentType = request.headers.get('content-type') || '';

    let data;
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();

      // Use either ingredients or tags (ingredients takes priority for frontend)
      const ingredientsInput = formData.get('ingredients');
      const tagsInput = formData.get('tags');
      const processedTags = (ingredientsInput || tagsInput)
        ? (ingredientsInput || tagsInput).split(',').map((t) => t.trim()).filter(Boolean)
        : [];

      data = {
        name: formData.get('name'),
        price: parseFloat(formData.get('price')),
        category: formData.get('category'),
        description: formData.get('description') || '',
        tags: processedTags,
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
      // Use either ingredients or tags
      const processedTags = Array.isArray(body.ingredients) 
        ? body.ingredients 
        : (Array.isArray(body.tags) ? body.tags : []);

      data = {
        name: body.name,
        price: parseFloat(body.price),
        category: body.category,
        description: body.description || '',
        tags: processedTags,
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
