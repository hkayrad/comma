import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useDialog } from "@/contexts/dialog";
import { PayableCustomerApi, ReceivableCustomerApi } from "@/lib/api/customer";
import { PayableDebtApi, ReceivableDebtApi } from "@/lib/api/debt";
import type { CustomerIdName, DebtDto, OverviewViewType } from "@comma/common";
import { formatCurrency } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { Logger } from "@/lib/utils/logger";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Euro,
  Plus,
  ReceiptText,
  TextInitial,
  Trash2,
  TurkishLira,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFieldArray, useForm, type UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import CustomerSelect from "@/layout/shared/dialog/components/CustomerSelect";
import DateSelect from "@/layout/shared/dialog/components/DateSelect";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectItem,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "react-i18next";
import CancelButton from "@/layout/shared/CancelButton";
import { getDebtFormSchema } from "@/lib/schemas/debtSchema";
import { useDebtCalculations } from "../hooks/useDebtCalculations";
import { useFormDraft } from "@/hooks/use-form-draft";

type Props = {
  debt?: DebtDto;
  customerId?: string;
  type?: OverviewViewType;
};

function DebtEntry({
  index,
  form,
  type,
  customerIdAndNames,
  handleFetchCustomerIdAndNames,
  currencySign,
  onRemove,
  isOnlyEntry,
  isEditMode,
}: {
  index: number;
  form: UseFormReturn<any>;
  type: OverviewViewType;
  customerIdAndNames: CustomerIdName[];
  handleFetchCustomerIdAndNames: () => void;
  currencySign: Record<string, React.ReactNode>;
  onRemove: (index: number) => void;
  isOnlyEntry: boolean;
  isEditMode: boolean;
}) {
  const { t } = useTranslation();
  const {
    total,
    handleVatButtonClick,
    handleDiscountButtonClick,
    handleSetWithholdingButtonClick,
    handleSetExchangeRateButtonClick,
  } = useDebtCalculations(form, index);

  const selectedCurrency = form.watch(`entries.${index}.currency`);

  return (
    <div className="p-4 grid grid-cols-2 gap-6 border-t">
      <CustomerSelect
        type={type}
        form={form}
        namePrefix={`entries.${index}.`}
        customerIdAndNames={customerIdAndNames}
        addNewCustomer
        onRefresh={handleFetchCustomerIdAndNames}
      />
      <FormField
        control={form.control}
        name={`entries.${index}.issue_date`}
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>
              {t("form.debt.issue_date")}{" "}
              <span className="text-red-500">*</span>
            </FormLabel>
            <DateSelect field={field} />
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name={`entries.${index}.due_date`}
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>{t("form.debt.due_date")}</FormLabel>
            <DateSelect field={field} allowFuture allowClear />
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name={`entries.${index}.currency`}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex gap-1">
              {t("form.debt.currency")}{" "}
              <span className="text-red-500">*</span>
            </FormLabel>
            <FormControl>
              <Select
                name={field.name}
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="p-2">
                  <SelectItem value="TRY">
                    <TurkishLira />
                    <span>{t("vars.try")}</span>
                  </SelectItem>
                  <SelectItem value="EUR">
                    <Euro />
                    <span>{t("vars.eur")}</span>
                  </SelectItem>
                  <SelectItem value="USD">
                    <DollarSign />
                    <span>{t("vars.usd")}</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name={`entries.${index}.amount`}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex gap-1">
              {t("form.debt.amount")} <span className="text-red-500">*</span>
            </FormLabel>
            <FormControl>
              <InputGroup>
                <InputGroupInput
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  {...field}
                  onChange={(e) => {
                    const value = e.target.value;
                    const num = value === "" ? "" : parseFloat(value);
                    field.onChange(Number.isNaN(num) ? undefined : num);
                  }}
                />
                <InputGroupAddon>
                  {currencySign[form.watch(`entries.${index}.currency`) as keyof typeof currencySign]}
                </InputGroupAddon>
              </InputGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name={`entries.${index}.discount`}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex gap-1">
              {t("form.debt.discount")}
            </FormLabel>
            <FormControl>
              <div className="flex items-center gap-1">
                <InputGroup>
                  <InputGroupInput
                    type="number"
                    placeholder="0.00"
                    step="0.01"
                    {...field}
                    onChange={(e) => {
                      const value = e.target.value;
                      const num = value === "" ? "" : parseFloat(value);
                      field.onChange(Number.isNaN(num) ? undefined : num);
                    }}
                  />
                  <InputGroupAddon>
                    {currencySign[form.watch(`entries.${index}.currency`) as keyof typeof currencySign]}
                  </InputGroupAddon>
                  <InputGroupAddon align="inline-end">
                    <Tooltip disableHoverablePopup>
                      <TooltipTrigger
                        render={(props) => (
                          <InputGroupButton
                            {...props}
                            size="xs"
                            nativeButton
                            onClick={(e) =>
                              handleDiscountButtonClick(e, 0.05)
                            }
                          >
                            %5
                          </InputGroupButton>
                        )}
                      />
                      <TooltipContent>
                        <p>{t("form.debt.discount.set.5%")}</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip disableHoverablePopup>
                      <TooltipTrigger
                        render={(props) => (
                          <InputGroupButton
                            {...props}
                            size="xs"
                            nativeButton
                            onClick={(e) => handleDiscountButtonClick(e, 0.1)}
                          >
                            %10
                          </InputGroupButton>
                        )}
                      />
                      <TooltipContent>
                        <p>{t("form.debt.discount.set.10%")}</p>
                      </TooltipContent>
                    </Tooltip>
                  </InputGroupAddon>
                </InputGroup>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name={`entries.${index}.vat`}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex gap-1">
              {t("form.debt.vat")} <span className="text-red-500">*</span>
            </FormLabel>
            <FormControl>
              <div className="flex items-center gap-1">
                <InputGroup>
                  <InputGroupInput
                    type="number"
                    placeholder="0.00"
                    step="0.01"
                    {...field}
                    onChange={(e) => {
                      const value = e.target.value;
                      const num = value === "" ? "" : parseFloat(value);
                      field.onChange(Number.isNaN(num) ? undefined : num);
                    }}
                  />
                  <InputGroupAddon>
                    {currencySign[form.watch(`entries.${index}.currency`) as keyof typeof currencySign]}
                  </InputGroupAddon>
                  <InputGroupAddon align="inline-end">
                    <Tooltip disableHoverablePopup>
                      <TooltipTrigger
                        render={(props) => (
                          <InputGroupButton
                            {...props}
                            size="xs"
                            nativeButton
                            onClick={(e) => handleVatButtonClick(e, 0.1)}
                          >
                            %10
                          </InputGroupButton>
                        )}
                      />
                      <TooltipContent>
                        <p>{t("form.debt.vat.set.10%")}</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip disableHoverablePopup>
                      <TooltipTrigger
                        render={(props) => (
                          <InputGroupButton
                            {...props}
                            size="xs"
                            nativeButton
                            onClick={(e) => handleVatButtonClick(e, 0.2)}
                          >
                            %20
                          </InputGroupButton>
                        )}
                      />
                      <TooltipContent>
                        <p>{t("form.debt.vat.set.20%")}</p>
                      </TooltipContent>
                    </Tooltip>
                  </InputGroupAddon>
                </InputGroup>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name={`entries.${index}.withholding`}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex gap-1">
              {t("form.debt.withholding")}
            </FormLabel>
            <FormControl>
              <div className="flex items-center gap-1">
                <InputGroup>
                  <InputGroupInput
                    type="number"
                    placeholder="0.00"
                    step="0.01"
                    {...field}
                    onChange={(e) => {
                      const value = e.target.value;
                      const num = value === "" ? "" : parseFloat(value);
                      field.onChange(Number.isNaN(num) ? undefined : num);
                    }}
                  />
                  <InputGroupAddon>
                    {currencySign[form.watch(`entries.${index}.currency`) as keyof typeof currencySign]}
                  </InputGroupAddon>
                  <InputGroupAddon align="inline-end">
                    <Tooltip disableHoverablePopup>
                      <TooltipTrigger
                        render={(props) => (
                          <InputGroupButton
                            {...props}
                            size="xs"
                            nativeButton
                            onClick={(e) =>
                              handleSetWithholdingButtonClick(e, 0.5)
                            }
                          >
                            %50
                          </InputGroupButton>
                        )}
                      />
                      <TooltipContent>
                        <p>{t("form.debt.withholding.set.50%")}</p>
                      </TooltipContent>
                    </Tooltip>
                  </InputGroupAddon>
                </InputGroup>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      {form.watch(`entries.${index}.currency`) !== "TRY" && (
        <FormField
          control={form.control}
          name={`entries.${index}.exchange_rate`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex gap-1">
                {t("form.debt.exchange_rate")}{" "}
                <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <div className="flex items-center gap-1">
                  <InputGroup>
                    <InputGroupInput
                      type="number"
                      placeholder="0.00"
                      step="0.01"
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value;
                        const num = value === "" ? "" : parseFloat(value);
                        field.onChange(Number.isNaN(num) ? undefined : num);
                      }}
                    />
                    <InputGroupAddon>{currencySign["TRY"]}</InputGroupAddon>
                    <InputGroupAddon align="inline-end">
                      <Tooltip disableHoverablePopup>
                        <TooltipTrigger
                          render={(props) => (
                            <InputGroupButton
                              {...props}
                              size="xs"
                              nativeButton
                              onClick={handleSetExchangeRateButtonClick}
                            >
                              {t("form.debt.exchange_rate.set.label")}
                            </InputGroupButton>
                          )}
                        />
                        <TooltipContent>
                          <p>{t("form.debt.exchange_rate.set.tooltip")}</p>
                        </TooltipContent>
                      </Tooltip>
                    </InputGroupAddon>
                  </InputGroup>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
      <FormField
        control={form.control}
        name={`entries.${index}.invoice_no`}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex gap-1">
              {t("form.debt.invoice_no")}
            </FormLabel>
            <FormControl>
              <InputGroup>
                <InputGroupInput
                  type="text"
                  placeholder="Fatura No"
                  {...field}
                />
                <InputGroupAddon>
                  <ReceiptText />
                </InputGroupAddon>
              </InputGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name={`entries.${index}.description`}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex gap-1">
              {t("form.debt.description")}
            </FormLabel>
            <FormControl>
              <InputGroup>
                <InputGroupInput
                  type="text"
                  placeholder="Açıklama"
                  {...field}
                />
                <InputGroupAddon>
                  <TextInitial />
                </InputGroupAddon>
              </InputGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="col-span-2 flex justify-between items-center bg-muted/30 p-2 rounded-md">
        <div className="text-sm font-medium">
          {t("form.debt.total", {
            total: formatCurrency(total, selectedCurrency),
          })}
        </div>
        {!isOnlyEntry && !isEditMode && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => onRemove(index)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {t("dialog.debt.remove")}
          </Button>
        )}
      </div>
    </div>
  );
}

