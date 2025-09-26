import { Button } from "@/components/ui/button";
import { useDialog } from "@/contexts/DialogContext";
import { Banknote, Plus, ReceiptTurkishLira, UserPlus2Icon } from "lucide-react";
import { useState } from "react";
import CustomerDialog from "./dialog/CustomerDialog";
import DebtDialog from "./dialog/DebtDialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import PaymentDialog from "./dialog/PaymentDialog";

export default function FloatingButton() {
    const { openDialog } = useDialog();

    const [isFloatingMenuOpen, setIsFloatingMenuOpen] = useState(false);

    const toggleFloatingMenu = () => {
        setIsFloatingMenuOpen(!isFloatingMenuOpen);
    };

    const handleAddCustomer = () => {
        toggleFloatingMenu();
        openDialog({
            title: "Müşteri Ekle",
            description: "Yeni müşteri ekleyin",
            size: "3xl",
            content: (
                <CustomerDialog />
            ),
            showCloseButton: true,
        });
    }

    const handleAddDebt = () => {
        toggleFloatingMenu();
        openDialog({
            title: "Borç Ekle",
            description: "Yeni borç ekleyin",
            size: "3xl",
            content: (
                <DebtDialog />
            ),
            showCloseButton: true,
        });
    }

    const handleAddPayment = () => {
        toggleFloatingMenu();
        openDialog({
            title: "Ödeme Ekle",
            description: "Yeni ödeme ekleyin",
            size: "3xl",
            content: (
                <PaymentDialog />
            ),
            showCloseButton: true,
        });
    }

    return (
        <>
            <Tooltip disableHoverableContent>
                <TooltipTrigger asChild>
                    <Button
                        onClick={handleAddPayment}
                        className={`fixed bottom-40 right-4 z-50 transition-all duration-300 ease ${isFloatingMenuOpen
                            ? 'translate-x-0 opacity-100 scale-100 delay-225'
                            : 'translate-x-[200px] opacity-0 scale-95 pointer-events-none delay-75'
                            }`}
                    >
                        <Banknote />
                        Ödeme Ekle
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                    Yeni bir ödeme ekle
                </TooltipContent>
            </Tooltip >
            <Tooltip disableHoverableContent>
                <TooltipTrigger asChild>
                    <Button
                        onClick={handleAddDebt}
                        className={`fixed bottom-28 right-4 z-50 transition-all duration-300 ease ${isFloatingMenuOpen
                            ? 'translate-x-0 opacity-100 scale-100 delay-150'
                            : 'translate-x-[200px] opacity-0 scale-95 pointer-events-none delay-150'
                            }`}
                    >
                        <ReceiptTurkishLira />
                        Borç Ekle
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                    Yeni bir borç ekle
                </TooltipContent>
            </Tooltip >
            <Tooltip disableHoverableContent>
                <TooltipTrigger asChild>
                    <Button
                        onClick={handleAddCustomer}
                        className={`fixed bottom-16 right-4 z-50 transition-all duration-300 ease ${isFloatingMenuOpen
                            ? 'translate-x-0 opacity-100 scale-100 delay-75'
                            : 'translate-x-[200px] opacity-0 scale-95 pointer-events-none delay-225'
                            }`}
                    >
                        <UserPlus2Icon />
                        Müşteri Ekle
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                    Yeni bir müşteri ekle
                </TooltipContent>
            </Tooltip>
            <Tooltip disableHoverableContent>
                <TooltipTrigger asChild>
                    <Button
                        onClick={toggleFloatingMenu}
                        size="icon"
                        className="fixed bottom-4 right-4 z-50"
                    >
                        <Plus
                            className={`transition-transform duration-300 ease scale-125 ${isFloatingMenuOpen ? 'rotate-45' : 'rotate-0'}`}
                        />
                    </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                    İşlem menüsünü {isFloatingMenuOpen ? 'kapat' : 'aç'}
                </TooltipContent>
            </Tooltip>
        </>
    );
}