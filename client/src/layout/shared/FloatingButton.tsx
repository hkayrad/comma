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
import DebtDialog from "@/layout/shared/dialog/DebtDialog";
import PaymentDialog from "@/layout/shared/dialog/PaymentDialog";
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

export default function FloatingButton() {
  const { openDialog } = useDialog();
  const location = useLocation();

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleFloatingMenu = useCallback(() => {
    setIsMenuOpen(!isMenuOpen);
  }, [isMenuOpen]);

  const handleAddReceivableCustomer = useCallback(() => {
    toggleFloatingMenu();
    openDialog({
      title: "Müşteri Ekle",
      description: "Yeni müşteri ekleyin",
      size: "3xl",
      content: <CustomerDialog />,
      showCloseButton: true,
    });
  }, [openDialog, toggleFloatingMenu]);

  const handleAddReceivableDebt = useCallback(() => {
    toggleFloatingMenu();
    openDialog({
      title: "Borç Ekle",
      description: "Yeni borç ekleyin",
      size: "3xl",
      content: <DebtDialog />,
      showCloseButton: true,
    });
  }, [openDialog, toggleFloatingMenu]);

  const handleAddReceivablePayment = useCallback(() => {
    toggleFloatingMenu();
    openDialog({
      title: "Ödeme Ekle",
      description: "Yeni ödeme ekleyin",
      size: "3xl",
      content: <PaymentDialog />,
      showCloseButton: true,
    });
  }, [openDialog, toggleFloatingMenu]);

  const handleAddPayableCustomer = useCallback(() => {
    toggleFloatingMenu();
    openDialog({
      title: "Müşteri Ekle",
      description: "Yeni müşteri ekleyin",
      size: "3xl",
      content: <CustomerDialog type="payable" />,
      showCloseButton: true,
    });
  }, [openDialog, toggleFloatingMenu]);

  const handleAddPayableDebt = useCallback(() => {
    toggleFloatingMenu();
    openDialog({
      title: "Borç Ekle",
      description: "Yeni borç ekleyin",
      size: "3xl",
      content: <DebtDialog type="payable" />,
      showCloseButton: true,
    });
  }, [openDialog, toggleFloatingMenu]);

  const handleAddPayablePayment = useCallback(() => {
    toggleFloatingMenu();
    openDialog({
      title: "Ödeme Ekle",
      description: "Yeni ödeme ekleyin",
      size: "3xl",
      content: <PaymentDialog type="payable" />,
      showCloseButton: true,
    });
  }, [openDialog, toggleFloatingMenu]);

  return (
    <>
      <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <Tooltip disableHoverableContent>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button size="icon" className="fixed bottom-4 right-4 z-50">
                <Plus
                  className={`transition-transform duration-300 ease ${isMenuOpen ? `-rotate-45` : `rotate-0`}`}
                />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="left">İşlem menüsünü aç</TooltipContent>
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
              <DropdownMenuLabel className="relative z-10">
                Alacak Eylemleri
              </DropdownMenuLabel>
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
            </DropdownMenuGroup>
          )}
          {(location.pathname === "/" ||
            location.pathname.startsWith("/verecekler")) && (
            <DropdownMenuGroup className="bg-popover !p-1 !border !rounded-md shadow-md">
              <DropdownMenuLabel className="relative z-10">
                Borç Eylemleri
              </DropdownMenuLabel>
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
            </DropdownMenuGroup>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