export default function DebtDialog(props: Props) {
  const { debt, customerId, type = "receivable" } = props;
  const queryClient = useQueryClient();
  const closeDialog = useDialog((s) => s.closeDialog);
  const { t } = useTranslation();
  const [customerIdAndNames, setCustomerIdAndNames] = useState<
    CustomerIdName[]
  >([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const isPersisted = useRef(false);

  const DEBT_API = type === "payable" ? PayableDebtApi : ReceivableDebtApi;
  const CUSTOMER_API = type === "payable" ? PayableCustomerApi : ReceivableCustomerApi;

  const SingleDebtSchema = useMemo(() => getDebtFormSchema(t), [t]);
  const DebtFormSchema = useMemo(
    () =>
      z.object({
        entries: z.array(SingleDebtSchema),
      }),
    [SingleDebtSchema],
  );

  const form = useForm<z.infer<typeof DebtFormSchema>>({
    resolver: zodResolver(DebtFormSchema),
    defaultValues: {
      entries: [
        {
          customer_id: debt?.customer_id || customerId || "",
          amount: debt?.amount ? Number(debt.amount) : 0,
          vat: debt?.vat ? Number(debt.vat) : 0,
          withholding: debt?.withholding ? Number(debt.withholding) : 0,
          discount: debt?.discount ? Number(debt.discount) : 0,
          currency: debt?.currency || "TRY",
          exchange_rate: debt?.exchange_rate ? Number(debt.exchange_rate) : 1,
          issue_date: debt?.issue_date ? new Date(debt.issue_date) : new Date(),
          due_date: debt?.due_date ? new Date(debt.due_date) : null,
          invoice_no: debt?.invoice_no || "",
          description: debt?.description || "",
        },
      ],
    },
  });

  const { saveDraft, clearDraft } = useFormDraft(
    `draft_debt_${type}`,
    form,
    !debt
  );

  const handleSaveDraft = useCallback(() => {
    saveDraft();
    isPersisted.current = true;
    closeDialog();
  }, [saveDraft, closeDialog]);

  useEffect(() => {
    return () => {
      if (!isPersisted.current && !debt) {
        clearDraft();
      }
    };
  }, [clearDraft, debt]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "entries",
  });

  const handleFetchCustomerIdAndNames = useCallback(async () => {
    try {
      const response = await CUSTOMER_API.GetIdAndName();
      Logger.debug("Fetched customer ID and names:", response);
      if (response) setCustomerIdAndNames(response);
    } catch (error) {
      Logger.error("Failed to fetch customer ID and names:", error);
    }
  }, [CUSTOMER_API]);

  const onCancel = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      isPersisted.current = false;
      clearDraft();
      form.reset();
      closeDialog();
    },
    [form, clearDraft, closeDialog],
  );

  const onSubmit = useCallback(
    (data: z.infer<typeof DebtFormSchema>) => {
      let promise: Promise<any>;

      const submitData = data.entries.map(entry => ({
        ...entry,
        due_date: entry.due_date || null,
      }));

      if (debt) promise = DEBT_API.Update(debt.id!, submitData[0]);
      else promise = DEBT_API.CreateBatch(submitData);

      toast.promise(promise, {
        loading: debt
          ? t("notification.debt.update.pending")
          : t("notification.debt.add.pending"),
        success: () => {
          isPersisted.current = true;
          form.reset();
          clearDraft();
          closeDialog();
          queryClient.invalidateQueries({ queryKey: ["totals"] });
          queryClient.invalidateQueries({ queryKey: ["debts"] });
          queryClient.invalidateQueries({ queryKey: ["customers"] });
          return debt
            ? t("notification.debt.update.success")
            : t("notification.debt.add.success");
        },
        error: debt
          ? t("notification.debt.update.error")
          : t("notification.debt.add.error"),
      });
    },
    [form, clearDraft, closeDialog, DEBT_API, debt, t, queryClient],
  );

  const currencySign = useMemo(
    () => ({
      TRY: <TurkishLira />,
      USD: <DollarSign />,
      EUR: <Euro />,
    }),
    [],
  );

  useEffect(() => {
    handleFetchCustomerIdAndNames();
  }, [handleFetchCustomerIdAndNames]);

  const addEntry = useCallback(() => {
    append({
      customer_id: customerId || "",
      amount: 0,
      vat: 0,
      withholding: 0,
      discount: 0,
      currency: "TRY",
      exchange_rate: 1,
      issue_date: new Date(),
      due_date: null,
      invoice_no: "",
      description: "",
    });
    setCurrentPageIndex(fields.length);
  }, [append, fields.length, customerId]);

  const watchedEntries = form.watch("entries");
  const grandTotals = useMemo(() => {
    const totals: Record<string, number> = { TRY: 0, USD: 0, EUR: 0 };
    watchedEntries.forEach((entry: any) => {
      const amount = entry.amount || 0;
      const vat = entry.vat || 0;
      const discount = entry.discount || 0;
      const withholding = entry.withholding || 0;
      const total = amount - discount + vat - withholding;
      totals[entry.currency] = (totals[entry.currency] || 0) + total;
    });
    return totals;
  }, [watchedEntries]);

  const onInvalid = useCallback(
    (errors: any) => {
      if (errors.entries) {
        const errorIndices = errors.entries
          .map((entry: any, index: number) => (entry ? index + 1 : null))
          .filter((index: number | null) => index !== null);

        if (errorIndices.length > 0) {
          toast.error(
            t("notification.validation.error_on_pages", {
              pages: errorIndices.join(", "),
            }),
          );
        }
      }
    },
    [t],
  );

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, onInvalid)}
        className="flex flex-col gap-4"
      >
        {!debt && (
          <div className="flex items-center justify-between bg-muted/50 p-2 rounded-lg mb-2">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={currentPageIndex === 0}
                onClick={() => setCurrentPageIndex(prev => prev - 1)}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                {t("dialog.pagination.previous")}
              </Button>
              <span className="text-sm font-medium">
                {currentPageIndex + 1} / {fields.length}
              </span>              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={currentPageIndex === fields.length - 1}
                onClick={() => setCurrentPageIndex(prev => prev + 1)}
              >
                {t("dialog.pagination.next")}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              {fields.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => {
                    remove(currentPageIndex);
                    if (currentPageIndex >= fields.length - 1) {
                      setCurrentPageIndex(Math.max(0, fields.length - 2));
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t("dialog.debt.remove")}
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addEntry}
              >
                <Plus className="h-4 w-4 mr-2" />
                {t("dialog.debt.add_more")}
              </Button>
            </div>
          </div>
        )}

        <div className="min-h-fit">
          {fields.map((field, index) => index === currentPageIndex && (
            <div key={field.id} className="animate-in fade-in slide-in-from-right-2 duration-200">
               <DebtEntry
                  index={index}
                  form={form}
                  type={type}
                  customerIdAndNames={customerIdAndNames}
                  handleFetchCustomerIdAndNames={handleFetchCustomerIdAndNames}
                  currencySign={currencySign}
                  onRemove={(idx) => {
                    remove(idx);
                    setCurrentPageIndex(Math.max(0, currentPageIndex - 1));
                  }}
                  isOnlyEntry={fields.length === 1}
                  isEditMode={!!debt}
                />
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2 mt-4 border-t pt-4">
          {Object.entries(grandTotals).map(([currency, total]) => total > 0 && (
            <div key={currency} className="flex justify-between items-center text-lg font-semibold">
              <span>{t("form.debt.grand_total", { currency })}</span>
              <span>{formatCurrency(total, currency as any)}</span>
            </div>
          ))}
          <div className="flex justify-end gap-2 mt-2">
            <CancelButton onClick={onCancel} />
            {!debt && (
              <Button type="button" variant="secondary" onClick={handleSaveDraft}>
                {t("dialog.debt.save_as_draft")}
              </Button>
            )}
            <Button type="submit">
              {debt ? t("dialog.debt.update") : t("dialog.debt.add")}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
