import { useCallback, useEffect, useState } from "react";
import type {
  AvailableCurrency,
  CustomerDto,
  OverviewViewType,
} from "@/lib/types";
import { ReceivableCustomerApi, PayableCustomerApi } from "@/lib/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import OverviewCards from "@/layout/shared/OverviewCards";
import CustomerTable from "./components/CustomerTable";
import { useSearchParams } from "react-router";

export default function Dashboard() {
  const [receivableCustomers, setReceivableCustomers] = useState<CustomerDto[]>(
    [],
  );
  const [payableCustomers, setPayableCustomers] = useState<CustomerDto[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCurrency, setSelectedCurrency] =
    useState<AvailableCurrency>("TRY");
  const [tabValue, setTabValue] = useState<OverviewViewType>(null!);

  const handleTabChange = useCallback(
    (value: string) => {
      setTabValue(value as OverviewViewType);
      setSearchParams({ tab: value });
    },
    [setSearchParams],
  );

  const handleCurrencyChange = useCallback(
    (value: AvailableCurrency) => {
      setSelectedCurrency(value);
    },
    [setSelectedCurrency],
  );

  const fetchReceivableCustomers = useCallback(async () => {
    const response = await ReceivableCustomerApi.GetAll();
    if (response) setReceivableCustomers(response);
  }, []);

  const fetchPayableCustomers = useCallback(async () => {
    const response = await PayableCustomerApi.GetAll();
    console.log(response);

    if (response) setPayableCustomers(response);
  }, []);

  const handleRefresh = useCallback(() => {
    fetchReceivableCustomers();
    fetchPayableCustomers();
  }, [fetchPayableCustomers, fetchReceivableCustomers]);

  useEffect(() => {
    setTabValue((searchParams.get("tab") as OverviewViewType) || "receivable");
    handleRefresh();
    window.addEventListener("global:refresh", handleRefresh);
    return () => {
      window.removeEventListener("global:refresh", handleRefresh);
    };
  }, [handleRefresh, searchParams]);

  useEffect(() => {
    console.log("Selected Currency:", selectedCurrency);
  }, [selectedCurrency]);

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
          <OverviewCards
            type="receivable"
            align="stretch"
            currency={selectedCurrency}
          />
          <Separator orientation="vertical" className="!h-20 w-full" />
          <OverviewCards
            type="payable"
            align="stretch"
            currency={selectedCurrency}
          />
        </div>
        <TabsContent value="receivable">
          <CustomerTable
            type="receivable"
            data={receivableCustomers}
            currency={{
              state: selectedCurrency,
              onChange: handleCurrencyChange,
            }}
          />
        </TabsContent>
        <TabsContent value="payable">
          <CustomerTable
            type="payable"
            data={payableCustomers}
            currency={{
              state: selectedCurrency,
              onChange: handleCurrencyChange,
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
