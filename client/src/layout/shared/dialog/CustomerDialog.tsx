import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useDialog } from "@/contexts/DialogContext"
import { CustomerApi } from "@/lib/api"
import type { CustomerDto } from "@/lib/types"
import { sendRefreshEvent } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import z from "zod"

type Props = {
    customer?: CustomerDto
}

const CustomerFormSchema = z.object({
    name: z.string().min(2, "Müşteri adı en az 2 karakter olmalıdır").max(255, "Müşteri adı en fazla 255 karakter olmalıdır"),
    phone: z.string().min(5, "Telefon numarası en az 5 karakter olmalıdır").max(20, "Telefon numarası en fazla 20 karakter olmalıdır").optional().or(z.literal("")),
    email: z.email({ message: "Geçersiz e-posta adresi" }).optional().or(z.literal("")),
    tax_number: z.string().min(5, "Vergi numarası en az 5 karakter olmalıdır").max(11, "Vergi numarası en fazla  karakter olmalıdır").optional().or(z.literal("")),
    address: z.string().min(5, "Adres en az 5 karakter olmalıdır").max(500, "Adres en fazla 500 karakter olmalıdır").optional().or(z.literal("")),
    is_company: z.boolean(),
})

export default function CustomerDialog(props: Props) {
    const { customer } = props;

    const { closeDialog } = useDialog();

    console.log(Number(customer?.is_company) === 1);
    

    const form = useForm<z.infer<typeof CustomerFormSchema>>({
        resolver: zodResolver(CustomerFormSchema),
        defaultValues: {
            name: customer?.name || "",
            phone: customer?.phone || "",
            email: customer?.email || "",
            tax_number: customer?.tax_number || "",
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
            promise = CustomerApi.Update(customer.id!, data);
        else
            promise = CustomerApi.Create(data);

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
                                <Input type="text" placeholder="ABC Ltd. Şti." {...field} />
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
                <FormField
                    control={form.control}
                    name="tax_number"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{form.watch("is_company") ? "Vergi No" : "TC Kimlik No"}</FormLabel>
                            <FormControl>
                                <Input type="text" placeholder={form.watch("is_company") ? "1234567890" : "12345678901"} {...field} />
                            </FormControl>
                            <FormDescription>
                                Müşteri {form.watch("is_company") ? "vergi" : "TC Kimlik"} numarası.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>İletişim Telefon Numarası</FormLabel>
                            <FormControl>
                                <Input type="text" placeholder="+90 555 555 55 55" {...field} />
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
                                <Input type="text" placeholder="ornek@sirket.com" {...field} />
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
                                <Input type="text" placeholder="Örnek Mah. No:1 D:5" {...field} />
                            </FormControl>
                            <FormDescription>
                                Müşterinin adresi.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="flex justify-end gap-2 col-span-2">
                    <Button variant="destructive" onClick={onCancel}>İptal</Button>
                    <Button type="submit" className="bg-green-600">
                        {customer ? "Müşteriyi Güncelle" : "Müşteri Ekle"}
                    </Button>
                </div>
            </form>
        </Form>
    )
}