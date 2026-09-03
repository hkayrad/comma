import { useEffect, useRef } from "react";
import type { Table } from "@tanstack/react-table";
import { flexRender } from "@tanstack/react-table";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router";
import { cn } from "@/lib/utils";
import {
  Loader2,
  Receipt,
  Calendar,
  CalendarClock,
  CreditCard,
  FileText,
  Phone,
  Landmark,
  Coins,
  Building2,
  User,
  Mail,
  MapPin,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  table: Table<any>;
  contextMenuItems?: (row: any) => React.ReactNode;
  isPortal?: boolean;
  translationPrefix?: "dashboard" | "debt" | "payment";
  type?: "receivable" | "payable";
  hasMore?: boolean;
  onLoadMore?: () => void;
  isLoadingMore?: boolean;
};

export default function CommaMobileCardList({
  table,
  translationPrefix,
  type,
  hasMore,
  onLoadMore,
  isLoadingMore,
}: Props) {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const rows = table.getRowModel().rows;
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasMore || isLoadingMore || !onLoadMore) return;

    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          onLoadMore();
        }
      },
      {
        root: null,
        rootMargin: "300px",
        threshold: 0.1,
      }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, onLoadMore]);

  if (!rows.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground bg-card rounded-2xl border border-dashed p-6">
        <p className="text-sm font-medium">
          {t("table.noData", { defaultValue: "Gösterilecek veri bulunamadı." })}
        </p>
      </div>
    );
  }

  // Determine if context is receivable or payable
  const isReceivable =
    type === "receivable" ||
    (!type && (location.pathname.startsWith("/alacaklar") || location.pathname === "/"));
  const isPayable =
    type === "payable" ||
    (!type && location.pathname.startsWith("/borclar"));

  return (
    <div className="flex flex-col gap-3.5">
      {rows.map((row) => {
        const isSelected = row.getIsSelected();
        const visibleCells = row.getVisibleCells();

        const getCell = (id: string) =>
          visibleCells.find((c) => c.column.id === id);

        // Core identifiers & actions
        const selectCell = getCell("select");
        const actionsCell = getCell("actions");
        const statusCell = getCell("debt_status") || getCell("status");
        const isCompanyCell = getCell("is_company");
        const invoiceNoCell = getCell("invoice_no");

        // Primary and secondary titles
        const primaryTitleCell =
          getCell("name") ||
          getCell("customer") ||
          getCell("customer_name") ||
          getCell("title") ||
          getCell("employee") ||
          visibleCells.find(
            (c) =>
              c.column.id !== "select" &&
              c.column.id !== "actions" &&
              c.column.id !== "#" &&
              c.column.id !== "debt_status" &&
              c.column.id !== "status"
          );

        const secondaryTitleCell = visibleCells.find(
          (c) =>
            (c.column.id === "phone" || c.column.id === "tax_number") &&
            c.column.id !== primaryTitleCell?.column.id
        );

        // Financial cells
        const remainingDebtCell = getCell("remaining_debt");
        const totalDebtCell = getCell("total_debt");
        const totalPaymentsCell = getCell("total_payments");
        const totalCell = getCell("total");
        const totalInTryCell = getCell("total_in_try");
        const amountCell = getCell("amount");
        const amountInTryCell = getCell("amount_in_try");
        const currencyCell = getCell("currency");
        const vatCell = getCell("vat");
        const discountCell = getCell("discount");
        const withholdingCell = getCell("withholding");

        // Date cells
        const dueDateCell = getCell("due_date");
        const issueDateCell = getCell("issue_date");
        const paymentDateCell = getCell("payment_date");
        const lastPaymentDateCell = getCell("last_payment_date");

        // Additional info
        const paymentMethodCell = getCell("payment_method");
        const descriptionCell = getCell("description");
        const phoneCell = getCell("phone");
        const emailCell = getCell("email");
        const taxNumberCell = getCell("tax_number");
        const taxOfficeCell = getCell("tax_office");
        const mersisNoCell = getCell("mersis_no");
        const addressCell = getCell("address");

        // Handled column IDs so we know what else to show in generic details
        const handledIds = new Set([
          "select",
          "actions",
          "#",
          "debt_status",
          "status",
          "is_company",
          "invoice_no",
          "remaining_debt",
          "total_debt",
          "total_payments",
          "total",
          "total_in_try",
          "amount",
          "amount_in_try",
          "currency",
          "exchange_rate",
          "vat",
          "discount",
          "withholding",
          "due_date",
          "issue_date",
          "payment_date",
          "last_payment_date",
          "payment_method",
          "description",
          "phone",
          "email",
          "tax_number",
          "tax_office",
          "mersis_no",
          "address",
          primaryTitleCell?.column.id,
          secondaryTitleCell?.column.id,
        ]);

        const otherCells = visibleCells.filter(
          (c) => !handledIds.has(c.column.id)
        );

        // Counterparty initial letter
        const rawTitle =
          row.original?.name ||
          row.original?.customer_name ||
          row.original?.title ||
          row.original?.customer ||
          row.original?.employee ||
          "";
        const initialLetter =
          typeof rawTitle === "string" && rawTitle.trim()
            ? rawTitle.trim().charAt(0).toUpperCase()
            : "?";

        // Has financial hero?
        const hasFinancialHero = Boolean(
          remainingDebtCell ||
            totalDebtCell ||
            totalPaymentsCell ||
            totalCell ||
            totalInTryCell ||
            amountCell ||
            amountInTryCell
        );

        // Check if description has actual text
        const rawDescription = row.original?.description;
        const hasDescription =
          Boolean(descriptionCell) &&
          typeof rawDescription === "string" &&
          rawDescription.trim() !== "" &&
          rawDescription.trim() !== "-";

        return (
          <div
            key={row.id}
            className={cn(
              "group relative bg-card text-card-foreground border rounded-2xl p-4 shadow-xs transition-all duration-200 flex flex-col gap-3.5",
              isSelected
                ? "border-primary/60 bg-primary/5 ring-1 ring-primary/20"
                : isReceivable
                  ? "border-border/70 border-l-4 border-l-emerald-500/80"
                  : isPayable
                    ? "border-border/70 border-l-4 border-l-rose-500/80"
                    : "border-border"
            )}
          >
            {/* 1. Header: Counterparty, Type Badge, Invoice No & Status Badge */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5 min-w-0 flex-1">
                {selectCell && (
                  <div className="shrink-0 mt-0.5">
                    {flexRender(
                      selectCell.column.columnDef.cell,
                      selectCell.getContext()
                    )}
                  </div>
                )}

                {/* Counterparty Avatar */}
                <div
                  className={cn(
                    "size-9.5 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 select-none shadow-2xs border transition-colors",
                    isReceivable
                      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20"
                      : isPayable
                        ? "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20"
                        : "bg-primary/10 text-primary border-primary/20"
                  )}
                >
                  {row.original?.is_company ? (
                    <Building2 className="size-4.5" />
                  ) : initialLetter !== "?" ? (
                    <span>{initialLetter}</span>
                  ) : (
                    <User className="size-4.5" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  {primaryTitleCell && (
                    <div className="font-bold text-base text-foreground leading-snug break-words line-clamp-2 [&_p]:w-auto [&_p]:max-w-full [&_p]:whitespace-normal [&_p]:break-words">
                      {flexRender(
                        primaryTitleCell.column.columnDef.cell,
                        primaryTitleCell.getContext()
                      )}
                    </div>
                  )}

                  {/* Subtitle Pills (Invoice number, company badge, etc.) */}
                  <div className="flex items-center gap-1.5 flex-wrap mt-1">
                    {invoiceNoCell && (
                      <div className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold bg-muted/80 text-foreground px-2 py-0.5 rounded-md border border-border/50">
                        <Receipt className="size-3 text-muted-foreground" />
                        <span>
                          {flexRender(
                            invoiceNoCell.column.columnDef.cell,
                            invoiceNoCell.getContext()
                          )}
                        </span>
                      </div>
                    )}

                    {isCompanyCell && (
                      <div className="shrink-0">
                        {flexRender(
                          isCompanyCell.column.columnDef.cell,
                          isCompanyCell.getContext()
                        )}
                      </div>
                    )}

                    {secondaryTitleCell && (
                      <span className="text-xs text-muted-foreground font-mono">
                        {flexRender(
                          secondaryTitleCell.column.columnDef.cell,
                          secondaryTitleCell.getContext()
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              {statusCell && (
                <div className="shrink-0 self-start mt-0.5">
                  {flexRender(
                    statusCell.column.columnDef.cell,
                    statusCell.getContext()
                  )}
                </div>
              )}
            </div>

            {/* 2. THE FINANCIAL HERO BLOCK (MAKING IMPORTANT INFORMATION POP) */}
            {hasFinancialHero && (
              <div
                className={cn(
                  "rounded-xl p-3.5 border transition-colors flex flex-col gap-2.5",
                  isReceivable
                    ? "bg-emerald-500/5 dark:bg-emerald-950/20 border-emerald-500/20"
                    : isPayable
                      ? "bg-rose-500/5 dark:bg-rose-950/20 border-rose-500/20"
                      : "bg-muted/40 border-border/60"
                )}
              >
                {/* Case A: Customer Summary on Dashboard */}
                {remainingDebtCell && (totalDebtCell || totalPaymentsCell) ? (
                  <>
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <Coins className="size-3.5" />
                        {isReceivable
                          ? t("dashboard.table.column.remaining_debt", {
                              defaultValue: "Kalan Alacak",
                            })
                          : isPayable
                            ? t("dashboard.table.column.remaining_debt", {
                                defaultValue: "Kalan Borç",
                              })
                            : t("dashboard.table.column.remaining_debt", {
                                defaultValue: "Kalan Bakiye",
                              })}
                      </span>
                      <div
                        className={cn(
                          "text-xl sm:text-2xl font-black tracking-tight",
                          isReceivable
                            ? "text-emerald-600 dark:text-emerald-400"
                            : isPayable
                              ? "text-rose-600 dark:text-rose-400"
                              : "text-foreground"
                        )}
                      >
                        {flexRender(
                          remainingDebtCell.column.columnDef.cell,
                          remainingDebtCell.getContext()
                        )}
                      </div>
                    </div>

                    {/* Comparison split bar */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/40 text-xs">
                      {totalDebtCell && (
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground/80">
                            {isReceivable
                              ? t("vars.receivables", {
                                  defaultValue: "Toplam Alacak",
                                })
                              : t("vars.payables", {
                                  defaultValue: "Toplam Borç",
                                })}
                          </span>
                          <div className="font-semibold text-foreground text-sm">
                            {flexRender(
                              totalDebtCell.column.columnDef.cell,
                              totalDebtCell.getContext()
                            )}
                          </div>
                        </div>
                      )}
                      {totalPaymentsCell && (
                        <div className="flex flex-col text-right">
                          <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground/80">
                            {isReceivable
                              ? t("dashboard.table.column.total_payments", {
                                  defaultValue: "Tahsil Edilen",
                                })
                              : t("dashboard.table.column.total_payments", {
                                  defaultValue: "Ödenen",
                                })}
                          </span>
                          <div className="font-semibold text-emerald-600 dark:text-emerald-400 text-sm">
                            {flexRender(
                              totalPaymentsCell.column.columnDef.cell,
                              totalPaymentsCell.getContext()
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                ) : /* Case B: Debt / Invoice or Payment (Total or Amount) */
                totalCell || totalInTryCell || amountCell || amountInTryCell ? (
                  <>
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <Coins className="size-3.5" />
                        {translationPrefix === "payment"
                          ? t("payment.table.column.amount", {
                              defaultValue: "Ödeme Tutarı",
                            })
                          : t("debt.table.column.total", {
                              defaultValue: "Fatura Tutarı",
                            })}
                      </span>
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            "text-xl sm:text-2xl font-black tracking-tight",
                            translationPrefix === "payment"
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-foreground"
                          )}
                        >
                          {totalCell
                            ? flexRender(
                                totalCell.column.columnDef.cell,
                                totalCell.getContext()
                              )
                            : totalInTryCell
                              ? flexRender(
                                  totalInTryCell.column.columnDef.cell,
                                  totalInTryCell.getContext()
                                )
                              : amountCell
                                ? flexRender(
                                    amountCell.column.columnDef.cell,
                                    amountCell.getContext()
                                  )
                                : amountInTryCell
                                  ? flexRender(
                                      amountInTryCell.column.columnDef.cell,
                                      amountInTryCell.getContext()
                                    )
                                  : null}
                        </div>
                        {currencyCell && (
                          <div className="shrink-0">
                            {flexRender(
                              currencyCell.column.columnDef.cell,
                              currencyCell.getContext()
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Sub-row: Total in TRY (if different) or Kalan Bakiye */}
                    {(totalInTryCell && totalCell && totalCell.id !== totalInTryCell.id) ||
                    remainingDebtCell ? (
                      <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs flex-wrap gap-2">
                        {totalInTryCell && totalCell && (
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <span className="text-[10px] uppercase font-semibold">
                              {t("debt.table.column.total_in_try", {
                                defaultValue: "TL Karşılığı:",
                              })}
                            </span>
                            <span className="font-semibold text-foreground">
                              {flexRender(
                                totalInTryCell.column.columnDef.cell,
                                totalInTryCell.getContext()
                              )}
                            </span>
                          </div>
                        )}
                        {remainingDebtCell && (
                          <div className="flex items-center gap-1.5 ml-auto">
                            <span className="text-[10px] uppercase font-semibold text-muted-foreground">
                              {t("dashboard.table.column.remaining_debt", {
                                defaultValue: "Kalan:",
                              })}
                            </span>
                            <span className="font-bold text-foreground">
                              {flexRender(
                                remainingDebtCell.column.columnDef.cell,
                                remainingDebtCell.getContext()
                              )}
                            </span>
                          </div>
                        )}
                      </div>
                    ) : null}

                    {/* Breakdown: KDV, İskonto, Tevkifat if present */}
                    {(vatCell || discountCell || withholdingCell) && (
                      <div className="flex items-center gap-3 pt-1 text-[11px] text-muted-foreground font-mono flex-wrap">
                        {vatCell && (
                          <span>
                            KDV:{" "}
                            <strong className="text-foreground">
                              {flexRender(
                                vatCell.column.columnDef.cell,
                                vatCell.getContext()
                              )}
                            </strong>
                          </span>
                        )}
                        {discountCell && (
                          <span>
                            İskonto:{" "}
                            <strong className="text-foreground">
                              {flexRender(
                                discountCell.column.columnDef.cell,
                                discountCell.getContext()
                              )}
                            </strong>
                          </span>
                        )}
                        {withholdingCell && (
                          <span>
                            Tevkifat:{" "}
                            <strong className="text-foreground">
                              {flexRender(
                                withholdingCell.column.columnDef.cell,
                                withholdingCell.getContext()
                              )}
                            </strong>
                          </span>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  /* Case C: Just remaining debt alone */
                  remainingDebtCell && (
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <Coins className="size-3.5" />
                        {isReceivable
                          ? t("dashboard.table.column.remaining_debt", {
                              defaultValue: "Kalan Alacak",
                            })
                          : isPayable
                            ? t("dashboard.table.column.remaining_debt", {
                                defaultValue: "Kalan Borç",
                              })
                            : t("dashboard.table.column.remaining_debt", {
                                defaultValue: "Kalan Bakiye",
                              })}
                      </span>
                      <div
                        className={cn(
                          "text-xl sm:text-2xl font-black tracking-tight",
                          isReceivable
                            ? "text-emerald-600 dark:text-emerald-400"
                            : isPayable
                              ? "text-rose-600 dark:text-rose-400"
                              : "text-foreground"
                        )}
                      >
                        {flexRender(
                          remainingDebtCell.column.columnDef.cell,
                          remainingDebtCell.getContext()
                        )}
                      </div>
                    </div>
                  )
                )}
              </div>
            )}

            {/* 3. KEY DATES & TIMELINE (VADE, DÜZENLEME, ÖDEME) */}
            {(dueDateCell || issueDateCell || paymentDateCell || lastPaymentDateCell || paymentMethodCell) && (
              <div className="flex flex-col gap-2">
                {/* Due Date Callout (Vade Tarihi) - High Priority! */}
                {dueDateCell && (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40 border border-border/50 text-xs">
                    <div className="flex items-center gap-1.5 text-muted-foreground font-medium">
                      <CalendarClock className="size-3.5 text-primary" />
                      <span className="text-[11px] font-bold uppercase tracking-wider">
                        {t("debt.table.column.due_date", { defaultValue: "Vade Tarihi" })}
                      </span>
                    </div>
                    <div className="font-semibold text-foreground">
                      {flexRender(
                        dueDateCell.column.columnDef.cell,
                        dueDateCell.getContext()
                      )}
                    </div>
                  </div>
                )}

                {/* Secondary Dates & Payment Method Row */}
                {(issueDateCell || paymentDateCell || lastPaymentDateCell || paymentMethodCell) && (
                  <div className="flex items-center gap-2 flex-wrap text-xs">
                    {issueDateCell && (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/30 border border-border/40 text-muted-foreground">
                        <Calendar className="size-3 text-muted-foreground/70" />
                        <span className="text-[10px] uppercase font-semibold">
                          {t("debt.table.column.issue_date", { defaultValue: "Düzenleme:" })}
                        </span>
                        <div className="text-foreground font-medium">
                          {flexRender(
                            issueDateCell.column.columnDef.cell,
                            issueDateCell.getContext()
                          )}
                        </div>
                      </div>
                    )}

                    {paymentDateCell && (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/30 border border-border/40 text-muted-foreground">
                        <Calendar className="size-3 text-muted-foreground/70" />
                        <span className="text-[10px] uppercase font-semibold">
                          {t("payment.table.column.payment_date", { defaultValue: "Ödeme:" })}
                        </span>
                        <div className="text-foreground font-medium">
                          {flexRender(
                            paymentDateCell.column.columnDef.cell,
                            paymentDateCell.getContext()
                          )}
                        </div>
                      </div>
                    )}

                    {lastPaymentDateCell && (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/30 border border-border/40 text-muted-foreground">
                        <Clock className="size-3 text-muted-foreground/70" />
                        <span className="text-[10px] uppercase font-semibold">
                          {t("debt.table.column.last_payment_date", { defaultValue: "Son Ödeme:" })}
                        </span>
                        <div className="text-foreground font-medium">
                          {flexRender(
                            lastPaymentDateCell.column.columnDef.cell,
                            lastPaymentDateCell.getContext()
                          )}
                        </div>
                      </div>
                    )}

                    {paymentMethodCell && (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/30 border border-border/40 text-muted-foreground">
                        <CreditCard className="size-3 text-muted-foreground/70" />
                        <div className="text-foreground font-medium">
                          {flexRender(
                            paymentMethodCell.column.columnDef.cell,
                            paymentMethodCell.getContext()
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 4. NOTE / DESCRIPTION BOX */}
            {hasDescription && (
              <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/25 px-3 py-2 rounded-xl border border-border/40">
                <FileText className="size-3.5 shrink-0 mt-0.5 text-muted-foreground/60" />
                <span className="italic line-clamp-2">
                  {flexRender(
                    descriptionCell!.column.columnDef.cell,
                    descriptionCell!.getContext()
                  )}
                </span>
              </div>
            )}

            {/* 5. CONTACT & TAX INFORMATION CHIPS */}
            {(phoneCell || emailCell || taxNumberCell || taxOfficeCell || mersisNoCell || addressCell) && (
              <div className="flex items-center gap-1.5 flex-wrap text-xs text-muted-foreground pt-0.5">
                {phoneCell && (
                  <div className="inline-flex items-center gap-1 bg-muted/30 px-2 py-0.5 rounded-md border border-border/30">
                    <Phone className="size-3 text-muted-foreground/70" />
                    <span>
                      {flexRender(
                        phoneCell.column.columnDef.cell,
                        phoneCell.getContext()
                      )}
                    </span>
                  </div>
                )}

                {emailCell && (
                  <div className="inline-flex items-center gap-1 bg-muted/30 px-2 py-0.5 rounded-md border border-border/30">
                    <Mail className="size-3 text-muted-foreground/70" />
                    <span>
                      {flexRender(
                        emailCell.column.columnDef.cell,
                        emailCell.getContext()
                      )}
                    </span>
                  </div>
                )}

                {taxNumberCell && (
                  <div className="inline-flex items-center gap-1 bg-muted/30 px-2 py-0.5 rounded-md border border-border/30 font-mono text-[11px]">
                    <Landmark className="size-3 text-muted-foreground/70" />
                    <span>
                      VN:{" "}
                      {flexRender(
                        taxNumberCell.column.columnDef.cell,
                        taxNumberCell.getContext()
                      )}
                    </span>
                    {taxOfficeCell && (
                      <span className="text-muted-foreground/70">
                        (
                        {flexRender(
                          taxOfficeCell.column.columnDef.cell,
                          taxOfficeCell.getContext()
                        )}
                        )
                      </span>
                    )}
                  </div>
                )}

                {addressCell && (
                  <div className="inline-flex items-center gap-1 bg-muted/30 px-2 py-0.5 rounded-md border border-border/30 text-[11px] truncate max-w-full">
                    <MapPin className="size-3 text-muted-foreground/70 shrink-0" />
                    <span className="truncate">
                      {flexRender(
                        addressCell.column.columnDef.cell,
                        addressCell.getContext()
                      )}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* 6. OTHER UNHANDLED CELLS (For general tables like employees, etc.) */}
            {otherCells.length > 0 && (
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-1 text-xs border-t border-border/30">
                {otherCells.map((cell) => {
                  const header = cell.column.columnDef.header;
                  let headerText = "";

                  if (typeof header === "string" && header.trim()) {
                    headerText = header;
                  } else if (typeof header === "function") {
                    try {
                      const rendered = header({
                        column: cell.column,
                        header: { column: cell.column } as any,
                        table,
                      } as any);
                      if (rendered && typeof rendered === "object") {
                        if ("props" in rendered && rendered.props?.title) {
                          headerText = rendered.props.title;
                        } else if (typeof rendered.props?.children === "string") {
                          headerText = rendered.props.children;
                        }
                      }
                    } catch {
                      // ignore
                    }
                  }

                  if (!headerText) {
                    const columnId = cell.column.id;
                    const prefixes = [translationPrefix, "debt", "payment", "dashboard"].filter(Boolean);
                    for (const prefix of prefixes) {
                      const key = `${prefix}.table.column.${columnId}`;
                      if (i18n.exists(key)) {
                        headerText = t(key as any);
                        break;
                      }
                    }

                    if (!headerText) {
                      headerText = columnId.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
                    }
                  }

                  return (
                    <div key={cell.id} className="flex flex-col gap-0.5 min-w-0">
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold truncate">
                        {headerText}
                      </span>
                      <div className="font-medium text-foreground truncate text-xs sm:text-sm">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* 7. DEDICATED BOTTOM ACTIONS BAR */}
            {actionsCell && (
              <div className="flex items-center justify-end pt-2.5 border-t border-border/40 w-full">
                {flexRender(
                  actionsCell.column.columnDef.cell,
                  actionsCell.getContext()
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Infinite Scroll Sentinel & Loader */}
      {hasMore && (
        <div
          ref={sentinelRef}
          className="flex flex-col items-center justify-center py-6 gap-2 text-sm text-muted-foreground"
        >
          {isLoadingMore ? (
            <div className="flex items-center gap-2 text-primary font-medium">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="text-xs">
                {t("table.loadingMore", { defaultValue: "Daha fazla yükleniyor..." })}
              </span>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={onLoadMore}
              className="text-xs h-8 px-4 rounded-full text-muted-foreground hover:text-foreground"
            >
              {t("table.loadMore", { defaultValue: "Daha Fazla Göster" })}
            </Button>
          )}
        </div>
      )}

      {!hasMore && rows.length > 0 && (
        <div className="flex items-center justify-center py-4 text-xs text-muted-foreground/60 select-none">
          <span>
            {t("table.allLoaded", {
              count: rows.length,
              defaultValue: `Tüm kayıtlar gösteriliyor (${rows.length})`,
            })}
          </span>
        </div>
      )}
    </div>
  );
}
