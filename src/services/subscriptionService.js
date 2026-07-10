import { prisma } from '@/lib/prisma';
import { NotFoundError } from '@/lib/errors';

export const subscriptionService = {
  async findByTenant(tenantId) {
    return prisma.subscription.findUnique({
      where: { tenantId },
      include: { plan: true },
    });
  },

  async findAll() {
    return prisma.subscription.findMany({
      include: { tenant: true, plan: true },
      orderBy: { createdAt: 'desc' },
    });
  },

  async findById(id) {
    const sub = await prisma.subscription.findUnique({
      where: { id },
      include: { tenant: true, plan: true },
    });
    if (!sub) throw new NotFoundError('Subscription');
    return sub;
  },

  async create(data) {
    return prisma.subscription.create({
      data: {
        tenantId: data.tenantId,
        planId: data.planId,
        status: data.status || 'trialing',
        autoRenew: data.autoRenew ?? true,
      },
      include: { plan: true },
    });
  },

  async update(id, data) {
    await this.findById(id);
    return prisma.subscription.update({
      where: { id },
      data,
      include: { plan: true },
    });
  },

  async cancel(id) {
    return this.update(id, { status: 'cancelled', autoRenew: false });
  },
};
