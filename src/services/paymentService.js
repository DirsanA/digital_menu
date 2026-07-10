import { prisma } from '@/lib/prisma';
import { NotFoundError, ValidationError } from '@/lib/errors';

export const paymentService = {
  async findByTenant(tenantId, filters = {}) {
    const where = { tenantId };
    if (filters.orderId) where.orderId = filters.orderId;
    if (filters.status) where.status = filters.status;
    if (filters.method) where.method = filters.method;

    return prisma.payment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  },

  async findById(id, tenantId) {
    const payment = await prisma.payment.findFirst({ where: { id, tenantId } });
    if (!payment) throw new NotFoundError('Payment');
    return payment;
  },

  async create(tenantId, data) {
    const order = await prisma.order.findFirst({
      where: { id: data.orderId, tenantId },
    });
    if (!order) throw new NotFoundError('Order');

    return prisma.payment.create({
      data: {
        tenantId,
        orderId: data.orderId,
        amount: data.amount,
        method: data.method || 'cash',
        status: data.status || 'completed',
        reference: data.reference,
        processedBy: data.processedBy,
      },
    });
  },

  async refund(id, tenantId) {
    const payment = await this.findById(id, tenantId);
    if (payment.status === 'refunded') {
      throw new ValidationError('Payment already refunded');
    }

    const result = await prisma.payment.updateMany({
      where: { id, tenantId },
      data: { status: 'refunded' },
    });
    if (result.count === 0) throw new NotFoundError('Payment');
    return this.findById(id, tenantId);
  },
};
