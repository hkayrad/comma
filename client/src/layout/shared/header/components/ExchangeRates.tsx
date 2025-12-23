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
import { useTranslation } from "react-i18next";

export default function ExchangeRates() {
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [exchangeRates, setExchangeRates] = useState<ExchangeRates | null>(
        null,
    );
    const { t } = useTranslation();

    const fetchExchangeRates = useCallback(async () => {
        try {
            const response = await TCMBApi.GetExchangeRates();

            if (response) {
                setExchangeRates(response);
                sessionStorage.setItem(
                    "exchangeRates",
                    JSON.stringify(response),
                );
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
                    <Tooltip disableHoverablePopup>
                        <TooltipTrigger
                            render={(props) => (
                                <p
                                    {...props}
                                    className="text-muted-foreground text-[10px] my-auto mr-1 select-none"
                                >
                                    {t("header.exchange.lastUpdate", {
                                        date: exchangeRates.date.replaceAll(
                                            "-",
                                            "/",
                                        ),
                                    })}
                                </p>
                            )}
                        />
                        <TooltipContent side="left">
                            <span>
                                {t("header.exchange.lastUpdate.hover", {
                                    date: exchangeRates.date.replaceAll(
                                        "-",
                                        "/",
                                    ),
                                    tcmb: t("vars.tcmb"),
                                })}
                            </span>
                        </TooltipContent>
                    </Tooltip>
                    <Tooltip disableHoverablePopup>
                        <TooltipTrigger
                            render={(props) => (
                                <div
                                    {...props}
                                    className="flex gap-2 select-none"
                                >
                                    <DollarSign size={20} />
                                    <p className="text-sm self-center">
                                        {t("header.exchange.buy")}:&nbsp;
                                        <span
                                            className="hover:cursor-copy"
                                            onClick={() =>
                                                copyToClipboard(
                                                    exchangeRates.usd
                                                        .forexBuying,
                                                    t,
                                                )
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
                                                copyToClipboard(
                                                    exchangeRates.usd
                                                        .forexSelling,
                                                    t,
                                                )
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
                    <Separator
                        orientation="vertical"
                        className="w-px mx-2 h-4!"
                    />
                    <Tooltip disableHoverablePopup>
                        <TooltipTrigger
                            render={(props) => (
                                <div
                                    {...props}
                                    className="flex gap-2 select-none"
                                >
                                    <Euro size={20} />
                                    <p className="text-sm self-center">
                                        {t("header.exchange.buy")}:&nbsp;
                                        <span
                                            className="hover:cursor-copy"
                                            onClick={() =>
                                                copyToClipboard(
                                                    exchangeRates.eur
                                                        .forexBuying,
                                                    t,
                                                )
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
                                                copyToClipboard(
                                                    exchangeRates.eur
                                                        .forexSelling,
                                                    t,
                                                )
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
        <Skeleton className="h-4 w-96" />
    );
}
