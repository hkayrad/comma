import { useCallback, useMemo } from "react";
import { useNavigate } from "react-router";
import type { DebtDto, PaymentDto } from "@comma/common";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  FileDown,
  Loader2,
  Calendar as CalendarIcon,
  TrendingUp,
  CheckCircle2,
  Wallet,
  ReceiptText,
  CreditCard,
  LayoutGrid,
  Building2,
  User,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
      cell: ({ row }) => (
        <span className="whitespace-nowrap font-medium">
          {formatDate(row.original.issue_date)}
        </span>
      ),
    },
    {
      accessorKey: "invoice_no",
      header: t("debt.table.column.invoice_no"),
      cell: ({ row }) => (
        <span className="font-mono text-xs">
          {row.original.invoice_no || "-"}
        </span>
      ),
    },
    {
      accessorKey: "amount",
      header: t("debt.table.column.amount"),
      cell: ({ row }) => (
        <span className="whitespace-nowrap">
          {formatCurrency(row.original.amount, row.original.currency)}
        </span>
      ),
    },
    {
      accessorKey: "vat",
      header: t("debt.table.column.vat"),
      cell: ({ row }) => (
        <span className="whitespace-nowrap text-muted-foreground">
          {formatCurrency(row.original.vat, row.original.currency)}
        </span>
      ),
    },
    {
      accessorKey: "total",
      header: t("debt.table.column.total"),
      cell: ({ row }) => (
        <span className="font-semibold text-red-600 dark:text-red-400 whitespace-nowrap">
          {formatCurrency(row.original.total, row.original.currency)}
        </span>
      ),
    },
    {
      accessorKey: "currency",
      header: t("debt.table.column.currency"),
      cell: ({ row }) => (
        <Badge variant="outline" className="text-[10px] uppercase font-mono">
          {row.original.currency}
        </Badge>
      ),
    },
    {
      accessorKey: "exchange_rate",
      header: t("debt.table.column.exchange_rate"),
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {row.original.exchange_rate === 1 ? "-" : formatCurrency(row.original.exchange_rate)}
        </span>
      ),
    },
    {
      accessorKey: "total_in_try",
      header: t("debt.table.column.total_in_try"),
      cell: ({ row }) => (
        <span className="font-semibold whitespace-nowrap">
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
      cell: ({ row }) => (
        <span className="whitespace-nowrap font-medium">
          {formatDate(row.original.payment_date)}
        </span>
      ),
    },
    {
      accessorKey: "invoice_no",
      header: t("payment.table.column.invoice_no"),
      cell: ({ row }) => (
        <span className="font-mono text-xs">
          {row.original.invoice_no || "-"}
        </span>
      ),
    },
    {
      accessorKey: "amount",
      header: t("payment.table.column.amount"),
      cell: ({ row }) => (
        <span className="font-semibold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
          {formatCurrency(row.original.amount, row.original.currency)}
        </span>
      ),
    },
    {
      accessorKey: "currency",
      header: t("payment.table.column.currency"),
      cell: ({ row }) => (
        <Badge variant="outline" className="text-[10px] uppercase font-mono">
          {row.original.currency}
        </Badge>
      ),
    },
    {
      accessorKey: "exchange_rate",
      header: t("payment.table.column.exchange_rate"),
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {row.original.exchange_rate === 1 ? "-" : formatCurrency(row.original.exchange_rate)}
        </span>
      ),
    },
    {
      accessorKey: "amount_in_try",
      header: t("payment.table.column.amount_in_try"),
      cell: ({ row }) => (
        <span className="font-semibold whitespace-nowrap">
          {formatCurrency(row.original.amount_in_try)}
        </span>
      ),
    },
    {
      accessorKey: "payment_method",
      header: t("payment.table.column.payment_method"),
      cell: ({ row }) => (
        <Badge variant="secondary" className="text-xs">
          {t(`vars.${row.original.payment_method}`)}
        </Badge>
      ),
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
    if (amount > 0.005) return "text-red-600 dark:text-red-400";
    if (amount < -0.005) return "text-blue-600 dark:text-blue-400";
    return "text-emerald-600 dark:text-emerald-400";
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
      <div className="flex items-center justify-center min-h-[400px] h-full py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="w-full max-w-4xl mx-auto space-y-4 p-4 sm:p-6">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("dashboard.customerStatement.back")}
        </Button>
        <Card className="shadow-xs">
          <CardContent className="py-8 text-center text-muted-foreground">
            <h2 className="text-lg font-semibold text-foreground mb-1">
              {t("dashboard.customerStatement.notFound.title")}
            </h2>
            <p className="text-sm">
              {t("dashboard.customerStatement.notFound.description")}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { customer, debts, payments } = data;

  return (
    <div className="w-full h-[calc(100vh-3.5rem)] overflow-y-auto overflow-x-hidden p-4 sm:p-6 scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-500 dark:hover:scrollbar-thumb-gray-500">
      <div className="w-full max-w-[1800px] mx-auto space-y-6 pb-6">
        {/* Top Header Card Component */}
      <Card className="p-4 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate(-1)}
              className="h-10 w-10 shrink-0 rounded-lg"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                  {customer.name}
                </h1>
                <Badge variant={type === "payable" ? "secondary" : "default"} className="text-xs">
                  {type === "payable" ? t("vars.payable") : t("vars.receivable")}
                </Badge>
                {customer.is_company !== undefined && (
                  <Badge variant="outline" className="text-xs gap-1">
                    {customer.is_company ? (
                      <Building2 className="h-3 w-3" />
                    ) : (
                      <User className="h-3 w-3" />
                    )}
                    {customer.is_company ? t("vars.is_company.true") : t("vars.is_company.false")}
                  </Badge>
                )}
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                {t("header.breadcrumbs.finance.customerStatement") || "Borç Dökümü"} • {debts.length} {t("debt.title")}, {payments.length} {t("payment.title")}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            <Button variant="outline" size="sm" onClick={resetDate} className="h-9 text-xs sm:text-sm">
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
                    size="sm"
                    className={cn(
                      "h-9 justify-start text-left font-normal text-xs sm:text-sm",
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

            <Button
              size="sm"
              disabled={exporting}
              onClick={exportStatement}
              className="h-9 gap-2 text-xs sm:text-sm font-medium"
            >
              {exporting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileDown className="h-4 w-4" />
              )}
              {t("dashboard.customerStatement.exportPdf")}
            </Button>
          </div>
        </div>
      </Card>

      {/* Financial Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
        <Card className="relative overflow-hidden bg-card/60 shadow-xs">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t("overviewCards.total", { state: "" }).trim()}
              </span>
              <div className="p-2 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <p className="text-xl sm:text-2xl font-bold tracking-tight text-red-600 dark:text-red-400">
                {formatCurrency(customer.total_debt || 0, "TRY")}
              </p>
              <span className="text-xs text-muted-foreground font-medium">
                {debts.length} {t("debt.title")}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-card/60 shadow-xs">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t("overviewCards.paid", { state: "" }).trim()}
              </span>
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <p className="text-xl sm:text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
                {formatCurrency(customer.total_payments || 0, "TRY")}
              </p>
              <span className="text-xs text-muted-foreground font-medium">
                {payments.length} {t("payment.title")}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden bg-card/60 shadow-xs">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t("overviewCards.remaining", { state: "" }).trim()}
              </span>
              <div className={cn(
                "p-2 rounded-lg",
                (customer.remaining_debt || 0) > 0.005
                  ? "bg-red-500/10 text-red-600 dark:text-red-400"
                  : (customer.remaining_debt || 0) < -0.005
                    ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                    : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              )}>
                <Wallet className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <p className={`text-xl sm:text-2xl font-bold tracking-tight ${getRemainingColor(customer.remaining_debt || 0)}`}>
                {formatCurrency(customer.remaining_debt || 0, "TRY")}
              </p>
              <Badge
                variant="outline"
                className={cn(
                  "text-[10px] font-semibold px-2 py-0.5",
                  (customer.remaining_debt || 0) > 0.005
                    ? "border-red-500/30 text-red-600 dark:text-red-400 bg-red-500/5"
                    : (customer.remaining_debt || 0) < -0.005
                      ? "border-blue-500/30 text-blue-600 dark:text-blue-400 bg-blue-500/5"
                      : "border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5"
                )}
              >
                {(customer.remaining_debt || 0) > 0.005
                  ? "Borçlu"
                  : (customer.remaining_debt || 0) < -0.005
                    ? "Alacaklı"
                    : "Dengede"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Area: Responsive Multi-View Tabs */}
      <Tabs defaultValue="all" className="w-full space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-border pb-3">
          <TabsList variant="line" className="h-9">
            <TabsTrigger value="all" className="gap-2 text-xs sm:text-sm">
              <LayoutGrid className="h-4 w-4" />
              <span>{t("vars.all")}</span>
            </TabsTrigger>
            <TabsTrigger value="debts" className="gap-2 text-xs sm:text-sm">
              <ReceiptText className="h-4 w-4 text-red-500" />
              <span>{t("dashboard.customerStatement.debts")}</span>
              <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0 h-4">
                {debts.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="payments" className="gap-2 text-xs sm:text-sm">
              <CreditCard className="h-4 w-4 text-emerald-500" />
              <span>{t("dashboard.customerStatement.payments")}</span>
              <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0 h-4">
                {payments.length}
              </Badge>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab 1: All (Split View / Side-by-Side on 2xl) */}
        <TabsContent value="all" className="focus-visible:outline-hidden">
          <div className="grid grid-cols-1 2xl:grid-cols-2 gap-6 items-start">
            {/* Debts Table Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <ReceiptText className="h-4 w-4 text-red-500" />
                  <h3 className="text-base font-semibold text-foreground">
                    {t("dashboard.customerStatement.debts")}
                  </h3>
                </div>
                <Badge variant="outline" className="text-xs font-normal">
                  {debts.length} {t("debt.title")}
                </Badge>
              </div>
              <CommaTable
                data={debts}
                columns={debtColumns}
                searchColumn="invoice_no"
                enableRowSelection
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

            {/* Payments Table Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-emerald-500" />
                  <h3 className="text-base font-semibold text-foreground">
                    {t("dashboard.customerStatement.payments")}
                  </h3>
                </div>
                <Badge variant="outline" className="text-xs font-normal">
                  {payments.length} {t("payment.title")}
                </Badge>
              </div>
              <CommaTable
                data={payments}
                columns={paymentColumns}
                searchColumn="invoice_no"
                enableRowSelection
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
        </TabsContent>

        {/* Tab 2: Debts Only (Full Width) */}
        <TabsContent value="debts" className="focus-visible:outline-hidden">
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <ReceiptText className="h-4 w-4 text-red-500" />
                <h3 className="text-base font-semibold text-foreground">
                  {t("dashboard.customerStatement.debts")}
                </h3>
              </div>
              <Badge variant="outline" className="text-xs font-normal">
                {debts.length} {t("debt.title")}
              </Badge>
            </div>
            <CommaTable
              data={debts}
              columns={debtColumns}
              searchColumn="invoice_no"
              enableRowSelection
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
        </TabsContent>

        {/* Tab 3: Payments Only (Full Width) */}
        <TabsContent value="payments" className="focus-visible:outline-hidden">
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-emerald-500" />
                <h3 className="text-base font-semibold text-foreground">
                  {t("dashboard.customerStatement.payments")}
                </h3>
              </div>
              <Badge variant="outline" className="text-xs font-normal">
                {payments.length} {t("payment.title")}
              </Badge>
            </div>
            <CommaTable
              data={payments}
              columns={paymentColumns}
              searchColumn="invoice_no"
              enableRowSelection
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
        </TabsContent>
      </Tabs>
    </div>
  </div>
);
}
