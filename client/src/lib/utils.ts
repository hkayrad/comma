import { clsx, type ClassValue } from "clsx";
import type { TFunction } from "i18next";
import { toast } from "sonner";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function notImplemented(t: TFunction) {
	toast.error(t("notification.notImplemented"));
}

export function copyToClipboard(text: string, t: TFunction) {
	navigator.clipboard
		.writeText(text)
		.then(() => {
			toast.success(t("notification.copy.success"));
		})
		.catch(() => {
			toast.error(t("notification.copy.success"));
		});
}

export function sendRefreshEvent(type: "global:refresh" | "logo:refresh" = "global:refresh") {
	window.dispatchEvent(new Event(type));
}

export function formatCurrency(amount?: number, currency: string = "TRY") {
	if (!amount) return "0,00 ₺";
	return new Intl.NumberFormat("tr-TR", {
		style: "currency",
		currency: currency,
	}).format(amount);
}

export function formatDate(date?: Date) {
	if (!date) return "N/A";
	return new Date(date).toLocaleDateString("tr-TR", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});
}
