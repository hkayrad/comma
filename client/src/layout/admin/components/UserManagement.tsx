import { useCallback, useEffect, useState } from "react";
import type { UserDto, CompanyDto } from "@/lib/types";
import { AdminUserApi } from "@/lib/api/admin";
import { Logger } from "@/lib/utils/logger";
import { useTranslation } from "react-i18next";
import type { ColumnFiltersState, OnChangeFn } from "@tanstack/react-table";
import { useTableState } from "@/hooks/use-table-state";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus } from "lucide-react";
import { useDialog } from "@/contexts/dialog";
import UserDialog from "./UserDialog";
import UserTable from "./UserTable";

type Props = {
  company: CompanyDto;
  onBack: () => void;
};

export default function UserManagement({ company, onBack }: Props) {
  const [users, setUsers] = useState<UserDto[]>([]);
  const [rowCount, setRowCount] = useState(0);

  const { openDialog } = useDialog();
  const { t } = useTranslation();

  const {
    pagination,
    setPagination,
    sorting,
    setSorting,
    columnFilters,
    setColumnFilters,
    columnVisibility,
    setColumnVisibility,
  } = useTableState({ key: `admin-users-${company.id}` });

  const onColumnFiltersChange: OnChangeFn<ColumnFiltersState> = (
    updaterOrValue,
  ) => {
    setColumnFilters(updaterOrValue);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const fetchUsers = useCallback(async () => {
    if (!company.id) return;

    try {
      const response = await AdminUserApi.GetAllByCompany(
        company.id,
        pagination.pageIndex,
        pagination.pageSize,
        sorting,
        columnFilters,
      );
      if (response) {
        setUsers(response.rows);
        setRowCount(response.count);
      }
    } catch (error) {
      Logger.error("Error fetching users", error);
    }
  }, [company.id, pagination, sorting, columnFilters]);

  const handleRefresh = useCallback(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    handleRefresh();
    window.addEventListener("global:refresh", handleRefresh);
    return () => {
      window.removeEventListener("global:refresh", handleRefresh);
    };
  }, [handleRefresh]);

  const handleAddUser = useCallback(() => {
    openDialog({
      title: t("dashboard.addButton.actions.receivable.addCustomer"),
      description: t("dialog.customer.add.description"),
      size: "md",
      content: <UserDialog companyId={company.id!} />,
      showCloseButton: true,
    });
  }, [openDialog, t, company.id]);

  return (
    <div className="px-4 py-4 h-[calc(100vh-3.5rem)] overflow-hidden scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-500 dark:hover:scrollbar-thumb-gray-500 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">{company.name}</h1>
            <p className="text-muted-foreground">{t("user.role.manager")}</p>
          </div>
        </div>
        <Button onClick={handleAddUser}>
          <Plus className="h-4 w-4 mr-2" />
          {t("dashboard.addButton.actions.receivable.addCustomer")}
        </Button>
      </div>
      <div>
        <UserTable
          data={users}
          companyId={company.id!}
          rowCount={rowCount}
          pagination={pagination}
          onPaginationChange={setPagination}
          sorting={sorting}
          onSortingChange={setSorting}
          columnFilters={columnFilters}
          onColumnFiltersChange={onColumnFiltersChange}
          columnVisibility={columnVisibility}
          onColumnVisibilityChange={setColumnVisibility}
        />
      </div>
    </div>
  );
}
