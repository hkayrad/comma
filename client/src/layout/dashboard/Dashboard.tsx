import { useEffect, useState } from "react";
import type { CustomerDto } from "@/lib/types";
import { ReceivableCustomerApi, PayableCustomerApi } from "@/lib/api";
import OverviewCards from "../shared/OverviewCards";
import CustomerTable from "./components/CustomerTable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

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
                <TabsList className="fixed top-4 left-0 right-0 mx-auto">
                    <TabsTrigger value="receivable" className="data-[state=active]:text-green-600 data-[state=active]:bg-green-50">Alacaklar</TabsTrigger>
                    <TabsTrigger value="payable" className="data-[state=active]:text-red-600 data-[state=active]:bg-red-50">Verecekler</TabsTrigger>
                </TabsList>
                <div className="flex items-center gap-10">
                    <OverviewCards type="receivable" align="stretch" />
                    <Separator orientation="vertical" className="!h-20 " />
                    <OverviewCards type="payable" align="stretch" />
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