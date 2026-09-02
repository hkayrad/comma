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
import { PayablePaymentApi, ReceivablePaymentApi } from "@/lib/api/payment";
import type { CustomerIdName, OverviewViewType, PaymentDto } from "@comma/common";
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
  Radio,
  RadioGroup,
} from "@/components/animate-ui/components/base/radio";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTranslation } from "react-i18next";
import CancelButton from "@/layout/shared/CancelButton";
import { useFormDraft } from "@/hooks/use-form-draft";

import { paymentSchema } from "@common";

type Props = {
  payment?: PaymentDto;
  customerId?: string;
  type?: OverviewViewType;
  amount?: number;
  currency?: "TRY" | "USD" | "EUR";
  invoiceNo?: string;
  exchangeRate?: number;
};

function PaymentEntry({
  index,
  form,
  type,
  customerIdAndNames,
  handleFetchCustomerIdAndNames,
  currencySign,
  onRemove,
  isOnlyEntry,
  isEditMode,
  PaymentFormSchema,
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
  PaymentFormSchema: any;
}) {
  const { t } = useTranslation();

  const handleSetExchangeRateButtonClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      const exchangeRatesString = sessionStorage.getItem("exchangeRates");
      const exchangeRates =
        exchangeRatesString && JSON.parse(exchangeRatesString);

      const selectedCurrency = form.watch(`entries.${index}.currency`).toLowerCase();

      if (exchangeRates && exchangeRates[selectedCurrency]) {
        form.setValue(
          `entries.${index}.exchange_rate`,
          parseFloat(exchangeRates[selectedCurrency].forexBuying),
        );
      }
    },
    [form, index],
  );

  const selectedCurrency = form.watch(`entries.${index}.currency`);
  useEffect(() => {
    if (selectedCurrency === "TRY") {
      form.setValue(`entries.${index}.exchange_rate`, 1);
    }
  }, [form, selectedCurrency, index]);

  return (
    <div className="p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 border-t">
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
        name={`entries.${index}.payment_date`}
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>
              {t("form.payment.payment_date")}{" "}
              <span className="text-red-500">*</span>
            </FormLabel>
            <DateSelect field={field} />
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
              {t("form.payment.currency")}{" "}
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
                  <SelectItem value="USD">
                    <DollarSign />
                    <span>{t("vars.usd")}</span>
                  </SelectItem>
                  <SelectItem value="EUR">
                    <Euro />
                    <span>{t("vars.eur")}</span>
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
              {t("form.payment.amount")}{" "}
              <span className="text-red-500">*</span>
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
      {form.watch(`entries.${index}.currency`) !== "TRY" && (
        <FormField
          control={form.control}
          name={`entries.${index}.exchange_rate`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex gap-1">
                {t("form.payment.exchange_rate")}{" "}
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
                              {t("form.payment.exchange_rate.set.label")}
                            </InputGroupButton>
                          )}
                        ></TooltipTrigger>
                        <TooltipContent>
                          <p>{t("form.payment.exchange_rate.set.tooltip")}</p>
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
        name={`entries.${index}.payment_method`}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex gap-1">
              {t("form.payment.payment_method")}{" "}
              <span className="text-red-500">*</span>
            </FormLabel>
            <FormControl>
              <RadioGroup
                className="flex gap-6"
                value={field.value}
                onValueChange={field.onChange}
              >
                {PaymentFormSchema.shape.payment_method.options.map(
                  (method: string) => (
                    <div key={method} className="flex gap-2 items-center">
                      <Radio value={method} id={`${method}-${index}`} />
                      <label
                        htmlFor={`${method}-${index}`}
                        className="cursor-pointer select-none"
                      >
                        {method === "cash"
                          ? t("vars.cash")
                          : method === "bank_transfer"
                            ? t("vars.bank_transfer")
                            : method === "card"
                              ? t("vars.card")
                              : method === "check"
                                ? t("vars.check")
                                : method}
                      </label>
                    </div>
                  ),
                )}
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name={`entries.${index}.due_date`}
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>
              {t("form.payment.due_date")}
            </FormLabel>
            <DateSelect field={field} allowFuture allowClear />
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name={`entries.${index}.invoice_no`}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex gap-1">
              {t("form.payment.invoice_no")}
            </FormLabel>
            <FormControl>
              <InputGroup>
                <InputGroupInput
                  type="text"
                  placeholder={t("form.payment.invoice_no")}
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
              {t("form.payment.description")}
            </FormLabel>
            <FormControl>
              <InputGroup>
                <InputGroupInput
                  type="text"
                  placeholder={t("form.payment.description")}
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
      {!isOnlyEntry && !isEditMode && (
        <div className="col-span-2 flex justify-end">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => onRemove(index)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {t("dialog.payment.remove")}
          </Button>
        </div>
      )}
    </div>
  );
}

