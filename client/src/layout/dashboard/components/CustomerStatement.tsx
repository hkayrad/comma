import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router";
import { PayableCustomerApi, ReceivableCustomerApi } from "@/lib/api";
import type {
  CustomerStatement as CustomerStatementType,
  DebtDto,
  PaymentDto,
  CompanyDto,
} from "@/lib/types";
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
import type { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { exportCustomerStatementPDF } from "@/lib/pdf";
import { Logger } from "@/lib/utils/logger";

import { useBreadcrumb } from "@/contexts/BreadcrumbContext";

export default function CustomerStatement() {
  const location = useLocation();
  const type: "payable" | "receivable" =
    location.pathname.split("/")[1] === "alacaklar" ? "receivable" : "payable";
  const { customerId } = useParams();
  const navigate = useNavigate();
  const { setLabel } = useBreadcrumb();

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

  useEffect(() => {
    if (!customerId) return;
    // setLoading(true);

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
      .catch(() => toast.error("Borç dökümü getirilirken hata oluştu"))
      .finally(() => setLoading(false));
  }, [customerId, API, date, setLabel]);

  const getRemainingColor = (amount: number) => {
    if (amount > 0) return "text-red-600";
    if (amount < 0) return "text-blue-600";
    return "text-green-600";
  };

  const exportStatement = useCallback(async () => {
    if (!data || !company) {
      if (!company) toast.error("Şirket bilgileri yüklenemedi");
      return;
    }
    try {
      setExporting(true);
      const pdfDateRange = {
        from: date?.from || new Date(0),
        to: date?.to || new Date("2100-01-01"),
      };
      await exportCustomerStatementPDF(data, company, pdfDateRange);
      toast.success("PDF indirildi");
    } catch (e) {
      Logger.error(e);
      toast.error("PDF oluşturulurken hata oluştu");
    } finally {
      setExporting(false);
    }
  }, [data, company, date]);

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
          <ArrowLeft className="h-4 w-4" /> Geri Dön
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>Veri bulunamadı</CardTitle>
          </CardHeader>
          <CardContent>Müşteri veya borç dökümü bulunamadı.</CardContent>
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
              onClick={() => {
                sessionStorage.setItem("current_page", "Genel Bakış");
                navigate(-1);
              }}
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
            PDF Dışa Aktar
          </Button>
        </div>
      </div>

      <div className="px-12 flex items-center gap-3">
        <h1 className="text-2xl font-semibold">{customer.name}</h1>
        <div className="flex ml-auto gap-2">
          <Button variant="outline" onClick={() => setDate(undefined)}>
            Tarih seçimini sıfırla
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className={cn(
                  "w-fit justify-start text-left font-normal",
                  !date && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "dd LLL y", { locale: tr })} -{" "}
                      {format(date.to, "dd LLL y", { locale: tr })}
                    </>
                  ) : (
                    format(date.from, "dd LLL y", { locale: tr })
                  )
                ) : (
                  <span>Tarih aralığı seçin</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
                locale={tr}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3 px-12">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Toplam Borç</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <p className="text-xl font-bold text-red-600">
              {formatCurrency(customer.total_debt || 0, "TRY")}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Ödenen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <p className="text-xl font-bold text-green-600">
              {formatCurrency(customer.total_payments || 0, "TRY")}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Kalan</CardTitle>
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
            <CardTitle>Borçlar</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[400px] overflow-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted sticky top-0">
                  <tr className="text-left">
                    <th className="py-2 px-3 font-medium">Tarih</th>
                    <th className="py-2 px-3 font-medium">Fatura No</th>
                    <th className="py-2 px-3 font-medium">Tutar</th>
                    <th className="py-2 px-3 font-medium">KDV</th>
                    <th className="py-2 px-3 font-medium">Toplam</th>
                    <th className="py-2 px-3 font-medium">Para Birimi</th>
                    <th className="py-2 px-3 font-medium">Kur</th>
                    <th className="py-2 px-3 font-medium">Net Toplam</th>
                  </tr>
                </thead>
                <tbody>
                  {debts.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-4 px-3 text-center text-muted-foreground"
                      >
                        Borç bulunamadı
                      </td>
                    </tr>
                  )}
                  {debts.map((d: DebtDto) => (
                    <tr
                      key={d.id}
                      className="border-b last:border-0 hover:bg-muted/50"
                    >
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Ödemeler</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[400px] overflow-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted sticky top-0">
                  <tr className="text-left">
                    <th className="py-2 px-3 font-medium">Tarih</th>
                    <th className="py-2 px-3 font-medium">Fatura No</th>
                    <th className="py-2 px-3 font-medium">Tutar</th>
                    <th className="py-2 px-3 font-medium">Para Birimi</th>
                    <th className="py-2 px-3 font-medium">Kur</th>
                    <th className="py-2 px-3 font-medium">Net Tutar</th>
                    <th className="py-2 px-3 font-medium">Yöntem</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-4 px-3 text-center text-muted-foreground"
                      >
                        Ödeme bulunamadı
                      </td>
                    </tr>
                  )}
                  {payments.map((p: PaymentDto) => (
                    <tr
                      key={p.id}
                      className="border-b last:border-0 hover:bg-muted/50"
                    >
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
                        {p.payment_method === "cash"
                          ? "Nakit"
                          : p.payment_method === "bank_transfer"
                            ? "Havale"
                            : p.payment_method === "check"
                              ? "Çek"
                              : p.payment_method === "card"
                                ? "Kart"
                                : p.payment_method}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
