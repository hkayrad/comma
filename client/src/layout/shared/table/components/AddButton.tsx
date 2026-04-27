import { Button } from "@/components/ui/button";
import { useEntityDialogs } from "@/hooks/use-entity-dialogs";
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
  Menu,
  MenuPanel,
  MenuGroup,
  MenuItem,
  MenuGroupLabel,
  MenuTrigger,
} from "@/components/animate-ui/components/base/menu";
import { useLocation } from "react-router";
import { useTranslation } from "react-i18next";

export default function AddButton() {
  const { openCustomerDialog, openDebtDialog, openPaymentDialog } =
    useEntityDialogs();
  const location = useLocation();
  const { t } = useTranslation();

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleAddMenu = useCallback(() => {
    setIsMenuOpen(!isMenuOpen);
  }, [isMenuOpen]);

  const handleAddReceivableCustomer = useCallback(() => {
    toggleAddMenu();
    openCustomerDialog({
      title: t("dialog.receivableCustomer.add.title"),
      description: t("dialog.receivableCustomer.add.description"),
      size: "3xl",
      content: <CustomerDialog type="receivable" />,
      showCloseButton: true,
    });
  }, [openCustomerDialog, toggleAddMenu, t]);

  const handleAddReceivableDebt = useCallback(() => {
    toggleAddMenu();
    openDebtDialog({
      title: t("dialog.receivable.add.title"),
      description: t("dialog.receivable.add.description"),
      size: "3xl",
      content: <DebtDialog type="receivable" />,
      showCloseButton: true,
    });
  }, [openDebtDialog, toggleAddMenu, t]);

  const handleAddReceivablePayment = useCallback(() => {
    toggleAddMenu();
    openPaymentDialog({
      title: t("dialog.receivablePayment.add.title"),
      description: t("dialog.receivablePayment.add.description"),
      size: "3xl",
      content: <PaymentDialog type="receivable" />,
      showCloseButton: true,
    });
  }, [openPaymentDialog, toggleAddMenu, t]);

  const handleAddPayableCustomer = useCallback(() => {
    toggleAddMenu();
    openCustomerDialog({
      title: t("dialog.payableCustomer.add.title"),
      description: t("dialog.payableCustomer.add.description"),
      size: "3xl",
      content: <CustomerDialog type="payable" />,
      showCloseButton: true,
    });
  }, [openCustomerDialog, toggleAddMenu, t]);

  const handleAddPayableDebt = useCallback(() => {
    toggleAddMenu();
    openDebtDialog({
      title: t("dialog.payable.add.title"),
      description: t("dialog.payable.add.description"),
      size: "3xl",
      content: <DebtDialog type="payable" />,
      showCloseButton: true,
    });
  }, [openDebtDialog, toggleAddMenu, t]);

  const handleAddPayablePayment = useCallback(() => {
    toggleAddMenu();
    openPaymentDialog({
      title: t("dialog.payablePayment.add.title"),
      description: t("dialog.payablePayment.add.description"),
      size: "3xl",
      content: <PaymentDialog type="payable" />,
      showCloseButton: true,
    });
  }, [openPaymentDialog, toggleAddMenu, t]);

  return (
    <>
      <Menu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <Tooltip disableHoverablePopup>
          <TooltipTrigger
            render={(props) => (
              <MenuTrigger
                {...props}
                nativeButton
                render={(props) => (
                  <Button
                    {...props}
                    nativeButton
                    size="default"
                    // className="fixed bottom-4 right-4 z-50"
                  >
                    <Plus
                      className={`transition-transform duration-300 ease ${isMenuOpen ? `-rotate-45` : `rotate-0`}`}
                    />
                    {t("dashboard.addButton.label")}
                  </Button>
                )}
              ></MenuTrigger>
            )}
          ></TooltipTrigger>
          <TooltipContent side="top">
            {t("dashboard.addButton.hover")}
          </TooltipContent>
        </Tooltip>
        <MenuPanel
          className="w-fit bg-transparent! p-0! border-none! space-y-1! shadow-none! overflow-visible"
          side="bottom"
          align="end"
          sideOffset={4}
        >
          {(location.pathname === "/" ||
            location.pathname.startsWith("/alacaklar")) && (
            <MenuGroup className="bg-popover p-1! border! rounded-md! shadow-md">
              <MenuGroupLabel className="relative z-10 text-muted-foreground select-none">
                {t("dashboard.addButton.actions.receivable")}
              </MenuGroupLabel>
              <MenuItem onClick={handleAddReceivableCustomer}>
                <UserPlus2Icon className="mr-2 h-4 w-4" />
                <span>
                  {t("dashboard.addButton.actions.receivable.addCustomer")}
                </span>
              </MenuItem>
              <MenuItem onClick={handleAddReceivableDebt}>
                <ReceiptTurkishLira className="mr-2 h-4 w-4" />
                <span>
                  {t("dashboard.addButton.actions.receivable.addReceivable")}
                </span>
              </MenuItem>
              <MenuItem onClick={handleAddReceivablePayment}>
                <Banknote className="mr-2 h-4 w-4" />
                <span>
                  {t("dashboard.addButton.actions.receivable.addPayment")}
                </span>
              </MenuItem>
            </MenuGroup>
          )}
          {(location.pathname === "/" ||
            location.pathname.startsWith("/borclar")) && (
            <MenuGroup className="bg-popover p-1! border! rounded-md! shadow-md">
              <MenuGroupLabel className="relative z-10 text-muted-foreground select-none">
                {t("dashboard.addButton.actions.payable")}
              </MenuGroupLabel>
              <MenuItem onClick={handleAddPayableCustomer}>
                <UserPlus2Icon className="mr-2 h-4 w-4" />
                <span>
                  {t("dashboard.addButton.actions.payable.addCustomer")}
                </span>
              </MenuItem>
              <MenuItem onClick={handleAddPayableDebt}>
                <ReceiptTurkishLira className="mr-2 h-4 w-4" />
                <span>
                  {t("dashboard.addButton.actions.payable.addPayable")}
                </span>
              </MenuItem>
              <MenuItem onClick={handleAddPayablePayment}>
                <Banknote className="mr-2 h-4 w-4" />
                <span>
                  {t("dashboard.addButton.actions.payable.addPayment")}
                </span>
              </MenuItem>
            </MenuGroup>
          )}
        </MenuPanel>
      </Menu>
    </>
  );
}
