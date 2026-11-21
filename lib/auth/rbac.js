import { NextResponse } from 'next/server';
import { getCurrentSession } from './session';

export const ROLES = {
  CUSTOMER: 'customer',
  TECHNICIAN: 'technician',
  DISPATCHER: 'dispatcher',
  ADMIN: 'admin',
};

/**
 * Server-side authorization guard for Next.js Route Handlers.
 * @param {Array<string>} allowedRoles - Optional list of permitted roles. If empty, any authenticated user is allowed.
 * @returns {Promise<{ authorized: boolean, user?: object, session?: object, response?: NextResponse }>}
 */
export async function requireAuth(allowedRoles = []) {
  const sessionData = await getCurrentSession();

  if (!sessionData || !sessionData.user) {
    return {
      authorized: false,
      response: NextResponse.json(
        { success: false, error: 'Authentication required. Please log in.' },
        { status: 401 }
      ),
    };
  }

  const { user, session } = sessionData;

  if (allowedRoles.length > 0) {
    const normalizedUserRole = (user.role || '').toLowerCase();
    const hasRole = allowedRoles.some((role) => role.toLowerCase() === normalizedUserRole);

    if (!hasRole) {
      return {
        authorized: false,
        response: NextResponse.json(
          { success: false, error: 'Access denied: insufficient permissions for this resource.' },
          { status: 403 }
        ),
      };
    }
  }

  return {
    authorized: true,
    user,
    session,
  };
}

/**
 * Check if the user is the resource owner, or has administrative override privileges.
 * @param {object} user - Authenticated user object.
 * @param {string} resourceOwnerId - UUID or email of the resource owner.
 * @param {Array<string>} overrideRoles - Roles permitted to bypass ownership (defaults to admin and dispatcher).
 * @returns {boolean}
 */
export function isOwnerOrPrivileged(user, resourceOwnerId, overrideRoles = ['admin', 'dispatcher']) {
  if (!user) return false;
  const userRole = (user.role || '').toLowerCase();
  if (overrideRoles.some((r) => r.toLowerCase() === userRole)) {
    return true;
  }
  return user.id === resourceOwnerId || user.email === resourceOwnerId;
}

