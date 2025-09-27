import { Card, CardAction, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DebtApi } from "@/lib/api";
import type { Totals } from "@/lib/types";
import { copyToClipboard } from "@/lib/utils";
import { BadgeAlert, BadgeCheck, BadgeTurkishLiraIcon } from "lucide-react";
import { useEffect, useState } from "react";

export default function OverviewCards() {
    const [totals, setTotals] = useState<Totals | null>(null);
    const [formattedTotals, setFormattedTotals] = useState({
        total_debts: "₺0",
        total_payments: "₺0",
        remaining_debt: "₺0"
    });

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

    useEffect(() => {
        if (totals) {
            setFormattedTotals({
                total_debts: Number(totals.total_debts || 0).toLocaleString("tr-TR", {
                    style: "currency",
                    currency: "TRY"
                }),
                total_payments: Number(totals.total_payments || 0).toLocaleString("tr-TR", {
                    style: "currency",
                    currency: "TRY"
                }),
                remaining_debt: Number(totals.remaining_debt || 0).toLocaleString("tr-TR", {
                    style: "currency",
                    currency: "TRY"
                })
            });
        }
    }, [totals])

    return (
        <div className="ml-auto flex items-center gap-4">
            <Card className="w-64">
                <CardHeader>
                    <CardDescription>Toplam Borç</CardDescription>
                    <CardTitle
                        className="text-2xl select-none hover:cursor-copy"
                        onClick={() => copyToClipboard(formattedTotals.total_debts)}
                    >
                        {formattedTotals.total_debts}
                    </CardTitle>
                    <CardAction>
                        <BadgeTurkishLiraIcon />
                    </CardAction>
                </CardHeader>
            </Card>
            <Card className="w-64">
                <CardHeader>
                    <CardDescription>Ödenmiş Borç</CardDescription>
                    <CardTitle
                        className="text-2xl text-green-600 select-none hover:cursor-copy"
                        onClick={() => copyToClipboard(formattedTotals.total_payments)}
                    >
                        {formattedTotals.total_payments}
                    </CardTitle>
                    <CardAction>
                        <BadgeCheck className="text-green-600" />
                    </CardAction>
                </CardHeader>
            </Card>
            <Card className="w-64">
                <CardHeader>
                    <CardDescription>Kalan Borç</CardDescription>
                    <CardTitle
                        className="text-2xl text-red-500 select-none hover:cursor-copy"
                        onClick={() => copyToClipboard(formattedTotals.remaining_debt)}
                    >
                        {formattedTotals.remaining_debt}
                    </CardTitle>
                    <CardAction>
                        <BadgeAlert className="text-red-500" />
                    </CardAction>
                </CardHeader>
            </Card>
        </div>
    )
}