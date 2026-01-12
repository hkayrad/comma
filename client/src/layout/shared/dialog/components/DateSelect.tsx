import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { FormControl } from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { format, type Locale } from "date-fns";
import { tr, enUS } from "date-fns/locale";
import { CalendarIcon, X } from "lucide-react";
import { useMemo } from "react";
import type { ControllerRenderProps } from "react-hook-form";
import { useTranslation } from "react-i18next";

type Props = {
  field: ControllerRenderProps<any>;
  allowFuture?: boolean;
  placeholder?: string;
  allowClear?: boolean;
};

export default function DateSelect(props: Props) {
  const { field, allowFuture = false, placeholder, allowClear = false } = props;

  const { i18n, t } = useTranslation();

  const localeMap: Record<string, Locale> = useMemo(
    () => ({
      tr: tr,
      en: enUS,
    }),
    [],
  );

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    field.onChange(null);
  };

  return (
    <div className="flex w-full overflow-hidden gap-2">
      <Popover>
        <PopoverTrigger
          render={(props) => (
            <FormControl {...props}>
              <Button
                variant="outline"
                nativeButton
                className={cn(
                  "flex grow justify-between overflow-hidden text-ellipsis",
                  allowClear && field.value ? "max-w-[calc(100%-2.75rem)]" : "w-full",
                  !field.value && "text-muted-foreground",
                )}
              >
                <span className="overflow-hidden flex items-center gap-2 min-w-0 flex-1">
                  <CalendarIcon className="text-muted-foreground! shrink-0 h-4 w-4 opacity-50" />
                  <span className="truncate">
                    {field.value
                      ? format(field.value, "PPP", {
                        locale: localeMap[i18n.language],
                      })
                      : (placeholder || t("vars.date_range"))}
                  </span>
                </span>
              </Button>
            </FormControl>
          )}
        />
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            lang={i18n.language}
            timeZone="Europe/Istanbul"
            selected={field.value}
            onSelect={field.onChange}
            disabled={(date) =>
              allowFuture
                ? date < new Date("1900-01-01")
                : date > new Date() || date < new Date("1900-01-01")
            }
            captionLayout="dropdown"
          />
        </PopoverContent>
      </Popover>
      {allowClear && field.value && (
        <Tooltip disableHoverablePopup>
          <TooltipTrigger
            render={(props) => (
              <Button
                {...props}
                onClick={handleClear}
                variant="outline"
                size="icon"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          />
          <TooltipContent>{t("component.dateSelect.clear")}</TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
