import { useEffect, type ReactNode } from "react";

import {
  Menu,
  MenuTrigger,
  MenuPanel,
  MenuItem,
} from "@/components/animate-ui/components/base/menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type AnimateSelectOption = {
  value: string;
  label: string | ReactNode;
};

type Props = {
  value?: string;
  onValueChange: (val: string) => void;
  options: AnimateSelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  panelClassName?: string;
  size?: "sm" | "default";
  onScrollEnd?: () => void;
};

export default function AnimateSelect({
  value,
  onValueChange,
  options,
  placeholder = "Seçiniz...",
  disabled = false,
  className,
  panelClassName,
  size = "default",
  onScrollEnd,
}: Props) {
  const selected = options.find((o) => o.value === value);
  useEffect(() => {
    if (!onScrollEnd) return;

    const handleScroll = (e: Event) => {
      const target = e.target as HTMLElement;
      if (
        target &&
        target instanceof HTMLElement &&
        target.scrollHeight > target.clientHeight &&
        target.scrollHeight - target.scrollTop - target.clientHeight < 150
      ) {
        onScrollEnd();
      }
    };

    window.addEventListener("scroll", handleScroll, true);
    return () => {
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [onScrollEnd]);


  return (
    <Menu>
      <MenuTrigger
        render={(triggerProps) => (
          <Button
            {...triggerProps}
            type="button"
            variant="outline"
            disabled={disabled}
            className={cn(
              "w-full justify-between font-normal text-left shadow-xs transition-colors overflow-hidden",
              size === "sm" ? "h-8 text-xs px-2.5" : "h-9 text-sm px-3",
              !selected && "text-muted-foreground",
              className,
            )}
          >
            <span className="truncate min-w-0 flex-1">{selected ? selected.label : placeholder}</span>
            <ChevronDown className="size-4 shrink-0 text-muted-foreground opacity-60 ml-2" />
          </Button>
        )}
      />
      <MenuPanel
        className={cn(
          "z-50 w-(--anchor-width) w-[var(--anchor-width)] min-w-full max-h-60 overflow-y-auto p-1 shadow-md",
          panelClassName,
        )}
      >
        {options.map((opt) => {

            const isSelected = opt.value === value;
            return (
              <MenuItem
                key={opt.value}
                onClick={() => onValueChange(opt.value)}
                className={cn(
                  "flex items-center justify-between cursor-pointer px-2.5 py-1.5 text-sm rounded-sm my-0.5",
                  isSelected && "font-semibold text-primary",
                )}
              >
                <span className="truncate">{opt.label}</span>
                {isSelected && <Check className="size-4 text-primary shrink-0 ml-2" />}
              </MenuItem>
            );
          })}
      </MenuPanel>

    </Menu>
  );
}

