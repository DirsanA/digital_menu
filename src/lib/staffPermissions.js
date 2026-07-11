import { ForbiddenError } from '@/lib/errors';
import { ROLES } from '@/lib/middleware';

export const STAFF_ROLE_OPTIONS = ['owner', 'manager', 'cashier', 'waiter', 'kitchen_staff'];

export function getAssignableRoles(actor) {
  if (actor?.role === ROLES.MANAGER) {
    return STAFF_ROLE_OPTIONS.filter((role) => role !== ROLES.OWNER);
  }
  return STAFF_ROLE_OPTIONS;
}

export function canManageStaff(actor, target) {
  if (!actor || !target) return false;
  if (actor.role === ROLES.SUPER_ADMIN) return false;
  if (actor.role === ROLES.OWNER) return true;
  if (actor.role === ROLES.MANAGER) {
    if (target.role === ROLES.OWNER) return false;
    if (target.id === actor.id || target.id === actor.sub) return false;
    return true;
  }
  return false;
}

export function assertCanManageStaff(actor, target) {
  if (canManageStaff(actor, target)) return;

  if (actor.role === ROLES.MANAGER && target.role === ROLES.OWNER) {
    throw new ForbiddenError('Managers cannot modify the restaurant owner');
  }
  if (actor.role === ROLES.MANAGER && (target.id === actor.id || target.id === actor.sub)) {
    throw new ForbiddenError('Managers cannot modify their own account');
  }
  throw new ForbiddenError('Insufficient permissions');
}

export function assertCanAssignStaffRole(actor, role) {
  if (actor.role === ROLES.MANAGER && role === ROLES.OWNER) {
    throw new ForbiddenError('Managers cannot assign the owner role');
  }
}

export function assertCanDeleteStaff(actor, target) {
  assertCanManageStaff(actor, target);
  if (target.role === ROLES.OWNER) {
    throw new ForbiddenError('Cannot delete the restaurant owner');
  }
}
