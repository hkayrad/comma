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
import { PayableDebtApi, ReceivableDebtApi } from "@/lib/api/debt";
import type { CustomerIdName, DebtDto, OverviewViewType } from "@/lib/types";
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

type Props = {
  debt?: DebtDto;
  type?: OverviewViewType;
};

export default function DebtDialog(props: Props) {
  const { debt, type = "receivable" } = props;
  const { closeDialog } = useDialog();
  const { t } = useTranslation();
  const [customerIdAndNames, setCustomerIdAndNames] = useState<
    CustomerIdName[]
  >([]);

  const DEBT_API = type === "payable" ? PayableDebtApi : ReceivableDebtApi;
  const CUSTOMER_API =
    type === "payable" ? PayableCustomerApi : ReceivableCustomerApi;

  const DebtFormSchema = z.object({
    customer_id: z
      .string({
        error: t("form.debt.customer_id.validation.required"),
      })
      .min(1, t("form.debt.customer_id.validation.required")),
    amount: z.number({ error: t("form.debt.amount.validation.invalid") }).min(
      0.01,
      t("form.debt.amount.validation.min", {
        min: 0.01,
      }),
    ),
    vat: z
      .number({ error: t("form.debt.vat.validation.invalid") })
      .min(0, t("form.debt.vat.validation.min", { min: 0 }))
      .or(z.literal(0)),
    currency: z.enum(["TRY", "USD", "EUR"], {
      error: t("form.debt.currency.validation.invalid"),
    }),
    withholding: z
      .number({ error: t("form.debt.withholding.validation.invalid") })
      .min(0, t("form.debt.withholding.validation.min", { min: 0 }))
      .or(z.literal(0)),
    discount: z
      .number({ error: t("form.debt.discount.validation.invalid") })
      .min(0, t("form.debt.discount.validation.min", { min: 0 }))
      .or(z.literal(0)),
    exchange_rate: z
      .number({ error: t("form.debt.exchange_rate.validation.invalid") })
      .min(0, t("form.debt.exchange_rate.validation.min", { min: 0 }))
      .or(z.literal(0)),
    issue_date: z.date({
      error: t("form.debt.issue_date.validation.invalid"),
    }),
    invoice_no: z
      .string({
        error: t("form.debt.invoice_no.validation.invalid"),
      })
      .max(100, t("form.debt.invoice_no.validation.max", { charCount: 100 }))
      .optional()
      .or(z.literal("")),
    description: z
      .string({
        error: t("form.debt.description.validation.invalid"),
      })
      .max(500, t("form.debt.description.validation.max", { charCount: 500 }))
      .optional()
      .or(z.literal("")),
  });

  const form = useForm<z.infer<typeof DebtFormSchema>>({
    resolver: zodResolver(DebtFormSchema),
    defaultValues: {
      customer_id: debt?.customer_id || "",
      amount: debt?.amount ? Number(debt.amount) : 0,
      vat: debt?.vat ? Number(debt.vat) : 0,
      withholding: debt?.withholding ? Number(debt.withholding) : 0,
      discount: debt?.discount ? Number(debt.discount) : 0,
      currency: debt?.currency || "TRY",
      exchange_rate: debt?.exchange_rate ? Number(debt.exchange_rate) : 1,
      issue_date: debt?.issue_date ? new Date(debt.issue_date) : new Date(),
      invoice_no: debt?.invoice_no || "",
      description: debt?.description || "",
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

  const handleVatButtonClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>, vatPercentage: number) => {
      e.preventDefault();
      const amount = form.getValues("amount");
      const discount = form.getValues("discount");
      form.setValue(
        "vat",
        Number(((amount - discount) * vatPercentage).toFixed(2)),
      );
    },
    [form],
  );

  const handleDiscountButtonClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>, discountPercentage: number) => {
      e.preventDefault();
      const amount = form.getValues("amount");
      form.setValue(
        "discount",
        Number((amount * discountPercentage).toFixed(2)),
      );
    },
    [form],
  );

  const handleSetWithholdingButtonClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>, discountPercentage: number) => {
      e.preventDefault();
      const vat = form.getValues("vat");
      form.setValue("withholding", Number((vat * discountPercentage).toFixed(2)));
    },
    [form],
  );

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
    (data: z.infer<typeof DebtFormSchema>) => {
      let promise;

      if (debt) promise = DEBT_API.Update(debt.id!, data);
      else promise = DEBT_API.Create(data);

      toast.promise(promise, {
        loading: debt
          ? t("notification.debt.update.pending")
          : t("notification.debt.add.pending"),
        success: () => {
          form.reset();
          closeDialog();
          sendRefreshEvent();
          return debt
            ? t("notification.debt.update.success")
            : t("notification.debt.add.success");
        },
        error: debt
          ? t("notification.debt.update.error")
          : t("notification.debt.add.error"),
      });
    },
    [form, closeDialog, DEBT_API, debt, t],
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
          name="issue_date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>
                {t("form.debt.issue_date")}{" "}
                <span className="text-red-500">*</span>
              </FormLabel>
              <DateSelect field={field} />
              <FormDescription>
                {t("form.debt.issue_date.description")}
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
              <FormDescription>
                {t("form.debt.currency.description")}
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
                    {currencySign[form.watch("currency")]}
                  </InputGroupAddon>
                </InputGroup>
              </FormControl>
              <FormDescription>
                {t("form.debt.amount.description")}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="discount"
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
                      {currencySign[form.watch("currency")]}
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
              <FormDescription>
                {t("form.debt.discount.description")}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="vat"
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
                      {currencySign[form.watch("currency")]}
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
              <FormDescription>
                {t("form.debt.vat.description")}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="withholding"
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
                      {currencySign[form.watch("currency")]}
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
              <FormDescription>
                {t("form.debt.withholding.description")}
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
                <FormDescription>
                  {t("form.debt.exchange_rate.description")}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <FormField
          control={form.control}
          name="invoice_no"
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
              <FormDescription>
                {t("form.debt.invoice_no.description")}
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
              <FormDescription>
                {t("form.debt.description.description")}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2 col-span-2">
          <Button variant="ghost" onClick={onCancel}>
            {t("vars.cancel")}
          </Button>
          <Button type="submit">
            {debt ? t("dialog.debt.update") : t("dialog.debt.add")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
