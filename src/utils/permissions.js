// Permission checking utility for admin workflows

export const PERMISSIONS = {
  // Instructor applications
  APPROVE_INSTRUCTORS: "approve_instructors",
  REJECT_INSTRUCTORS: "reject_instructors",
  VIEW_APPLICATIONS: "view_applications",

  // Settings
  MANAGE_SETTINGS: "manage_settings",
  MANAGE_PAYMENT: "manage_payment",
  MANAGE_NOTIFICATIONS: "manage_notifications",

  // Reports
  VIEW_REPORTS: "view_reports",
  VIEW_ORDERS: "view_orders",
  VIEW_REVENUE: "view_revenue",
  EXPORT_REPORTS: "export_reports",
};

export const ROLES = {
  MAIN_ADMIN: "admin",
  SUB_ADMIN: "sub_admin",
  INSTRUCTOR: "instructor",
  STUDENT: "student",
};

/**
 * Check if user is Main Admin
 */
export const isMainAdmin = (user) => {
  return user?.role === "admin";
};

/**
 * Check if user is Sub Admin
 */
export const isSubAdmin = (user) => {
  return user?.role === "sub_admin";
};

/**
 * Check if user has specific permission
 */
export const hasPermission = (user, permission) => {
  // Main Admin has all permissions
  if (isMainAdmin(user)) {
    return true;
  }

  // Sub Admin permissions from user.permissions array or role-based permissions
  if (isSubAdmin(user)) {
    const userPermissions = user?.permissions || [];
    return userPermissions.includes(permission);
  }

  return false;
};

/**
 * Check if user can manage settings (Main Admin only)
 */
export const canManageSettings = (user) => {
  return isMainAdmin(user);
};

/**
 * Check if user can approve instructors
 */
export const canApproveInstructors = (user) => {
  return hasPermission(user, PERMISSIONS.APPROVE_INSTRUCTORS);
};

/**
 * Check if user can view instructor applications
 */
export const canViewApplications = (user) => {
  return (
    isMainAdmin(user) || hasPermission(user, PERMISSIONS.VIEW_APPLICATIONS)
  );
};

/**
 * Check if user can view reports
 */
export const canViewReports = (user) => {
  return hasPermission(user, PERMISSIONS.VIEW_REPORTS);
};

/**
 * Check if user can export reports
 */
export const canExportReports = (user) => {
  return hasPermission(user, PERMISSIONS.EXPORT_REPORTS);
};

/**
 * Get user role display name
 */
export const getRoleDisplayName = (role) => {
  const roleNames = {
    admin: "Main Admin",
    sub_admin: "Sub Admin",
    instructor: "Instructor",
    student: "Student",
  };
  return roleNames[role] || role;
};
