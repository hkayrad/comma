import { useEffect, type ComponentType } from "react";
import { Check, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type SubMenuItem = {
  label: string;
  path: string;
  icon: ComponentType<{ className?: string }>;
};

type Props = {
  isOpen: boolean;
  categoryTitle: string;
  categoryIcon: ComponentType<{ className?: string }>;
  items: SubMenuItem[];
  currentPath: string;
  onSelect: (path: string) => void;
  onClose: () => void;
};

export default function MobileNavSubmenu({
  isOpen,
  categoryTitle,
  categoryIcon: CategoryIcon,
  items,
  currentPath,
  onSelect,
  onClose,
}: Props) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop overlay */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/35 dark:bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 select-none"
      />

      {/* Floating Submenu Card */}
      <div
        role="menu"
        aria-label={categoryTitle}
        className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom)+0.5rem)] left-3 right-3 max-w-sm mx-auto z-50 rounded-2xl border border-border/80 bg-card/95 dark:bg-card/90 backdrop-blur-xl shadow-2xl p-2 flex flex-col gap-1 animate-in fade-in slide-in-from-bottom-3 duration-200 select-none"
      >
        {/* Category Header */}
        <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-border/40">
          <div className="flex items-center gap-2">
            <CategoryIcon className="w-4 h-4 text-primary" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              {categoryTitle}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            aria-label="Kapat"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Submenu items */}
        <div className="flex flex-col gap-1 pt-1">
          {items.map((subItem) => {
            const isCurrentPage = currentPath === subItem.path;
            const SubIcon = subItem.icon;
            return (
              <button
                key={subItem.path}
                type="button"
                onClick={() => onSelect(subItem.path)}
                className={cn(
                  "flex items-center justify-between w-full px-3 py-2.5 rounded-xl transition-all text-sm",
                  isCurrentPage
                    ? "bg-primary/10 text-primary font-semibold shadow-xs"
                    : "text-foreground hover:bg-muted/50 active:bg-muted font-medium"
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={cn(
                      "p-1.5 rounded-lg shrink-0 transition-colors",
                      isCurrentPage
                        ? "bg-primary/20 text-primary"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    <SubIcon className="w-4 h-4" />
                  </div>
                  <span className="truncate">{subItem.label}</span>
                </div>
                {isCurrentPage ? (
                  <Check className="w-4 h-4 text-primary shrink-0 ml-2" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-muted-foreground/50 shrink-0 ml-2" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
