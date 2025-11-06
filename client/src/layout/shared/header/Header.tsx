import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useEffect, useState } from "react";
import ExchangeRates from "./components/ExchangeRates";

type Props = {
    isSidebarOpen: boolean;
}

export default function Header(props: Props) {
    const { isSidebarOpen } = props;

    const [currentPage, setCurrentPage] = useState<string>("Genel Bakış");

    useEffect(() => {
        const page = sessionStorage.getItem("current_page");
        if (page) {
            setCurrentPage(page);
        }
    }, [sessionStorage.getItem("current_page")]);

    return (
        <header className="border-b p-3">
            <div className="flex w-full items-center">
                <Tooltip
                    disableHoverableContent>
                    <TooltipTrigger asChild>
                        <SidebarTrigger />
                    </TooltipTrigger>
                    <TooltipContent side="right">
                        Kenarlığı {isSidebarOpen ? "Kapat" : "Aç"}s
                    </TooltipContent>
                </Tooltip>
                <Separator orientation="vertical" className="w-px mr-4 ml-3 !h-4" />
                <p className="">{currentPage}</p>
                <div className="ml-auto mr-2">
                    <ExchangeRates />
                </div>
            </div>
        </header>
    )
}