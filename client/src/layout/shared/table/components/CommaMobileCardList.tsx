import type { Table } from "@tanstack/react-table";
import { flexRender } from "@tanstack/react-table";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

type Props = {
  table: Table<any>;
  contextMenuItems?: (row: any) => React.ReactNode;
  isPortal?: boolean;
  translationPrefix?: "dashboard" | "debt" | "payment";
};

export default function CommaMobileCardList({ table, translationPrefix }: Props) {
  const { t, i18n } = useTranslation();
  const rows = table.getRowModel().rows;

  if (!rows.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground bg-card rounded-xl border border-dashed p-6">
        <p className="text-sm font-medium">{t("table.noData", { defaultValue: "Gösterilecek veri bulunamadı." })}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {rows.map((row) => {
        const isSelected = row.getIsSelected();
        const visibleCells = row.getVisibleCells();

        // Separate special cells
        const selectCell = visibleCells.find((c) => c.column.id === "select");
        const actionsCell = visibleCells.find((c) => c.column.id === "actions");
        const statusCell = visibleCells.find(
          (c) => c.column.id === "debt_status" || c.column.id === "status"
        );

        // Identify primary title cell
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
            c.column.id !== "debt_status"
        );

        // Identify secondary subtitle cell (e.g. invoice_no, phone, description)
        const secondaryTitleCell = visibleCells.find(
          (c) =>
            (c.column.id === "invoice_no" ||
              c.column.id === "phone" ||
              c.column.id === "tax_number") &&
            c.column.id !== primaryTitleCell?.column.id
        );

        // Other detail cells
        const excludedIds = new Set([
          "select",
          "actions",
          "#",
          "debt_status",
          "status",
          primaryTitleCell?.column.id,
          secondaryTitleCell?.column.id,
        ]);

        const detailCells = visibleCells.filter(
          (c) => !excludedIds.has(c.column.id)
        );

        return (
          <div
            key={row.id}
            className={cn(
              "bg-card text-card-foreground border rounded-xl p-3.5 shadow-xs flex flex-col gap-2.5 transition-colors",
              isSelected ? "border-primary/50 bg-primary/5" : "border-border"
            )}
          >
            {/* Top row: Checkbox + Titles + Status + Actions */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                {selectCell && (
                  <div className="shrink-0">
                    {flexRender(
                      selectCell.column.columnDef.cell,
                      selectCell.getContext()
                    )}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  {primaryTitleCell && (
                    <div className="font-semibold text-sm truncate text-foreground">
                      {flexRender(
                        primaryTitleCell.column.columnDef.cell,
                        primaryTitleCell.getContext()
                      )}
                    </div>
                  )}
                  {secondaryTitleCell && (
                    <div className="text-xs text-muted-foreground truncate mt-0.5 font-mono">
                      {flexRender(
                        secondaryTitleCell.column.columnDef.cell,
                        secondaryTitleCell.getContext()
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {statusCell && (
                  <div className="shrink-0">
                    {flexRender(
                      statusCell.column.columnDef.cell,
                      statusCell.getContext()
                    )}
                  </div>
                )}
                {actionsCell && (
                  <div className="shrink-0">
                    {flexRender(
                      actionsCell.column.columnDef.cell,
                      actionsCell.getContext()
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Metrics & Details Grid */}
            {detailCells.length > 0 && (
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/50 text-xs">
                {detailCells.map((cell) => {
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
                      const commonLabels: Record<string, string> = {
                        amount: t("debt.table.column.amount", { defaultValue: "Tutar" }),
                        amount_in_try: t("payment.table.column.amount_in_try", { defaultValue: "Toplam (TL)" }),
                        total: t("debt.table.column.total", { defaultValue: "Toplam" }),
                        total_in_try: t("debt.table.column.total_in_try", { defaultValue: "Toplam (TL)" }),
                        vat: t("debt.table.column.vat", { defaultValue: "KDV" }),
                        discount: t("debt.table.column.discount", { defaultValue: "İskonto" }),
                        withholding: t("debt.table.column.withholding", { defaultValue: "Tevkifat" }),
                        currency: t("debt.table.column.currency", { defaultValue: "Para Birimi" }),
                        exchange_rate: t("debt.table.column.exchange_rate", { defaultValue: "Kur" }),
                        issue_date: t("debt.table.column.issue_date", { defaultValue: "Düzenleme Tarihi" }),
                        due_date: t("debt.table.column.due_date", { defaultValue: "Vade Tarihi" }),
                        payment_date: t("payment.table.column.payment_date", { defaultValue: "Ödeme Tarihi" }),
                        payment_method: t("payment.table.column.payment_method", { defaultValue: "Ödeme Yöntemi" }),
                        description: t("debt.table.column.description", { defaultValue: "Açıklama" }),
                        invoice_no: t("debt.table.column.invoice_no", { defaultValue: "Fatura No" }),
                        customer_name: t("debt.table.column.customer_name", { defaultValue: "Müşteri" }),
                        tax_number: t("dashboard.table.column.tax_number", { defaultValue: "Vergi No" }),
                        tax_office: t("dashboard.table.column.tax_office", { defaultValue: "Vergi Dairesi" }),
                        remaining_debt: t("dashboard.table.column.remaining_debt", { defaultValue: "Kalan Borç" }),
                        total_debt: t("dashboard.table.column.total_debt", { defaultValue: "Toplam Borç" }),
                        total_payments: t("dashboard.table.column.total_payments", { defaultValue: "Ödenmiş" }),
                        address: t("dashboard.table.column.address", { defaultValue: "Adres" }),
                        phone: t("dashboard.table.column.phone", { defaultValue: "Telefon" }),
                        email: t("dashboard.table.column.email", { defaultValue: "E-posta" }),
                        is_company: t("dashboard.table.column.is_company", { defaultValue: "Tür" }),
                        debt_status: t("dashboard.table.column.debt_status", { defaultValue: "Borç Durumu" }),
                        status: t("table.column.status", { defaultValue: "Durum" }),
                      };
                      headerText = commonLabels[columnId] || columnId.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
                    }
                  }

                  return (
                    <div key={cell.id} className="flex flex-col gap-0.5 min-w-0">
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium truncate">
                        {headerText}
                      </span>
                      <div className="font-medium text-foreground truncate">
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
          </div>
        );
      })}
    </div>
  );
}
