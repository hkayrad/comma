import { useCallback, useEffect, useState } from "react";
import type { CompanyDto, AuditLogDto } from "@comma/common";
import { AdminCompanyApi, AuditLogApi } from "@/lib/api/admin";
import { Logger } from "@/lib/utils/logger";
import { useTranslation } from "react-i18next";
import type { ColumnFiltersState, OnChangeFn } from "@tanstack/react-table";
import { useTableState } from "@/hooks/use-table-state";
import CompanyTable from "./components/CompanyTable";
import AuditLogTable from "./components/AuditLogTable";
import { Button } from "@/components/ui/button";
import { Plus, Building2, History } from "lucide-react";
import { useDialog } from "@/contexts/dialog";
import CompanyDialog from "./components/CompanyDialog";
import UserManagement from "./components/UserManagement";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

type AdminView = "companies" | "users" | "audit-logs";

export default function Admin() {
  const [companies, setCompanies] = useState<CompanyDto[]>([]);
  const [companyRowCount, setCompanyRowCount] = useState(0);
  const [auditLogs, setAuditLogs] = useState<AuditLogDto[]>([]);
  const [auditLogRowCount, setAuditLogRowCount] = useState(0);
  const [currentView, setCurrentView] = useState<AdminView>("companies");
  const [selectedCompany, setSelectedCompany] = useState<CompanyDto | null>(null);

  const openDialog = useDialog((s) => s.openDialog);
  const { t } = useTranslation();

  const {
    pagination: companyPagination,
    setPagination: setCompanyPagination,
    sorting: companySorting,
    setSorting: setCompanySorting,
    columnFilters: companyFilters,
    setColumnFilters: setCompanyFilters,
    columnVisibility: companyVisibility,
    setColumnVisibility: setCompanyVisibility,
  } = useTableState({ key: "admin-companies" });

  const {
    pagination: auditPagination,
    setPagination: setAuditPagination,
    sorting: auditSorting,
    setSorting: setAuditSorting,
    columnFilters: auditFilters,
    setColumnFilters: setAuditFilters,
    columnVisibility: auditVisibility,
    setColumnVisibility: setAuditVisibility,
  } = useTableState({ key: "admin-audit-logs" });

  const onCompanyFiltersChange: OnChangeFn<ColumnFiltersState> = (updaterOrValue) => {
    setCompanyFilters(updaterOrValue);
    setCompanyPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const onAuditFiltersChange: OnChangeFn<ColumnFiltersState> = (updaterOrValue) => {
    setAuditFilters(updaterOrValue);
    setAuditPagination((prev) => ({ ...prev, pageIndex: 0 }));
  };

  const fetchCompanies = useCallback(async () => {
    try {
      const response = await AdminCompanyApi.GetAll(
        companyPagination.pageIndex,
        companyPagination.pageSize,
        companySorting,
        companyFilters,
      );
      if (response) {
        setCompanies(response.rows);
        setCompanyRowCount(response.count);
      }
    } catch (error) {
      Logger.error("Error fetching companies", error);
    }
  }, [companyPagination, companySorting, companyFilters]);

  const fetchAuditLogs = useCallback(async () => {
    try {
      const response = await AuditLogApi.GetAll(
        auditPagination.pageIndex,
        auditPagination.pageSize,
        auditSorting,
        auditFilters,
      );
      if (response) {
        setAuditLogs(response.rows);
        setAuditLogRowCount(response.count);
      }
    } catch (error) {
      Logger.error("Error fetching audit logs", error);
    }
  }, [auditPagination, auditSorting, auditFilters]);

  useEffect(() => {
    if (currentView === "companies") {
      fetchCompanies();
    } else if (currentView === "audit-logs") {
      fetchAuditLogs();
    }
  }, [currentView, fetchCompanies, fetchAuditLogs]);

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
            {t("admin.title", { defaultValue: "Yönetim Paneli" })}
          </h1>
          <p className="text-muted-foreground">
            {t("admin.subtitle", { defaultValue: "Şirket ve denetim kaydı yönetimi" })}
          </p>
        </div>
      </div>

      <Tabs
        value={currentView}
        onValueChange={(val) => setCurrentView(val as AdminView)}
        className="w-full flex-1 flex flex-col gap-4 overflow-hidden"
      >
        <TabsList className="w-fit">
          <TabsTrigger value="companies" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            <span>{t("admin.tabs.companies", { defaultValue: "Şirketler" })}</span>
          </TabsTrigger>
          <TabsTrigger value="audit-logs" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            <span>{t("admin.tabs.auditLogs", { defaultValue: "Denetim Kayıtları (Audit Trail)" })}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="companies" className="flex-1 overflow-hidden m-0">
          <CompanyTable
            data={companies}
            rowCount={companyRowCount}
            pagination={companyPagination}
            onPaginationChange={setCompanyPagination}
            sorting={companySorting}
            onSortingChange={setCompanySorting}
            columnFilters={companyFilters}
            onColumnFiltersChange={onCompanyFiltersChange}
            columnVisibility={companyVisibility}
            onColumnVisibilityChange={setCompanyVisibility}
            onManageUsers={handleManageUsers}
            addButton={
              <Button onClick={handleAddCompany}>
                <Plus className="h-4 w-4 mr-2" />
                {t("dashboard.addButton.actions.receivable.addCustomer")}
              </Button>
            }
          />
        </TabsContent>

        <TabsContent value="audit-logs" className="flex-1 overflow-hidden m-0">
          <AuditLogTable
            data={auditLogs}
            rowCount={auditLogRowCount}
            pagination={auditPagination}
            onPaginationChange={setAuditPagination}
            sorting={auditSorting}
            onSortingChange={setAuditSorting}
            columnFilters={auditFilters}
            onColumnFiltersChange={onAuditFiltersChange}
            columnVisibility={auditVisibility}
            onColumnVisibilityChange={setAuditVisibility}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
