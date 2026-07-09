import { prisma } from '@/lib/prisma';
import { NotFoundError } from '@/lib/errors';

export async function resolveTenant(request) {
  const slug =
    request.headers.get('x-tenant-slug') ||
    process.env.NEXT_PUBLIC_DEFAULT_TENANT ||
    'bistronoir';

  const tenant = await prisma.tenant.findUnique({
    where: { slug, isActive: true },
  });

  if (!tenant) {
    throw new NotFoundError(`Tenant "${slug}" not found or inactive`);
  }

  return tenant;
}

// Maps Prisma field names and types to what the frontend expects
export function transformMenuItem(item) {
  return {
    id: item.id,
    name: item.name,
    price: Number(item.price),
    description: item.description,
    category: item.category,
    tags: item.tags,
    image: item.imageUrl,
    available: item.available,
    sortOrder: item.sortOrder,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

export function transformOrder(order) {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    tableNumber: order.tableNumber,
    status: order.status,
    notes: order.notes,
    items: order.items,
    subtotal: Number(order.subtotal),
    serviceCharge: Number(order.serviceCharge),
    totalAmount: Number(order.totalAmount),
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
}
