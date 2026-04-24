import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  MoreHorizontal,
  FileDown,
  Pencil,
  Trash2
} from "lucide-react";
import type {
  DebtDto,
  PaymentDto,
  CompanyDto
} from "@comma/common";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  ContextMenuItem
} from "@/components/ui/context-menu";
import { Button } from "@/components/ui/button";
import { useDialog } from "@/contexts/dialog";
import DebtDialog from "@/layout/debts/components/DebtDialog";
import PaymentDialog from "@/layout/payments/components/PaymentDialog";
import {
  exportDebtInvoicePDF,
  exportPaymentReceiptPDF
} from "@/lib/pdf-receipts";
import {
  PayableDebtApi,
  ReceivableDebtApi
} from "@/lib/api/debt";
import {
  PayablePaymentApi,
  ReceivablePaymentApi
} from "@/lib/api/payment";

interface StatementRowActionsProps {
  item: DebtDto | PaymentDto;
  type: "debt" | "payment";
  overviewType: "payable" | "receivable";
  company: CompanyDto | null;
  onRefresh: () => void;
  isContextMenu?: boolean;
}

export function StatementRowActions({
  item,
  type,
  overviewType,
  company,
  onRefresh,
  isContextMenu = false,
}: StatementRowActionsProps) {
  const { t } = useTranslation();
  const openDialog = useDialog((s) => s.openDialog);
  const closeDialog = useDialog((s) => s.closeDialog);

  const DEBT_API = overviewType === "payable" ? PayableDebtApi : ReceivableDebtApi;
  const PAYMENT_API = overviewType === "payable" ? PayablePaymentApi : ReceivablePaymentApi;

  const handleDownload = useCallback(async () => {
    try {
      if (type === "debt") {
        await exportDebtInvoicePDF(item as DebtDto, company);
      } else {
        await exportPaymentReceiptPDF(item as PaymentDto, company);
      }
      toast.success(t("dashboard.customerStatement.success.pdfExport"));
    } catch (_error) {
      toast.error(t("dashboard.customerStatement.error.pdfExport"));
    }
  }, [type, item, company, t]);

  const handleEdit = useCallback(() => {
    if (type === "debt") {
      openDialog({
        title: t("dialog.debt.edit.title"),
        description: t("dialog.debt.edit.description"),
        size: "3xl",
        content: <DebtDialog debt={item as DebtDto} type={overviewType} />,
        showCloseButton: true,
        onSuccess: onRefresh,
      });
    } else {
      openDialog({
        title: t("dialog.payment.edit.title"),
        description: t("dialog.payment.edit.description"),
        size: "3xl",
        content: <PaymentDialog payment={item as PaymentDto} type={overviewType} />,
        showCloseButton: true,
        onSuccess: onRefresh,
      });
    }
  }, [type, item, overviewType, openDialog, onRefresh, t]);

  const handleDelete = useCallback(async () => {
    const api = type === "debt" ? DEBT_API : PAYMENT_API;
    try {
      await api.Delete(item.id!);
      onRefresh();
      toast.success(t(`notification.${type}.delete.success`), {
        action: {
          label: t("vars.undo"),
          onClick: async () => {
            try {
              await api.Restore(item.id!);
              onRefresh();
              toast.success(t(`notification.${type}.restore.success`));
            } catch (_error) {
              toast.error(t(`notification.${type}.restore.error`));
            }
          },
        },
      });
    } catch (_error) {
      toast.error(t(`notification.${type}.delete.error`));
    }
  }, [type, item.id, DEBT_API, PAYMENT_API, onRefresh, t]);

  const onConfirmDelete = useCallback(() => {
    openDialog({
      title: t(`debt.table.column.actions.delete.title`),
      description: t(`debt.table.column.actions.delete.description`),
      footer: (
        <div className="flex justify-end gap-2 w-full">
          <Button variant="outline" onClick={closeDialog}>
            {t("vars.cancel")}
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              handleDelete();
              closeDialog();
            }}
          >
            {t("vars.delete")}
          </Button>
        </div>
      ),
    });
  }, [openDialog, closeDialog, handleDelete, t]);

  if (isContextMenu) {
    return (
      <>
        <ContextMenuItem onClick={handleDownload}>
          <FileDown className="mr-2 h-4 w-4" />
          {t("vars.download")}
        </ContextMenuItem>
        <ContextMenuItem onClick={handleEdit}>
          <Pencil className="mr-2 h-4 w-4" />
          {t("vars.edit")}
        </ContextMenuItem>
        <ContextMenuItem
          onClick={onConfirmDelete}
          className="text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          {t("vars.delete")}
        </ContextMenuItem>
      </>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button variant="ghost" size="icon" className="h-8 w-8 p-0" nativeButton>
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleDownload}>
          <FileDown className="mr-2 h-4 w-4" />
          {t("vars.download")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleEdit}>
          <Pencil className="mr-2 h-4 w-4" />
          {t("vars.edit")}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={onConfirmDelete}
          className="text-red-600 focus:text-red-600 dark:text-red-400 dark:focus:text-red-400"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          {t("vars.delete")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
