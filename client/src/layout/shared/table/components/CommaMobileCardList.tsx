import { useEffect, useRef } from "react";
import type { Table } from "@tanstack/react-table";
import { flexRender } from "@tanstack/react-table";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
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
  hasMore,
  onLoadMore,
  isLoadingMore,
}: Props) {
  const { t, i18n } = useTranslation();
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
      <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground bg-card rounded-xl border border-dashed p-6">
        <p className="text-sm font-medium">{t("table.noData", { defaultValue: "Gösterilecek veri bulunamadı." })}</p>
      </div>
    );
  }

  const getHeaderText = (cell: any): string => {
    if (!cell) return "";
    const header = cell.column.columnDef.header;
    if (typeof header === "string" && header.trim()) {
      return header;
    }
    if (typeof header === "function") {
      try {
        const rendered = header({
          column: cell.column,
          header: { column: cell.column } as any,
          table,
        } as any);
        if (rendered && typeof rendered === "object") {
          if ("props" in rendered && rendered.props?.title) {
            return rendered.props.title;
          }
          if (typeof rendered.props?.children === "string") {
            return rendered.props.children;
          }
        }
      } catch {
        // ignore
      }
    }

    const columnId = cell.column.id;
    const prefixes = [translationPrefix, "debt", "payment", "dashboard"].filter(Boolean);
    for (const prefix of prefixes) {
      const key = `${prefix}.table.column.${columnId}`;
      if (i18n.exists(key)) {
        return t(key as any);
      }
    }

    const commonLabels: Record<string, string> = {
      amount: t("debt.table.column.amount", { defaultValue: "Net Tutar" }),
      amount_in_try: t("payment.table.column.amount_in_try", { defaultValue: "Toplam (TL)" }),
      total: t("debt.table.column.total", { defaultValue: "Toplam Tutar" }),
      total_in_try: t("debt.table.column.total_in_try", { defaultValue: "Toplam (TL)" }),
      vat: t("debt.table.column.vat", { defaultValue: "KDV" }),
      discount: t("debt.table.column.discount", { defaultValue: "İskonto" }),
      withholding: t("debt.table.column.withholding", { defaultValue: "Tevkifat" }),
      currency: t("debt.table.column.currency", { defaultValue: "Para Birimi" }),
      exchange_rate: t("debt.table.column.exchange_rate", { defaultValue: "Döviz Kuru" }),
      issue_date: t("debt.table.column.issue_date", { defaultValue: "Düzenleme Tarihi" }),
      due_date: t("debt.table.column.due_date", { defaultValue: "Vade Tarihi" }),
      last_payment_date: t("debt.table.column.last_payment_date", { defaultValue: "Son Ödeme Tarihi" }),
      payment_date: t("payment.table.column.payment_date", { defaultValue: "Ödeme Tarihi" }),
      payment_method: t("payment.table.column.payment_method", { defaultValue: "Ödeme Yöntemi" }),
      description: t("debt.table.column.description", { defaultValue: "Açıklama" }),
      invoice_no: t("debt.table.column.invoice_no", { defaultValue: "Fatura No" }),
      customer_name: t("debt.table.column.customer_name", { defaultValue: "Müşteri / Firma" }),
      tax_number: t("dashboard.table.column.tax_number", { defaultValue: "Vergi No" }),
      tax_office: t("dashboard.table.column.tax_office", { defaultValue: "Vergi Dairesi" }),
      remaining_debt: t("dashboard.table.column.remaining_debt", { defaultValue: "Kalan Bakiye" }),
      total_debt: t("dashboard.table.column.total_debt", { defaultValue: "Toplam Borç" }),
      total_payments: t("dashboard.table.column.total_payments", { defaultValue: "Ödenmiş" }),
      address: t("dashboard.table.column.address", { defaultValue: "Adres" }),
      phone: t("dashboard.table.column.phone", { defaultValue: "Telefon" }),
      email: t("dashboard.table.column.email", { defaultValue: "E-posta" }),
      is_company: t("dashboard.table.column.is_company", { defaultValue: "Tür" }),
      debt_status: t("dashboard.table.column.debt_status", { defaultValue: "Durum" }),
      status: t("table.column.status", { defaultValue: "Durum" }),
    };

    return commonLabels[columnId] || columnId.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase());
  };

  return (
    <div className="flex flex-col gap-3">
      {rows.map((row) => {
        const isSelected = row.getIsSelected();
        const visibleCells = row.getVisibleCells();

        // Separate special cells
        const actionsCell = visibleCells.find((c) => c.column.id === "actions");
        const statusCell = visibleCells.find(
          (c) => c.column.id === "debt_status" || c.column.id === "status"
        );
        const isCompanyCell = visibleCells.find((c) => c.column.id === "is_company");

        // Identify primary title cell (Company or Customer name)
        const primaryTitleCell = visibleCells.find(
          (c) =>
            c.column.id === "name" ||
            c.column.id === "customer" ||
            c.column.id === "customer_name" ||
            c.column.id === "title" ||
            c.column.id === "employee"
        ) || visibleCells.find(
          (c) =>
            c.column.id !== "select" &&
            c.column.id !== "actions" &&
            c.column.id !== "#" &&
            c.column.id !== "debt_status" &&
            c.column.id !== "status"
        );

        // Identify secondary subtitle cell (e.g. invoice_no, phone, tax_number)
        const secondaryTitleCell = visibleCells.find(
          (c) =>
            (c.column.id === "invoice_no" ||
              c.column.id === "phone" ||
              c.column.id === "tax_number") &&
            c.column.id !== primaryTitleCell?.column.id
        );

        // Check row currency
        const rowCurrency =
          row.getValue("currency") ||
          row.original?.currency ||
          "TRY";
        const isTRY =
          rowCurrency === "TRY" ||
          rowCurrency === "TL" ||
          rowCurrency === "₺";

        // Primary Amount Cell (Priority: total > remaining_debt > amount)
        const primaryAmountCell =
          visibleCells.find((c) => c.column.id === "total") ||
          visibleCells.find((c) => c.column.id === "remaining_debt") ||
          visibleCells.find((c) => c.column.id === "amount");

        // Amount Cell (explicit amount / tutar)
        const amountCell = visibleCells.find((c) => c.column.id === "amount");

        // Secondary Amount Cell (Never use converted amount_in_try if already in TRY)
        const secondaryAmountCell = visibleCells.find(
          (c) =>
            c.column.id !== primaryAmountCell?.column.id &&
            c.column.id !== amountCell?.column.id &&
            (c.column.id === "remaining_debt" ||
              c.column.id === "total_debt" ||
              (!isTRY && c.column.id === "amount_in_try"))
        );

        // Total in TRY (Only show converted value if original currency is foreign, never for TL)
        const totalInTryCell = !isTRY
          ? visibleCells.find(
              (c) =>
                c.column.id === "total_in_try" &&
                c.column.id !== primaryAmountCell?.column.id &&
                c.column.id !== secondaryAmountCell?.column.id
            )
          : null;

        // Date cells
        const dueDateCell = visibleCells.find((c) => c.column.id === "due_date");
        const issueDateCell = visibleCells.find((c) => c.column.id === "issue_date");
        const lastPaymentDateCell = visibleCells.find(
          (c) => c.column.id === "last_payment_date"
        );
        const paymentDateCell = visibleCells.find(
          (c) => c.column.id === "payment_date"
        );

        // Description cell
        const descriptionCell = visibleCells.find(
          (c) => c.column.id === "description"
        );
        const descRaw = descriptionCell ? row.getValue("description") : null;
        const hasDescription =
          typeof descRaw === "string" && descRaw.trim() !== "" && descRaw !== "-";

        // Financial Breakdown cells (Amount, VAT, Discount, Withholding, Currency, Exchange Rate)
        const breakdownIds = ["amount", "vat", "discount", "withholding", "exchange_rate"];
        const breakdownCells = visibleCells.filter(
          (c) =>
            breakdownIds.includes(c.column.id) &&
            c.column.id !== primaryAmountCell?.column.id
        );

        // Other detail cells not explicitly placed
        const handledIds = new Set([
          "select",
          "actions",
          "#",
          "debt_status",
          "status",
          "is_company",
          "total_in_try",
          "amount_in_try",
          primaryTitleCell?.column.id,
          secondaryTitleCell?.column.id,
          primaryAmountCell?.column.id,
          secondaryAmountCell?.column.id,
          dueDateCell?.column.id,
          issueDateCell?.column.id,
          lastPaymentDateCell?.column.id,
          paymentDateCell?.column.id,
          descriptionCell?.column.id,
          ...breakdownCells.map((c) => c.column.id),
        ]);

        const otherDetailCells = visibleCells.filter(
          (c) => !handledIds.has(c.column.id)
        );

        return (
          <div
            key={row.id}
            className={cn(
              "bg-card text-card-foreground border rounded-xl p-3.5 shadow-xs flex flex-col gap-3 transition-colors",
              isSelected ? "border-primary/50 bg-primary/5 shadow-sm" : "border-border/70"
            )}
          >
            {/* Top row: Entity Title + Subtitle Badge + Status Badge */}
            <div className="flex items-start justify-between gap-2.5">
              <div className="min-w-0 flex-1">
                {primaryTitleCell && (
                  <div className="font-bold text-base text-foreground leading-snug break-words">
                    {flexRender(
                      primaryTitleCell.column.columnDef.cell,
                      primaryTitleCell.getContext()
                    )}
                  </div>
                )}
                <div className="flex items-center gap-1.5 flex-wrap mt-1">
                  {secondaryTitleCell && (
                    <span className="text-xs font-mono font-medium text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded border border-border/40">
                      {flexRender(
                        secondaryTitleCell.column.columnDef.cell,
                        secondaryTitleCell.getContext()
                      )}
                    </span>
                  )}
                  {isCompanyCell && (
                    <div className="shrink-0">
                      {flexRender(
                        isCompanyCell.column.columnDef.cell,
                        isCompanyCell.getContext()
                      )}
                    </div>
                  )}
                </div>
              </div>

              {statusCell && (
                <div className="shrink-0 self-start mt-0.5">
                  {flexRender(
                    statusCell.column.columnDef.cell,
                    statusCell.getContext()
                  )}
                </div>
              )}
            </div>

            {/* Financial Hero Block: Makes Important Amounts & Urgency Pop! */}
            {primaryAmountCell && (
              <div className="rounded-xl bg-muted/40 dark:bg-muted/20 border border-border/60 p-3 flex flex-col gap-1.5">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground truncate">
                    {getHeaderText(primaryAmountCell)}
                  </span>
                  {dueDateCell ? (
                    <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground text-right shrink-0">
                      {getHeaderText(dueDateCell)}
                    </span>
                  ) : secondaryAmountCell ? (
                    <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground text-right shrink-0 truncate">
                      {getHeaderText(secondaryAmountCell)}
                    </span>
                  ) : paymentDateCell ? (
                    <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground text-right shrink-0">
                      {getHeaderText(paymentDateCell)}
                    </span>
                  ) : null}
                </div>

                <div className="flex items-center justify-between gap-3">
                  {/* Big Bold Primary Amount */}
                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="text-xl sm:text-2xl font-black font-mono tracking-tight text-foreground truncate">
                      {flexRender(
                        primaryAmountCell.column.columnDef.cell,
                        primaryAmountCell.getContext()
                      )}
                    </div>
                    {totalInTryCell && (
                      <div className="text-xs text-muted-foreground font-mono mt-0.5 truncate">
                        ≈ {flexRender(totalInTryCell.column.columnDef.cell, totalInTryCell.getContext())}
                      </div>
                    )}
                  </div>

                  {/* Right side: Due Date with urgency badge OR Secondary Amount */}
                  {dueDateCell ? (
                    <div className="shrink-0 flex items-center justify-end text-right">
                      {flexRender(
                        dueDateCell.column.columnDef.cell,
                        dueDateCell.getContext()
                      )}
                    </div>
                  ) : secondaryAmountCell ? (
                    <div className="shrink-0 text-lg font-bold font-mono tracking-tight text-foreground text-right">
                      {flexRender(
                        secondaryAmountCell.column.columnDef.cell,
                        secondaryAmountCell.getContext()
                      )}
                    </div>
                  ) : paymentDateCell ? (
                    <div className="shrink-0 text-sm font-semibold text-foreground text-right">
                      {flexRender(
                        paymentDateCell.column.columnDef.cell,
                        paymentDateCell.getContext()
                      )}
                    </div>
                  ) : null}
                </div>
              </div>
            )}

            {/* Dates / Timeline Strip (Düzenleme Tarihi, Son Ödeme Tarihi) */}
            {(issueDateCell || lastPaymentDateCell) && (
              <div className="flex items-center justify-between text-xs text-muted-foreground border-y border-border/30 py-1.5 px-1 gap-2 flex-wrap">
                {issueDateCell && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-medium text-muted-foreground/70">
                      {getHeaderText(issueDateCell)}:
                    </span>
                    <span className="font-medium text-foreground">
                      {flexRender(
                        issueDateCell.column.columnDef.cell,
                        issueDateCell.getContext()
                      )}
                    </span>
                  </div>
                )}
                {lastPaymentDateCell && (
                  <div className="flex items-center gap-1.5 ml-auto">
                    <span className="text-[11px] font-medium text-muted-foreground/70">
                      {getHeaderText(lastPaymentDateCell)}:
                    </span>
                    <span className="font-medium text-foreground">
                      {flexRender(
                        lastPaymentDateCell.column.columnDef.cell,
                        lastPaymentDateCell.getContext()
                      )}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Financial Breakdown (Net Tutar, KDV, İskonto, Tevkifat, Döviz Kuru) */}
            {breakdownCells.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-2.5 rounded-lg bg-muted/20 border border-border/30 text-xs">
                {breakdownCells.map((cell) => (
                  <div key={cell.id} className="flex flex-col min-w-0">
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground/80 truncate">
                      {getHeaderText(cell)}
                    </span>
                    <div className="font-semibold text-foreground font-mono text-xs truncate mt-0.5">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Description Callout */}
            {hasDescription && descriptionCell && (
              <div className="text-xs text-muted-foreground bg-muted/30 rounded-lg p-2.5 border border-border/40 flex items-start gap-2 leading-relaxed">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 shrink-0 mt-0.5">
                  {getHeaderText(descriptionCell)}:
                </span>
                <span className="text-foreground break-words flex-1 font-normal">
                  {flexRender(
                    descriptionCell.column.columnDef.cell,
                    descriptionCell.getContext()
                  )}
                </span>
              </div>
            )}

            {/* Any Other Detail Cells */}
            {otherDetailCells.length > 0 && (
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs pt-0.5">
                {otherDetailCells.map((cell) => (
                  <div key={cell.id} className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold truncate">
                      {getHeaderText(cell)}
                    </span>
                    <div className="font-medium text-foreground truncate text-xs sm:text-sm">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Dedicated Bottom Actions Bar */}
            {actionsCell && (
              <div className="flex items-center justify-end pt-2 border-t border-border/40 w-full">
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
