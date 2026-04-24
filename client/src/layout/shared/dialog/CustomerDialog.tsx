import {
  Radio,
  RadioGroup,
} from "@/components/animate-ui/components/base/radio";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
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
import { PayableCustomerApi, ReceivableCustomerApi } from "@/lib/api/customer";
import type { CustomerDto, OverviewViewType } from "@comma/common";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Archive,
  ChevronLeft,
  ChevronRight,
  Hash,
  IdCard,
  Landmark,
  Mail,
  MapPinHouse,
  Phone,
  Plus,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import z from "zod";
import CancelButton from "@/layout/shared/CancelButton";
import { useFormDraft } from "@/hooks/use-form-draft";
import { useQueryClient } from "@tanstack/react-query";

import { customerSchema } from "@common";

type Props = {
  customer?: CustomerDto;
  type?: OverviewViewType;
  onSuccess?: () => void;
};

export default function CustomerDialog(props: Props) {
  const { customer, type = "receivable", onSuccess } = props;
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const isPersisted = useRef(false);

  const API = type === "payable" ? PayableCustomerApi : ReceivableCustomerApi;

  const closeDialog = useDialog((s) => s.closeDialog);

  const SingleCustomerSchema = useMemo(
    () =>
      customerSchema.extend({
        name: z
          .string({
            error: t("form.customer.name.validation.invalid"),
          })
          .min(
            2,
            t("form.customer.name.validation.min", {
              charCount: 2,
            }),
          )
          .max(
            255,
            t("form.customer.name.validation.max", {
              charCount: 255,
            }),
          ),
        phone: z
          .string({
            error: t("form.customer.phone.validation.invalid"),
          })
          .min(
            5,
            t("form.customer.phone.validation.min", {
              charCount: 5,
            }),
          )
          .max(
            20,
            t("form.customer.phone.validation.max", {
              charCount: 20,
            }),
          )
          .optional()
          .or(z.literal("")),
        email: z
          .email({
            error: t("form.customer.email.validation.invalid"),
          })
          .min(
            5,
            t("form.customer.email.validation.min", {
              charCount: 5,
            }),
          )
          .max(
            255,
            t("form.customer.email.validation.max", {
              charCount: 255,
            }),
          )
          .optional()
          .or(z.literal("")),
        tax_number: z
          .string({
            error: t("form.customer.tax_number.validation.invalid"),
          })
          .min(
            5,
            t("form.customer.tax_number.validation.min", {
              charCount: 5,
            }),
          )
          .max(
            11,
            t("form.customer.tax_number.validation.max", {
              charCount: 11,
            }),
          )
          .optional()
          .or(z.literal("")),
        tax_office: z
          .string({
            error: t("form.customer.tax_office.validation.invalid"),
          })
          .min(
            2,
            t("form.customer.tax_office.validation.min", {
              charCount: 2,
            }),
          )
          .max(
            100,
            t("form.customer.tax_office.validation.max", {
              charCount: 100,
            }),
          )
          .optional()
          .or(z.literal("")),
        mersis_no: z
          .string({
            error: t("form.customer.mersis_no.validation.invalid"),
          })
          .min(
            16,
            t("form.customer.mersis_no.validation.min", {
              charCount: 16,
            }),
          )
          .max(
            16,
            t("form.customer.mersis_no.validation.max", {
              charCount: 16,
            }),
          )
          .optional()
          .or(z.literal("")),
        address: z
          .string({
            error: t("form.customer.address.validation.invalid"),
          })
          .min(
            5,
            t("form.customer.address.validation.min", {
              charCount: 5,
            }),
          )
          .max(
            500,
            t("form.customer.address.validation.max", {
              charCount: 500,
            }),
          )
          .optional()
          .or(z.literal("")),
        is_company: z.boolean(),
      }),
    [t],
  );

  const CustomerFormSchema = useMemo(
    () =>
      z.object({
        entries: z.array(SingleCustomerSchema),
      }),
    [SingleCustomerSchema],
  );

  const form = useForm<z.infer<typeof CustomerFormSchema>>({
    resolver: zodResolver(CustomerFormSchema),
    defaultValues: {
      entries: [
        {
          name: customer?.name || "",
          phone: customer?.phone || "",
          email: customer?.email || "",
          tax_number: customer?.tax_number || "",
          tax_office: customer?.tax_office || "",
          mersis_no: customer?.mersis_no || undefined,
          address: customer?.address || "",
          is_company: customer ? Number(customer.is_company) === 1 : true,
        },
      ],
    },
  });

  const { saveDraft, clearDraft } = useFormDraft(
    `draft_customer_${type}`,
    form,
    !customer
  );

  const handleSaveDraft = useCallback(() => {
    saveDraft();
    isPersisted.current = true;
    closeDialog();
  }, [saveDraft, closeDialog]);

  useEffect(() => {
    return () => {
      if (!isPersisted.current && !customer) {
        clearDraft();
      }
    };
  }, [clearDraft, customer]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "entries",
  });

  const onCancel = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      isPersisted.current = false;
      clearDraft();
      form.reset();
      closeDialog();
    },
    [form, clearDraft, closeDialog],
  );

  const onSubmit = useCallback(
    (data: z.infer<typeof CustomerFormSchema>) => {
      let promise: Promise<any>;

      if (customer) promise = API.Update(customer.id!, data.entries[0]);
      else promise = API.CreateBatch(data.entries);

      toast.promise(promise, {
        loading: customer
          ? t("notification.customer.update.pending")
          : t("notification.customer.add.pending"),
        success: () => {
          isPersisted.current = true;
          form.reset();
          clearDraft();
          closeDialog();
          queryClient.invalidateQueries({ queryKey: ["totals"] });
          queryClient.invalidateQueries({ queryKey: ["customers"] });
          if (onSuccess) onSuccess();
          return customer
            ? t("notification.customer.update.success")
            : t("notification.customer.add.success");
        },
        error: customer
          ? t("notification.customer.update.error")
          : t("notification.customer.add.error"),
      });
    },
    [form, clearDraft, closeDialog, API, customer, onSuccess, t, queryClient],
  );

  const addEntry = useCallback(() => {
    append({
      name: "",
      phone: "",
      email: "",
      tax_number: "",
      tax_office: "",
      mersis_no: undefined,
      address: "",
      is_company: true,
    });
    setCurrentPageIndex(fields.length);
  }, [append, fields.length]);

  const onInvalid = useCallback(
    (errors: any) => {
      if (errors.entries) {
        const errorIndices = errors.entries
          .map((entry: any, index: number) => (entry ? index + 1 : null))
          .filter((index: number | null) => index !== null);

        if (errorIndices.length > 0) {
          toast.error(
            t("notification.validation.error_on_pages", {
              pages: errorIndices.join(", "),
            }),
          );
        }
      }
    },
    [t],
  );

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, onInvalid)}
        className="flex flex-col gap-4"
      >
        {!customer && (
          <div className="flex items-center justify-between bg-muted/50 p-2 rounded-lg mb-2">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={currentPageIndex === 0}
                onClick={() => setCurrentPageIndex(prev => prev - 1)}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                {t("dialog.pagination.previous")}
              </Button>
              <span className="text-sm font-medium">
                {currentPageIndex + 1} / {fields.length}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={currentPageIndex === fields.length - 1}
                onClick={() => setCurrentPageIndex(prev => prev + 1)}
              >
                {t("dialog.pagination.next")}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>            </div>
            <div className="flex items-center gap-2">
              {fields.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => {
                    remove(currentPageIndex);
                    if (currentPageIndex >= fields.length - 1) {
                      setCurrentPageIndex(Math.max(0, fields.length - 2));
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t("dialog.customer.remove")}
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addEntry}
              >
                <Plus className="h-4 w-4 mr-2" />
                {t("dialog.customer.add_more")}
              </Button>
            </div>
          </div>
        )}

        <div className="min-h-fit">
          {fields.map((field, index) => index === currentPageIndex && (
            <div key={field.id} className="grid grid-cols-2 gap-6 border-t pt-4 animate-in fade-in slide-in-from-right-2 duration-200">
              <FormField
                control={form.control}
                name={`entries.${index}.name`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex gap-1">
                      {t("form.customer.name")}{" "}
                      <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <InputGroup>
                        <InputGroupInput
                          type="text"
                          placeholder="ABC Ltd. Şti."
                          {...field}
                        />
                        <InputGroupAddon>
                          <IdCard />
                        </InputGroupAddon>
                      </InputGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`entries.${index}.is_company`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex gap-1">
                      {t("form.customer.is_company")}{" "}
                      <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <RadioGroup
                        className="flex gap-8"
                        value={String(field.value)}
                        onValueChange={(value) => field.onChange(value === "true")}
                      >
                        <div className="flex gap-2 items-center">
                          <Radio value="true" id={`company-${index}`} />
                          <label
                            htmlFor={`company-${index}`}
                            className="cursor-pointer select-none"
                          >
                            {t("vars.is_company.true")}
                          </label>
                        </div>
                        <div className="flex gap-2 items-center">
                          <Radio value="false" id={`individual-${index}`} />
                          <label
                            htmlFor={`individual-${index}`}
                            className="cursor-pointer select-none"
                          >
                            {t("vars.is_company.false")}
                          </label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {(() => {
                const isCompany = form.watch(`entries.${index}.is_company`);
                return isCompany && (
                  <FormField
                    control={form.control}
                    name={`entries.${index}.tax_office`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("form.customer.tax_office")}</FormLabel>
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                );
              })()}
              <FormField
                control={form.control}
                name={`entries.${index}.tax_number`}
                render={({ field }) => {
                  const isCompany = form.watch(`entries.${index}.is_company`);
                  return (
                    <FormItem>
                      <FormLabel>
                        {isCompany
                          ? t("vars.tax_number")
                          : t("vars.tckn")}
                      </FormLabel>
                      <FormControl>
                        <InputGroup>
                          <InputGroupInput
                            type="text"
                            placeholder={
                              isCompany ? "1234567890" : "12345678901"
                            }
                            {...field}
                          />
                          <InputGroupAddon>
                            <Hash />
                          </InputGroupAddon>
                        </InputGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
              {(() => {
                const isCompany = form.watch(`entries.${index}.is_company`);
                return isCompany && (
                  <FormField
                    control={form.control}
                    name={`entries.${index}.mersis_no`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("form.customer.mersis_no")}</FormLabel>
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                );
              })()}
              <FormField
                control={form.control}
                name={`entries.${index}.phone`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("form.customer.phone")}</FormLabel>
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
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`entries.${index}.email`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("form.customer.email")}</FormLabel>
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
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`entries.${index}.address`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("form.customer.address")}</FormLabel>
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
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <CancelButton onClick={onCancel} />
          {!customer && (
            <Button type="button" variant="secondary" onClick={handleSaveDraft}>
              {t("dialog.customer.save_as_draft")}
            </Button>
          )}
          <Button type="submit">
            {customer ? t("dialog.customer.update") : t("dialog.customer.add")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
