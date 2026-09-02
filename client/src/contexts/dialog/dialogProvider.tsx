import { type ReactNode } from "react";
import { useDialog } from "./useDialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const DialogProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const dialogs = useDialog((state) => state.dialogs);
  const closeDialog = useDialog((state) => state.closeDialog);

  const getSizeClass = (size?: string) => {
    switch (size) {
      case "sm":
        return "sm:max-w-sm";
      case "md":
        return "sm:max-w-md";
      case "lg":
        return "sm:max-w-lg";
      case "xl":
        return "sm:max-w-xl";
      case "2xl":
        return "sm:max-w-2xl";
      case "3xl":
        return "sm:max-w-3xl";
      case "4xl":
        return "sm:max-w-4xl";
      case "full":
        return "sm:max-w-[95vw] sm:w-[95vw]";
      default:
        return "sm:max-w-md";
    }
  };

  const getWidthStyle = (size?: string) => {
    const widths: Record<string, string> = {
      sm: "24rem",
      md: "28rem",
      lg: "32rem",
      xl: "36rem",
      "2xl": "42rem",
      "3xl": "48rem",
      "4xl": "56rem",
      full: "95vw",
    };
    const target = widths[size || "md"] || "28rem";
    return {
      maxWidth: `min(${target}, calc(100dvw - 2rem))`,
      width: `min(${target}, calc(100dvw - 2rem))`,
    };
  };

  return (
    <>
      {children}
      {dialogs.map((dialog, index) => {
        const offset = dialogs.length - 1 - index;
        // Only apply stacking transforms when there are multiple dialogs
        const shouldStack = dialogs.length > 1 && offset > 0;
        const scale = shouldStack ? 1 - offset * 0.05 : 1;
        const translateY = shouldStack ? offset * -16 : 0;

        return (
          <Dialog
            key={dialog.id}
            open={dialog.isOpen}
            onOpenChange={(open, details) => {
              if (!open) {
                const closeOnOverlayClick = dialog.closeOnOverlayClick ?? true;
                if (details.reason === "outside-press" && !closeOnOverlayClick)
                  return;
                closeDialog();
              }
            }}
          >
            <DialogContent
              className={`${getSizeClass(dialog.size)} selection:text-background selection:bg-foreground`}
              style={{
                ...getWidthStyle(dialog.size),
                ...(shouldStack && {
                  transform: `scale(${scale}) translateY(${translateY * 2}px)`,
                }),
              }}
            >
              {(dialog.title || dialog.description) && (
                <DialogHeader>
                  {dialog.title && <DialogTitle>{dialog.title}</DialogTitle>}
                  {dialog.description && (
                    <DialogDescription>{dialog.description}</DialogDescription>
                  )}
                </DialogHeader>
              )}

              {dialog.content && <div className="pt-4">{dialog.content}</div>}

              {dialog.footer && <DialogFooter>{dialog.footer}</DialogFooter>}
            </DialogContent>
          </Dialog>
        );
      })}
    </>
  );
};
