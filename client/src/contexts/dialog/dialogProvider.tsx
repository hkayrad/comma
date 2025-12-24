import type { CustomerDto } from "@/lib/types";
import { useState, type ReactNode } from "react";
import { DialogContext } from "./dialogContext";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

export interface DialogConfig {
    title?: string;
    description?: string;
    content?: ReactNode;
    footer?: ReactNode;
    onClose?: () => void;
    onSuccess?: () => void;
    size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "full";
    showCloseButton?: boolean;
}

export const DialogProvider: React.FC<{ children: ReactNode }> = ({
    children,
}) => {
    type DialogInstance = DialogConfig & {
        id: string;
        isOpen: boolean;
        customerInfo: CustomerDto | null;
    };

    const [dialogs, setDialogs] = useState<DialogInstance[]>([]);

    const openDialog = (
        dialogConfig: DialogConfig,
        customerInfo: CustomerDto | null = null,
    ) => {
        const newDialog: DialogInstance = {
            ...dialogConfig,
            id: crypto.randomUUID(),
            isOpen: true,
            customerInfo,
        };
        setDialogs((prev) => [...prev, newDialog]);
    };

    const closeDialog = () => {
        setDialogs((prev) => {
            // Find the last dialog that is currently open
            let lastOpenIndex = -1;
            for (let i = prev.length - 1; i >= 0; i--) {
                if (prev[i].isOpen) {
                    lastOpenIndex = i;
                    break;
                }
            }

            if (lastOpenIndex === -1) return prev;

            const dialogToClose = prev[lastOpenIndex];

            // Trigger onClose callback if exists
            if (dialogToClose.onClose) {
                dialogToClose.onClose();
            }

            // Create new array with the target dialog set to isOpen: false
            const newDialogs = [...prev];
            newDialogs[lastOpenIndex] = { ...dialogToClose, isOpen: false };

            // Schedule removal of this dialog after animation
            setTimeout(() => {
                setDialogs((currentDialogs) =>
                    currentDialogs.filter((d) => d.id !== dialogToClose.id),
                );
            }, 0);

            return newDialogs;
        });
    };

    const getSizeClass = (size?: string) => {
        switch (size) {
            case "sm":
                return "max-w-sm !important";
            case "md":
                return "max-w-md !important";
            case "lg":
                return "max-w-lg !important";
            case "xl":
                return "max-w-xl !important";
            case "2xl":
                return "max-w-2xl !important";
            case "3xl":
                return "max-w-3xl !important";
            case "4xl":
                return "max-w-4xl !important";
            case "full":
                return "max-w-[95vw] !important w-[95vw] !important";
            default:
                return "max-w-md !important";
        }
    };

    const getWidthStyle = (size?: string) => {
        switch (size) {
            case "sm":
                return { maxWidth: "24rem", width: "100%" };
            case "md":
                return { maxWidth: "28rem", width: "100%" };
            case "lg":
                return { maxWidth: "32rem", width: "100%" };
            case "xl":
                return { maxWidth: "36rem", width: "100%" };
            case "2xl":
                return { maxWidth: "42rem", width: "100%" };
            case "3xl":
                return { maxWidth: "48rem", width: "100%" };
            case "4xl":
                return { maxWidth: "56rem", width: "100%" };
            case "full":
                return { maxWidth: "95vw", width: "95vw" };
            default:
                return { maxWidth: "28rem", width: "100%" };
        }
    };

    // Derived state for context consumers
    // We use the last dialog (top of stack) for context values to maintain backward compatibility
    // or checks like "is there any dialog open?"
    const activeDialog =
        dialogs.length > 0 ? dialogs[dialogs.length - 1] : null;
    const isAnyOpen = dialogs.some((d) => d.isOpen);

    return (
        <DialogContext.Provider
            value={{
                openDialog,
                closeDialog,
                isOpen: isAnyOpen,
                customerInfo: activeDialog?.customerInfo ?? null,
            }}
        >
            {children}
            {dialogs.map((dialog, index) => {
                const offset = dialogs.length - 1 - index;
                const scale = 1 - offset * 0.05;
                const translateY = offset * -16; // Raise slighty (16px per level)

                return (
                    <Dialog
                        key={dialog.id}
                        open={dialog.isOpen}
                        onOpenChange={(open) => {
                            if (!open) closeDialog();
                        }}
                    >
                        <DialogContent
                            className={`${getSizeClass(dialog.size)} selection:text-background selection:bg-foreground`}
                            style={{
                                ...getWidthStyle(dialog.size),
                                transform: `scale(${scale}) translateY(${translateY * 2}px)`,
                                transition: "all 0.1s ease-in-out",
                            }}
                        >
                            {(dialog.title || dialog.description) && (
                                <DialogHeader>
                                    {dialog.title && (
                                        <DialogTitle>
                                            {dialog.title}
                                        </DialogTitle>
                                    )}
                                    {dialog.description && (
                                        <DialogDescription>
                                            {dialog.description}
                                        </DialogDescription>
                                    )}
                                </DialogHeader>
                            )}

                            {dialog.content && (
                                <div className="pt-4">{dialog.content}</div>
                            )}

                            {dialog.footer && (
                                <DialogFooter>{dialog.footer}</DialogFooter>
                            )}
                        </DialogContent>
                    </Dialog>
                );
            })}
        </DialogContext.Provider>
    );
};
