import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useEffect, useState } from "react";
import ExchangeRates from "./components/ExchangeRates";
import { Button } from "@/components/ui/button";
import { SidebarClose, SidebarOpen } from "lucide-react";
import { useSidebar } from "@/components/animate-ui/components/radix/sidebar";

export default function Header() {
    const [currentPage, setCurrentPage] = useState<string>("Genel Bakış");

    const { state, toggleSidebar } = useSidebar();

    useEffect(() => {
        const page = sessionStorage.getItem("current_page");
        if (page) {
            setCurrentPage(page);
        }
    }, [sessionStorage.getItem("current_page")]);

    return (
        <header className="border-b p-3 bg-background sticky top-0 z-10">
            <div className="flex w-full items-center">
                <Tooltip
                    disableHoverableContent>
                    <TooltipTrigger asChild>
                        <Button
                            onClick={toggleSidebar}
                            size="icon"
                            variant="ghost"
                            className="size-7"
                        >
                            {state === "collapsed" ? (
                                <SidebarOpen />
                            ) : (
                                <SidebarClose />
                            )}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                        Kenarlığı {state === "collapsed" ? "Aç" : "Kapat"}
                    </TooltipContent>
                </Tooltip>
                <Separator orientation="vertical" className="w-px mr-4 ml-3 !h-4" />
                <p className="whitespace-nowrap text-muted-foreground text-sm">{currentPage}</p>
                <div className="ml-auto mr-2">
                    <ExchangeRates />
                </div>
            </div>
        </header>
    )
}