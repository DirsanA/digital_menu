import { prisma } from '@/lib/prisma';
import { NotFoundError } from '@/lib/errors';

export const tenantService = {
  async findAll() {
    return prisma.tenant.findMany({ orderBy: { name: 'asc' } });
  },

  async findById(id) {
    const tenant = await prisma.tenant.findUnique({ where: { id } });
    if (!tenant) throw new NotFoundError('Tenant');
    return tenant;
  },

  async findBySlug(slug) {
    const tenant = await prisma.tenant.findUnique({
      where: { slug, isActive: true },
    });
    if (!tenant) throw new NotFoundError('Tenant');
    return tenant;
  },

  async create(data) {
    return prisma.tenant.create({ data });
  },

  async update(id, data) {
    await this.findById(id);
    return prisma.tenant.update({ where: { id }, data });
  },

  async deactivate(id) {
    await this.findById(id);
    return prisma.tenant.update({
      where: { id },
      data: { isActive: false },
    });
  },

  async delete(id) {
    await this.findById(id);
    return prisma.tenant.delete({ where: { id } });
  },
};
