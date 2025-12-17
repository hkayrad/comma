import { Button } from "@/components/ui/button";
import { useDialog } from "@/contexts/dialog";
import {
    Banknote,
    Plus,
    ReceiptTurkishLira,
    UserPlus2Icon,
} from "lucide-react";
import { useCallback, useState } from "react";
import CustomerDialog from "@/layout/shared/dialog/CustomerDialog";
import DebtDialog from "@/layout/debts/components/DebtDialog";
import PaymentDialog from "@/layout/payments/components/PaymentDialog";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/animate-ui/components/radix/dropdown-menu";
import { useLocation } from "react-router";
import { useTranslation } from "react-i18next";

export default function FloatingButton() {
    const { openDialog } = useDialog();
    const location = useLocation();
    const { t } = useTranslation();

    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleFloatingMenu = useCallback(() => {
        setIsMenuOpen(!isMenuOpen);
    }, [isMenuOpen]);

    const handleAddReceivableCustomer = useCallback(() => {
        toggleFloatingMenu();
        openDialog({
            title: t("dialog.receivableCustomer.add.title"),
            description: t("dialog.receivableCustomer.add.description"),
            size: "3xl",
            content: <CustomerDialog type="receivable" />,
            showCloseButton: true,
        });
    }, [openDialog, toggleFloatingMenu, t]);

    const handleAddReceivableDebt = useCallback(() => {
        toggleFloatingMenu();
        openDialog({
            title: t("dialog.receivable.add.title"),
            description: t("dialog.receivable.add.description"),
            size: "3xl",
            content: <DebtDialog type="receivable" />,
            showCloseButton: true,
        });
    }, [openDialog, toggleFloatingMenu, t]);

    const handleAddReceivablePayment = useCallback(() => {
        toggleFloatingMenu();
        openDialog({
            title: t("dialog.receivablePayment.add.title"),
            description: t("dialog.receivablePayment.add.description"),
            size: "3xl",
            content: <PaymentDialog type="receivable" />,
            showCloseButton: true,
        });
    }, [openDialog, toggleFloatingMenu, t]);

    const handleAddPayableCustomer = useCallback(() => {
        toggleFloatingMenu();
        openDialog({
            title: t("dialog.payableCustomer.add.title"),
            description: t("dialog.payableCustomer.add.description"),
            size: "3xl",
            content: <CustomerDialog type="payable" />,
            showCloseButton: true,
        });
    }, [openDialog, toggleFloatingMenu, t]);

    const handleAddPayableDebt = useCallback(() => {
        toggleFloatingMenu();
        openDialog({
            title: t("dialog.payable.add.title"),
            description: t("dialog.payable.add.description"),
            size: "3xl",
            content: <DebtDialog type="payable" />,
            showCloseButton: true,
        });
    }, [openDialog, toggleFloatingMenu, t]);

    const handleAddPayablePayment = useCallback(() => {
        toggleFloatingMenu();
        openDialog({
            title: t("dialog.payablePayment.add.title"),
            description: t("dialog.payablePayment.add.description"),
            size: "3xl",
            content: <PaymentDialog type="payable" />,
            showCloseButton: true,
        });
    }, [openDialog, toggleFloatingMenu, t]);

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
                                <Plus
                                    className={`transition-transform duration-300 ease ${isMenuOpen ? `-rotate-45` : `rotate-0`}`}
                                />
                            </Button>
                        </DropdownMenuTrigger>
                    </TooltipTrigger>
                    <TooltipContent side="left">
                        {t("dashboard.floatingButton.hover")}
                    </TooltipContent>
                </Tooltip>
                <DropdownMenuContent
                    className="w-fit !bg-transparent !p-0 !border-none !space-y-1 !shadow-none overflow-visible"
                    side="top"
                    align="end"
                    sideOffset={4}
                >
                    {(location.pathname === "/" ||
                        location.pathname.startsWith("/alacaklar")) && (
                        <DropdownMenuGroup className="bg-popover !p-1 !border !rounded-md shadow-md">
                            <DropdownMenuLabel className="relative z-10 text-muted-foreground select-none">
                                {t(
                                    "dashboard.floatingButton.actions.receivable",
                                )}
                            </DropdownMenuLabel>
                            <DropdownMenuItem
                                onClick={handleAddReceivableCustomer}
                            >
                                <UserPlus2Icon className="mr-2 h-4 w-4" />
                                <span>
                                    {t(
                                        "dashboard.floatingButton.actions.receivable.addCustomer",
                                    )}
                                </span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleAddReceivableDebt}>
                                <ReceiptTurkishLira className="mr-2 h-4 w-4" />
                                <span>
                                    {t(
                                        "dashboard.floatingButton.actions.receivable.addReceivable",
                                    )}
                                </span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={handleAddReceivablePayment}
                            >
                                <Banknote className="mr-2 h-4 w-4" />
                                <span>
                                    {t(
                                        "dashboard.floatingButton.actions.receivable.addPayment",
                                    )}
                                </span>
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                    )}
                    {(location.pathname === "/" ||
                        location.pathname.startsWith("/verecekler")) && (
                        <DropdownMenuGroup className="bg-popover !p-1 !border !rounded-md shadow-md">
                            <DropdownMenuLabel className="relative z-10 text-muted-foreground select-none">
                                {t("dashboard.floatingButton.actions.payable")}
                            </DropdownMenuLabel>
                            <DropdownMenuItem
                                onClick={handleAddPayableCustomer}
                            >
                                <UserPlus2Icon className="mr-2 h-4 w-4" />
                                <span>
                                    {t(
                                        "dashboard.floatingButton.actions.payable.addCustomer",
                                    )}
                                </span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleAddPayableDebt}>
                                <ReceiptTurkishLira className="mr-2 h-4 w-4" />
                                <span>
                                    {t(
                                        "dashboard.floatingButton.actions.payable.addPayable",
                                    )}
                                </span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleAddPayablePayment}>
                                <Banknote className="mr-2 h-4 w-4" />
                                <span>
                                    {t(
                                        "dashboard.floatingButton.actions.payable.addPayment",
                                    )}
                                </span>
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
}
