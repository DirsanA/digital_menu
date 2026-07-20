import { prisma } from '@/lib/prisma';
import { NotFoundError } from '@/lib/errors';

export const expenseService = {
  async findByTenant(tenantId, filters = {}) {
    const where = { tenantId };
    if (filters.category) where.category = filters.category;
    if (filters.dateFrom || filters.dateTo) {
      where.date = {};
      if (filters.dateFrom) where.date.gte = new Date(filters.dateFrom);
      if (filters.dateTo) where.date.lte = new Date(filters.dateTo);
    }

    return prisma.expense.findMany({
      where,
      orderBy: { date: 'desc' },
    });
  },

  async findById(id, tenantId) {
    const expense = await prisma.expense.findFirst({ where: { id, tenantId } });
    if (!expense) throw new NotFoundError('Expense');
    return expense;
  },

  async create(tenantId, data) {
    return prisma.expense.create({
      data: {
        tenantId,
        description: data.description,
        amount: data.amount,
        category: data.category,
        date: data.date ? new Date(data.date) : new Date(),
        createdBy: data.createdBy,
      },
    });
  },

  async update(id, tenantId, data) {
    const result = await prisma.expense.updateMany({
      where: { id, tenantId },
      data,
    });
    if (result.count === 0) throw new NotFoundError('Expense');
    return this.findById(id, tenantId);
  },

  async delete(id, tenantId) {
    const result = await prisma.expense.deleteMany({
      where: { id, tenantId },
    });
    if (result.count === 0) throw new NotFoundError('Expense');
    return true;
  },
};
