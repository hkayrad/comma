import { useCallback, useEffect, useState } from "react";
import type { CustomerDto, OverviewViewType } from "@/lib/types";
import { ReceivableCustomerApi, PayableCustomerApi } from "@/lib/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import OverviewCards from "@/layout/shared/OverviewCards";
import CustomerTable from "./components/CustomerTable";
import { Logger } from "@/lib/utils/logger";

export default function Dashboard() {
  const [receivableCustomers, setReceivableCustomers] = useState<CustomerDto[]>(
    [],
  );
  const [payableCustomers, setPayableCustomers] = useState<CustomerDto[]>([]);
  const [tabValue, setTabValue] = useState<OverviewViewType>("receivable");

  const handleTabChange = useCallback((value: string) => {
    setTabValue(value as OverviewViewType);
  }, []);

  // const handleCurrencyChange = useCallback(
  //   (value: AvailableCurrency | "") => {
  //     setSelectedCurrency(value);
  //   },
  //   [setSelectedCurrency],
  // );

  const fetchReceivableCustomers = useCallback(async () => {
    const response = await ReceivableCustomerApi.GetAll();
    if (response) setReceivableCustomers(response);
    else Logger.error("Müşteriler getirilirken bir hata oluştu", response);
  }, []);

  const fetchPayableCustomers = useCallback(async () => {
    const response = await PayableCustomerApi.GetAll();
    if (response) setPayableCustomers(response);
    else Logger.error("Müşteriler getirilirken bir hata oluştu", response);
  }, []);

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
            Alacaklar
          </TabsTrigger>
          <TabsTrigger
            value="payable"
            className="data-[state=active]:text-red-600 data-[state=active]:bg-red-50"
          >
            Borçlar
          </TabsTrigger>
        </TabsList>
        <div className="flex items-center gap-4">
          <OverviewCards type="receivable" align="stretch" />
          <Separator orientation="vertical" className="!h-20 w-full" />
          <OverviewCards type="payable" align="stretch" />
        </div>
        <TabsContent value="receivable">
          <CustomerTable type="receivable" data={receivableCustomers} />
        </TabsContent>
        <TabsContent value="payable">
          <CustomerTable type="payable" data={payableCustomers} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
