import { useUser } from "@/contexts/user/useUser";
import { useMemo } from "react";

/**
 * Hook for role-based access control
 * Provides utilities to check user roles and permissions
 */
export const useRole = () => {
	const { user } = useUser();

	const role = useMemo(() => user?.role ?? null, [user?.role]);

	const isSystemAdmin = useMemo(() => role === 99, [role]);

	const isCompanyAdmin = useMemo(() => role === 1, [role]);

	const isUser = useMemo(() => role === 0, [role]);

	const hasRole = useMemo(
		() => (requiredRole: number) => {
			return role === requiredRole;
		},
		[role],
	);

	const hasMinimumRole = useMemo(
		() => (minimumRole: number) => {
			if (role === null) return false;
			return role >= minimumRole;
		},
		[role],
	);

	const hasAnyRole = useMemo(
		() => (roles: number[]) => {
			if (role === null) return false;
			return roles.includes(role);
		},
		[role],
	);

	return {
		role,
		isSystemAdmin,
		isCompanyAdmin,
		isUser,
		hasRole,
		hasMinimumRole,
		hasAnyRole,
	};
};
