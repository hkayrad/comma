import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PayableDebtApi, ReceivableDebtApi } from "@/lib/api/debt";
import type { OverviewViewType } from "@comma/common";
import { copyToClipboard } from "@/lib/utils";
import { BadgeAlert, BadgeCheck, BadgeTurkishLiraIcon } from "lucide-react";
import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient } from "@tanstack/react-query";

type Props = {
  type: OverviewViewType;
  width?: "full" | "auto";
  align?: "start" | "center" | "end" | "stretch";
};

export default function OverviewCards(props: Props) {
  const { type, width = "full" } = props;
  const currency = "TRY";

  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { data: totals, isLoading } = useQuery({
    queryKey: ["totals", type, currency],
    queryFn: async () => {
      if (type === "receivable") {
        return await ReceivableDebtApi.GetTotals(currency);
      } else {
        return await PayableDebtApi.GetTotals(currency);
      }
    },
    staleTime: 30000, // 30 seconds
    gcTime: 1000 * 60 * 5, // 5 minutes
  });

  useEffect(() => {
    const handleRefresh = () => {
      queryClient.invalidateQueries({ queryKey: ["totals"] });
    };
    window.addEventListener("global:refresh", handleRefresh);
    return () => {
      window.removeEventListener("global:refresh", handleRefresh);
    };
  }, [queryClient]);

  const formattedTotals = useMemo(() => {
    if (!totals) {
      return {
        total_debts: "₺0",
        total_payments: "₺0",
        remaining_debt: "₺0",
      };
    }

    return {
      total_debts: Number(totals.total_debts || 0).toLocaleString("tr-TR", {
        style: "currency",
        currency: currency,
      }),
      total_payments: Number(totals.total_payments || 0).toLocaleString(
        "tr-TR",
        {
          style: "currency",
          currency: currency,
        },
      ),
      remaining_debt: Number(totals.remaining_debt || 0).toLocaleString(
        "tr-TR",
        {
          style: "currency",
          currency: currency,
        },
      ),
    };
  }, [totals, currency]);

  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-3 gap-3 ${width === "full" ? "w-full" : ""}`}
    >
      <Card className="w-full shadow-xs">
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
      <Card className="w-full shadow-xs">
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
      <Card className="w-full shadow-xs">
        <CardHeader>
          <CardDescription className="text-xs 2xl:text-sm 2xl:h-6 2xl:py-0.5 select-none">
            {t("overviewCards.remaining", {
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
