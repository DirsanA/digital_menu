import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { NotFoundError, ValidationError } from '@/lib/errors';

export const userService = {
  async findByTenant(tenantId) {
    return prisma.user.findMany({
      where: { tenantId },
      orderBy: { displayName: 'asc' },
      select: { id: true, email: true, displayName: true, role: true, isActive: true, createdAt: true, lastLoginAt: true },
    });
  },

  async findPrimaryManagerByTenant(tenantId) {
    return prisma.user.findFirst({
      where: { tenantId, role: 'manager' },
      orderBy: { createdAt: 'asc' },
      select: { id: true, email: true, displayName: true, role: true, isActive: true, createdAt: true, lastLoginAt: true },
    });
  },

  async createPrimaryManager(tenantId, data) {
    const existingManager = await this.findPrimaryManagerByTenant(tenantId);
    if (existingManager) {
      throw new ValidationError('This restaurant already has a primary manager. Edit the existing manager instead.');
    }
    if (!data.email || !data.password) {
      throw new ValidationError('Email and password are required');
    }
    return this.create(tenantId, { ...data, role: 'manager' });
  },

  async findAll() {
    return prisma.user.findMany({
      orderBy: { displayName: 'asc' },
      select: { id: true, email: true, displayName: true, role: true, isActive: true, tenantId: true, createdAt: true },
    });
  },

  async findById(id) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundError('User');
    return user;
  },

  async findByEmail(tenantId, email) {
    return prisma.user.findFirst({
      where: { tenantId, email },
    });
  },

  async create(tenantId, data) {
    const existing = tenantId
      ? await this.findByEmail(tenantId, data.email)
      : await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new ValidationError('Email already in use');

    const passwordHash = await bcrypt.hash(data.password, 12);
    return prisma.user.create({
      data: {
        tenantId: tenantId || null,
        email: data.email,
        passwordHash,
        displayName: data.displayName,
        role: data.role,
      },
      select: { id: true, email: true, displayName: true, role: true, isActive: true, tenantId: true, createdAt: true },
    });
  },

  async update(id, data) {
    await this.findById(id);
    const updateData = {};
    if (data.displayName) updateData.displayName = data.displayName;
    if (data.role) updateData.role = data.role;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.password) {
      updateData.passwordHash = await bcrypt.hash(data.password, 12);
    }

    return prisma.user.update({
      where: { id },
      data: updateData,
      select: { id: true, email: true, displayName: true, role: true, isActive: true, tenantId: true, createdAt: true },
    });
  },

  async delete(id) {
    await this.findById(id);
    return prisma.user.delete({ where: { id } });
  },

  async updateLastLogin(id) {
    return prisma.user.update({
      where: { id },
      data: { lastLoginAt: new Date() },
    });
  },
};
