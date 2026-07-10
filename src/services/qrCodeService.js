import { prisma } from '@/lib/prisma';
import { NotFoundError } from '@/lib/errors';

export const qrCodeService = {
  async findRestaurantQr(tenantId) {
    return prisma.qrCode.findFirst({
      where: { tenantId, tableId: null, isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  },

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

  async upsertRestaurantQr(tenantId, { url, label }) {
    const existing = await this.findRestaurantQr(tenantId);
    if (existing) {
      return prisma.qrCode.update({
        where: { id: existing.id },
        data: { url, label: label ?? existing.label },
      });
    }
    return prisma.qrCode.create({
      data: {
        tenantId,
        tableId: null,
        url,
        label: label ?? 'Restaurant Menu',
      },
    });
  },

  async create(tenantId, data) {
    return prisma.qrCode.create({
      data: {
        tenantId,
        tableId: data.tableId ?? null,
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
