import { prisma } from '@/lib/prisma';
import { NotFoundError } from '@/lib/errors';

export const pricingPlanService = {
  async findAll() {
    return prisma.pricingPlan.findMany({ orderBy: { price: 'asc' } });
  },

  async findById(id) {
    const plan = await prisma.pricingPlan.findUnique({ where: { id } });
    if (!plan) throw new NotFoundError('Pricing plan');
    return plan;
  },

  async create(data) {
    return prisma.pricingPlan.create({ data });
  },

  async update(id, data) {
    await this.findById(id);
    return prisma.pricingPlan.update({ where: { id }, data });
  },

  async delete(id) {
    await this.findById(id);
    return prisma.pricingPlan.delete({ where: { id } });
  },
};
