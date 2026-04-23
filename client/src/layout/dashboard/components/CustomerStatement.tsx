import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router";
import { PayableCustomerApi, ReceivableCustomerApi } from "@/lib/api/customer";
import type {
  CustomerStatement as CustomerStatementType,
  DebtDto,
  PaymentDto,
  CompanyDto,
} from "@comma/common";
import { CompanyApi } from "@/lib/api/company";
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
import type { DateRange, Locale } from "react-day-picker";
import { format } from "date-fns";
import { tr, enUS } from "date-fns/locale";
import { exportCustomerStatementPDF } from "@/lib/pdf-new";
import { Logger } from "@/lib/utils/logger";
import { useBreadcrumb } from "@/contexts/breadcrumb/useBreadcrumb";
import { useTranslation } from "react-i18next";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { useDashboardSettings } from "@/hooks/use-dashboard-settings";
import { StatementRowActions } from "./StatementRowActions";

export default function CustomerStatement() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const type: "payable" | "receivable" =
    location.pathname.split("/")[1] === "alacaklar" ? "receivable" : "payable";
  const { customerId } = useParams();
  const navigate = useNavigate();
  const setLabel = useBreadcrumb((s) => s.setLabel);

  const useContextMenuForActions = useDashboardSettings(
    (s) => s.useContextMenuForActions,
  );

  const langMap: Record<string, Locale> = {
    tr: tr,
    en: enUS,
  };

  const API = type === "payable" ? PayableCustomerApi : ReceivableCustomerApi;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<CustomerStatementType | null>(null);
  const [exporting, setExporting] = useState(false);
  const [date, setDate] = useState<DateRange | undefined>(undefined);

  const [company, setCompany] = useState<CompanyDto | null>(null);

  useEffect(() => {
    CompanyApi.GetCompanyById()
      .then((response) => setCompany(response.data))
      .catch(Logger.error);
  }, []);

  const refresh = useCallback(() => {
    if (!customerId) return;

    const filters = {
      startDate: date?.from ? format(date.from, "yyyy-MM-dd") : undefined,
      endDate: date?.to ? format(date.to, "yyyy-MM-dd") : undefined,
    };

    API.GetStatement(customerId, filters)
      .then((res) => {
        setData(res);
        if (res?.customer?.name) {
          setLabel(customerId, res.customer.name);
        }
      })
      .catch(() =>
        toast.error(t("dashboard.customerStatement.error.fetchStatement")),
      )
      .finally(() => setLoading(false));
  }, [customerId, API, date, setLabel, t]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const getRemainingColor = (amount: number) => {
    if (amount > 0) return "text-red-600";
    if (amount < 0) return "text-blue-600";
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
  }, [data, company, date, t]);

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
    <div className="space-y-6 p-4 overflow-y-auto">
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
          <Button variant="outline" onClick={() => setDate(undefined)}>
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
              {t("overviewCards.remaning", { state: "" }).trim()}
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
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>{t("dashboard.customerStatement.debts")}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-100 overflow-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted sticky top-0">
                  <tr className="text-left">
                    <th className="py-2 px-3 font-medium">
                      {t("debt.table.column.issue_date")}
                    </th>
                    <th className="py-2 px-3 font-medium">
                      {t("debt.table.column.invoice_no")}
                    </th>
                    <th className="py-2 px-3 font-medium">
                      {t("debt.table.column.amount")}
                    </th>
                    <th className="py-2 px-3 font-medium">
                      {t("debt.table.column.vat")}
                    </th>
                    <th className="py-2 px-3 font-medium">
                      {t("debt.table.column.total")}
                    </th>
                    <th className="py-2 px-3 font-medium">
                      {t("debt.table.column.currency")}
                    </th>
                    <th className="py-2 px-3 font-medium">
                      {t("debt.table.column.exchange_rate")}
                    </th>
                    <th className="py-2 px-3 font-medium">
                      {t("debt.table.column.total_in_try")}
                    </th>
                    {!useContextMenuForActions && (
                      <th className="py-2 px-3 font-medium text-right">
                        {t("debt.table.column.actions")}
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {debts.length === 0 && (
                    <tr>
                      <td
                        colSpan={useContextMenuForActions ? 8 : 9}
                        className="py-4 px-3 text-center text-muted-foreground"
                      >
                        {t("dashboard.customerStatement.noDebts")}
                      </td>
                    </tr>
                  )}
                  {debts.map((d: DebtDto) => {
                    const rowContent = (
                      <>
                        <td className="py-1.5 px-3 whitespace-nowrap">
                          {formatDate(d.issue_date)}
                        </td>
                        <td className="py-1.5 px-3">{d.invoice_no || "-"}</td>
                        <td className="py-1.5 px-3 whitespace-nowrap">
                          {formatCurrency(d.amount, d.currency)}
                        </td>
                        <td className="py-1.5 px-3 whitespace-nowrap">
                          {formatCurrency(d.vat, d.currency)}
                        </td>
                        <td className="py-1.5 px-3 whitespace-nowrap font-medium">
                          {formatCurrency(d.total, d.currency)}
                        </td>
                        <td className="py-1.5 px-3 whitespace-nowrap">
                          {d.currency}
                        </td>
                        <td className="py-1.5 px-3 whitespace-nowrap font-medium">
                          {d.exchange_rate === 1
                            ? "-"
                            : formatCurrency(d.exchange_rate)}
                        </td>
                        <td className="py-1.5 px-3 whitespace-nowrap font-medium">
                          {formatCurrency(d.total_in_try)}
                        </td>
                        {!useContextMenuForActions && (
                          <td className="py-1.5 px-3 text-right">
                            <StatementRowActions
                              item={d}
                              type="debt"
                              overviewType={type}
                              company={company}
                              onRefresh={refresh}
                            />
                          </td>
                        )}
                      </>
                    );

                    if (useContextMenuForActions) {
                      return (
                        <ContextMenu key={d.id}>
                          <ContextMenuTrigger
                            render={(props) => (
                              <tr
                                {...props}
                                className="border-b last:border-0 hover:bg-muted/50 group cursor-default"
                              >
                                {rowContent}
                              </tr>
                            )}
                          />
                          <ContextMenuContent className="w-48">
                            <StatementRowActions
                              item={d}
                              type="debt"
                              overviewType={type}
                              company={company}
                              onRefresh={refresh}
                              isContextMenu
                            />
                          </ContextMenuContent>
                        </ContextMenu>
                      );
                    }

                    return (
                      <tr
                        key={d.id}
                        className="border-b last:border-0 hover:bg-muted/50 group"
                      >
                        {rowContent}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>{t("dashboard.customerStatement.payments")}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-100 overflow-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted sticky top-0">
                  <tr className="text-left">
                    <th className="py-2 px-3 font-medium">
                      {t("payment.table.column.payment_date")}
                    </th>
                    <th className="py-2 px-3 font-medium">
                      {t("payment.table.column.invoice_no")}
                    </th>
                    <th className="py-2 px-3 font-medium">
                      {t("payment.table.column.amount")}
                    </th>
                    <th className="py-2 px-3 font-medium">
                      {t("payment.table.column.currency")}
                    </th>
                    <th className="py-2 px-3 font-medium">
                      {t("payment.table.column.exchange_rate")}
                    </th>
                    <th className="py-2 px-3 font-medium">
                      {t("payment.table.column.amount_in_try")}
                    </th>
                    <th className="py-2 px-3 font-medium">
                      {t("payment.table.column.payment_method")}
                    </th>
                    {!useContextMenuForActions && (
                      <th className="py-2 px-3 font-medium text-right">
                        {t("payment.table.column.actions")}
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {payments.length === 0 && (
                    <tr>
                      <td
                        colSpan={useContextMenuForActions ? 7 : 8}
                        className="py-4 px-3 text-center text-muted-foreground"
                      >
                        {t("dashboard.customerStatement.noPayments")}
                      </td>
                    </tr>
                  )}
                  {payments.map((p: PaymentDto) => {
                    const rowContent = (
                      <>
                        <td className="py-1.5 px-3 whitespace-nowrap">
                          {formatDate(p.payment_date)}
                        </td>
                        <td className="py-1.5 px-3">{p.invoice_no || "-"}</td>
                        <td className="py-1.5 px-3 whitespace-nowrap">
                          {formatCurrency(p.amount, p.currency)}
                        </td>
                        <td className="py-1.5 px-3 whitespace-nowrap">
                          {p.currency}
                        </td>
                        <td className="py-1.5 px-3 whitespace-nowrap">
                          {p.exchange_rate === 1
                            ? "-"
                            : formatCurrency(p.exchange_rate)}
                        </td>
                        <td className="py-1.5 px-3 whitespace-nowrap">
                          {formatCurrency(p.amount_in_try)}
                        </td>
                        <td className="py-1.5 px-3 whitespace-nowrap">
                          {t(`vars.${p.payment_method}`)}
                        </td>
                        {!useContextMenuForActions && (
                          <td className="py-1.5 px-3 text-right">
                            <StatementRowActions
                              item={p}
                              type="payment"
                              overviewType={type}
                              company={company}
                              onRefresh={refresh}
                            />
                          </td>
                        )}
                      </>
                    );

                    if (useContextMenuForActions) {
                      return (
                        <ContextMenu key={p.id}>
                          <ContextMenuTrigger
                            render={(props) => (
                              <tr
                                {...props}
                                className="border-b last:border-0 hover:bg-muted/50 group cursor-default"
                              >
                                {rowContent}
                              </tr>
                            )}
                          />
                          <ContextMenuContent className="w-48">
                            <StatementRowActions
                              item={p}
                              type="payment"
                              overviewType={type}
                              company={company}
                              onRefresh={refresh}
                              isContextMenu
                            />
                          </ContextMenuContent>
                        </ContextMenu>
                      );
                    }

                    return (
                      <tr
                        key={p.id}
                        className="border-b last:border-0 hover:bg-muted/50 group"
                      >
                        {rowContent}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
