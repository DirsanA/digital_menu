import { prisma } from '@/lib/prisma';
import { NotFoundError, ValidationError } from '@/lib/errors';

export const domainService = {
  async findByTenant(tenantId) {
    return prisma.tenantDomain.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  },

  async findById(id) {
    const domain = await prisma.tenantDomain.findUnique({ where: { id } });
    if (!domain) throw new NotFoundError('Domain');
    return domain;
  },

  async create(tenantId, domain) {
    const existing = await prisma.tenantDomain.findUnique({
      where: { domain },
    });
    if (existing) throw new ValidationError('Domain already registered');

    return prisma.tenantDomain.create({
      data: { tenantId, domain },
    });
  },

  async verify(id, tenantId) {
    const result = await prisma.tenantDomain.updateMany({
      where: { id, tenantId },
      data: { verified: true },
    });
    if (result.count === 0) throw new NotFoundError('Domain');
    return this.findById(id);
  },

  async delete(id, tenantId) {
    const result = await prisma.tenantDomain.deleteMany({
      where: { id, tenantId },
    });
    if (result.count === 0) throw new NotFoundError('Domain');
    return true;
  },
};
