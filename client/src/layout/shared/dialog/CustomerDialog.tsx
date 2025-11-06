import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useDialog } from "@/contexts/DialogContext"
import { PayableCustomerApi, ReceivableCustomerApi } from "@/lib/api"
import type { CustomerDto } from "@/lib/types"
import { sendRefreshEvent } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { Archive, Hash, IdCard, Landmark, Mail, MapPinHouse, Phone } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import z from "zod"

type Props = {
    customer?: CustomerDto,
    type?: "receivable" | "payable",
}

const CustomerFormSchema = z.object({
    name: z.string().min(2, "Müşteri adı en az 2 karakter olmalıdır").max(255, "Müşteri adı en fazla 255 karakter olmalıdır"),
    phone: z.string().min(5, "Telefon numarası en az 5 karakter olmalıdır").max(20, "Telefon numarası en fazla 20 karakter olmalıdır").optional().or(z.literal("")),
    email: z.email({ message: "Geçersiz e-posta adresi" }).optional().or(z.literal("")),
    tax_number: z.string().min(5, "Vergi numarası en az 5 karakter olmalıdır").max(11, "Vergi numarası en fazla 11 karakter olmalıdır").optional().or(z.literal("")),
    tax_office: z.string().min(2, "Vergi dairesi en az 2 karakter olmalıdır").max(100, "Vergi dairesi en fazla 100 karakter olmalıdır").optional().or(z.literal("")),
    mersis_no: z.string().min(16, "MERSİS numarası en az 16 karakter olmalıdır").max(16, "MERSİS numarası en fazla 16 karakter olmalıdır").optional().or(z.literal("")),
    address: z.string().min(5, "Adres en az 5 karakter olmalıdır").max(500, "Adres en fazla 500 karakter olmalıdır").optional().or(z.literal("")),
    is_company: z.boolean(),
})

export default function CustomerDialog(props: Props) {
    const { customer, type = "receivable" } = props;

    const API = type === "payable" ? PayableCustomerApi : ReceivableCustomerApi;

    const { closeDialog } = useDialog();

    const form = useForm<z.infer<typeof CustomerFormSchema>>({
        resolver: zodResolver(CustomerFormSchema),
        defaultValues: {
            name: customer?.name || "",
            phone: customer?.phone || "",
            email: customer?.email || "",
            tax_number: customer?.tax_number || "",
            tax_office: customer?.tax_office || "",
            mersis_no: customer?.mersis_no || undefined,
            address: customer?.address || "",
            is_company: customer ? (Number(customer.is_company) === 1) : true,
        }
    })

    const onCancel = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        form.reset();
        closeDialog();
    }

    const onSubmit = (data: z.infer<typeof CustomerFormSchema>) => {
        let promise;

        if (customer)
            promise = API.Update(customer.id!, data);
        else
            promise = API.Create(data);

        toast.promise(promise, {
            loading: customer ? "Müşteri güncelleniyor..." : "Müşteri ekleniyor...",
            success: () => {
                form.reset();
                closeDialog();
                sendRefreshEvent();
                return customer ? "Müşteri başarıyla güncellendi" : "Müşteri başarıyla eklendi"
            },
            error: customer ? "Müşteri güncellenirken hata oluştu" : "Müşteri eklenirken hata oluştu"
        });
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-2 gap-8">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="flex gap-1">Müşteri Adı <span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                                <InputGroup>
                                    <InputGroupInput type="text" placeholder="ABC Ltd. Şti." {...field} />
                                    <InputGroupAddon>
                                        <IdCard />
                                    </InputGroupAddon>
                                </InputGroup>
                            </FormControl>
                            <FormDescription>
                                Şirket veya birey adı.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="is_company"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="flex gap-1">Müşteri Türü <span className="text-red-500">*</span></FormLabel>
                            <FormControl>
                                <RadioGroup className="flex gap-8" value={String(field.value)} onValueChange={(value) => field.onChange(value === "true")}>
                                    <div className="flex gap-2 items-center">
                                        <RadioGroupItem value="true" id="company" />
                                        <label htmlFor="company" className="cursor-pointer select-none">Şirket</label>
                                    </div>
                                    <div className="flex gap-2 items-center">
                                        <RadioGroupItem value="false" id="individual" />
                                        <label htmlFor="individual" className="cursor-pointer select-none">Birey</label>
                                    </div>
                                </RadioGroup>
                            </FormControl>
                            <FormDescription>
                                Müşteri türünü seçin.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                {
                    form.watch("is_company") &&
                    <FormField
                        control={form.control}
                        name="tax_office"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Vergi Dairesi</FormLabel>
                                <FormControl>
                                    <InputGroup>
                                        <InputGroupInput type="text" placeholder="Eskişehir" {...field} />
                                        <InputGroupAddon>
                                            <Landmark />
                                        </InputGroupAddon>
                                    </InputGroup>
                                </FormControl>
                                <FormDescription>
                                    Müşterinin vergi dairesi.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                }
                <FormField
                    control={form.control}
                    name="tax_number"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{form.watch("is_company") ? "Vergi No" : "TC Kimlik No"}</FormLabel>
                            <FormControl>
                                <InputGroup>
                                    <InputGroupInput type="text" placeholder={form.watch("is_company") ? "1234567890" : "12345678901"} {...field} />
                                    <InputGroupAddon>
                                        <Hash />
                                    </InputGroupAddon>
                                </InputGroup>
                            </FormControl>
                            <FormDescription>
                                Müşteri {form.watch("is_company") ? "vergi" : "TC Kimlik"} numarası.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                {
                    form.watch("is_company") &&
                    <FormField
                        control={form.control}
                        name="mersis_no"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>MERSİS No</FormLabel>
                                <FormControl>
                                    <InputGroup>
                                        <InputGroupInput type="number" placeholder="1234567890123456" {...field} />
                                        <InputGroupAddon>
                                            <Archive />
                                        </InputGroupAddon>
                                    </InputGroup>
                                </FormControl>
                                <FormDescription>
                                    Müşterinin MERSİS numarası.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                }
                <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>İletişim Telefon Numarası</FormLabel>
                            <FormControl>
                                <InputGroup>
                                    <InputGroupInput type="text" placeholder="+90 555 555 55 55" {...field} />
                                    <InputGroupAddon>
                                        <Phone />
                                    </InputGroupAddon>
                                </InputGroup>
                            </FormControl>
                            <FormDescription>
                                Müşterinin telefon numarası.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>İletişim E-posta Adresi</FormLabel>
                            <FormControl>
                                <InputGroup>
                                    <InputGroupInput type="text" placeholder="ornek@sirket.com" {...field} />
                                    <InputGroupAddon>
                                        <Mail />
                                    </InputGroupAddon>
                                </InputGroup>
                            </FormControl>
                            <FormDescription>
                                Müşterinin e-posta adresi.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Adresi</FormLabel>
                            <FormControl>
                                <InputGroup>
                                    <InputGroupInput type="text" placeholder="Örnek Mah. No:1 D:5" {...field} />
                                    <InputGroupAddon>
                                        <MapPinHouse />
                                    </InputGroupAddon>
                                </InputGroup>
                            </FormControl>
                            <FormDescription>
                                Müşterinin adresi.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="flex justify-end gap-2 col-span-2">
                    <Button variant="ghost" onClick={onCancel}>İptal</Button>
                    <Button type="submit">
                        {customer ? "Müşteriyi Güncelle" : "Müşteri Ekle"}
                    </Button>
                </div>
            </form>
        </Form>
    )
}