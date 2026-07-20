import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { UnauthorizedError, ForbiddenError } from '@/lib/errors';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';

export function getTokenFromRequest(request) {
  const auth = request.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  return auth.slice(7);
}

export async function authenticate(request) {
  const token = getTokenFromRequest(request);
  if (!token) throw new UnauthorizedError('Missing authentication token');
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch {
    throw new UnauthorizedError('Invalid or expired token');
  }
}

export function authorize(...allowedRoles) {
  return (user) => {
    if (!allowedRoles.includes(user.role)) {
      throw new ForbiddenError('Insufficient permissions');
    }
    return user;
  };
}

export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  MANAGER: 'manager',
  CASHIER: 'cashier',
  WAITER: 'waiter',
  KITCHEN_STAFF: 'kitchen_staff',
};
