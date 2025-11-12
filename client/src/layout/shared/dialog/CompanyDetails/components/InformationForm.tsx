import {
  Radio,
  RadioGroup,
} from "@/components/animate-ui/components/base/radio";
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
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { useDialog } from "@/contexts/dialog";
import { useUser } from "@/contexts/user";
import { CompanyApi } from "@/lib/api/company";
import type { CompanyDto } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Archive,
  Hash,
  IdCard,
  Landmark,
  Mail,
  MapPinHouse,
  Phone,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

const CompanyFormSchema = z.object({
  name: z
    .string()
    .min(2, "Müşteri adı en az 2 karakter olmalıdır")
    .max(255, "Müşteri adı en fazla 255 karakter olmalıdır"),
  is_company: z.boolean(),
  phone: z
    .string()
    .min(5, "Telefon numarası en az 5 karakter olmalıdır")
    .max(20, "Telefon numarası en fazla 20 karakter olmalıdır")
    .optional()
    .or(z.literal("")),
  email: z
    .email({ message: "Geçersiz e-posta adresi" })
    .optional()
    .or(z.literal("")),
  tax_number: z
    .string()
    .min(5, "Vergi numarası en az 5 karakter olmalıdır")
    .max(11, "Vergi numarası en fazla 11 karakter olmalıdır")
    .optional()
    .or(z.literal("")),
  tax_office: z
    .string()
    .min(2, "Vergi dairesi en az 2 karakter olmalıdır")
    .max(100, "Vergi dairesi en fazla 100 karakter olmalıdır")
    .optional()
    .or(z.literal("")),
  mersis_no: z
    .string()
    .min(16, "MERSİS numarası en az 16 karakter olmalıdır")
    .max(16, "MERSİS numarası en fazla 16 karakter olmalıdır")
    .optional()
    .or(z.literal("")),
  address: z
    .string()
    .min(5, "Adres en az 5 karakter olmalıdır")
    .max(500, "Adres en fazla 500 karakter olmalıdır")
    .optional()
    .or(z.literal("")),
});

