import { Card, CardAction, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DebtApi } from "@/lib/api";
import type { Totals } from "@/lib/types";
import { BadgeAlert, BadgeCheck, BadgeTurkishLiraIcon } from "lucide-react";
import { useEffect, useState } from "react";

export default function OverviewCards() {
    const [totals, setTotals] = useState<Totals | null>(null);

    const fetchTotals = async () => {
        const response = await DebtApi.GetTotals();
        if (response)
            setTotals(response);
    }

    const handleRefresh = () => {
        fetchTotals();
    }

    useEffect(() => {
        handleRefresh();
        window.addEventListener("global:refresh", handleRefresh);
        return () => {
            window.removeEventListener("global:refresh", handleRefresh);
        }
    }, [])

    return (
        <div className="ml-auto flex items-center gap-4">
            <Card className="w-64">
                <CardHeader>
                    <CardDescription>Toplam Borç</CardDescription>
                    <CardTitle className="text-2xl">{
                        Number(totals?.total_debts || 0)
                            .toLocaleString("tr-TR", {
                                style: "currency",
                                currency: "TRY"
                            })}</CardTitle>
                    <CardAction>
                        <BadgeTurkishLiraIcon />
                    </CardAction>
                </CardHeader>
            </Card>
            <Card className="w-64">
                <CardHeader>
                    <CardDescription>Ödenmiş Borç</CardDescription>
                    <CardTitle className="text-2xl text-green-600">{
                        Number(totals?.total_payments || 0)
                            .toLocaleString("tr-TR", {
                                style: "currency",
                                currency: "TRY"
                            })}</CardTitle>
                    <CardAction>
                        <BadgeCheck className="text-green-600" />
                    </CardAction>
                </CardHeader>
            </Card>
            <Card className="w-64">
                <CardHeader>
                    <CardDescription>Kalan Borç</CardDescription>
                    <CardTitle className="text-2xl text-red-500">{
                        Number(totals?.remaining_debt || 0)
                            .toLocaleString("tr-TR", {
                                style: "currency",
                                currency: "TRY"
                            })}</CardTitle>
                    <CardAction>
                        <BadgeAlert className="text-red-500" />
                    </CardAction>
                </CardHeader>
            </Card>
        </div>
    )
}