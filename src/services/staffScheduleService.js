import { prisma } from '@/lib/prisma';
import { NotFoundError } from '@/lib/errors';

export const staffScheduleService = {
  async findByTenant(tenantId, filters = {}) {
    const where = { tenantId };
    if (filters.userId) where.userId = filters.userId;
    if (filters.dayOfWeek !== undefined) where.dayOfWeek = filters.dayOfWeek;

    return prisma.staffSchedule.findMany({
      where,
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
      include: {
        user: { select: { id: true, displayName: true, role: true } },
      },
    });
  },

  async findById(id, tenantId) {
    const schedule = await prisma.staffSchedule.findFirst({
      where: { id, tenantId },
      include: {
        user: { select: { id: true, displayName: true, role: true } },
      },
    });
    if (!schedule) throw new NotFoundError('Staff schedule');
    return schedule;
  },

  async create(tenantId, data) {
    return prisma.staffSchedule.create({
      data: {
        tenantId,
        userId: data.userId,
        dayOfWeek: data.dayOfWeek,
        startTime: data.startTime,
        endTime: data.endTime,
      },
      include: {
        user: { select: { id: true, displayName: true, role: true } },
      },
    });
  },

  async update(id, tenantId, data) {
    const result = await prisma.staffSchedule.updateMany({
      where: { id, tenantId },
      data,
    });
    if (result.count === 0) throw new NotFoundError('Staff schedule');
    return this.findById(id, tenantId);
  },

  async delete(id, tenantId) {
    const result = await prisma.staffSchedule.deleteMany({
      where: { id, tenantId },
    });
    if (result.count === 0) throw new NotFoundError('Staff schedule');
    return true;
  },
};