export default function PaymentDialog(props: Props) {
  const {
    payment,
    customerId,
    type = "receivable",
    amount,
    currency,
    invoiceNo,
    exchangeRate,
  } = props;
  const queryClient = useQueryClient();
  const closeDialog = useDialog((s) => s.closeDialog);
  const { t } = useTranslation();
  const [customerIdAndNames, setCustomerIdAndNames] = useState<
    CustomerIdName[]
  >([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const isPersisted = useRef(false);

  const PAYMENT_API =
    type === "payable" ? PayablePaymentApi : ReceivablePaymentApi;
  const CUSTOMER_API =
    type === "payable" ? PayableCustomerApi : ReceivableCustomerApi;

  const SinglePaymentSchema = useMemo(() => paymentSchema.extend({
    customer_id: z
      .string({
        error: t("form.payment.customer_id.validation.required"),
      })
      .min(1, t("form.payment.customer_id.validation.required")),
    amount: z
      .number({ error: t("form.payment.amount.validation.invalid") })
      .min(0.01, t("form.payment.amount.validation.min", { min: 0.01 })),
    currency: z.enum(["TRY", "USD", "EUR"], {
      error: t("form.payment.currency.validation.invalid"),
    }),
    exchange_rate: z
      .number({
        error: t("form.payment.exchange_rate.validation.invalid"),
      })
      .min(0, t("form.payment.exchange_rate.validation.min", { min: 0 }))
      .or(z.literal(0)),
    payment_date: z.date({
      error: t("form.payment.payment_date.validation.invalid"),
    }),
    payment_method: z.enum(["cash", "bank_transfer", "check", "card"], {
      error: t("form.payment.payment_method.validation.invalid"),
    }),
    invoice_no: z
      .string({
        error: t("form.payment.invoice_no.validation.invalid"),
      })
      .max(100, t("form.payment.invoice_no.validation.max", { max: 100 }))
      .optional()
      .or(z.literal("")),
    description: z
      .string({
        error: t("form.payment.description.validation.invalid"),
      })
      .max(500, t("form.payment.description.validation.max", { max: 500 }))
      .optional()
      .or(z.literal("")),
    due_date: z.date().optional().nullable(),
  }), [t]);

  const PaymentFormSchema = useMemo(() => z.object({
    entries: z.array(SinglePaymentSchema),
  }), [SinglePaymentSchema]);

  const form = useForm<z.infer<typeof PaymentFormSchema>>({
    resolver: zodResolver(PaymentFormSchema),
    defaultValues: {
      entries: [
        {
          customer_id: payment?.customer_id || customerId || "",
          amount: payment?.amount
            ? Number(payment.amount)
            : amount
              ? Number(amount)
              : 0,
          currency: payment?.currency || currency || "TRY",
          exchange_rate: payment?.exchange_rate
            ? Number(payment.exchange_rate)
            : exchangeRate
              ? Number(exchangeRate)
              : 1,
          payment_date: payment?.payment_date
            ? new Date(payment.payment_date)
            : new Date(),
          payment_method: payment?.payment_method || "bank_transfer",
          invoice_no: payment?.invoice_no || invoiceNo || "",
          description: payment?.description || "",
          due_date: payment?.due_date ? new Date(payment.due_date) : null,
        },
      ],
    },
  });

  const { saveDraft, clearDraft } = useFormDraft(
    `draft_payment_${type}`,
    form,
    !payment
  );

  const handleSaveDraft = useCallback(() => {
    saveDraft();
    isPersisted.current = true;
    closeDialog();
  }, [saveDraft, closeDialog]);

  useEffect(() => {
    return () => {
      if (!isPersisted.current && !payment) {
        clearDraft();
      }
    };
  }, [clearDraft, payment]);

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
    (data: z.infer<typeof PaymentFormSchema>) => {
      let promise: Promise<any>;

      if (payment) promise = PAYMENT_API.Update(payment.id!, data.entries[0]);
      else promise = PAYMENT_API.CreateBatch(data.entries);

      toast.promise(promise, {
        loading: payment
          ? t("notification.payment.update.pending")
          : t("notification.payment.add.pending"),
        success: () => {
          isPersisted.current = true;
          form.reset();
          clearDraft();
          closeDialog();
          queryClient.invalidateQueries({ queryKey: ["totals"] });
          queryClient.invalidateQueries({ queryKey: ["payments"] });
          queryClient.invalidateQueries({ queryKey: ["customers"] });
          queryClient.invalidateQueries({ queryKey: ["debts"] });
          queryClient.invalidateQueries({ queryKey: ["upcoming-due-dates"] });
          return payment
            ? t("notification.payment.update.success")
            : t("notification.payment.add.success");
        },
        error: payment
          ? t("notification.payment.update.error")
          : t("notification.payment.add.error"),
      });
    },
    [form, clearDraft, closeDialog, PAYMENT_API, payment, t, queryClient],
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
      currency: "TRY",
      exchange_rate: 1,
      payment_date: new Date(),
      payment_method: "bank_transfer",
      invoice_no: "",
      description: "",
      due_date: null,
    });
    setCurrentPageIndex(fields.length);
  }, [append, fields.length, customerId]);

  const watchedEntries = form.watch("entries");
  const grandTotals = useMemo(() => {
    const totals: Record<string, number> = { TRY: 0, USD: 0, EUR: 0 };
    watchedEntries.forEach((entry: any) => {
      totals[entry.currency] = (totals[entry.currency] || 0) + (entry.amount || 0);
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
        {!payment && (
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
                  {t("dialog.payment.remove")}
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addEntry}
              >
                <Plus className="h-4 w-4 mr-2" />
                {t("dialog.payment.add_more")}
              </Button>
            </div>
          </div>
        )}

        <div className="min-h-fit">
          {fields.map((field, index) => index === currentPageIndex && (
            <div key={field.id} className="animate-in fade-in slide-in-from-right-2 duration-200">
               <PaymentEntry
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
                  isEditMode={!!payment}
                  PaymentFormSchema={SinglePaymentSchema}
                />
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2 mt-4 border-t pt-4">
          {Object.entries(grandTotals).map(([currency, total]) => total > 0 && (
            <div key={currency} className="flex justify-between items-center text-lg font-semibold">
              <span>{t("form.payment.grand_total", { currency })}</span>
              <span>{formatCurrency(total, currency as any)}</span>
            </div>
          ))}
          <div className="flex justify-end gap-2 mt-2">
            <CancelButton onClick={onCancel} />
            {!payment && (
              <Button type="button" variant="secondary" onClick={handleSaveDraft}>
                {t("dialog.payment.save_as_draft")}
              </Button>
            )}
            <Button type="submit">
              {payment ? t("dialog.payment.update") : t("dialog.payment.add")}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
