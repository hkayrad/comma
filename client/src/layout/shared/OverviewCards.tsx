import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PayableDebtApi, ReceivableDebtApi } from "@/lib/api/debt";
import type { OverviewViewType, Totals } from "@/lib/types";
import { copyToClipboard } from "@/lib/utils";
import { BadgeAlert, BadgeCheck, BadgeTurkishLiraIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

type Props = {
  type: OverviewViewType;
  width?: "full" | "auto";
  align?: "start" | "center" | "end" | "stretch";
};

export default function OverviewCards(props: Props) {
  const { type, width = "full", align = "center" } = props;
  const currency = "TRY";

  const { t } = useTranslation();

  const [isLoading, setIsLoading] = useState(true);
  const [receivableTotals, setReceivableTotals] = useState<Totals | null>(null);
  const [payableTotals, setPayableTotals] = useState<Totals | null>(null);
  const [formattedTotals, setFormattedTotals] = useState({
    total_debts: "₺0",
    total_payments: "₺0",
    remaining_debt: "₺0",
  });

  const fetchReceivableTotals = useCallback(async () => {
    const response = await ReceivableDebtApi.GetTotals(currency);
    if (response) setReceivableTotals(response);
  }, [currency]);

  const fetchPayableTotals = useCallback(async () => {
    const response = await PayableDebtApi.GetTotals(currency);
    if (response) setPayableTotals(response);
  }, [currency]);

  const handleRefresh = useCallback(async () => {
    setIsLoading(true);
    await Promise.all([fetchReceivableTotals(), fetchPayableTotals()]);
    setIsLoading(false);
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
          <CardDescription className="text-xs 2xl:text-sm 2xl:h-6 2xl:py-0.5 select-none">
            {t("overviewCards.total", {
              state:
                type === "receivable"
                  ? t("vars.receivable")
                  : t("vars.payable"),
            })}
          </CardDescription>
          <CardTitle
            className="text-xl select-none hover:cursor-copy"
            onClick={() => copyToClipboard(formattedTotals.total_debts, t)}
          >
            {isLoading ? (
              <Skeleton className="h-7 w-full" />
            ) : (
              formattedTotals.total_debts
            )}
          </CardTitle>
          <CardAction>
            <BadgeTurkishLiraIcon size={"1.5rem"} />
          </CardAction>
        </CardHeader>
      </Card>
      <Card className="grow w-48 shadow-xs">
        <CardHeader>
          <CardDescription className="text-xs 2xl:text-sm 2xl:h-6 2xl:py-0.5 select-none">
            {t("overviewCards.paid", {
              state:
                type === "receivable"
                  ? t("vars.receivable")
                  : t("vars.payable"),
            })}
          </CardDescription>
          <CardTitle
            className="text-xl text-green-600 select-none hover:cursor-copy"
            onClick={() => copyToClipboard(formattedTotals.total_payments, t)}
          >
            {isLoading ? (
              <Skeleton className="h-7 w-full" />
            ) : (
              formattedTotals.total_payments
            )}
          </CardTitle>
          <CardAction>
            <BadgeCheck size={"1.5rem"} className="text-green-600" />
          </CardAction>
        </CardHeader>
      </Card>
      <Card className="grow w-48 shadow-xs">
        <CardHeader>
          <CardDescription className="text-xs 2xl:text-sm 2xl:h-6 2xl:py-0.5 select-none">
            {t("overviewCards.remaning", {
              state:
                type === "receivable"
                  ? t("vars.receivable")
                  : t("vars.payable"),
            })}
          </CardDescription>
          <CardTitle
            className="text-xl text-red-500 select-none hover:cursor-copy"
            onClick={() => copyToClipboard(formattedTotals.remaining_debt, t)}
          >
            {isLoading ? (
              <Skeleton className="h-7 w-full" />
            ) : (
              formattedTotals.remaining_debt
            )}
          </CardTitle>
          <CardAction>
            <BadgeAlert size={"1.5rem"} className="text-red-500" />
          </CardAction>
        </CardHeader>
      </Card>
    </div>
  );
}
