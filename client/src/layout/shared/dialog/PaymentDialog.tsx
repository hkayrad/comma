import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useDialog } from "@/contexts/DialogContext"
import { PayableCustomerApi, PayablePaymentApi, ReceivableCustomerApi, ReceivablePaymentApi } from "@/lib/api"
import type { AvailableCurrency, CustomerIdName, OverviewViewType, PaymentDto } from "@/lib/types"
import { sendRefreshEvent } from "@/lib/utils"
import { Logger } from "@/lib/utils/logger"
import { zodResolver } from "@hookform/resolvers/zod"
import { DollarSign, Euro, ReceiptText, TextInitial, TurkishLira } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import z from "zod"
import CustomerSelect from "./components/CustomerSelect"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import DateSelect from "./components/DateSelect"
import { Radio, RadioGroup } from "@/components/animate-ui/components/base/radio"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type Props = {
    payment?: PaymentDto,
    type?: OverviewViewType
}

const PaymentFormSchema = z.object({
    customer_id: z.string().min(1, "Müşteri seçilmesi zorunludur"),
    amount: z.number({ error: "Geçersiz tutar" }).min(0.01, "Tutar en az 0.01 olmalıdır"),
    currency: z.enum(["TRY", "USD", "EUR"], { error: "Geçersiz para birimi" }),
    payment_date: z.date({ error: "Geçersiz tarih" }),
    payment_method: z.enum(["cash", "bank_transfer", "check", "card"], { error: "Geçersiz ödeme yöntemi" }),
    invoice_no: z.string().max(100, "Fatura numarası en fazla 100 karakter olmalıdır").optional().or(z.literal("")),
    description: z.string().max(500, "Açıklama en fazla 500 karakter olmalıdır").optional().or(z.literal("")),
})

export default function PaymentDialog(props: Props) {
    const { payment, type = "receivable" } = props;
    const { closeDialog } = useDialog();
    const [customerIdAndNames, setCustomerIdAndNames] = useState<CustomerIdName[]>([]);

    const PAYMENT_API = type === "payable" ? PayablePaymentApi : ReceivablePaymentApi;
    const CUSTOMER_API = type === "payable" ? PayableCustomerApi : ReceivableCustomerApi;

    const form = useForm<z.infer<typeof PaymentFormSchema>>({
        resolver: zodResolver(PaymentFormSchema),
        defaultValues: {
            customer_id: payment?.customer_id || "",
            amount: payment?.amount ? Number(payment.amount) : 0,
            currency: payment?.currency || "TRY",
            payment_date: payment?.payment_date ? new Date(payment.payment_date) : new Date(),
            payment_method: payment?.payment_method || "bank_transfer",
            invoice_no: payment?.invoice_no || "",
            description: payment?.description || "",
        }
    })

    const handleFetchCustomerIdAndNames = async () => {
        try {
            const response = await CUSTOMER_API.GetIdAndName();
            Logger.debug("Fetched customer ID and names:", response);
            if (response)
                setCustomerIdAndNames(response);
        } catch (error) {
            Logger.error("Failed to fetch customer ID and names:", error);
        }
    }

    const onCancel = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        form.reset();
        closeDialog();
    }

    const onSubmit = (data: z.infer<typeof PaymentFormSchema>) => {
        let promise;

        if (payment)
            promise = PAYMENT_API.Update(payment.id!, data);
        else
            promise = PAYMENT_API.Create(data);

        toast.promise(promise, {
            loading: payment ? "Ödeme güncelleniyor..." : "Ödeme ekleniyor...",
            success: () => {
                form.reset();
                closeDialog();
                sendRefreshEvent();
                return payment ? "Ödeme başarıyla güncellendi" : "Ödeme başarıyla eklendi"
            },
            error: payment ? "Ödeme güncellenirken hata oluştu" : "Ödeme eklenirken hata oluştu"
        });
    }

    const currencySign = useMemo(() => ({
        TRY: <TurkishLira />,
        USD: <DollarSign />,
        EUR: <Euro />,
    }), []);

    useEffect(() => {
        handleFetchCustomerIdAndNames();
    }, []);

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-2 gap-8">
                <CustomerSelect
                    type={type}
                    form={form}
                    customerIdAndNames={customerIdAndNames}
                    addNewCustomer
                />
                <FormField
                    control={form.control}
                    name="payment_date"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Ödeme Tarihi <span className="text-red-500">*</span></FormLabel>
                            <DateSelect field={field} />
                            <FormDescription>
                                Borç ödeme tarihi.
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
                            <FormLabel className="flex gap-1">Para Birimi <span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                                <Select name={field.name} onValueChange={field.onChange} defaultValue={field.value}>
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
                            <FormDescription>
                                Borç para birimi.
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
                            <FormLabel className="flex gap-1">Tutar <span className="text-red-500">*</span></FormLabel>
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
                                        {currencySign[form.watch("currency") as AvailableCurrency]}
                                    </InputGroupAddon>
                                </InputGroup>
                            </FormControl>
                            <FormDescription>
                                Ödeme tutarı.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="payment_method"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="flex gap-1">Ödeme Yöntemi <span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                                <RadioGroup className="flex gap-6" value={field.value} onValueChange={field.onChange}>
                                    {
                                        PaymentFormSchema.shape.payment_method.options.map((method) => (
                                            <div key={method} className="flex gap-2 items-center">
                                                <Radio value={method} id={method} />
                                                <label htmlFor={method} className="cursor-pointer select-none">
                                                    {method === "cash" ? "Nakit" :
                                                        method === "bank_transfer" ? "Havale" :
                                                            method === "card" ? "Kart" :
                                                                method === "check" ? "Çek" : method}
                                                </label>
                                            </div>
                                        ))
                                    }
                                </RadioGroup>
                            </FormControl>
                            <FormDescription>
                                Ödeme türünü seçin.
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
                            <FormLabel className="flex gap-1">Fatura No</FormLabel>
                            <FormControl>
                                <InputGroup>
                                    <InputGroupInput type="text" placeholder="Fatura No" {...field} />
                                    <InputGroupAddon>
                                        <ReceiptText />
                                    </InputGroupAddon>
                                </InputGroup>
                            </FormControl>
                            <FormDescription>
                                Fatura numarası (varsa).
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
                            <FormLabel className="flex gap-1">Açıklama</FormLabel>
                            <FormControl>
                                <InputGroup>
                                    <InputGroupInput type="text" placeholder="Açıklama" {...field} />
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
                    <Button variant="ghost" onClick={onCancel}>İptal</Button>
                    <Button type="submit">
                        {payment ? "Ödemeyi Güncelle" : "Ödeme Ekle"}
                    </Button>
                </div>
            </form>
        </Form>
    )
}