import { prisma } from '@/lib/prisma';
import { NotFoundError } from '@/lib/errors';

export const featureFlagService = {
  async findAll() {
    return prisma.featureFlag.findMany({ orderBy: { key: 'asc' } });
  },

  async findByKey(key) {
    const flag = await prisma.featureFlag.findUnique({ where: { key } });
    if (!flag) throw new NotFoundError('Feature flag');
    return flag;
  },

  async isEnabled(key, tenantId) {
    const flag = await prisma.featureFlag.findUnique({ where: { key } });
    if (!flag) return false;

    if (flag.tenantOverrides && typeof flag.tenantOverrides === 'object') {
      const overrides = flag.tenantOverrides;
      if (overrides[tenantId] !== undefined) return overrides[tenantId];
    }

    return flag.enabled;
  },

  async create(data) {
    return prisma.featureFlag.create({ data });
  },

  async update(key, data) {
    await this.findByKey(key);
    return prisma.featureFlag.update({ where: { key }, data });
  },

  async delete(key) {
    await this.findByKey(key);
    return prisma.featureFlag.delete({ where: { key } });
  },

  async setTenantOverride(key, tenantId, enabled) {
    const flag = await this.findByKey(key);
    const overrides = (flag.tenantOverrides && typeof flag.tenantOverrides === 'object')
      ? { ...flag.tenantOverrides }
      : {};
    overrides[tenantId] = enabled;

    return prisma.featureFlag.update({
      where: { key },
      data: { tenantOverrides: overrides },
    });
  },
};
