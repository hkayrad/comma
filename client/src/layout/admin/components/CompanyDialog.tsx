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
import { AdminCompanyApi } from "@/lib/api/admin";
import type { CompanyDto } from "@comma/common";
import { sendRefreshEvent } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Radio,
  RadioGroup,
} from "@/components/animate-ui/components/base/radio";
import {
  Archive,
  Hash,
  IdCard,
  Landmark,
  Mail,
  MapPinHouse,
  Phone,
} from "lucide-react";
import { useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import z from "zod";
import CancelButton from "@/layout/shared/CancelButton";

import { companySchema } from "@common";

type Props = {
  company?: CompanyDto;
  onSuccess?: () => void;
};

export default function CompanyDialog(props: Props) {
  const { company, onSuccess } = props;
  const { t } = useTranslation();

  const closeDialog = useDialog((s) => s.closeDialog);

  const CompanyFormSchema = useMemo(
    () =>
      companySchema.extend({
        name: z
          .string({
            message: t("form.company.name.validation.invalid"),
          })
          .min(
            2,
            t("form.company.name.validation.min", {
              charCount: 2,
            }),
          )
          .max(
            255,
            t("form.company.name.validation.max", {
              charCount: 255,
            }),
          ),
        phone: z
          .string({
            message: t("form.company.phone.validation.invalid"),
          })
          .min(
            5,
            t("form.company.phone.validation.min", {
              charCount: 5,
            }),
          )
          .max(
            20,
            t("form.company.phone.validation.max", {
              charCount: 20,
            }),
          )
          .optional()
          .or(z.literal("")),
        email: z
          .email(t("form.company.email.validation.invalid"))
          .min(
            5,
            t("form.company.email.validation.min", {
              charCount: 5,
            }),
          )
          .max(
            255,
            t("form.company.email.validation.max", {
              charCount: 255,
            }),
          )
          .optional()
          .or(z.literal("")),
        tax_number: z
          .string({
            message: t("form.company.tax_number.validation.invalid"),
          })
          .min(
            5,
            t("form.company.tax_number.validation.min", {
              charCount: 5,
            }),
          )
          .max(
            11,
            t("form.company.tax_number.validation.max", {
              charCount: 11,
            }),
          )
          .optional()
          .or(z.literal("")),
        tax_office: z
          .string({
            message: t("form.company.tax_office.validation.invalid"),
          })
          .min(
            2,
            t("form.company.tax_office.validation.min", {
              charCount: 2,
            }),
          )
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
          .min(
            16,
            t("form.company.mersis_no.validation.min", {
              charCount: 16,
            }),
          )
          .max(
            16,
            t("form.company.mersis_no.validation.max", {
              charCount: 16,
            }),
          )
          .optional()
          .or(z.literal("")),
        address: z
          .string({
            message: t("form.company.address.validation.invalid"),
          })
          .min(
            5,
            t("form.company.address.validation.min", {
              charCount: 5,
            }),
          )
          .max(
            500,
            t("form.company.address.validation.max", {
              charCount: 500,
            }),
          )
          .optional()
          .or(z.literal("")),
        is_company: z.boolean(),
      }),
    [t],
  );

  const form = useForm<z.infer<typeof CompanyFormSchema>>({
    resolver: zodResolver(CompanyFormSchema),
    defaultValues: {
      name: company?.name || "",
      phone: company?.phone || "",
      email: company?.email || "",
      tax_number: company?.tax_number || "",
      tax_office: company?.tax_office || "",
      mersis_no: company?.mersis_no || "",
      address: company?.address || "",
      is_company: company ? Boolean(company.is_company) : true,
    },
  });

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
      let promise;

      if (company) promise = AdminCompanyApi.Update(company.id!, data);
      else promise = AdminCompanyApi.Create(data);

      toast.promise(promise, {
        loading: company
          ? t("notification.companyDetails.update.pending")
          : t("notification.customer.add.pending"),
        success: () => {
          form.reset();
          closeDialog();
          sendRefreshEvent();
          if (onSuccess) onSuccess();
          return company
            ? t("notification.companyDetails.update.success")
            : t("notification.customer.add.success");
        },
        error: company
          ? t("notification.companyDetails.update.error")
          : t("notification.customer.add.error"),
      });
    },
    [form, closeDialog, company, onSuccess, t],
  );

  const isCompany = form.watch("is_company");
  const tax_number_text = useMemo(() => {
    return isCompany
      ? t("form.company.tax_number")
      : t("form.company.tax_number_alternative");
  }, [isCompany, t]);

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
              <FormLabel className="flex gap-1">
                {t("form.company.name")} <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <InputGroup>
                  <InputGroupAddon align="inline-start">
                    <IdCard className="h-4 w-4 text-muted-foreground" />
                  </InputGroupAddon>
                  <InputGroupInput
                    placeholder={t("form.company.name")}
                    {...field}
                  />
                </InputGroup>
              </FormControl>
              <FormDescription>
                {t("form.company.name.description")}
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
              <FormLabel>
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
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("form.company.phone")}</FormLabel>
              <FormControl>
                <InputGroup>
                  <InputGroupAddon align="inline-start">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                  </InputGroupAddon>
                  <InputGroupInput
                    placeholder={t("form.company.phone")}
                    {...field}
                  />
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
              <FormLabel className="flex gap-1">
                {t("form.company.email")}
              </FormLabel>
              <FormControl>
                <InputGroup>
                  <InputGroupAddon align="inline-start">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                  </InputGroupAddon>
                  <InputGroupInput
                    placeholder={t("form.company.email")}
                    {...field}
                  />
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
          name="tax_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{tax_number_text}</FormLabel>
              <FormControl>
                <InputGroup>
                  <InputGroupAddon align="inline-start">
                    <Hash className="h-4 w-4 text-muted-foreground" />
                  </InputGroupAddon>
                  <InputGroupInput placeholder={tax_number_text} {...field} />
                </InputGroup>
              </FormControl>
              <FormDescription>
                {t("form.company.tax_number.description", {
                  tax_number_text,
                })}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        {form.watch("is_company") ? (
          <>
            <FormField
              control={form.control}
              name="tax_office"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("form.company.tax_office")}</FormLabel>
                  <FormControl>
                    <InputGroup>
                      <InputGroupAddon align="inline-start">
                        <Landmark className="h-4 w-4 text-muted-foreground" />
                      </InputGroupAddon>
                      <InputGroupInput
                        placeholder={t("form.company.tax_office")}
                        {...field}
                      />
                    </InputGroup>
                  </FormControl>
                  <FormDescription>
                    {t("form.company.tax_office.description")}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="mersis_no"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("form.company.mersis_no")}</FormLabel>
                  <FormControl>
                    <InputGroup>
                      <InputGroupAddon align="inline-start">
                        <Archive className="h-4 w-4 text-muted-foreground" />
                      </InputGroupAddon>
                      <InputGroupInput
                        placeholder={t("form.company.mersis_no")}
                        {...field}
                      />
                    </InputGroup>
                  </FormControl>
                  <FormDescription>
                    {t("form.company.mersis_no.description")}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        ) : null}
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("form.company.address")}</FormLabel>
              <FormControl>
                <InputGroup>
                  <InputGroupAddon align="inline-start">
                    <MapPinHouse className="h-4 w-4 text-muted-foreground" />
                  </InputGroupAddon>
                  <InputGroupInput
                    placeholder={t("form.company.address")}
                    {...field}
                  />
                </InputGroup>
              </FormControl>
              <FormDescription>
                {t("form.company.address.description")}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="col-span-2 flex justify-end gap-2">
          <CancelButton onClick={onCancel} />
          <Button type="submit">
            {company ? t("vars.save") : t("vars.save")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
