import { NextResponse } from 'next/server';
import { menuService } from '@/services/menuService';
import { resolveTenant, transformMenuItem } from '@/lib/tenant';
import { authenticate, authorize, ROLES } from '@/lib/middleware';
import { uploadImage } from '@/lib/cloudinary';
import { handleApiError } from '@/lib/errors';

export async function PUT(request, { params }) {
  try {
    const user = await authenticate(request);
    authorize(ROLES.MANAGER)(user);
    const { id } = await params;
    const tenant = await resolveTenant(request);
    const contentType = request.headers.get('content-type') || '';

    let updates;
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();

      updates = {};
      if (formData.has('name')) updates.name = formData.get('name');
      if (formData.has('price')) updates.price = parseFloat(formData.get('price'));
      if (formData.has('category')) updates.category = formData.get('category');
      if (formData.has('description')) updates.description = formData.get('description');
      if (formData.has('tags')) {
        updates.tags = formData.get('tags').split(',').map((t) => t.trim()).filter(Boolean);
      }
      if (formData.has('available')) updates.available = formData.get('available') === 'true';

      const file = formData.get('image');
      if (file && file instanceof File) {
        updates.imageUrl = await uploadImage(file);
      } else if (typeof file === 'string' && file.trim() !== '') {
        updates.imageUrl = file;
      }
    } else {
      const body = await request.json();
      updates = {};
      if (body.name !== undefined) updates.name = body.name;
      if (body.price !== undefined) updates.price = parseFloat(body.price);
      if (body.category !== undefined) updates.category = body.category;
      if (body.description !== undefined) updates.description = body.description;
      if (body.tags !== undefined) updates.tags = Array.isArray(body.tags) ? body.tags : [];
      if (body.available !== undefined) updates.available = body.available;
      if (body.imageUrl !== undefined) updates.imageUrl = body.imageUrl;
    }

    const item = await menuService.update(id, tenant.id, updates);
    return NextResponse.json({ success: true, data: transformMenuItem(item) });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = await authenticate(request);
    authorize(ROLES.MANAGER)(user);
    const { id } = await params;
    const tenant = await resolveTenant(request);
    await menuService.delete(id, tenant.id);
    return NextResponse.json({ success: true, message: 'Item deleted' });
  } catch (error) {
    return handleApiError(error);
  }
}
