import { prisma } from '@/lib/prisma';
import { NotFoundError } from '@/lib/errors';

export const qrCodeService = {
  async findByTenant(tenantId) {
    return prisma.qrCode.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  },

  async findById(id, tenantId) {
    const qrCode = await prisma.qrCode.findFirst({ where: { id, tenantId } });
    if (!qrCode) throw new NotFoundError('QR code');
    return qrCode;
  },

  async create(tenantId, data) {
    return prisma.qrCode.create({
      data: {
        tenantId,
        tableId: data.tableId,
        url: data.url,
        label: data.label,
      },
    });
  },

  async update(id, tenantId, data) {
    const result = await prisma.qrCode.updateMany({
      where: { id, tenantId },
      data,
    });
    if (result.count === 0) throw new NotFoundError('QR code');
    return this.findById(id, tenantId);
  },

  async delete(id, tenantId) {
    const result = await prisma.qrCode.deleteMany({
      where: { id, tenantId },
    });
    if (result.count === 0) throw new NotFoundError('QR code');
    return true;
  },
};
