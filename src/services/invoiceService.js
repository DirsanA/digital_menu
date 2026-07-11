import { prisma } from '@/lib/prisma';
import { NotFoundError, ValidationError } from '@/lib/errors';

export const invoiceService = {
  async findByTenant(tenantId, filters = {}) {
    const where = { tenantId };
    if (filters.status) where.status = filters.status;

    return prisma.invoice.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  },

  async findById(id, tenantId) {
    const invoice = await prisma.invoice.findFirst({ where: { id, tenantId } });
    if (!invoice) throw new NotFoundError('Invoice');
    return invoice;
  },

  async create(tenantId, data) {
    return prisma.invoice.create({
      data: {
        tenantId,
        orderId: data.orderId,
        invoiceNumber: data.invoiceNumber,
        amount: data.amount,
        tax: data.tax || 0,
        status: data.status || 'draft',
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
      },
    });
  },

  async update(id, tenantId, data) {
    const result = await prisma.invoice.updateMany({
      where: { id, tenantId },
      data,
    });
    if (result.count === 0) throw new NotFoundError('Invoice');
    return this.findById(id, tenantId);
  },

  async markPaid(id, tenantId) {
    const result = await prisma.invoice.updateMany({
      where: { id, tenantId },
      data: { status: 'paid', paidAt: new Date() },
    });
    if (result.count === 0) throw new NotFoundError('Invoice');
    return this.findById(id, tenantId);
  },
};
