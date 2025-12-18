import { useCallback, useEffect, useState } from "react";
import type { CustomerDto, OverviewViewType } from "@/lib/types";
import { ReceivableCustomerApi, PayableCustomerApi } from "@/lib/api/customer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import OverviewCards from "@/layout/shared/OverviewCards";
import CustomerTable from "./components/CustomerTable";
import { Logger } from "@/lib/utils/logger";
import { useTranslation } from "react-i18next";
import type { PaginationState } from "@tanstack/react-table";

export default function Dashboard() {
  const [receivableCustomers, setReceivableCustomers] = useState<CustomerDto[]>(
    [],
  );
  const [payableCustomers, setPayableCustomers] = useState<CustomerDto[]>([]);
  const [tabValue, setTabValue] = useState<OverviewViewType>("receivable");

  const [receivableRowCount, setReceivableRowCount] = useState(0);
  const [receivablePagination, setReceivablePagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  });

  const [payableRowCount, setPayableRowCount] = useState(0);
  const [payablePagination, setPayablePagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  });

  const { t } = useTranslation();

  const handleTabChange = useCallback((value: string) => {
    setTabValue(value as OverviewViewType);
  }, []);

  const fetchReceivableCustomers = useCallback(async () => {
    const response = await ReceivableCustomerApi.GetAll(receivablePagination.pageIndex, receivablePagination.pageSize);
    if (response) {
      setReceivableCustomers(response.rows);
      setReceivableRowCount(response.count);
    } else {
      Logger.error("Müşteriler getirilirken bir hata oluştu", response);
    }
  }, [receivablePagination]);

  const fetchPayableCustomers = useCallback(async () => {
    const response = await PayableCustomerApi.GetAll(payablePagination.pageIndex, payablePagination.pageSize);
    if (response) {
      setPayableCustomers(response.rows);
      setPayableRowCount(response.count);
    } else {
      Logger.error("Müşteriler getirilirken bir hata oluştu", response);
    }
  }, [payablePagination]);

  const handleRefresh = useCallback(() => {
    fetchReceivableCustomers();
    fetchPayableCustomers();
  }, [fetchPayableCustomers, fetchReceivableCustomers]);

  useEffect(() => {
    handleRefresh();
    window.addEventListener("global:refresh", handleRefresh);
    return () => {
      window.removeEventListener("global:refresh", handleRefresh);
    };
  }, [handleRefresh]);

  return (
    <div className="px-4 py-4 h-[calc(100vh-3.5rem)] overflow-hidden scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-500 dark:hover:scrollbar-thumb-gray-500">
      <Tabs
        value={tabValue}
        onValueChange={handleTabChange}
        className="w-full gap-2"
      >
        <TabsList className="fixed bottom-6 z-20 left-0 right-0 mx-auto select-none">
          <TabsTrigger
            value="receivable"
            className="data-[state=active]:text-green-600 data-[state=active]:bg-green-50"
          >
            {t("vars.receivables")}
          </TabsTrigger>
          <TabsTrigger
            value="payable"
            className="data-[state=active]:text-red-600 data-[state=active]:bg-red-50"
          >
            {t("vars.payables")}
          </TabsTrigger>
        </TabsList>
        <div className="flex items-center gap-4">
          <OverviewCards type="receivable" align="stretch" />
          <Separator orientation="vertical" className="!h-20 w-full" />
          <OverviewCards type="payable" align="stretch" />
        </div>
        <TabsContent value="receivable">
          <CustomerTable
            type="receivable"
            data={receivableCustomers}
            rowCount={receivableRowCount}
            pagination={receivablePagination}
            onPaginationChange={setReceivablePagination}
          />
        </TabsContent>
        <TabsContent value="payable">
          <CustomerTable
            type="payable"
            data={payableCustomers}
            rowCount={payableRowCount}
            pagination={payablePagination}
            onPaginationChange={setPayablePagination}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
