import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { FormControl } from "@/components/ui/form";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import type { ControllerRenderProps } from "react-hook-form";

type Props = {
    field: ControllerRenderProps<any>;
};

export default function DateSelect(props: Props) {
    const { field } = props;

    return (
        <Popover>
            <PopoverTrigger
                render={(props) => (
                    <FormControl {...props}>
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
                                format(field.value, "PPP", { locale: tr })
                            ) : (
                                <span>Bir tarih seçin</span>
                            )}
                        </Button>
                    </FormControl>
                )}
            ></PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    mode="single"
                    timeZone="Europe/Istanbul"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                    }
                    captionLayout="dropdown"
                />
            </PopoverContent>
        </Popover>
    );
}
