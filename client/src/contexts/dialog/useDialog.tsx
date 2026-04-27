import { create } from "zustand";
import type { CustomerDto } from "@comma/common";
import type { ReactNode } from "react";

export interface DialogConfig {
  title?: string;
  description?: string;
  content?: ReactNode;
  footer?: ReactNode;
  onClose?: () => void;
  onSuccess?: () => void;
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "full";
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
}

export interface DialogInstance extends DialogConfig {
  id: string;
  isOpen: boolean;
  customerInfo: CustomerDto | null;
}

interface DialogState {
  dialogs: DialogInstance[];
  openDialog: (config: DialogConfig, customerInfo?: CustomerDto | null) => void;
  closeDialog: () => void;
}

export const useDialog = create<DialogState>((set, get) => ({
  dialogs: [],
  openDialog: (config, customerInfo = null) => {
    const newDialog: DialogInstance = {
      ...config,
      id: crypto.randomUUID(),
      isOpen: true,
      customerInfo,
    };
    set((state) => ({ dialogs: [...state.dialogs, newDialog] }));
  },
  closeDialog: () => {
    const { dialogs } = get();
    let lastOpenIndex = -1;
    for (let i = dialogs.length - 1; i >= 0; i--) {
      if (dialogs[i].isOpen) {
        lastOpenIndex = i;
        break;
      }
    }

    if (lastOpenIndex === -1) return;

    const dialogToClose = dialogs[lastOpenIndex];
    const newDialogs = [...dialogs];
    newDialogs[lastOpenIndex] = { ...dialogToClose, isOpen: false };

    set({ dialogs: newDialogs });

    setTimeout(() => {
      if (dialogToClose.onClose) {
        dialogToClose.onClose();
      }

      set((state) => ({
        dialogs: state.dialogs.filter((d) => d.id !== dialogToClose.id),
      }));
    }, 0);
  },
}));

// Selectors for convenience
export const useIsDialogOpen = () =>
  useDialog((state) => state.dialogs.some((d) => d.isOpen));
export const useDialogCustomerInfo = () =>
  useDialog((state) => {
    const activeDialog =
      state.dialogs.length > 0 ? state.dialogs[state.dialogs.length - 1] : null;
    return activeDialog?.customerInfo ?? null;
  });
