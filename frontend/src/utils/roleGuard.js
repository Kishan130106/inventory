// utils/roleGuard.js

const ROLE_LEVELS = { staff: 1, manager: 2, admin: 3 }

/**
 * Check if user has at least the required role level
 * canAccess(user, 'manager') → true for manager and admin
 */
export const canAccess = (user, requiredRole) => {
  if (!user) return false
  return (ROLE_LEVELS[user.role] || 0) >= (ROLE_LEVELS[requiredRole] || 0)
}

export const isAdmin   = (user) => user?.role === 'admin'
export const isManager = (user) => canAccess(user, 'manager')
export const isStaff   = (user) => canAccess(user, 'staff')
