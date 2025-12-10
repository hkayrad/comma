import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useDialog } from "@/contexts/dialog";
import type { CustomerIdName } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown, IdCard, Plus } from "lucide-react";
import { useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import CustomerDialog from "@/layout/shared/dialog/CustomerDialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Props = {
  type: "receivable" | "payable";
  form: UseFormReturn<any>;
  customerIdAndNames: CustomerIdName[];
  addNewCustomer?: boolean;
  onRefresh?: () => void;
};

export default function CustomerSelect(props: Props) {
  const {
    type,
    form,
    customerIdAndNames,
    addNewCustomer = false,
    onRefresh,
  } = props;

  const { openDialog } = useDialog();

  const [isCustomerSelectOpen, setIsCustomerSelectOpen] = useState(false);

  return (
    <FormField
      control={form.control}
      name="customer_id"
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>
            Müşteri <span className="text-red-500">*</span>
          </FormLabel>
          <div className="flex w-full overflow-hidden gap-2">
            <Popover
              open={isCustomerSelectOpen}
              onOpenChange={setIsCustomerSelectOpen}
            >
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    role="combobox"
                    className={cn(
                      "max-w-[calc(100%-2.75rem)] flex grow justify-between overflow-hidden text-ellipsis",
                      !field.value && "text-muted-foreground",
                    )}
                  >
                    <span className="overflow-hidden text-ellipsis flex items-center gap-2">
                      <IdCard className="!text-muted-foreground" />
                      {field.value
                        ? customerIdAndNames.find(
                          (customer) => customer.id === field.value,
                        )?.name
                        : "Müşteri seçin"}
                    </span>
                    <ChevronsUpDown className="opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-0">
                <Command>
                  <CommandInput placeholder="Ara..." className="h-9" />
                  <CommandList>
                    <CommandEmpty>Müşteri bulunamadı.</CommandEmpty>
                    <CommandGroup>
                      {customerIdAndNames.map((customer) => (
                        <CommandItem
                          value={customer.name}
                          key={customer.id}
                          onSelect={() => {
                            form.setValue("customer_id", customer.id);
                            setIsCustomerSelectOpen(false);
                          }}
                        >
                          {customer.name}
                          <Check
                            className={cn(
                              "ml-auto",
                              customer.id === field.value
                                ? "opacity-100"
                                : "opacity-0",
                            )}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <Tooltip disableHoverableContent>
              <TooltipTrigger asChild>
                <Button
                  hidden={!addNewCustomer}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    openDialog({
                      title: "Müşteri Ekle",
                      description: "Yeni müşteri ekleyin",
                      size: "3xl",
                      content: (
                        <CustomerDialog type={type} onSuccess={onRefresh} />
                      ),
                      showCloseButton: true,
                    });
                  }}
                  variant="outline"
                  size="icon"
                >
                  <Plus />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Yeni Müşteri Ekle</TooltipContent>
            </Tooltip>
          </div>
          <FormDescription>Borçlu müşteri.</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
