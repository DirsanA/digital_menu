import { prisma } from '@/lib/prisma';
import { NotFoundError } from '@/lib/errors';

export const menuService = {
  async findByTenant(tenantId) {
    return prisma.menuItem.findMany({
      where: { tenantId },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
  },

  async findById(id) {
    const item = await prisma.menuItem.findUnique({ where: { id } });
    if (!item) throw new NotFoundError('Menu item');
    return item;
  },

  async create(tenantId, data) {
    return prisma.menuItem.create({ data: { tenantId, ...data } });
  },

  async update(id, tenantId, data) {
    const result = await prisma.menuItem.updateMany({
      where: { id, tenantId },
      data,
    });
    if (result.count === 0) throw new NotFoundError('Menu item');
    return this.findById(id);
  },

  async delete(id, tenantId) {
    const result = await prisma.menuItem.deleteMany({
      where: { id, tenantId },
    });
    if (result.count === 0) throw new NotFoundError('Menu item');
    return true;
  },
};
