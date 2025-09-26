import { clsx, type ClassValue } from "clsx"
import { toast } from "sonner";
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function notImplemented() {
  toast.error("Bu özellik henüz geliştirilmedi");
}

export function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text)
    .then(() => {
      toast.success("Panoya kopyalandı");
    })
    .catch(() => {
      toast.error("Panoya kopyalanamadı");
    });
}

export function sendRefreshEvent() {
  window.dispatchEvent(new Event("global:refresh"));
}