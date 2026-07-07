import { useCallback, useMemo } from "react";
import { useNavigate } from "react-router";
import type {
  DebtDto,
  PaymentDto,
} from "@comma/common";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  FileDown,
  Loader2,
  Calendar as CalendarIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { toast } from "sonner";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { Locale } from "react-day-picker";
import { format } from "date-fns";
import { tr, enUS } from "date-fns/locale";
import { exportCustomerStatementPDF } from "@/lib/pdf-new";
import { Logger } from "@/lib/utils/logger";
import { useTranslation } from "react-i18next";
import { StatementRowActions } from "./StatementRowActions";
import { useCustomerStatement } from "@/hooks/useCustomerStatement";
import CommaTable from "@/layout/shared/table/CommaTable";
import type { ColumnDef } from "@tanstack/react-table";

export default function CustomerStatement() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  
  const {
    type,
    loading,
    data,
    company,
    exporting,
    setExporting,
    date,
    setDate,
    resetDate,
    refresh,
  } = useCustomerStatement();

  const langMap: Record<string, Locale> = {
    tr: tr,
    en: enUS,
  };

  const debtColumns = useMemo<ColumnDef<DebtDto>[]>(() => [
    {
      accessorKey: "issue_date",
      header: t("debt.table.column.issue_date"),
      cell: ({ row }) => formatDate(row.original.issue_date),
    },
    {
      accessorKey: "invoice_no",
      header: t("debt.table.column.invoice_no"),
      cell: ({ row }) => row.original.invoice_no || "-",
    },
    {
      accessorKey: "amount",
      header: t("debt.table.column.amount"),
      cell: ({ row }) => formatCurrency(row.original.amount, row.original.currency),
    },
    {
      accessorKey: "vat",
      header: t("debt.table.column.vat"),
      cell: ({ row }) => formatCurrency(row.original.vat, row.original.currency),
    },
    {
      accessorKey: "total",
      header: t("debt.table.column.total"),
      cell: ({ row }) => (
        <span className="font-medium">
          {formatCurrency(row.original.total, row.original.currency)}
        </span>
      ),
    },
    {
      accessorKey: "currency",
      header: t("debt.table.column.currency"),
    },
    {
      accessorKey: "exchange_rate",
      header: t("debt.table.column.exchange_rate"),
      cell: ({ row }) => row.original.exchange_rate === 1 ? "-" : formatCurrency(row.original.exchange_rate),
    },
    {
      accessorKey: "total_in_try",
      header: t("debt.table.column.total_in_try"),
      cell: ({ row }) => (
        <span className="font-medium">
          {formatCurrency(row.original.total_in_try)}
        </span>
      ),
    },
    {
      id: "actions",
      header: () => <div className="text-right">{t("debt.table.column.actions")}</div>,
      cell: ({ row }) => (
        <div className="text-right">
          <StatementRowActions
            item={row.original}
            type="debt"
            overviewType={type}
            company={company}
            onRefresh={refresh}
          />
        </div>
      ),
    }
  ], [t, type, company, refresh]);

  const paymentColumns = useMemo<ColumnDef<PaymentDto>[]>(() => [
    {
      accessorKey: "payment_date",
      header: t("payment.table.column.payment_date"),
      cell: ({ row }) => formatDate(row.original.payment_date),
    },
    {
      accessorKey: "invoice_no",
      header: t("payment.table.column.invoice_no"),
      cell: ({ row }) => row.original.invoice_no || "-",
    },
    {
      accessorKey: "amount",
      header: t("payment.table.column.amount"),
      cell: ({ row }) => formatCurrency(row.original.amount, row.original.currency),
    },
    {
      accessorKey: "currency",
      header: t("payment.table.column.currency"),
    },
    {
      accessorKey: "exchange_rate",
      header: t("payment.table.column.exchange_rate"),
      cell: ({ row }) => row.original.exchange_rate === 1 ? "-" : formatCurrency(row.original.exchange_rate),
    },
    {
      accessorKey: "amount_in_try",
      header: t("payment.table.column.amount_in_try"),
      cell: ({ row }) => formatCurrency(row.original.amount_in_try),
    },
    {
      accessorKey: "payment_method",
      header: t("payment.table.column.payment_method"),
      cell: ({ row }) => t(`vars.${row.original.payment_method}`),
    },
    {
      id: "actions",
      header: () => <div className="text-right">{t("payment.table.column.actions")}</div>,
      cell: ({ row }) => (
        <div className="text-right">
          <StatementRowActions
            item={row.original}
            type="payment"
            overviewType={type}
            company={company}
            onRefresh={refresh}
          />
        </div>
      ),
    }
  ], [t, type, company, refresh]);

  const getRemainingColor = (amount: number) => {
    if (amount > 0.005) return "text-red-600";
    if (amount < -0.005) return "text-blue-600";
    return "text-green-600";
  };

  const exportStatement = useCallback(async () => {
    if (!data || !company) {
      if (!company)
        toast.error(t("dashboard.customerStatement.error.companyInfo"));
      return;
    }
    try {
      setExporting(true);
      const pdfDateRange = {
        from: date?.from || new Date(0),
        to: date?.to || new Date("2100-01-01"),
      };
      await exportCustomerStatementPDF(data, company, pdfDateRange);
      toast.success(t("dashboard.customerStatement.success.pdfExport"));
    } catch (e) {
      Logger.error(e);
      toast.error(t("dashboard.customerStatement.error.pdfExport"));
    } finally {
      setExporting(false);
    }
  }, [data, company, date, t, setExporting]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-4">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />{" "}
          {t("dashboard.customerStatement.back")}
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>
              {t("dashboard.customerStatement.notFound.title")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {t("dashboard.customerStatement.notFound.description")}
          </CardContent>
        </Card>
      </div>
    );
  }

  const { customer, debts, payments } = data;

  return (
    <div className="space-y-6 p-4 h-[calc(100vh-3.5rem)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-500 dark:hover:scrollbar-thumb-gray-500">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="px-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            disabled={exporting}
            onClick={exportStatement}
            className="flex items-center gap-2"
          >
            {exporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileDown className="h-4 w-4" />
            )}{" "}
            {t("dashboard.customerStatement.exportPdf")}
          </Button>
        </div>
      </div>

      <div className="px-12 flex items-center gap-3">
        <h1 className="text-2xl font-semibold">{customer.name}</h1>
        <div className="flex ml-auto gap-2">
          <Button variant="outline" onClick={resetDate}>
            {t("dashboard.customerStatement.resetDate")}
          </Button>
          <Popover>
            <PopoverTrigger
              render={(props) => (
                <Button
                  {...props}
                  nativeButton
                  id="date"
                  variant={"outline"}
                  className={cn(
                    "w-fit justify-start text-left font-normal",
                    !date && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {(() => {
                    const isAllTime =
                      date?.from?.getTime() === 0 &&
                      date?.to?.getFullYear() === 2100 &&
                      date?.to?.getMonth() === 0 &&
                      date?.to?.getDate() === 1;

                    if (!date?.from || isAllTime) {
                      return <span>{t("vars.all")}</span>;
                    }

                    if (date.to) {
                      return (
                        <>
                          {format(date.from, "dd LLL y", {
                            locale: langMap[i18n.language] as any,
                          })}{" "}
                          -{" "}
                          {format(date.to, "dd LLL y", {
                            locale: langMap[i18n.language] as any,
                          })}
                        </>
                      );
                    }

                    return format(date.from, "dd LLL y", {
                      locale: langMap[i18n.language] as any,
                    });
                  })()}
                </Button>
              )}
            />
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
                locale={langMap[i18n.language] as any}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3 px-12">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {t("overviewCards.total", { state: "" }).trim()}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <p className="text-xl font-bold text-red-600">
              {formatCurrency(customer.total_debt || 0, "TRY")}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {t("overviewCards.paid", { state: "" }).trim()}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <p className="text-xl font-bold text-green-600">
              {formatCurrency(customer.total_payments || 0, "TRY")}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {t("overviewCards.remaining", { state: "" }).trim()}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <p
              className={`text-xl font-bold ${getRemainingColor(customer.remaining_debt || 0)}`}
            >
              {formatCurrency(customer.remaining_debt || 0, "TRY")}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 px-12">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">{t("dashboard.customerStatement.debts")}</h2>
          <CommaTable
            data={debts}
            columns={debtColumns}
            searchColumn="invoice_no"
            readOnly
            translationPrefix="debt"
            hideHeader
            contextMenuItems={(item) => (
              <StatementRowActions
                item={item}
                type="debt"
                overviewType={type}
                company={company}
                onRefresh={refresh}
                isContextMenu
              />
            )}
          />
        </div>
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">{t("dashboard.customerStatement.payments")}</h2>
          <CommaTable
            data={payments}
            columns={paymentColumns}
            searchColumn="invoice_no"
            readOnly
            translationPrefix="payment"
            hideHeader
            contextMenuItems={(item) => (
              <StatementRowActions
                item={item}
                type="payment"
                overviewType={type}
                company={company}
                onRefresh={refresh}
                isContextMenu
              />
            )}
          />
        </div>
      </div>
    </div>
  );
}
