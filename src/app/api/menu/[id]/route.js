import { NextResponse } from 'next/server';
import { updateMenuItem, deleteMenuItem } from '@/lib/db';

export async function PUT(request, { params }) {
  try {
    // Await params as required by Next.js 15+ 
    const { id } = await params;
    const formData = await request.formData();
    
    const updates = {};
    if (formData.has('name')) updates.name = formData.get('name');
    if (formData.has('price')) updates.price = parseFloat(formData.get('price'));
    if (formData.has('category')) updates.category = formData.get('category');
    if (formData.has('description')) updates.description = formData.get('description');
    if (formData.has('tags')) updates.tags = formData.get('tags').split(',').map(t => t.trim()).filter(Boolean);
    if (formData.has('available')) updates.available = formData.get('available') === 'true';

    const file = formData.get('image');
    if (file && file instanceof File) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      updates.image = `data:${file.type};base64,${buffer.toString('base64')}`;
    } else if (typeof file === 'string' && file.trim() !== '') {
      updates.image = file;
    }

    const updated = updateMenuItem(id, updates);
    if (!updated) return NextResponse.json({ success: false, message: 'Item not found' }, { status: 404 });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating menu item:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const success = deleteMenuItem(id);
    if (!success) return NextResponse.json({ success: false, message: 'Item not found' }, { status: 404 });
    return NextResponse.json({ success: true, message: 'Item deleted' });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
