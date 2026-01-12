import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useDialog } from "@/contexts/dialog";
import { PayableCustomerApi, ReceivableCustomerApi } from "@/lib/api/customer";
import { PayablePaymentApi, ReceivablePaymentApi } from "@/lib/api/payment";
import type { CustomerIdName, OverviewViewType, PaymentDto } from "@/lib/types";
import { sendRefreshEvent } from "@/lib/utils";
import { Logger } from "@/lib/utils/logger";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  DollarSign,
  Euro,
  ReceiptText,
  TextInitial,
  TurkishLira,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
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

type Props = {
  payment?: PaymentDto;
  customerId?: string;
  type?: OverviewViewType;
};

export default function PaymentDialog(props: Props) {
  const { payment, customerId, type = "receivable" } = props;
  const { closeDialog } = useDialog();
  const { t } = useTranslation();
  const [customerIdAndNames, setCustomerIdAndNames] = useState<
    CustomerIdName[]
  >([]);

  const PAYMENT_API =
    type === "payable" ? PayablePaymentApi : ReceivablePaymentApi;
  const CUSTOMER_API =
    type === "payable" ? PayableCustomerApi : ReceivableCustomerApi;

  const PaymentFormSchema = z.object({
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
  });

  const form = useForm<z.infer<typeof PaymentFormSchema>>({
    resolver: zodResolver(PaymentFormSchema),
    defaultValues: {
      customer_id: payment?.customer_id || customerId || "",
      amount: payment?.amount ? Number(payment.amount) : 0,
      currency: payment?.currency || "TRY",
      exchange_rate: payment?.exchange_rate ? Number(payment.exchange_rate) : 1,
      payment_date: payment?.payment_date
        ? new Date(payment.payment_date)
        : new Date(),
      payment_method: payment?.payment_method || "bank_transfer",
      invoice_no: payment?.invoice_no || "",
      description: payment?.description || "",
    },
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

  const handleSetExchangeRateButtonClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      const exchangeRatesString = sessionStorage.getItem("exchangeRates");
      const exchangeRates =
        exchangeRatesString && JSON.parse(exchangeRatesString);

      const selectedCurrency = form.watch("currency").toLowerCase();

      if (exchangeRates && exchangeRates[selectedCurrency]) {
        form.setValue(
          "exchange_rate",
          parseFloat(exchangeRates[selectedCurrency].forexBuying),
        );
      }
    },
    [form],
  );

  const onCancel = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      form.reset();
      closeDialog();
    },
    [form, closeDialog],
  );

  const onSubmit = useCallback(
    (data: z.infer<typeof PaymentFormSchema>) => {
      let promise;

      if (payment) promise = PAYMENT_API.Update(payment.id!, data);
      else promise = PAYMENT_API.Create(data);

      toast.promise(promise, {
        loading: payment
          ? t("notification.payment.update.pending")
          : t("notification.payment.add.pending"),
        success: () => {
          form.reset();
          closeDialog();
          sendRefreshEvent();
          return payment
            ? t("notification.payment.update.success")
            : t("notification.payment.add.success");
        },
        error: payment
          ? t("notification.payment.update.error")
          : t("notification.payment.add.error"),
      });
    },
    [form, closeDialog, PAYMENT_API, payment, t],
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

  const selectedCurrency = form.watch("currency");
  useEffect(() => {
    if (selectedCurrency === "TRY") {
      form.setValue("exchange_rate", 1);
    }
  }, [form, selectedCurrency]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid grid-cols-2 gap-8"
      >
        <CustomerSelect
          type={type}
          form={form}
          customerIdAndNames={customerIdAndNames}
          addNewCustomer
          onRefresh={handleFetchCustomerIdAndNames}
        />
        <FormField
          control={form.control}
          name="payment_date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>
                {t("form.payment.payment_date")}{" "}
                <span className="text-red-500">*</span>
              </FormLabel>
              <DateSelect field={field} />
              <FormDescription>
                {t("form.payment.payment_date.description")}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="currency"
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
              <FormDescription>
                {t("form.payment.currency.description")}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="amount"
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
                    {currencySign[form.watch("currency")]}
                  </InputGroupAddon>
                </InputGroup>
              </FormControl>
              <FormDescription>
                {t("form.payment.amount.description")}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        {form.watch("currency") !== "TRY" && (
          <FormField
            control={form.control}
            name="exchange_rate"
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
                <FormDescription>
                  {t("form.payment.exchange_rate.description")}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <FormField
          control={form.control}
          name="payment_method"
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
                    (method) => (
                      <div key={method} className="flex gap-2 items-center">
                        <Radio value={method} id={method} />
                        <label
                          htmlFor={method}
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
              <FormDescription>
                {t("form.payment.payment_method.description")}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="invoice_no"
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
              <FormDescription>
                {t("form.payment.invoice_no.description")}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
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
              <FormDescription>
                {t("form.payment.description.description")}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2 col-span-2">
          <CancelButton onClick={onCancel} />
          <Button type="submit">
            {payment ? t("dialog.payment.update") : t("dialog.payment.add")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
