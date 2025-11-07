import { Button } from "@/components/ui/button";
import { useDialog } from "@/contexts/DialogContext";
import { Banknote, Plus, ReceiptTurkishLira, UserPlus2Icon } from "lucide-react";
import { useState } from "react";
import CustomerDialog from "./dialog/CustomerDialog";
import DebtDialog from "./dialog/DebtDialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import PaymentDialog from "./dialog/PaymentDialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useLocation } from "react-router";

export default function FloatingButton() {
    const { openDialog } = useDialog();
    const location = useLocation();

    const [isMenuOpen, setIsMenuOpen] = useState(false);


    const toggleFloatingMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleAddReceivableCustomer = () => {
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

    const handleAddReceivableDebt = () => {
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

    const handleAddReceivablePayment = () => {
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

    const handleAddPayableCustomer = () => {
        toggleFloatingMenu();
        openDialog({
            title: "Müşteri Ekle",
            description: "Yeni müşteri ekleyin",
            size: "3xl",
            content: (
                <CustomerDialog type="payable" />
            ),
            showCloseButton: true,
        });
    }

    const handleAddPayableDebt = () => {
        toggleFloatingMenu();
        openDialog({
            title: "Borç Ekle",
            description: "Yeni borç ekleyin",
            size: "3xl",
            content: (
                <DebtDialog type="payable" />
            ),
            showCloseButton: true,
        });
    }

    const handleAddPayablePayment = () => {
        toggleFloatingMenu();
        openDialog({
            title: "Ödeme Ekle",
            description: "Yeni ödeme ekleyin",
            size: "3xl",
            content: (
                <PaymentDialog type="payable" />
            ),
            showCloseButton: true,
        });
    }

    return (
        <>
            <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <Tooltip disableHoverableContent>
                    <TooltipTrigger asChild>
                        <DropdownMenuTrigger asChild>
                            <Button
                                size="icon"
                                className="fixed bottom-4 right-4 z-50"
                            >
                                <Plus className={`transition-transform duration-300 ease ${isMenuOpen ? `-rotate-45` : `rotate-0`}`} />
                            </Button>
                        </DropdownMenuTrigger>
                    </TooltipTrigger>
                    <TooltipContent side="left">
                        İşlem menüsünü aç
                    </TooltipContent>
                </Tooltip>
                <DropdownMenuContent
                    className="w-fit !bg-transparent !p-0 !border-none !space-y-1 !shadow-none overflow-visible"
                    side="left"
                    align="end"
                    sideOffset={4}
                >
                    {(location.pathname === "/" || location.pathname.startsWith("/alacaklar")) &&
                        <DropdownMenuGroup className="bg-popover !p-1 !border !rounded-md shadow-md">
                            <DropdownMenuLabel>Alacak Eylemleri</DropdownMenuLabel>
                            <DropdownMenuItem onClick={handleAddReceivableCustomer}>
                                <UserPlus2Icon className="mr-2 h-4 w-4" />
                                <span>Müşteri Ekle</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleAddReceivableDebt}>
                                <ReceiptTurkishLira className="mr-2 h-4 w-4" />
                                <span>Borç Ekle</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleAddReceivablePayment}>
                                <Banknote className="mr-2 h-4 w-4" />
                                <span>Ödeme Ekle</span>
                            </DropdownMenuItem>
                        </DropdownMenuGroup>}
                    {(location.pathname === "/" || location.pathname.startsWith("/verecekler")) &&
                        <DropdownMenuGroup className="bg-popover !p-1 !border !rounded-md shadow-md">
                            <DropdownMenuLabel>Borç Eylemleri</DropdownMenuLabel>
                            <DropdownMenuItem onClick={handleAddPayableCustomer}>
                                <UserPlus2Icon className="mr-2 h-4 w-4" />
                                <span>Müşteri Ekle</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleAddPayableDebt}>
                                <ReceiptTurkishLira className="mr-2 h-4 w-4" />
                                <span>Borç Ekle</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleAddPayablePayment}>
                                <Banknote className="mr-2 h-4 w-4" />
                                <span>Ödeme Ekle</span>
                            </DropdownMenuItem>
                        </DropdownMenuGroup>}
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
}