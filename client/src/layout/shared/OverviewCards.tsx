import { Card, CardAction, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PayableDebtApi, ReceivableDebtApi } from "@/lib/api";
import type { OverviewViewType, Totals } from "@/lib/types";
import { copyToClipboard } from "@/lib/utils";
import { BadgeAlert, BadgeCheck, BadgeTurkishLiraIcon } from "lucide-react";
import { useEffect, useState } from "react";

type Props = {
    type: OverviewViewType;
    width?: "full" | "auto";
    align?: "start" | "center" | "end" | "stretch";
}

export default function OverviewCards(props: Props) {
    const { type, width = "full", align = "center" } = props;

    const [receivableTotals, setReceivableTotals] = useState<Totals | null>(null);
    const [payableTotals, setPayableTotals] = useState<Totals | null>(null);
    const [formattedTotals, setFormattedTotals] = useState({
        total_debts: "₺0",
        total_payments: "₺0",
        remaining_debt: "₺0"
    });

    const fetchReceivableTotals = async () => {
        const response = await ReceivableDebtApi.GetTotals();
        if (response)
            setReceivableTotals(response);
    }

    const fetchPayableTotals = async () => {
        const response = await PayableDebtApi.GetTotals();
        if (response)
            setPayableTotals(response);
    }

    const handleRefresh = () => {
        fetchReceivableTotals();
        fetchPayableTotals();
    }

    useEffect(() => {
        handleRefresh();
        window.addEventListener("global:refresh", handleRefresh);
        return () => {
            window.removeEventListener("global:refresh", handleRefresh);
        }
    }, [])

    useEffect(() => {
        if (type === "receivable") {
            if (receivableTotals) {
                setFormattedTotals({
                    total_debts: Number(receivableTotals.total_debts || 0).toLocaleString("tr-TR", {
                        style: "currency",
                        currency: "TRY"
                    }),
                    total_payments: Number(receivableTotals.total_payments || 0).toLocaleString("tr-TR", {
                        style: "currency",
                        currency: "TRY"
                    }),
                    remaining_debt: Number(receivableTotals.remaining_debt || 0).toLocaleString("tr-TR", {
                        style: "currency",
                        currency: "TRY"
                    })
                });
            }
        } else if (type === "payable") {
            if (payableTotals) {
                setFormattedTotals({
                    total_debts: Number(payableTotals.total_debts || 0).toLocaleString("tr-TR", {
                        style: "currency",
                        currency: "TRY"
                    }),
                    total_payments: Number(payableTotals.total_payments || 0).toLocaleString("tr-TR", {
                        style: "currency",
                        currency: "TRY"
                    }),
                    remaining_debt: Number(payableTotals.remaining_debt || 0).toLocaleString("tr-TR", {
                        style: "currency",
                        currency: "TRY"
                    })
                });
            }
        }
    }, [type, receivableTotals])

    return (
        <div className={`flex items-center gap-4 ${width === "full" ? "w-full" : ""} ${align === "start" ? "justify-start" : align === "center" ? "justify-center" : align === "stretch" ? "justify-between" : "justify-end"}`}>
            <Card className="w-64">
                <CardHeader>
                    <CardDescription>Toplam {type === "receivable" ? "Alacak" : "Borç"}</CardDescription>
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
                    <CardDescription>Ödenmiş {type === "receivable" ? "Alacak" : "Borç"}</CardDescription>
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
                    <CardDescription>Kalan {type === "receivable" ? "Alacak" : "Borç"}</CardDescription>
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