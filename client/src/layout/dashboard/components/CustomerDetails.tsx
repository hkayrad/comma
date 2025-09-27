import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { CustomerDto } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Mail, MapPin, Phone, Hash, Calendar, BanknoteX } from "lucide-react";

type Props = {
    customer: CustomerDto;
}

export default function CustomerDetails(props: Props) {
    const { customer } = props;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="w-full flex items-center justify-between px-4 gap-8">
                <h1 className="text-2xl font-semibold text-gray-900">{customer.name}</h1>
                <Badge variant={customer.is_company ? "default" : "secondary"}>
                    {customer.is_company ? "Şirket" : "Birey"}
                </Badge>
            </div>

            <Separator />

            {/* Contact Information */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">İletişim Bilgileri</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="flex items-center gap-3">
                            <Phone className="w-4 h-4 text-gray-500" />
                            <div>
                                <p className="text-sm text-gray-500">Telefon</p>
                                <p className="font-medium">{customer.phone || "Belirtilmemiş"}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Mail className="w-4 h-4 text-gray-500" />
                            <div>
                                <p className="text-sm text-gray-500">E-posta</p>
                                <p className="font-medium">{customer.email || "Belirtilmemiş"}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Hash className="w-4 h-4 text-gray-500" />
                            <div>
                                <p className="text-sm text-gray-500">{
                                    customer.is_company ? "Vergi Numarası" : "TC Kimlik Numarası"}</p>
                                <p className="font-medium">{customer.tax_number || "Belirtilmemiş"}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <div>
                                <p className="text-sm text-gray-500">Kayıt Tarihi</p>
                                <p className="font-medium">{formatDate(customer.created_at)}</p>
                            </div>
                        </div>
                        {customer.address && (
                            <div className="flex items-start gap-3 pt-2 col-span-2">
                                <MapPin className="w-4 h-4 text-gray-500 mt-1" />
                                <div>
                                    <p className="text-sm text-gray-500">Adres</p>
                                    <p className="font-medium leading-relaxed">{customer.address}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Financial Summary */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Finansal Özet</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center p-4 bg-red-50 rounded-lg">
                            <p className="text-sm text-red-600 mb-1">Toplam Borç</p>
                            <p className="text-2xl font-bold text-red-700">
                                {formatCurrency(customer.total_debt)}
                            </p>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                            <p className="text-sm text-green-600 mb-1">Toplam Ödeme</p>
                            <p className="text-2xl font-bold text-green-700">
                                {formatCurrency(customer.total_payments)}
                            </p>
                        </div>
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-600 mb-1">Kalan Borç</p>
                            <p className="text-2xl font-bold text-blue-700">
                                {formatCurrency(customer.remaining_debt)}
                            </p>
                        </div>
                    </div>
                    {customer.remaining_debt! > 0 && (
                        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2">
                            <BanknoteX className="text-amber-800" />
                            <p className="text-amber-800 text-sm font-medium">
                                Bu müşterinin ödenmemiş borcu bulunmaktadır.
                            </p>
                        </div>
                    )}
                    {customer.remaining_debt! < 0 && (
                        <div className="mt-4 p-3 bg-sky-50 border border-sky-200 rounded-lg flex items-center gap-2">
                            <BanknoteX className="text-sky-800" />
                            <p className="text-sky-800 text-sm font-medium">
                                Bu müşterinin ödenmiş fazla borcu bulunmaktadır.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}