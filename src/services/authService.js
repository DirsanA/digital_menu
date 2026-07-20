import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { userService } from '@/services/userService';
import { tenantService } from '@/services/tenantService';
import { UnauthorizedError } from '@/lib/errors';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

export const authService = {
  async login(email, password, tenantSlug) {
    if (tenantSlug) {
      return this.loginStaff(email, password, tenantSlug);
    }
    return this.loginSuperAdmin(email, password);
  },

  async loginStaff(email, password, tenantSlug) {
    const tenant = await tenantService.findBySlug(tenantSlug);
    const user = await userService.findByEmail(tenant.id, email);

    if (!user || !user.isActive) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedError('Invalid credentials');
    }

    await userService.updateLastLogin(user.id);

    const accessToken = this.generateAccessToken(user, tenant.id);
    const refreshToken = this.generateRefreshToken(user, tenant.id);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
        tenantId: tenant.id,
        tenantSlug: tenant.slug,
        tenantName: tenant.name,
      },
    };
  },

  async loginSuperAdmin(email, password) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.role !== 'super_admin' || !user.isActive) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedError('Invalid credentials');
    }

    await userService.updateLastLogin(user.id);

    const token = jwt.sign(
      { sub: user.id, role: 'super_admin', email: user.email },
      JWT_SECRET,
      { expiresIn: '2h' }
    );

    return {
      accessToken: token,
      refreshToken: null,
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        role: 'super_admin',
      },
    };
  },

  generateAccessToken(user, tenantId) {
    return jwt.sign(
      { sub: user.id, tenant_id: tenantId, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
  },

  generateRefreshToken(user, tenantId) {
    return jwt.sign(
      { sub: user.id, tenant_id: tenantId, type: 'refresh' },
      JWT_SECRET,
      { expiresIn: JWT_REFRESH_EXPIRES_IN }
    );
  },

  async refresh(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, JWT_SECRET);
      if (decoded.type !== 'refresh') {
        throw new UnauthorizedError('Invalid refresh token');
      }

      const user = await userService.findById(decoded.sub);
      if (!user || !user.isActive) {
        throw new UnauthorizedError('User not found or inactive');
      }

      const accessToken = this.generateAccessToken(user, decoded.tenant_id);
      return { accessToken };
    } catch (err) {
      if (err instanceof UnauthorizedError) throw err;
      throw new UnauthorizedError('Invalid or expired refresh token');
    }
  },

  async getCurrentUser(userId) {
    const user = await userService.findById(userId);
    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      role: user.role,
      tenantId: user.tenantId,
    };
  },
};
