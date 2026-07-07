import { useEffect, useState } from "react";
import { PortalApi } from "@/lib/api/portal";
import DebtTable from "@/layout/debts/components/DebtTable";
import PaymentTable from "@/layout/payments/components/PaymentTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router";
import { CommaImage } from "@/components/shared/CommaImage";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export default function PortalDashboard() {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<any>(null);
  const [statement, setStatement] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      try {
        const [overviewResponse, statementResponse] = await Promise.all([
          PortalApi.getOverview(),
          PortalApi.getStatement()
        ]);
        setOverview(overviewResponse.data);
        setStatement(statementResponse.data);
      } catch {
        toast.error("Veriler alınırken bir hata oluştu. Oturumunuz süresi dolmuş olabilir.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleLogout = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Spinner className="size-8" />
      </div>
    );
  }

  if (!overview || !statement) {
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-4 bg-background">
        <div className="text-xl text-destructive">Veri bulunamadı veya oturumunuz geçersiz.</div>
        <Button onClick={() => navigate("/")}>Geri Dön</Button>
      </div>
    );
  }

  const { customer } = overview;
  const debts = statement.debts || [];
  const payments = statement.payments || [];
  const remainingDebt = parseFloat(customer?.remaining_debt) || 0;

  return (
    <div className="min-h-screen bg-background p-6 sm:p-12">
      <div className="max-w-screen mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <CommaImage
              src={
                customer?.small_logo_path
                  ? `${import.meta.env.VITE_API_URL}/uploads/logos/${customer.small_logo_path}`
                  : "/logo.webp"
              }
              alt="Company Logo"
              className="h-12 object-contain"
            />
            <h1 className="text-3xl font-bold tracking-tight">Müşteri Portalı</h1>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Çıkış Yap
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{customer?.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg flex items-center gap-2">
              <strong>Kalan Borç: </strong>
              <span className={remainingDebt > 0.005 ? "text-destructive font-medium" : "text-green-600 font-medium"}>
                {formatCurrency(Math.abs(remainingDebt))}
                {remainingDebt < -0.005 ? " (Alacaklı)" : ""}
              </span>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="debts" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="debts">Borçlar</TabsTrigger>
            <TabsTrigger value="payments">Ödemeler</TabsTrigger>
          </TabsList>
          <TabsContent value="debts" className="bg-card overflow-hidden">
            <DebtTable data={debts} type="receivable" readOnly={true} isPortal={true} />
          </TabsContent>
          <TabsContent value="payments" className="bg-card overflow-hidden">
            <PaymentTable data={payments} type="receivable" readOnly={true} isPortal={true} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
