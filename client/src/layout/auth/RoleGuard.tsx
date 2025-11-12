import { useRole } from "@/hooks/useRole";
import type { ReactNode } from "react";

interface RoleGuardProps {
  children: ReactNode;
  /**
   * Required role to render children
   */
  requiredRole?: number;
  /**
   * Minimum role level required (for hierarchical roles)
   */
  minimumRole?: number;
  /**
   * Array of roles that have access
   */
  allowedRoles?: number[];
  /**
   * Render this instead if user doesn't have required role
   */
  fallback?: ReactNode;
  /**
   * Invert the logic - render children only if user does NOT have the role
   */
  invert?: boolean;
}

/**
 * Component that conditionally renders children based on user role
 *
 * @example
 * // Only admins can see this button
 * <RoleGuard requiredRole={1}>
 *   <Button>Admin Only Button</Button>
 * </RoleGuard>
 *
 * @example
 * // Multiple roles can access
 * <RoleGuard allowedRoles={[1, 2]}>
 *   <Button>Manager or Admin Button</Button>
 * </RoleGuard>
 *
 * @example
 * // Show fallback for non-admin users
 * <RoleGuard requiredRole={1} fallback={<div>Access Denied</div>}>
 *   <Button>Admin Only Button</Button>
 * </RoleGuard>
 *
 * @example
 * // Hide something from admins
 * <RoleGuard requiredRole={1} invert>
 *   <Button>Non-Admin Button</Button>
 * </RoleGuard>
 */
export const RoleGuard = ({
  children,
  requiredRole,
  minimumRole,
  allowedRoles,
  fallback = null,
  invert = false,
}: RoleGuardProps) => {
  const { hasRole, hasMinimumRole, hasAnyRole } = useRole();

  let hasAccess = false;

  if (requiredRole !== undefined) {
    hasAccess = hasRole(requiredRole);
  } else if (minimumRole !== undefined) {
    hasAccess = hasMinimumRole(minimumRole);
  } else if (allowedRoles !== undefined) {
    hasAccess = hasAnyRole(allowedRoles);
  } else {
    // If no role check is specified, default to true
    hasAccess = true;
  }

  // Apply invert logic if specified
  if (invert) {
    hasAccess = !hasAccess;
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>;
};

export const SystemAdminOnly = ({
  children,
  fallback = null,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) => {
  return (
    <RoleGuard requiredRole={99} fallback={fallback}>
      {children}
    </RoleGuard>
  );
};

/**
 * Component that only renders for admin users (role === 1)
 */
export const CompanyAdminOnly = ({
  children,
  fallback = null,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) => {
  return (
    <RoleGuard requiredRole={1} fallback={fallback}>
      {children}
    </RoleGuard>
  );
};

/**
 * Component that only renders for non-admin users (role !== 1)
 */
export const NonSystemAdminOnly = ({
  children,
  fallback = null,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) => {
  return (
    <RoleGuard minimumRole={99} invert fallback={fallback}>
      {children}
    </RoleGuard>
  );
};
