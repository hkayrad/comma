import { useEffect, useState } from "react";
import type { CustomerDto } from "@/lib/types";
import { CustomerApi } from "@/lib/api";
import OverviewCards from "../shared/OverviewCards";
import CustomerTable from "./components/CustomerTable";

export default function Dashboard() {
    const [customers, setCustomers] = useState<CustomerDto[]>([]);

    const fetchCustomers = async () => {
        const response = await CustomerApi.GetAll();
        if (response)
            setCustomers(response);
    }

    const handleRefresh = () => {
        fetchCustomers();
    }

    useEffect(() => {
        handleRefresh();
        window.addEventListener("global:refresh", handleRefresh);
        return () => {
            window.removeEventListener("global:refresh", handleRefresh);
        }
    }, [])

    return (
        <div className="py-4 px-8 space-y-8">
            <div className="flex items-center gap-4">
                <h1 className="text-4xl font-bold">Anasayfa</h1>
                <OverviewCards />
            </div>
            <CustomerTable data={customers} />
        </div>
    )
}