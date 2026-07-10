import { prisma } from '@/lib/prisma';
import { NotFoundError, ValidationError } from '@/lib/errors';

export const categoryService = {
  async findByTenant(tenantId) {
    return prisma.category.findMany({
      where: { tenantId },
      orderBy: { sortOrder: 'asc' },
    });
  },

  async findById(id, tenantId) {
    const category = await prisma.category.findFirst({ where: { id, tenantId } });
    if (!category) throw new NotFoundError('Category');
    return category;
  },

  async create(tenantId, data) {
    const existing = await prisma.category.findUnique({
      where: { tenantId_name: { tenantId, name: data.name } },
    });
    if (existing) throw new ValidationError('Category name already exists');

    return prisma.category.create({
      data: { tenantId, ...data },
    });
  },

  async update(id, tenantId, data) {
    const result = await prisma.category.updateMany({
      where: { id, tenantId },
      data,
    });
    if (result.count === 0) throw new NotFoundError('Category');
    return this.findById(id, tenantId);
  },

  async delete(id, tenantId) {
    const result = await prisma.category.deleteMany({
      where: { id, tenantId },
    });
    if (result.count === 0) throw new NotFoundError('Category');
    return true;
  },
};
