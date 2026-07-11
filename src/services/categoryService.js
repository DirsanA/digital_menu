import { prisma } from '@/lib/prisma';
import { NotFoundError, ValidationError } from '@/lib/errors';

function pickCategoryData(data) {
  const result = {};
  if (data.name !== undefined) result.name = data.name;
  if (data.sortOrder !== undefined) result.sortOrder = data.sortOrder;
  return result;
}

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
    if (!data.name?.trim()) throw new ValidationError('Category name is required');

    const existing = await prisma.category.findUnique({
      where: { tenantId_name: { tenantId, name: data.name.trim() } },
    });
    if (existing) throw new ValidationError('Category name already exists');

    const maxOrder = await prisma.category.aggregate({
      where: { tenantId },
      _max: { sortOrder: true },
    });

    return prisma.category.create({
      data: {
        tenantId,
        name: data.name.trim(),
        sortOrder: data.sortOrder ?? (maxOrder._max.sortOrder ?? 0) + 1,
      },
    });
  },

  async update(id, tenantId, data) {
    const updateData = pickCategoryData(data);
    if (updateData.name) updateData.name = updateData.name.trim();
    if (Object.keys(updateData).length === 0) {
      return this.findById(id, tenantId);
    }

    if (updateData.name) {
      const existing = await prisma.category.findFirst({
        where: { tenantId, name: updateData.name, id: { not: id } },
      });
      if (existing) throw new ValidationError('Category name already exists');
    }

    const result = await prisma.category.updateMany({
      where: { id, tenantId },
      data: updateData,
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
