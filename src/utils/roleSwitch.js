// src/utils/roleSwitch.js

const normalizeRole = (roleValue = '') => {
  const role = String(roleValue || '').trim().toLowerCase();
  if (role.includes('super')) return 'super_admin';
  if (role.includes('sub')) return 'sub_admin';
  if (role.includes('admin')) return 'admin';
  if (role.includes('instructor')) return 'instructor';
  if (role.includes('student')) return 'student';
  return role || 'student';
};

// Get the current acting role (defaults to user's original role)
export const getActingRole = () => {
  const acting = localStorage.getItem('lms_acting_role');
  const user = JSON.parse(localStorage.getItem('lms_user') || '{}');
  const normalizedUserRole = normalizeRole(user.role || user.originalRole || 'student');

  if (acting && (normalizedUserRole === 'admin' || normalizedUserRole === 'instructor')) {
    return normalizeRole(acting);
  }

  return normalizedUserRole;
};

// Set the acting role (only for admin/instructor)
export const setActingRole = (role) => {
  const user = JSON.parse(localStorage.getItem('lms_user') || '{}');
  const baseRole = normalizeRole(user.role || user.originalRole || 'student');
  const targetRole = normalizeRole(role);

  if (baseRole === 'admin' && ['admin', 'instructor', 'student'].includes(targetRole)) {
    localStorage.setItem('lms_acting_role', targetRole);
    const nextUser = { ...user, role: targetRole, actingRole: targetRole };
    localStorage.setItem('lms_user', JSON.stringify(nextUser));
    return targetRole;
  }

  if (baseRole === 'instructor' && ['instructor', 'student'].includes(targetRole)) {
    localStorage.setItem('lms_acting_role', targetRole);
    const nextUser = { ...user, role: targetRole, actingRole: targetRole };
    localStorage.setItem('lms_user', JSON.stringify(nextUser));
    return targetRole;
  }

  localStorage.removeItem('lms_acting_role');
  const fallbackUser = { ...user, role: baseRole, actingRole: baseRole };
  localStorage.setItem('lms_user', JSON.stringify(fallbackUser));
  return baseRole;
};

// Reset acting role to original
export const resetActingRole = () => {
  localStorage.removeItem('lms_acting_role');
  const user = JSON.parse(localStorage.getItem('lms_user') || '{}');
  if (user) {
    const baseRole = normalizeRole(user.originalRole || user.role || 'student');
    localStorage.setItem('lms_user', JSON.stringify({ ...user, role: baseRole, actingRole: baseRole }));
  }
};