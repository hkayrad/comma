import { useCallback, useEffect, useState } from "react";
import type { CompanyDto } from "@/lib/types";
import { AdminCompanyApi } from "@/lib/api/admin";
import { Logger } from "@/lib/utils/logger";
import { useTranslation } from "react-i18next";
import type { ColumnFiltersState, OnChangeFn } from "@tanstack/react-table";
import { useTableState } from "@/hooks/use-table-state";
import CompanyTable from "./components/CompanyTable";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useDialog } from "@/contexts/dialog";
import CompanyDialog from "./components/CompanyDialog";
import UserManagement from "./components/UserManagement";

type AdminView = "companies" | "users";

export default function Admin() {
  const [companies, setCompanies] = useState<CompanyDto[]>([]);
  const [rowCount, setRowCount] = useState(0);
  const [currentView, setCurrentView] = useState<AdminView>("companies");
  const [selectedCompany, setSelectedCompany] = useState<CompanyDto | null>(
    null,
  );

  const openDialog = useDialog((s) => s.openDialog);
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
  } = useTableState({ key: "admin-companies" });

  const onColumnFiltersChange: OnChangeFn<ColumnFiltersState> = (
    updaterOrValue,
  ) => {
    setColumnFilters(updaterOrValue);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const fetchCompanies = useCallback(async () => {
    try {
      const response = await AdminCompanyApi.GetAll(
        pagination.pageIndex,
        pagination.pageSize,
        sorting,
        columnFilters,
      );
      if (response) {
        setCompanies(response.rows);
        setRowCount(response.count);
      }
    } catch (error) {
      Logger.error("Error fetching companies", error);
    }
  }, [pagination, sorting, columnFilters]);

  const handleRefresh = useCallback(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  useEffect(() => {
    handleRefresh();
    window.addEventListener("global:refresh", handleRefresh);
    return () => {
      window.removeEventListener("global:refresh", handleRefresh);
    };
  }, [handleRefresh]);

  const handleAddCompany = useCallback(() => {
    openDialog({
      title: t("dialog.customer.add"),
      description: t("dialog.customer.add.description"),
      size: "3xl",
      content: <CompanyDialog />,
      showCloseButton: true,
    });
  }, [openDialog, t]);

  const handleManageUsers = useCallback((company: CompanyDto) => {
    setSelectedCompany(company);
    setCurrentView("users");
  }, []);

  const handleBackToCompanies = useCallback(() => {
    setSelectedCompany(null);
    setCurrentView("companies");
  }, []);

  if (currentView === "users" && selectedCompany) {
    return (
      <UserManagement
        company={selectedCompany}
        onBack={handleBackToCompanies}
      />
    );
  }

  return (
    <div className="px-4 py-4 h-[calc(100vh-3.5rem)] overflow-hidden scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-500 dark:hover:scrollbar-thumb-gray-500 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            {t("sidebar.footer.companyManagement.label")}
          </h1>
          <p className="text-muted-foreground">
            {t("sidebar.footer.companyManagement.accountDetails.label")}
          </p>
        </div>
      </div>
      <div>
        <CompanyTable
          data={companies}
          rowCount={rowCount}
          pagination={pagination}
          onPaginationChange={setPagination}
          sorting={sorting}
          onSortingChange={setSorting}
          columnFilters={columnFilters}
          onColumnFiltersChange={onColumnFiltersChange}
          columnVisibility={columnVisibility}
          onColumnVisibilityChange={setColumnVisibility}
          onManageUsers={handleManageUsers}
          addButton={
            <Button onClick={handleAddCompany}>
              <Plus className="h-4 w-4 mr-2" />
              {t("dashboard.addButton.actions.receivable.addCustomer")}
            </Button>
          }
        />
      </div>
    </div>
  );
}
