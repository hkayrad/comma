import { TCMBApi } from "@/lib/api/tcmb";
import { useEffect, useState } from "react";
import type { ExchangeRates } from "@comma/common";
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
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function ExchangeRates() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates | null>(
    null,
  );
  const { t, i18n } = useTranslation();

  const formatDate = (date: string) => {
    const [day, month, year] = date.split("-");
    return `${month}.${day}.${year}`;
  };

  useEffect(() => {
    let active = true;
    const fetchRates = async () => {
      try {
        const response = await TCMBApi.GetExchangeRates();
        if (response && active) {
          setExchangeRates(response);
          sessionStorage.setItem("exchangeRates", JSON.stringify(response));
        }
      } catch (error) {
        Logger.error(error);
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };
    fetchRates();
    return () => {
      active = false;
    };
  }, []);

  return !isLoading ? (
    <div className="flex items-center gap-2">
      {exchangeRates ? (
        <>
          {/* Mobile compact rates pill */}
          <Popover>
            <PopoverTrigger
              render={(props: any) => (
                <Button
                  {...props}
                  nativeButton
                  variant="secondary"
                  size="sm"
                  className="flex md:hidden items-center gap-1.5 text-[11px] font-medium h-7 px-2 rounded-md select-none"
                >
                  <span className="font-bold text-foreground">$</span>
                  <span>{exchangeRates.usd.forexSelling}</span>
                  <span className="text-muted-foreground/50">|</span>
                  <span className="font-bold text-foreground">€</span>
                  <span>{exchangeRates.eur.forexSelling}</span>
                </Button>
              )}
            />
            <PopoverContent className="w-64 p-3 text-xs" align="end">
              <p className="text-muted-foreground text-[10px] mb-2 font-medium">
                {t("header.exchange.lastUpdate", {
                  date: new Date(
                    formatDate(exchangeRates.date),
                  ).toLocaleDateString(i18n.language),
                })}
              </p>
              <div className="space-y-2">
                <div className="flex justify-between items-center py-1 border-b">
                  <span className="font-semibold flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5" /> USD
                  </span>
                  <div className="text-right">
                    <div>{t("header.exchange.buy")}: {exchangeRates.usd.forexBuying}</div>
                    <div>{t("header.exchange.sell")}: {exchangeRates.usd.forexSelling}</div>
                  </div>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="font-semibold flex items-center gap-1">
                    <Euro className="w-3.5 h-3.5" /> EUR
                  </span>
                  <div className="text-right">
                    <div>{t("header.exchange.buy")}: {exchangeRates.eur.forexBuying}</div>
                    <div>{t("header.exchange.sell")}: {exchangeRates.eur.forexSelling}</div>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Desktop full rates display */}
          <div className="hidden md:flex items-center gap-2">
            <Tooltip disableHoverablePopup>
              <TooltipTrigger
                render={(props) => (
                  <p
                    {...props}
                    className="text-muted-foreground text-[0.625rem] my-auto mr-1 select-none"
                  >
                    {t("header.exchange.lastUpdate", {
                      date: new Date(
                        formatDate(exchangeRates.date),
                      ).toLocaleDateString(i18n.language),
                    })}
                  </p>
                )}
              />
              <TooltipContent side="left">
                <span>
                  {t("header.exchange.lastUpdate.hover", {
                    date: new Date(
                      formatDate(exchangeRates.date),
                    ).toLocaleDateString(i18n.language),
                    tcmb: t("vars.tcmb"),
                  })}
                </span>
              </TooltipContent>
            </Tooltip>
            <Tooltip disableHoverablePopup>
              <TooltipTrigger
                render={(props) => (
                  <div {...props} className="flex gap-2 select-none">
                    <DollarSign size={"1.25rem"} />
                    <p className="text-sm self-center">
                      {t("header.exchange.buy")}:&nbsp;
                      <span
                        className="hover:cursor-copy"
                        onClick={() =>
                          copyToClipboard(exchangeRates.usd.forexBuying, t)
                        }
                      >
                        {exchangeRates.usd.forexBuying}
                      </span>
                    </p>
                    <p className="text-sm self-center">
                      {t("header.exchange.sell")}:&nbsp;
                      <span
                        className="hover:cursor-copy"
                        onClick={() =>
                          copyToClipboard(exchangeRates.usd.forexSelling, t)
                        }
                      >
                        {exchangeRates.usd.forexSelling}
                      </span>
                    </p>
                  </div>
                )}
              />
              <TooltipContent side="bottom">
                <span>{t("vars.usd")}</span>
              </TooltipContent>
            </Tooltip>
            <Separator orientation="vertical" className="w-px mx-2 h-4!" />
            <Tooltip disableHoverablePopup>
              <TooltipTrigger
                render={(props) => (
                  <div {...props} className="flex gap-2 select-none">
                    <Euro size={"1.25rem"} />
                    <p className="text-sm self-center">
                      {t("header.exchange.buy")}:&nbsp;
                      <span
                        className="hover:cursor-copy"
                        onClick={() =>
                          copyToClipboard(exchangeRates.eur.forexBuying, t)
                        }
                      >
                        {exchangeRates.eur.forexBuying}
                      </span>
                    </p>
                    <p className="text-sm self-center">
                      {t("header.exchange.sell")}:&nbsp;
                      <span
                        className="hover:cursor-copy"
                        onClick={() =>
                          copyToClipboard(exchangeRates.eur.forexSelling, t)
                        }
                      >
                        {exchangeRates.eur.forexSelling}
                      </span>
                    </p>
                  </div>
                )}
              />
              <TooltipContent side="bottom">
                <span>{t("vars.eur")}</span>
              </TooltipContent>
            </Tooltip>
          </div>
        </>
      ) : (
        <p className="text-muted-foreground text-[10px] select-none">
          {t("header.exchange.noData", {
            tcmb: t("vars.tcmb"),
          })}
        </p>
      )}
    </div>
  ) : (
    <Skeleton className="h-4 w-24 md:w-96" />
  );
}
