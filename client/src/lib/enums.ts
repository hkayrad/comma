export const UserRole = {
    0: "Kullanıcı",
    1: "Admin",
} as const;
export type UserRoleType = keyof typeof UserRole;

export const RoleBackgrounds = {
    0: "bg-green-200",
    1: "bg-blue-200",
} as const;
export type RoleBackgroundType = keyof typeof RoleBackgrounds;

export const RoleColors = {
    0: "text-green-600",
    1: "text-blue-600",
} as const;
export type RoleColorType = keyof typeof RoleColors;