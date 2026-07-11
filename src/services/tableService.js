import { prisma } from '@/lib/prisma';
import { NotFoundError, ValidationError } from '@/lib/errors';

export const tableService = {
  async findByTenant(tenantId) {
    return prisma.table.findMany({
      where: { tenantId },
      orderBy: { tableNumber: 'asc' },
    });
  },

  async findById(id, tenantId) {
    const table = await prisma.table.findFirst({ where: { id, tenantId } });
    if (!table) throw new NotFoundError('Table');
    return table;
  },

  async create(tenantId, data) {
    const existing = await prisma.table.findUnique({
      where: { tenantId_tableNumber: { tenantId, tableNumber: data.tableNumber } },
    });
    if (existing) throw new ValidationError('Table number already exists');

    return prisma.table.create({
      data: { tenantId, ...data },
    });
  },

  async update(id, tenantId, data) {
    const result = await prisma.table.updateMany({
      where: { id, tenantId },
      data,
    });
    if (result.count === 0) throw new NotFoundError('Table');
    return this.findById(id, tenantId);
  },

  async delete(id, tenantId) {
    const result = await prisma.table.deleteMany({
      where: { id, tenantId },
    });
    if (result.count === 0) throw new NotFoundError('Table');
    return true;
  },
};