export default function InformationForm() {
  const { user } = useUser();
  const [companyDetails, setCompanyDetails] = useState<CompanyDto | null>(null);

  const { closeDialog } = useDialog();

  const form = useForm<z.infer<typeof CompanyFormSchema>>({
    resolver: zodResolver(CompanyFormSchema),
    defaultValues: {
      name: companyDetails?.name || "",
      is_company: Number(companyDetails?.is_company) === 1 || false,
      phone: companyDetails?.phone || "",
      email: companyDetails?.email || "",
      tax_number: companyDetails?.tax_number || "",
      tax_office: companyDetails?.tax_office || "",
      mersis_no: companyDetails?.mersis_no || "",
      address: companyDetails?.address || "",
    },
  });

  const fetchCompanyDetails = useCallback(async () => {
    try {
      const response = await CompanyApi.GetCompanyById();

      if (response.success) {
        setCompanyDetails(response.data);
      }
    } catch (error) {
      console.error("Şirket detayları alınırken bir hata oluştu:", error);
    }
  }, []);

  const onCancel = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      form.reset();
      closeDialog();
    },
    [form, closeDialog],
  );

  const onSubmit = useCallback(
    (data: z.infer<typeof CompanyFormSchema>) => {
      if (!user?.companyId) return;

      const promise = CompanyApi.UpdateCompanyDetails(user.companyId, data);

      toast.promise(promise, {
        loading: "Şirket detayları güncelleniyor...",
        success: () => {
          form.reset();
          closeDialog();
          return "Şirket detayları başarıyla güncellendi!";
        },
        error: "Şirket detayları güncellenirken bir hata oluştu.",
      });
    },
    [form, closeDialog, user],
  );

  useEffect(() => {
    fetchCompanyDetails();
  }, [fetchCompanyDetails]);

  useEffect(() => {
    if (companyDetails) {
      form.reset({
        name: companyDetails.name || "",
        is_company: Number(companyDetails?.is_company) === 1 || false,
        phone: companyDetails.phone || "",
        email: companyDetails.email || "",
        tax_number: companyDetails.tax_number || "",
        tax_office: companyDetails.tax_office || "",
        mersis_no: companyDetails.mersis_no || "",
        address: companyDetails.address || "",
      });
    }
  }, [companyDetails, form]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid grid-cols-2 gap-8"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Şirket Adı <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <InputGroup>
                  <InputGroupInput
                    type="text"
                    placeholder="ABC. Ltd. Şti."
                    {...field}
                  />
                  <InputGroupAddon>
                    <IdCard />
                  </InputGroupAddon>
                </InputGroup>
              </FormControl>
              <FormDescription>
                <span>Şirketinizin tam adı.</span>
              </FormDescription>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="is_company"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex gap-1">
                Hesap Türü <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <RadioGroup
                  className="flex gap-8"
                  value={String(field.value)}
                  onValueChange={(value) => field.onChange(value === "true")}
                >
                  <div className="flex gap-2 items-center">
                    <Radio value="true" id="company" />
                    <label
                      htmlFor="company"
                      className="cursor-pointer select-none"
                    >
                      Şirket
                    </label>
                  </div>
                  <div className="flex gap-2 items-center">
                    <Radio value="false" id="individual" />
                    <label
                      htmlFor="individual"
                      className="cursor-pointer select-none"
                    >
                      Birey
                    </label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormDescription>Hesap türünü seçin.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        {form.watch("is_company") && (
          <FormField
            control={form.control}
            name="tax_office"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vergi Dairesi</FormLabel>
                <FormControl>
                  <InputGroup>
                    <InputGroupInput
                      type="text"
                      placeholder="Eskişehir"
                      {...field}
                    />
                    <InputGroupAddon>
                      <Landmark />
                    </InputGroupAddon>
                  </InputGroup>
                </FormControl>
                <FormDescription>Şirketinizin vergi dairesi.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <FormField
          control={form.control}
          name="tax_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {form.watch("is_company") ? "Vergi No" : "TC Kimlik No"}
              </FormLabel>
              <FormControl>
                <InputGroup>
                  <InputGroupInput
                    type="text"
                    placeholder={
                      form.watch("is_company") ? "1234567890" : "12345678901"
                    }
                    {...field}
                  />
                  <InputGroupAddon>
                    <Hash />
                  </InputGroupAddon>
                </InputGroup>
              </FormControl>
              <FormDescription>
                {form.watch("is_company") ? "Vergi" : "TC Kimlik"} numarası.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        {form.watch("is_company") && (
          <FormField
            control={form.control}
            name="mersis_no"
            render={({ field }) => (
              <FormItem>
                <FormLabel>MERSİS No</FormLabel>
                <FormControl>
                  <InputGroup>
                    <InputGroupInput
                      type="number"
                      placeholder="1234567890123456"
                      {...field}
                    />
                    <InputGroupAddon>
                      <Archive />
                    </InputGroupAddon>
                  </InputGroup>
                </FormControl>
                <FormDescription>MERSİS numarası.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>İletişim Telefon Numarası</FormLabel>
              <FormControl>
                <InputGroup>
                  <InputGroupInput
                    type="text"
                    placeholder="+90 555 555 55 55"
                    {...field}
                  />
                  <InputGroupAddon>
                    <Phone />
                  </InputGroupAddon>
                </InputGroup>
              </FormControl>
              <FormDescription>İletişim telefon numarası.</FormDescription>
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
                  <InputGroupInput
                    type="text"
                    placeholder="ornek@sirket.com"
                    {...field}
                  />
                  <InputGroupAddon>
                    <Mail />
                  </InputGroupAddon>
                </InputGroup>
              </FormControl>
              <FormDescription>E-posta adresiniz.</FormDescription>
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
                  <InputGroupInput
                    type="text"
                    placeholder="Örnek Mah. No:1 D:5"
                    {...field}
                  />
                  <InputGroupAddon>
                    <MapPinHouse />
                  </InputGroupAddon>
                </InputGroup>
              </FormControl>
              <FormDescription>Fiziksel adresiniz.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2 col-span-2">
          <Button variant="ghost" onClick={onCancel}>
            İptal
          </Button>
          <Button type="submit">Kaydet</Button>
        </div>
      </form>
    </Form>
  );
}
