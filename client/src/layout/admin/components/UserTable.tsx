import type { UserDto } from "@comma/common";
import { Button } from "@/components/ui/button";
import { KeyRound, Pencil, Trash2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { sendRefreshEvent } from "@/lib/utils";
import {
  DialogClose,
} from "@/components/ui/dialog";
import { ContextMenuItem, ContextMenuSeparator } from "@/components/ui/context-menu";
import { toast } from "sonner";
import { AdminUserApi } from "@/lib/api/admin";
import type {
  ColumnDef,
  PaginationState,
  OnChangeFn,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
} from "@tanstack/react-table";
import HksTable from "@/layout/shared/table/HksTable";
import { useDialog } from "@/contexts/dialog";
import SortableColumnHeader from "@/layout/shared/table/components/SortableColumnHeader";
import ClickToCopyText from "@/layout/shared/ClickToCopyText";
import { useCallback, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import UserDialog from "./UserDialog";
import ResetPasswordDialog from "./ResetPasswordDialog";
import CancelButton from "@/layout/shared/CancelButton";

type Props = {
  data: UserDto[];
  companyId: string;
  rowCount?: number;
  pagination?: PaginationState;
  onPaginationChange?: OnChangeFn<PaginationState>;
  sorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;
  columnFilters?: ColumnFiltersState;
  onColumnFiltersChange?: OnChangeFn<ColumnFiltersState>;
  columnVisibility?: VisibilityState;
  onColumnVisibilityChange?: OnChangeFn<VisibilityState>;
};

export default function UserTable(props: Props) {
  const {
    data,
    companyId,
    rowCount,
    pagination,
    onPaginationChange,
    sorting,
    onSortingChange,
    columnFilters,
    onColumnFiltersChange,
    columnVisibility,
    onColumnVisibilityChange,
  } = props;

  const openDialog = useDialog((s) => s.openDialog);
  const closeDialog = useDialog((s) => s.closeDialog);
  const { t } = useTranslation();

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await AdminUserApi.Delete(id);
        sendRefreshEvent();
        toast.success(t("notification.customer.delete.success"), {
          action: {
            label: t("vars.undo"),
            onClick: async () => {
              try {
                await AdminUserApi.Restore(id);
                sendRefreshEvent();
                toast.success(t("notification.customer.restore.success"));
              } catch (error) {
                toast.error(t("notification.customer.restore.error"));
              }
            },
          },
        });
      } catch (error) {
        toast.error(t("notification.customer.delete.error"));
      }
    },
    [t],
  );

  const confirmDelete = useCallback(
    (user: UserDto) => {
      openDialog({
        title: t("dashboard.table.column.actions.delete.title"),
        description: t("dashboard.table.column.actions.delete.description", {
          name: user.username,
        }),
        content: null,
        footer: (
          <>
            <DialogClose render={(props) => <CancelButton {...props} />} />
            <Button
              variant="destructive"
              onClick={() => {
                handleDelete(user.id!);
                closeDialog();
              }}
            >
              {t("dashboard.table.column.actions.delete.confirm")}
            </Button>
          </>
        ),
      });
    },
    [handleDelete, openDialog, closeDialog, t],
  );

  const onEdit = useCallback(
    (user: UserDto) => {
      openDialog({
        title: t("dialog.customer.edit.title"),
        description: t("dialog.customer.edit.description"),
        size: "md",
        content: <UserDialog companyId={companyId} user={user} />,
        showCloseButton: true,
      });
    },
    [openDialog, t, companyId],
  );

  const onResetPassword = useCallback(
    (user: UserDto) => {
      openDialog({
        title: t("dialog.customer.edit.title"),
        description: t("dialog.customer.edit.description"),
        size: "sm",
        content: (
          <ResetPasswordDialog userId={user.id!} username={user.username} />
        ),
        showCloseButton: true,
      });
    },
    [openDialog, t],
  );

  const getRoleBadge = useCallback(
    (role: number) => {
      switch (role) {
        case 99:
          return (
            <Badge className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100 select-none">
              {t("user.role.admin")}
            </Badge>
          );
        case 1:
          return (
            <Badge className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 select-none">
              {t("user.role.manager")}
            </Badge>
          );
        default:
          return (
            <Badge className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 select-none">
              {t("user.role.user")}
            </Badge>
          );
      }
    },
    [t],
  );

  const UserTableColumns: ColumnDef<UserDto>[] = useMemo(
    () => [
      {
        id: "index",
        header: "#",
        cell: ({ row }) => row.index + 1,
      },
      {
        accessorKey: "username",
        header: ({ column }) => (
          <SortableColumnHeader
            column={column}
            title={t("login.form.username")}
          />
        ),
        cell: ({ row }) => (
          <ClickToCopyText
            value={row.getValue("username")}
            className="font-medium"
          />
        ),
      },
      {
        accessorKey: "role",
        header: ({ column }) => (
          <SortableColumnHeader
            column={column}
            title={t("dashboard.table.column.is_company")}
          />
        ),
        cell: ({ row }) => getRoleBadge(row.getValue("role")),
      },
      {
        accessorKey: "created_at",
        header: ({ column }) => (
          <SortableColumnHeader
            column={column}
            title={t("vars.creation_date")}
          />
        ),
        cell: ({ row }) => {
          const date = row.getValue("created_at") as string;
          if (!date) return "-";
          return new Date(date).toLocaleDateString();
        },
      },
      {
        id: "actions",
        header: t("dashboard.table.column.actions"),
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Tooltip disableHoverablePopup>
              <TooltipTrigger
                render={(props) => (
                  <Button
                    {...props}
                    nativeButton
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(row.original)}
                  >
                    <Pencil />
                  </Button>
                )}
              />
              <TooltipContent>
                {t("dashboard.table.column.actions.edit_details")}
              </TooltipContent>
            </Tooltip>
            <Tooltip disableHoverablePopup>
              <TooltipTrigger
                render={(props) => (
                  <Button
                    {...props}
                    nativeButton
                    variant="ghost"
                    size="icon"
                    onClick={() => onResetPassword(row.original)}
                  >
                    <KeyRound />
                  </Button>
                )}
              />
              <TooltipContent>{t("login.form.password")}</TooltipContent>
            </Tooltip>
            <Tooltip disableHoverablePopup>
              <TooltipTrigger
                render={(props) => (
                  <Button
                    {...props}
                    nativeButton
                    variant="ghost"
                    size="icon"
                    className="text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-300"
                    onClick={() => confirmDelete(row.original)}
                  >
                    <Trash2 />
                  </Button>
                )}
              />
              <TooltipContent className="bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800 fill-red-100 dark:fill-red-950">
                {t("vars.delete")}
              </TooltipContent>
            </Tooltip>
          </div>
        ),
      },
    ],
    [t, onEdit, onResetPassword, confirmDelete, getRoleBadge],
  );

  const tags = useMemo(
    () => [
      {
        column: "role",
        column_label: t("dashboard.table.column.is_company"),
        value: "99",
        label: t("user.role.admin"),
        color: "red",
      },
      {
        column: "role",
        column_label: t("dashboard.table.column.is_company"),
        value: "1",
        label: t("user.role.manager"),
        color: "green",
      },
      {
        column: "role",
        column_label: t("dashboard.table.column.is_company"),
        value: "0",
        label: t("user.role.user"),
        color: "blue",
      },
    ],
    [t],
  );

  return (
    <HksTable
      data={data}
      columns={UserTableColumns}
      searchColumn="username"
      tags={tags}
      rowCount={rowCount}
      pagination={pagination}
      onPaginationChange={onPaginationChange}
      sorting={sorting}
      onSortingChange={onSortingChange}
      columnFilters={columnFilters}
      onColumnFiltersChange={onColumnFiltersChange}
      columnVisibility={columnVisibility}
      onColumnVisibilityChange={onColumnVisibilityChange}
      contextMenuItems={(c) => (
        <>
          <ContextMenuItem onClick={() => onEdit(c)}>
            <Pencil className="mr-2 h-4 w-4" />
            {t("dashboard.table.column.actions.edit_details")}
          </ContextMenuItem>
          <ContextMenuItem onClick={() => onResetPassword(c)}>
            <KeyRound className="mr-2 h-4 w-4" />
            {t("login.form.password")}
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem
            className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
            onClick={() => confirmDelete(c)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {t("vars.delete")}
          </ContextMenuItem>
        </>
      )}
    />
  );
}
