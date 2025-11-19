import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { CustomerDto, OverviewViewType } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Mail, MapPin, Phone, Hash, Calendar, BanknoteX } from "lucide-react";

type Props = {
  customer: CustomerDto;
  type?: OverviewViewType;
};

export default function CustomerDetails(props: Props) {
  const { customer, type = "receivable" } = props;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="w-full flex items-center justify-between px-4 gap-8">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          {customer.name}
        </h1>
        <Badge variant={customer.is_company ? "default" : "secondary"}>
          {customer.is_company ? "Şirket" : "Birey"}
        </Badge>
      </div>

      <Tabs>
        <TabsList>
          <TabsTrigger
            value="details"
            className="text-sm font-medium text-gray-500 dark:text-gray-400"
          >
            Detaylar
          </TabsTrigger>
          <TabsTrigger
            value="financial_summary"
            className="text-sm font-medium text-gray-500 dark:text-gray-400"
          >
            Finansal Özet
          </TabsTrigger>
        </TabsList>
        <TabsContent value="details">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">İletişim Bilgileri</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Telefon
                    </p>
                    <p className="font-medium">
                      {customer.phone || "Belirtilmemiş"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      E-posta
                    </p>
                    <p className="font-medium">
                      {customer.email || "Belirtilmemiş"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Hash className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {customer.is_company
                        ? "Vergi Numarası"
                        : "TC Kimlik Numarası"}
                    </p>
                    <p className="font-medium">
                      {customer.tax_number || "Belirtilmemiş"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Kayıt Tarihi
                    </p>
                    <p className="font-medium">
                      {formatDate(customer.created_at)}
                    </p>
                  </div>
                </div>
                {customer.address && (
                  <div className="flex items-start gap-3 pt-2 col-span-2">
                    <MapPin className="w-4 h-4 text-gray-500 dark:text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Adres
                      </p>
                      <p className="font-medium leading-relaxed">
                        {customer.address}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="financial_summary">
          {/* Financial Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Finansal Özet</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* TRY */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Türk Lirası (TRY)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-red-50 dark:bg-red-950/30 rounded-lg">
                    <p className="text-sm text-red-600 dark:text-red-400 mb-1">
                      Toplam {type === "receivable" ? "Alacak" : "Borç"}
                    </p>
                    <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                      {formatCurrency(customer.total_debt_try || 0)}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-950/30 rounded-lg">
                    <p className="text-sm text-green-600 dark:text-green-400 mb-1">
                      Toplam Ödeme
                    </p>
                    <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                      {formatCurrency(customer.total_payments_try || 0)}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                    <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">
                      Kalan {type === "receivable" ? "Alacak" : "Borç"}
                    </p>
                    <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                      {formatCurrency(customer.remaining_debt_try || 0)}
                    </p>
                  </div>
                </div>
              </div>

              {/* USD */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Amerikan Doları (USD)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-red-50 dark:bg-red-950/30 rounded-lg">
                    <p className="text-sm text-red-600 dark:text-red-400 mb-1">
                      Toplam {type === "receivable" ? "Alacak" : "Borç"}
                    </p>
                    <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                      {formatCurrency(customer.total_debt_usd || 0, "USD")}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-950/30 rounded-lg">
                    <p className="text-sm text-green-600 dark:text-green-400 mb-1">
                      Toplam Ödeme
                    </p>
                    <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                      {formatCurrency(customer.total_payments_usd || 0, "USD")}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                    <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">
                      Kalan {type === "receivable" ? "Alacak" : "Borç"}
                    </p>
                    <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                      {formatCurrency(customer.remaining_debt_usd || 0, "USD")}
                    </p>
                  </div>
                </div>
              </div>

              {/* EUR */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Euro (EUR)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-red-50 dark:bg-red-950/30 rounded-lg">
                    <p className="text-sm text-red-600 dark:text-red-400 mb-1">
                      Toplam {type === "receivable" ? "Alacak" : "Borç"}
                    </p>
                    <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                      {formatCurrency(customer.total_debt_eur || 0, "EUR")}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-950/30 rounded-lg">
                    <p className="text-sm text-green-600 dark:text-green-400 mb-1">
                      Toplam Ödeme
                    </p>
                    <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                      {formatCurrency(customer.total_payments_eur || 0, "EUR")}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                    <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">
                      Kalan {type === "receivable" ? "Alacak" : "Borç"}
                    </p>
                    <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                      {formatCurrency(customer.remaining_debt_eur || 0, "EUR")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Warning Messages */}
              {((customer.remaining_debt_try || 0) > 0 ||
                (customer.remaining_debt_usd || 0) > 0 ||
                (customer.remaining_debt_eur || 0) > 0) && (
                <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg flex items-center gap-2">
                  <BanknoteX className="text-amber-800 dark:text-amber-400" />
                  <p className="text-amber-800 dark:text-amber-300 text-sm font-medium">
                    {type === "receivable"
                      ? "Bu müşteriden tahsil etmeniz gereken bakiye bulunmaktadır."
                      : "Bu müşteriye ödemeniz gereken bakiye bulunmaktadır."}
                  </p>
                </div>
              )}
              {((customer.remaining_debt_try || 0) < 0 ||
                (customer.remaining_debt_usd || 0) < 0 ||
                (customer.remaining_debt_eur || 0) < 0) && (
                <div className="mt-4 p-3 bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 rounded-lg flex items-center gap-2">
                  <BanknoteX className="text-sky-800 dark:text-sky-400" />
                  <p className="text-sky-800 dark:text-sky-300 text-sm font-medium">
                    {type === "receivable"
                      ? "Bu müşteriye fazladan tahsilat yapılmıştır."
                      : "Bu müşteriden fazladan ödeme alınmıştır."}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
