import { useEffect, useState } from "react";
import type { CustomerDto } from "@/lib/types";
import { ReceivableCustomerApi, PayableCustomerApi } from "@/lib/api";
import OverviewCards from "../shared/OverviewCards";
import CustomerTable from "./components/CustomerTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Dashboard() {
    const [receivableCustomers, setReceivableCustomers] = useState<CustomerDto[]>([]);
    const [payableCustomers, setPayableCustomers] = useState<CustomerDto[]>([]);

    const [tabValue, setTabValue] = useState<"receivable" | "payable">("receivable");

    const handleTabChange = (value: string) => {
        setTabValue(value as "receivable" | "payable");
    }

    const fetchReceivableCustomers = async () => {
        const response = await ReceivableCustomerApi.GetAll();
        if (response)
            setReceivableCustomers(response);
    }

    const fetchPayableCustomers = async () => {
        const response = await PayableCustomerApi.GetAll();
        if (response)
            setPayableCustomers(response);
    }

    const handleRefresh = () => {
        fetchReceivableCustomers();
        fetchPayableCustomers();
    }

    useEffect(() => {
        handleRefresh();
        window.addEventListener("global:refresh", handleRefresh);
        return () => {
            window.removeEventListener("global:refresh", handleRefresh);
        }
    }, [])

    return (
        <div className="py-4 px-8">
            <Tabs defaultValue="receivable" value={tabValue} onValueChange={handleTabChange} className="w-full space-y-6">
                <div className="flex items-center gap-8">
                    <h1 className="text-4xl font-bold">Genel Bakış</h1>
                    <TabsList>
                        <TabsTrigger value="receivable" className="data-[state=active]:text-green-600 data-[state=active]:bg-green-50">Alacaklar</TabsTrigger>
                        <TabsTrigger value="payable" className="data-[state=active]:text-red-600 data-[state=active]:bg-red-50">Verecekler</TabsTrigger>
                    </TabsList>
                    <OverviewCards type={tabValue} />
                </div>
                <TabsContent value="receivable">
                    <CustomerTable data={receivableCustomers} type="receivable" />
                </TabsContent>
                <TabsContent value="payable">
                    <CustomerTable data={payableCustomers} type="payable" />
                </TabsContent>
            </Tabs>
        </div>
    )
}