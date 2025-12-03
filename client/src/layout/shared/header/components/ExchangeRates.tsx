import { TCMBApi } from "@/lib/api/tcmb";
import { useCallback, useEffect, useState } from "react";
import type { ExchangeRates } from "@/lib/types";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { copyToClipboard } from "@/lib/utils";
import { DollarSign, Euro } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Logger } from "@/lib/utils/logger";
import { Skeleton } from "@/components/ui/skeleton";

export default function ExchangeRates() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates | null>(
    null,
  );

  const fetchExchangeRates = useCallback(async () => {
    try {
      const response = await TCMBApi.GetExchangeRates();

      if (response) {
        setExchangeRates(response);
        sessionStorage.setItem("exchangeRates", JSON.stringify(response));
      }
    } catch (error) {
      Logger.error(error);
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsLoading(true);
    await Promise.all([fetchExchangeRates()]);
    setIsLoading(false);
  }, [fetchExchangeRates]);

  useEffect(() => {
    handleRefresh();
  }, [fetchExchangeRates, handleRefresh]);

  return !isLoading ? (
    <div className="flex gap-2">
      {exchangeRates ? (
        <>
          <Tooltip disableHoverableContent>
            <TooltipTrigger asChild>
              <p className="text-muted-foreground text-[10px] my-auto mr-1 select-none">
                Son Güncelleme: {exchangeRates.date.replaceAll("-", "/")}
              </p>
            </TooltipTrigger>
            <TooltipContent side="left">
              <span>
                {exchangeRates.date.replaceAll("-", "/")} günü için, Türkiye
                Cumhuriyeti Merkez Bankası tarafından belirlenmiş kur bilgileri
              </span>
            </TooltipContent>
          </Tooltip>
          <Tooltip disableHoverableContent>
            <TooltipTrigger asChild>
              <div className="flex gap-2 select-none">
                <DollarSign size={20} />
                <p className="text-sm">
                  Alış:&nbsp;
                  <span
                    className="hover:cursor-copy"
                    onClick={() =>
                      copyToClipboard(exchangeRates.usd.forexBuying)
                    }
                  >
                    {exchangeRates.usd.forexBuying}
                  </span>
                </p>
                <p className="text-sm">
                  Satış:&nbsp;
                  <span
                    className="hover:cursor-copy"
                    onClick={() =>
                      copyToClipboard(exchangeRates.usd.forexSelling)
                    }
                  >
                    {exchangeRates.usd.forexSelling}
                  </span>
                </p>
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <span>Amerikan Doları (USD)</span>
            </TooltipContent>
          </Tooltip>
          <Separator orientation="vertical" className="w-px mx-2 !h-4" />
          <Tooltip disableHoverableContent>
            <TooltipTrigger asChild>
              <div className="flex gap-2 select-none">
                <Euro size={20} />
                <p className="text-sm">
                  Alış:&nbsp;
                  <span
                    className="hover:cursor-copy"
                    onClick={() =>
                      copyToClipboard(exchangeRates.eur.forexBuying)
                    }
                  >
                    {exchangeRates.eur.forexBuying}
                  </span>
                </p>
                <p className="text-sm">
                  Satış:&nbsp;
                  <span
                    className="hover:cursor-copy"
                    onClick={() =>
                      copyToClipboard(exchangeRates.eur.forexSelling)
                    }
                  >
                    {exchangeRates.eur.forexSelling}
                  </span>
                </p>
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <span>Euro (EUR)</span>
            </TooltipContent>
          </Tooltip>
        </>
      ) : (
        <p className="text-muted-foreground text-[10px] select-none">
          Merkez Bankası verileri mevcut değildir.
        </p>
      )}
    </div>
  ) : (
    <Skeleton className="h-4 w-96" />
  );
}
