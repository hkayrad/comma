import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useDialog } from "@/contexts/DialogContext"
import { CustomerApi, DebtApi } from "@/lib/api"
import type { CustomerIdName, DebtDto } from "@/lib/types"
import { cn, sendRefreshEvent } from "@/lib/utils"
import { Logger } from "@/lib/utils/logger"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import { CalendarIcon, Check, ChevronsUpDown } from "lucide-react"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import z from "zod"

type Props = {
    debt?: DebtDto
}

const DebtFormSchema = z.object({
    customer_id: z.string().min(1, "Müşteri seçilmesi zorunludur"),
    amount: z.number({ error: "Geçersiz tutar" }).min(0.01, "Tutar en az 0.01 olmalıdır"),
    vat: z.number({ error: "Geçersiz tutar" }).min(0, "KDV en az 0 olmalıdır").or(z.literal(0)),
    issue_date: z.date({ error: "Geçersiz tarih" }),
    invoice_no: z.string().max(100, "Fatura numarası en fazla 100 karakter olmalıdır").optional().or(z.literal("")),
    description: z.string().max(500, "Açıklama en fazla 500 karakter olmalıdır").optional().or(z.literal("")),
})

export default function DebtDialog(props: Props) {
    const { debt } = props;
    const { closeDialog } = useDialog();
    const [customerIdAndNames, setCustomerIdAndNames] = useState<CustomerIdName[]>([]);
    const [isCustomerSelectOpen, setIsCustomerSelectOpen] = useState(false);

    const form = useForm<z.infer<typeof DebtFormSchema>>({
        resolver: zodResolver(DebtFormSchema),
        defaultValues: {
            customer_id: debt?.customer_id || "",
            amount: debt?.amount ? Number(debt.amount) : 0,
            vat: debt?.vat ? Number(debt.vat) : 0,
            issue_date: debt?.issue_date ? new Date(debt.issue_date) : new Date(),
            invoice_no: debt?.invoice_no || "",
            description: debt?.description || "",
        }
    })

    const handleFetchCustomerIdAndNames = async () => {
        try {
            const response = await CustomerApi.GetIdAndName();
            Logger.debug("Fetched customer ID and names:", response);
            if (response)
                setCustomerIdAndNames(response);
        } catch (error) {
            Logger.error("Failed to fetch customer ID and names:", error);
        }
    }

    const handleVatButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        const amount = form.getValues("amount");
        form.setValue("vat", Number((amount * 0.2).toFixed(2)));
    }

    const onCancel = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        form.reset();
        closeDialog();
    }

    const onSubmit = (data: z.infer<typeof DebtFormSchema>) => {
        let promise;

        if (debt)
            promise = DebtApi.Update(debt.id!, data);
        else
            promise = DebtApi.Create(data);

        toast.promise(promise, {
            loading: debt ? "Borç güncelleniyor..." : "Borç ekleniyor...",
            success: () => {
                form.reset();
                closeDialog();
                sendRefreshEvent();
                return debt ? "Borç başarıyla güncellendi" : "Borç başarıyla eklendi"
            },
            error: (debt ? "Borç güncellenirken hata oluştu" : "Borç eklenirken hata oluştu")
        });
    }

    useEffect(() => {
        handleFetchCustomerIdAndNames();
    }, []);

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-2 gap-8">
                <FormField
                    control={form.control}
                    name="customer_id"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Müşteri <span className="text-red-500">*</span></FormLabel>
                            <Popover open={isCustomerSelectOpen} onOpenChange={setIsCustomerSelectOpen}>
                                <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            className={cn(
                                                "w-full justify-between",
                                                !field.value && "text-muted-foreground"
                                            )}
                                        >
                                            {field.value
                                                ? customerIdAndNames.find(
                                                    (customer) => customer.id === field.value
                                                )?.name
                                                : "Müşteri seçin"}
                                            <ChevronsUpDown className="opacity-50" />
                                        </Button>
                                    </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-[200px] p-0">
                                    <Command>
                                        <CommandInput
                                            placeholder="Ara..."
                                            className="h-9"
                                        />
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
                                                                    : "opacity-0"
                                                            )}
                                                        />
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                            <FormDescription>
                                Borçlu müşteri.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="issue_date"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Kesim Tarihi <span className="text-red-500">*</span></FormLabel>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full pl-3 text-left font-normal",
                                                !field.value && "text-muted-foreground"
                                            )}
                                        >
                                            {field.value ? (
                                                format(field.value, "PPP", { locale: tr })
                                            ) : (
                                                <span>Bir tarih seçin</span>
                                            )}
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                    </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={field.value}
                                        onSelect={field.onChange}
                                        disabled={(date) =>
                                            date > new Date() || date < new Date("1900-01-01")
                                        }
                                        captionLayout="dropdown"
                                    />
                                </PopoverContent>
                            </Popover>
                            <FormDescription>
                                Borç kesim tarihi.
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
                                <Input
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
                            </FormControl>
                            <FormDescription>
                                Borç tutarı.
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
                            <FormLabel className="flex gap-1">KDV <span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                                <div className="flex items-center gap-1">
                                    <Input
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
                                    <Button variant="outline" onClick={handleVatButtonClick}>%20</Button>
                                </div>
                            </FormControl>
                            <FormDescription>
                                Borç KDV'si.
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
                                <Input type="text" placeholder="Fatura No" {...field} />
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
                                <Input type="text" placeholder="Açıklama" {...field} />
                            </FormControl>
                            <FormDescription>
                                Belirtmek istediğiniz ek bilgiler (varsa).
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="flex justify-end gap-2 col-span-2">
                    <Button variant="destructive" onClick={onCancel}>İptal</Button>
                    <Button type="submit" className="bg-green-600">
                        {debt ? "Borcu Güncelle" : "Borç Ekle"}
                    </Button>
                </div>
            </form>
        </Form>
    )
}