import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { PayableCustomerApi, ReceivableCustomerApi } from "@/lib/api";
import type {
  CustomerStatement as CustomerStatementType,
  DebtDto,
  PaymentDto,
} from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileDown, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import { exportCustomerStatementPDF } from "@/lib/pdf";

type Props = {
  type: "receivable" | "payable";
};

export default function CustomerStatement(props: Props) {
  const { type } = props;
  const { customerId } = useParams();
  const navigate = useNavigate();

  const API = type === "payable" ? PayableCustomerApi : ReceivableCustomerApi;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<CustomerStatementType | null>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (!customerId) return;
    setLoading(true);
    API.GetStatement(customerId)
      .then((res) => setData(res))
      .catch(() => toast.error("Borç dökümü getirilirken hata oluştu"))
      .finally(() => setLoading(false));
  }, [customerId, API]);

  const getRemainingColor = (amount: number) => {
    if (amount > 0) return "text-red-600";
    if (amount < 0) return "text-blue-600";
    return "text-green-600";
  };

  const exportStatement = useCallback(async () => {
    if (!data) return;
    try {
      setExporting(true);
      await exportCustomerStatementPDF(data);
      toast.success("PDF indirildi");
    } catch (e) {
      console.error(e);
      toast.error("PDF oluşturulurken hata oluştu");
    } finally {
      setExporting(false);
    }
  }, [data]);

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

  console.log(data);

  return (
    <div className="space-y-6 p-4">
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
            variant="outline"
            size="sm"
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
      </div>

      <div className="grid gap-4 md:grid-cols-3 px-12">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Toplam Borç</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <p className="text-xl font-bold text-red-600">
              {formatCurrency(customer.total_debt_try || 0, "TRY")}
            </p>
            <p className="text-xl font-bold text-red-600">
              {formatCurrency(customer.total_debt_usd || 0, "USD")}
            </p>
            <p className="text-xl font-bold text-red-600">
              {formatCurrency(customer.total_debt_eur || 0, "EUR")}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Ödenen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <p className="text-xl font-bold text-green-600">
              {formatCurrency(customer.total_payments_try || 0, "TRY")}
            </p>
            <p className="text-xl font-bold text-green-600">
              {formatCurrency(customer.total_payments_usd || 0, "USD")}
            </p>
            <p className="text-xl font-bold text-green-600">
              {formatCurrency(customer.total_payments_eur || 0, "EUR")}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Kalan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <p
              className={`text-xl font-bold ${getRemainingColor(customer.remaining_debt_try || 0)}`}
            >
              {formatCurrency(customer.remaining_debt_try || 0, "TRY")}
            </p>
            <p
              className={`text-xl font-bold ${getRemainingColor(customer.remaining_debt_usd || 0)}`}
            >
              {formatCurrency(customer.remaining_debt_usd || 0, "USD")}
            </p>
            <p
              className={`text-xl font-bold ${getRemainingColor(customer.remaining_debt_eur || 0)}`}
            >
              {formatCurrency(customer.remaining_debt_eur || 0, "EUR")}
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
                        {formatCurrency(parseFloat(d.total_amount || "0"))}
                      </td>
                      <td className="py-1.5 px-3 whitespace-nowrap">
                        {d.currency}
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
                        {p.payment_method === "cash"
                          ? "Nakit"
                          : p.payment_method === "bank_transfer"
                            ? "Havale"
                            : p.payment_method === "check"
                              ? "Çek"
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
