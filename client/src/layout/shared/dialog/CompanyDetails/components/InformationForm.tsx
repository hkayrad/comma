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
import CancelButton from "@/layout/shared/CancelButton";
import { CompanyApi } from "@/lib/api/company";
import type { CompanyDto } from "@/lib/types";
import { Logger } from "@/lib/utils/logger";
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
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import z from "zod";

export default function InformationForm() {
  const [companyDetails, setCompanyDetails] = useState<CompanyDto | null>(null);

  const closeDialog = useDialog((s) => s.closeDialog);
  const { t } = useTranslation();

  const CompanyFormSchema = z.object({
    name: z
      .string({ message: t("form.company.name.validation.invalid") })
      .min(2, t("form.company.name.validation.min", { charCount: 2 }))
      .max(255, t("form.company.name.validation.max", { charCount: 255 })),
    is_company: z.boolean(),
    phone: z
      .string({ message: t("form.company.phone.validation.invalid") })
      .min(5, t("form.company.phone.validation.min", { charCount: 5 }))
      .max(20, t("form.company.phone.validation.max", { charCount: 20 }))
      .optional()
      .or(z.literal("")),
    email: z
      .email({ message: t("form.company.email.validation.invalid") })
      .min(5, t("form.company.email.validation.min", { charCount: 5 }))
      .max(255, t("form.company.email.validation.max", { charCount: 255 }))
      .optional()
      .or(z.literal("")),
    tax_number: z
      .string({
        message: t("form.company.tax_number.validation.invalid"),
      })
      .min(5, t("form.company.tax_number.validation.min", { charCount: 5 }))
      .max(11, t("form.company.tax_number.validation.max", { charCount: 11 }))
      .optional()
      .or(z.literal("")),
    tax_office: z
      .string({
        message: t("form.company.tax_office.validation.invalid"),
      })
      .min(2, t("form.company.tax_office.validation.min", { charCount: 2 }))
      .max(
        100,
        t("form.company.tax_office.validation.max", {
          charCount: 100,
        }),
      )
      .optional()
      .or(z.literal("")),
    mersis_no: z
      .string({
        message: t("form.company.mersis_no.validation.invalid"),
      })
      .min(16, t("form.company.mersis_no.validation.min", { charCount: 16 }))
      .max(16, t("form.company.mersis_no.validation.max", { charCount: 16 }))
      .optional()
      .or(z.literal("")),
    address: z
      .string({ message: t("form.company.address.validation.invalid") })
      .min(5, t("form.company.address.validation.min", { charCount: 5 }))
      .max(500, t("form.company.address.validation.max", { charCount: 500 }))
      .optional()
      .or(z.literal("")),
  });

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
      Logger.error("Şirket detayları alınırken bir hata oluştu:", error);
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
      const promise = CompanyApi.UpdateCompanyDetails(data);

      toast.promise(promise, {
        loading: t("notification.companyDetails.update.pending"),
        success: () => {
          form.reset();
          closeDialog();
          return t("notification.companyDetails.update.success");
        },
        error: t("notification.companyDetails.update.error"),
      });
    },
    [form, closeDialog, t],
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
                {t("form.company.name")} <span className="text-red-500">*</span>
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
                <span>{t("form.company.name.description")}</span>
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
                {t("form.company.is_company")}{" "}
                <span className="text-red-500">*</span>
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
                      {t("vars.is_company.true")}
                    </label>
                  </div>
                  <div className="flex gap-2 items-center">
                    <Radio value="false" id="individual" />
                    <label
                      htmlFor="individual"
                      className="cursor-pointer select-none"
                    >
                      {t("vars.is_company.false")}
                    </label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormDescription>
                {t("form.company.is_company.description")}
              </FormDescription>
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
                <FormLabel>{t("form.company.tax_office")}</FormLabel>
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
                <FormDescription>
                  {t("form.company.tax_office.description")}
                </FormDescription>
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
                {form.watch("is_company")
                  ? t("vars.tax_number")
                  : t("vars.tckn")}
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
                {t("form.company.tax_number.description", {
                  tax_number_text: form.watch("is_company")
                    ? t("form.company.tax_number").toLowerCase()
                    : t("form.company.tax_number_alternative"),
                })}
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
                <FormLabel>{t("form.company.mersis_no")}</FormLabel>
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
                <FormDescription>
                  {t("form.company.mersis_no.description")}
                </FormDescription>
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
              <FormLabel>{t("form.company.phone")}</FormLabel>
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
              <FormDescription>
                {t("form.company.phone.description")}
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
              <FormLabel>{t("form.company.email")}</FormLabel>
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
              <FormDescription>
                {t("form.company.email.description")}
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
              <FormLabel>{t("form.company.address")}</FormLabel>
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
              <FormDescription>
                {t("form.company.address.description")}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2 col-span-2">
          <CancelButton onClick={onCancel} />
          <Button type="submit">{t("vars.save")}</Button>
        </div>
      </form>
    </Form>
  );
}
