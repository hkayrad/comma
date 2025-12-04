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
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<DialogConfig>({});
  const [customerInfo, setCustomerInfo] = useState<CustomerDto | null>(null);

  const openDialog = (
    dialogConfig: DialogConfig,
    customerInfo: CustomerDto | null = null,
  ) => {
    setConfig(dialogConfig);
    setCustomerInfo(customerInfo);
    setIsOpen(true);
  };

  const closeDialog = () => {
    setIsOpen(false);

    if (config.onClose) {
      config.onClose();
    }
    // Clear config after a brief delay to allow for closing animation
    setTimeout(() => setConfig({}), 200);
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

  return (
    <DialogContext.Provider
      value={{ openDialog, closeDialog, isOpen, customerInfo }}
    >
      {children}
      <Dialog open={isOpen} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent
          className={`${getSizeClass(config.size)} selection:text-background selection:bg-foreground`}
          style={getWidthStyle(config.size)}
        >
          {(config.title || config.description) && (
            <DialogHeader>
              {config.title && <DialogTitle>{config.title}</DialogTitle>}
              {config.description && (
                <DialogDescription>{config.description}</DialogDescription>
              )}
            </DialogHeader>
          )}

          {config.content && <div className="pt-4">{config.content}</div>}

          {config.footer && <DialogFooter>{config.footer}</DialogFooter>}
        </DialogContent>
      </Dialog>
    </DialogContext.Provider>
  );
};
