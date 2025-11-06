import { TCMBApi } from "@/lib/api/tcmb";
import { useEffect, useState } from "react";
import type { ExchangeRates } from "@/lib/types";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { copyToClipboard } from "@/lib/utils";
import { DollarSign, Euro, PoundSterling } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function ExchangeRates() {

    const [exchangeRates, setExchangeRates] = useState<ExchangeRates | null>(null);

    const fetchExchangeRates = async () => {
        try {
            const response = await TCMBApi.GetExchangeRates();

            if (response)
                setExchangeRates(response);

        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        fetchExchangeRates();
    }, [])

    return (
        <div className="flex gap-2">
            {exchangeRates && (
                <>
                    <Tooltip
                        disableHoverableContent>
                        <TooltipTrigger asChild>
                            <div className="flex gap-2 select-none">
                                <DollarSign size={20} />
                                <p className="text-sm">
                                    Alış:&nbsp;
                                    <span className="hover:cursor-copy" onClick={() => copyToClipboard(exchangeRates.usd.forexBuying)}>{exchangeRates.usd.forexBuying.slice(0, 5)}</span>
                                </p>
                                <p className="text-sm">
                                    Satış:&nbsp;
                                    <span className="hover:cursor-copy" onClick={() => copyToClipboard(exchangeRates.usd.forexSelling)}>{exchangeRates.usd.forexSelling.slice(0, 5)}</span>
                                </p>
                            </div>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                            <span>Amerikan Doları (USD)</span>
                        </TooltipContent>
                    </Tooltip>
                    <Separator orientation="vertical" className="w-px mx-2 !h-4" />
                    <Tooltip
                        disableHoverableContent>
                        <TooltipTrigger asChild>
                            <div className="flex gap-2 select-none">
                                <Euro size={20} />
                                <p className="text-sm">
                                    Alış:&nbsp;
                                    <span className="hover:cursor-copy" onClick={() => copyToClipboard(exchangeRates.eur.forexBuying)}>{exchangeRates.eur.forexBuying.slice(0, 5)}</span>
                                </p>
                                <p className="text-sm">
                                    Satış:&nbsp;
                                    <span className="hover:cursor-copy" onClick={() => copyToClipboard(exchangeRates.eur.forexSelling)}>{exchangeRates.eur.forexSelling.slice(0, 5)}</span>
                                </p>
                            </div>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                            <span>Euro (EUR)</span>
                        </TooltipContent>
                    </Tooltip>
                    <Separator orientation="vertical" className="w-px mx-2 !h-4" />
                    <Tooltip
                        disableHoverableContent>
                        <TooltipTrigger asChild>
                            <div className="flex gap-2 select-none">
                                <PoundSterling size={20} />
                                <p className="text-sm">
                                    Alış:&nbsp;
                                    <span className="hover:cursor-copy" onClick={() => copyToClipboard(exchangeRates.gbp.forexBuying)}>{exchangeRates.gbp.forexBuying.slice(0, 5)}</span>
                                </p>
                                <p className="text-sm">
                                    Satış:&nbsp;
                                    <span className="hover:cursor-copy" onClick={() => copyToClipboard(exchangeRates.gbp.forexSelling)}>{exchangeRates.gbp.forexSelling.slice(0, 5)}</span>
                                </p>
                            </div>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                            <span>Pound Sterling (GBP)</span>
                        </TooltipContent>
                    </Tooltip>
                </>
            )}
        </div>
    )

}