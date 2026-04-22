import z from "zod";
import type { TFunction } from "i18next";
import { debtSchema } from "@common";

export const getDebtFormSchema = (t: TFunction<"translation", undefined>) =>
  debtSchema.extend({
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
    due_date: z.date().optional().nullable(),
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

export type DebtFormValues = z.infer<ReturnType<typeof getDebtFormSchema>>;
