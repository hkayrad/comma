import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { FormControl } from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
    <Popover>
      <PopoverTrigger
        render={(props) => (
          <FormControl {...props}>
            <div className="flex items-center gap-1">
              <Button
                variant={"outline"}
                nativeButton
                className={cn(
                  "w-full pl-3 text-left font-normal justify-start",
                  !field.value && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="h-4 w-4 opacity-50" />
                {field.value ? (
                  format(field.value, "PPP", {
                    locale: localeMap[i18n.language],
                  })
                ) : (
                  <span>{placeholder || t("vars.date_range")}</span>
                )}
              </Button>
              {allowClear && field.value && (
                <Button
                  variant="ghost"
                  size="icon"
                  nativeButton
                  className="h-8 w-8 shrink-0"
                  onClick={handleClear}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </FormControl>
        )}
      ></PopoverTrigger>
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
  );
}
