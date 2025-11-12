import { clsx, type ClassValue } from "clsx";
import { toast } from "sonner";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function notImplemented() {
	toast.error("Bu özellik henüz geliştirilmedi");
}

export function copyToClipboard(text: string) {
	navigator.clipboard
		.writeText(text)
		.then(() => {
			toast.success("Panoya kopyalandı");
		})
		.catch(() => {
			toast.error("Panoya kopyalanamadı");
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
