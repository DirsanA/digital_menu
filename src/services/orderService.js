import { prisma } from '@/lib/prisma';
import { NotFoundError, ValidationError } from '@/lib/errors';

const VALID_STATUSES = ['pending', 'preparing', 'ready', 'completed', 'cancelled'];

export const orderService = {
  async findByTenant(tenantId, filters = {}) {
    const where = { tenantId };
    if (filters.status) where.status = filters.status;
    if (filters.tableNumber) {
      const tableNumber = parseInt(filters.tableNumber, 10);
      if (Number.isInteger(tableNumber)) where.tableNumber = tableNumber;
    }

    return prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  },

  async findById(id, tenantId) {
    const order = await prisma.order.findFirst({ where: { id, tenantId } });
    if (!order) throw new NotFoundError('Order');
    return order;
  },

  async create(tenantId, data) {
    const { items, notes } = data;
    const tableNumber = parseInt(data.tableNumber, 10);

    if (!Number.isInteger(tableNumber) || tableNumber < 1 || !items?.length) {
      throw new ValidationError('tableNumber and items are required');
    }

    const subtotal = items.reduce((sum, i) => sum + (i.unitPrice ?? i.price) * i.quantity, 0);

    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    const serviceChargePercent = tenant?.serviceCharge?.toNumber?.() ?? 10;
    const serviceCharge = subtotal * (serviceChargePercent / 100);

    return prisma.order.create({
      data: {
        tenantId,
        tableNumber,
        items,
        notes: notes || '',
        subtotal,
        serviceCharge,
        totalAmount: subtotal + serviceCharge,
      },
    });
  },

  async updateStatus(id, tenantId, status) {
    if (!VALID_STATUSES.includes(status)) {
      throw new ValidationError(`Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`);
    }

    const result = await prisma.order.updateMany({
      where: { id, tenantId },
      data: { status },
    });
    if (result.count === 0) throw new NotFoundError('Order');
    return this.findById(id, tenantId);
  },
};
