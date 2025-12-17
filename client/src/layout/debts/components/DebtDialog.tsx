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

type Props = {
  debt?: DebtDto;
  type?: OverviewViewType;
};

const DebtFormSchema = z.object({
  customer_id: z.string().min(1, "Müşteri seçilmesi zorunludur"),
  amount: z
    .number({ error: "Geçersiz tutar" })
    .min(0.01, "Tutar en az 0.01 olmalıdır"),
  vat: z
    .number({ error: "Geçersiz tutar" })
    .min(0, "KDV en az 0 olmalıdır")
    .or(z.literal(0)),
  currency: z.enum(["TRY", "USD", "EUR"], { error: "Geçersiz para birimi" }),
  exchange_rate: z
    .number({ error: "Geçersiz kur" })
    .min(0, "Kur en az 0 olmalıdır")
    .or(z.literal(0)),
  issue_date: z.date({ error: "Geçersiz tarih" }),
  invoice_no: z
    .string()
    .max(100, "Fatura numarası en fazla 100 karakter olmalıdır")
    .optional()
    .or(z.literal("")),
  description: z
    .string()
    .max(500, "Açıklama en fazla 500 karakter olmalıdır")
    .optional()
    .or(z.literal("")),
});

export default function DebtDialog(props: Props) {
  const { debt, type = "receivable" } = props;
  const { closeDialog } = useDialog();
  const [customerIdAndNames, setCustomerIdAndNames] = useState<
    CustomerIdName[]
  >([]);

  const DEBT_API = type === "payable" ? PayableDebtApi : ReceivableDebtApi;
  const CUSTOMER_API =
    type === "payable" ? PayableCustomerApi : ReceivableCustomerApi;

  const form = useForm<z.infer<typeof DebtFormSchema>>({
    resolver: zodResolver(DebtFormSchema),
    defaultValues: {
      customer_id: debt?.customer_id || "",
      amount: debt?.amount ? Number(debt.amount) : 0,
      vat: debt?.vat ? Number(debt.vat) : 0,
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
      form.setValue("vat", Number((amount * vatPercentage).toFixed(2)));
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
        loading: debt ? "Borç güncelleniyor..." : "Borç ekleniyor...",
        success: () => {
          form.reset();
          closeDialog();
          sendRefreshEvent();
          return debt ? "Borç başarıyla güncellendi" : "Borç başarıyla eklendi";
        },
        error: debt
          ? "Borç güncellenirken hata oluştu"
          : "Borç eklenirken hata oluştu",
      });
    },
    [form, closeDialog, DEBT_API, debt],
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
                Kesim Tarihi <span className="text-red-500">*</span>
              </FormLabel>
              <DateSelect field={field} />
              <FormDescription>Borç kesim tarihi.</FormDescription>
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
                Para Birimi <span className="text-red-500">*</span>
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
                  <SelectContent>
                    <SelectItem value="TRY">
                      <TurkishLira />
                      <span>Türk Lirası</span>
                    </SelectItem>
                    <SelectItem value="EUR">
                      <Euro />
                      <span>Euro</span>
                    </SelectItem>
                    <SelectItem value="USD">
                      <DollarSign />
                      <span>Amerikan Doları</span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
              <FormDescription>Borç para birimi.</FormDescription>
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
                Tutar <span className="text-red-500">*</span>
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
              <FormDescription>Borç tutarı.</FormDescription>
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
                KDV <span className="text-red-500">*</span>
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
                      <Tooltip disableHoverableContent>
                        <TooltipTrigger asChild>
                          <InputGroupButton
                            size="xs"
                            onClick={(e) => handleVatButtonClick(e, 0.1)}
                          >
                            %10
                          </InputGroupButton>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Tutarın %10'unu KDV olarak ayarla</p>
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip disableHoverableContent>
                        <TooltipTrigger asChild>
                          <InputGroupButton
                            size="xs"
                            onClick={(e) => handleVatButtonClick(e, 0.2)}
                          >
                            %20
                          </InputGroupButton>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Tutarın %20'sini KDV olarak ayarla</p>
                        </TooltipContent>
                      </Tooltip>
                    </InputGroupAddon>
                  </InputGroup>
                </div>
              </FormControl>
              <FormDescription>Borç KDV'si.</FormDescription>
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
                  Kur <span className="text-red-500">*</span>
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
                        <Tooltip disableHoverableContent>
                          <TooltipTrigger asChild>
                            <InputGroupButton
                              size="xs"
                              onClick={handleSetExchangeRateButtonClick}
                            >
                              TCMB Kuru
                            </InputGroupButton>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Kur olarak TCMB günlük kurunu kullan</p>
                          </TooltipContent>
                        </Tooltip>
                      </InputGroupAddon>
                    </InputGroup>
                  </div>
                </FormControl>
                <FormDescription>Döviz Kuru</FormDescription>
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
              <FormLabel className="flex gap-1">Fatura No</FormLabel>
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
              <FormDescription>Fatura numarası (varsa).</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex gap-1">Açıklama</FormLabel>
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
                Belirtmek istediğiniz ek bilgiler (varsa).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2 col-span-2">
          <Button variant="ghost" onClick={onCancel}>
            İptal
          </Button>
          <Button type="submit">{debt ? "Borcu Güncelle" : "Borç Ekle"}</Button>
        </div>
      </form>
    </Form>
  );
}
