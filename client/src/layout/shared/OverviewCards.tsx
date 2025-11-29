import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PayableDebtApi, ReceivableDebtApi } from "@/lib/api";
import type { AvailableCurrency, OverviewViewType, Totals } from "@/lib/types";
import { copyToClipboard } from "@/lib/utils";
import {
  BadgeAlert,
  BadgeCheck,
  BadgeDollarSignIcon,
  BadgeEuroIcon,
  BadgeTurkishLiraIcon,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

type Props = {
  type: OverviewViewType;
  width?: "full" | "auto";
  align?: "start" | "center" | "end" | "stretch";
  currency: AvailableCurrency | "";
};

export default function OverviewCards(props: Props) {
  const { type, width = "full", align = "center" } = props;
  const currency = "TRY";

  const [receivableTotals, setReceivableTotals] = useState<Totals | null>(null);
  const [payableTotals, setPayableTotals] = useState<Totals | null>(null);
  const [formattedTotals, setFormattedTotals] = useState({
    total_debts: "₺0",
    total_payments: "₺0",
    remaining_debt: "₺0",
  });

  const currencyBadges = useMemo(
    () => ({
      TRY: <BadgeTurkishLiraIcon className="hidden 2xl:block" />,
      USD: <BadgeDollarSignIcon className="hidden 2xl:block" />,
      EUR: <BadgeEuroIcon className="hidden 2xl:block" />,
    }),
    [],
  );

  const fetchReceivableTotals = useCallback(async () => {
    const response = await ReceivableDebtApi.GetTotals(currency);
    if (response) setReceivableTotals(response);
  }, [currency]);

  const fetchPayableTotals = useCallback(async () => {
    const response = await PayableDebtApi.GetTotals(currency);
    if (response) setPayableTotals(response);
  }, [currency]);

  const handleRefresh = useCallback(() => {
    fetchReceivableTotals();
    fetchPayableTotals();
  }, [fetchReceivableTotals, fetchPayableTotals]);

  useEffect(() => {
    handleRefresh();
    window.addEventListener("global:refresh", handleRefresh);
    return () => {
      window.removeEventListener("global:refresh", handleRefresh);
    };
  }, [currency, handleRefresh]);

  useEffect(() => {
    if (type === "receivable") {
      if (receivableTotals) {
        setFormattedTotals({
          total_debts: Number(receivableTotals.total_debts || 0).toLocaleString(
            "tr-TR",
            {
              style: "currency",
              currency: currency,
            },
          ),
          total_payments: Number(
            receivableTotals.total_payments || 0,
          ).toLocaleString("tr-TR", {
            style: "currency",
            currency: currency,
          }),
          remaining_debt: Number(
            receivableTotals.remaining_debt || 0,
          ).toLocaleString("tr-TR", {
            style: "currency",
            currency: currency,
          }),
        });
      }
    } else if (type === "payable") {
      if (payableTotals) {
        setFormattedTotals({
          total_debts: Number(payableTotals.total_debts || 0).toLocaleString(
            "tr-TR",
            {
              style: "currency",
              currency: currency,
            },
          ),
          total_payments: Number(
            payableTotals.total_payments || 0,
          ).toLocaleString("tr-TR", {
            style: "currency",
            currency: currency,
          }),
          remaining_debt: Number(
            payableTotals.remaining_debt || 0,
          ).toLocaleString("tr-TR", {
            style: "currency",
            currency: currency,
          }),
        });
      }
    }
  }, [type, receivableTotals, payableTotals, currency]);

  return (
    <div
      className={`flex items-center gap-4 ${width === "full" ? "w-full" : ""} ${align === "start" ? "justify-start" : align === "center" ? "justify-center" : align === "stretch" ? "justify-between" : "justify-end"} `}
    >
      <Card className="grow w-48 shadow-xs">
        <CardHeader>
          <CardDescription className="text-xs 2xl:text-sm select-none">
            Toplam {type === "receivable" ? "Alacak" : "Borç"}
          </CardDescription>
          <CardTitle
            className="text-xl select-none hover:cursor-copy"
            onClick={() => copyToClipboard(formattedTotals.total_debts)}
          >
            {formattedTotals.total_debts}
          </CardTitle>
          <CardAction>{currencyBadges[currency]}</CardAction>
        </CardHeader>
      </Card>
      <Card className="grow w-48 shadow-xs">
        <CardHeader>
          <CardDescription className="text-xs 2xl:text-sm select-none">
            Ödenmiş {type === "receivable" ? "Alacak" : "Borç"}
          </CardDescription>
          <CardTitle
            className="text-xl text-green-600 select-none hover:cursor-copy"
            onClick={() => copyToClipboard(formattedTotals.total_payments)}
          >
            {formattedTotals.total_payments}
          </CardTitle>
          <CardAction>
            <BadgeCheck className="text-green-600 hidden 2xl:block" />
          </CardAction>
        </CardHeader>
      </Card>
      <Card className="grow w-48 shadow-xs">
        <CardHeader>
          <CardDescription className="text-xs 2xl:text-sm select-none">
            Kalan {type === "receivable" ? "Alacak" : "Borç"}
          </CardDescription>
          <CardTitle
            className="text-xl text-red-500 select-none hover:cursor-copy"
            onClick={() => copyToClipboard(formattedTotals.remaining_debt)}
          >
            {formattedTotals.remaining_debt}
          </CardTitle>
          <CardAction>
            <BadgeAlert className="text-red-500 hidden 2xl:block" />
          </CardAction>
        </CardHeader>
      </Card>
    </div>
  );
}
