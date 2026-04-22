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
import { ChevronsUpDown, IdCard, Plus } from "lucide-react";
import { useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import CustomerDialog from "@/layout/shared/dialog/CustomerDialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTranslation } from "react-i18next";

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

  const openDialog = useDialog((s) => s.openDialog);
  const { t } = useTranslation();

  const [isCustomerSelectOpen, setIsCustomerSelectOpen] = useState(false);

  return (
    <FormField
      control={form.control}
      name="customer_id"
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>
            {t("form.customer.select")} <span className="text-red-500">*</span>
          </FormLabel>
          <div className="flex w-full overflow-hidden gap-2">
            <Popover
              open={isCustomerSelectOpen}
              onOpenChange={setIsCustomerSelectOpen}
            >
              <PopoverTrigger
                render={(props) => (
                  <FormControl {...props}>
                    <Button
                      variant="outline"
                      nativeButton
                      role="combobox"
                      className={cn(
                        "max-w-[calc(100%-2.75rem)] flex grow justify-between overflow-hidden text-ellipsis",
                        !field.value && "text-muted-foreground",
                      )}
                    >
                      <span className="overflow-hidden flex items-center gap-2 min-w-0 flex-1">
                        <IdCard className="text-muted-foreground! shrink-0" />
                        <span className="truncate">
                          {field.value
                            ? customerIdAndNames.find(
                                (customer) => customer.id === field.value,
                              )?.name
                            : t("form.customer.select.placeholder")}
                        </span>
                      </span>
                      <ChevronsUpDown className="opacity-50" />
                    </Button>
                  </FormControl>
                )}
              />
              <PopoverContent className="w-100 p-0">
                <Command>
                  <CommandInput
                    placeholder={t("form.customer.select.search").toString()}
                  />
                  <CommandList>
                    <CommandEmpty>
                      {t("form.customer.select.couldNotFind")}
                    </CommandEmpty>
                    <CommandGroup>
                      {customerIdAndNames.map((customer) => (
                        <CommandItem
                          value={customer.name}
                          key={customer.id}
                          data-checked={customer.id === field.value}
                          onSelect={() => {
                            form.setValue("customer_id", customer.id);
                            setIsCustomerSelectOpen(false);
                          }}
                        >
                          <span className="truncate flex-1">
                            {customer.name}
                          </span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <Tooltip disableHoverablePopup>
              <TooltipTrigger
                render={(props) => (
                  <Button
                    {...props}
                    hidden={!addNewCustomer}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      openDialog({
                        title: t("dialog.customer.add"),
                        description: t("dialog.customer.add.description"),
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
                )}
              />
              <TooltipContent>{t("form.customer.select.add")}</TooltipContent>
            </Tooltip>
          </div>
          <FormDescription>
            {t("form.customer.select.description")}
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
