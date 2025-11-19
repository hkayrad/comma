export const UserRole = {
	0: "Kullanıcı",
	1: "Yönetici",
	99: "Admin",
} as const;
export type UserRoleType = keyof typeof UserRole;

export const RoleBackgrounds = {
	0: "bg-green-200",
	1: "bg-blue-200",
	99: "bg-red-200",
} as const;
export type RoleBackgroundType = keyof typeof RoleBackgrounds;

export const RoleColors = {
	0: "text-green-600",
	1: "text-blue-600",
	99: "text-red-600",
} as const;
export type RoleColorType = keyof typeof RoleColors;

export const AvailableCurrencies = ["TRY", "USD", "EUR"] as const;
export type AvailableCurrencyType = keyof typeof AvailableCurrencies;

export const CurrencyIcons = {
	TRY: "₺",
	USD: "$",
	EUR: "€",
} as const;
export type CurrencyIconType = keyof typeof CurrencyIcons;
