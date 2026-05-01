import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Component,
  PiggyBank,
  HandCoins,
  Plus,
  Wallet,
  Moon,
  Sun,
  RefreshCw,
} from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { useQueryClient } from "@tanstack/react-query";
import { useEntityDialogs } from "@/hooks/use-entity-dialogs";
import DebtDialog from "@/layout/debts/components/DebtDialog";
import PaymentDialog from "@/layout/payments/components/PaymentDialog";

/**
 * CommaCommandPalette - A global command hub for the Comma application.
 * Triggered via Cmd+K or Ctrl+K.
 */
export function CommaCommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();
  const queryClient = useQueryClient();
  const { openDebtDialog, openPaymentDialog } = useEntityDialogs();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder={t("commandPalette.placeholder", "Type a command or search...")} />
      <CommandList>
        <CommandEmpty>{t("commandPalette.noResults", "No results found.")}</CommandEmpty>
        
        <CommandGroup heading={t("commandPalette.group.navigation", "Navigation")}>
          <CommandItem onSelect={() => runCommand(() => navigate("/"))}>
            <Component className="mr-2 h-4 w-4" />
            <span>{t("sidebar.nonSysAdmin.finance.overview")}</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate("/alacaklar"))}>
            <PiggyBank className="mr-2 h-4 w-4" />
            <span>{t("sidebar.nonSysAdmin.finance.receivableInfo")}</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => navigate("/borclar"))}>
            <HandCoins className="mr-2 h-4 w-4" />
            <span>{t("sidebar.nonSysAdmin.finance.payableInfo")}</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading={t("commandPalette.group.actions", "Actions")}>
          <CommandItem onSelect={() => runCommand(() => openDebtDialog({
            title: t("dialog.debt.add"),
            size: "3xl",
            content: <DebtDialog type="receivable" />,
            showCloseButton: true,
          }))}>
            <Plus className="mr-2 h-4 w-4" />
            <span>{t("dashboard.addButton.actions.receivable.addReceivable")}</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => openPaymentDialog({
            title: t("dialog.payment.add"),
            size: "3xl",
            content: <PaymentDialog type="receivable" />,
            showCloseButton: true,
          }))}>
            <Wallet className="mr-2 h-4 w-4" />
            <span>{t("dashboard.addButton.actions.receivable.addPayment")}</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading={t("commandPalette.group.settings", "Settings")}>
          <CommandItem onSelect={() => runCommand(() => setTheme(theme === "dark" ? "light" : "dark"))}>
            {theme === "dark" ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
            <span>{t("login.changeTheme")}</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => {
            queryClient.invalidateQueries();
          })}>
            <RefreshCw className="mr-2 h-4 w-4" />
            <span>{t("table.header.refresh")}</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
