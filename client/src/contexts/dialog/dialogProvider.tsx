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
                if (details.reason === "outside-press") return;
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
