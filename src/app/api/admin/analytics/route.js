import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate, authorize, ROLES } from '@/lib/middleware';
import { handleApiError } from '@/lib/errors';

export async function GET(request) {
  try {
    const user = await authenticate(request);
    authorize(ROLES.SUPER_ADMIN)(user);

    const [
      totalTenants,
      activeTenants,
      totalOrders,
      totalRevenue,
      tenantList,
    ] = await Promise.all([
      prisma.tenant.count(),
      prisma.tenant.count({ where: { isActive: true } }),
      prisma.order.count(),
      prisma.order.aggregate({ _sum: { totalAmount: true }, where: { status: { not: 'cancelled' } } }),
      prisma.tenant.findMany({
        select: {
          id: true, name: true, slug: true, isActive: true,
          _count: { select: { users: true, orders: true, menuItems: true } },
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        totalTenants,
        activeTenants,
        totalOrders,
        totalRevenue: Number(totalRevenue._sum.totalAmount || 0),
        tenants: tenantList,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
