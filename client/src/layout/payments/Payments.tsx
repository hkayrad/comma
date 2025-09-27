import { useEffect, useState } from "react";
import type { PaymentDto } from "@/lib/types";
import { PaymentApi } from "@/lib/api";
import OverviewCards from "../shared/OverviewCards";
import PaymentTable from "./components/PaymentTable";

export default function Payments() {
    const [payments, setPayments] = useState<PaymentDto[]>([]);

    const fetchPayments = async () => {
        const response = await PaymentApi.GetAll();
        if (response)
            setPayments(response);
    }

    const handleRefresh = () => {
        fetchPayments();
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
                <h1 className="text-4xl font-bold">Ödeme Bilgileri</h1>
                <OverviewCards />
            </div>
            <PaymentTable data={payments} />
        </div>
    )
}