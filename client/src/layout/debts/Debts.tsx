import { useEffect, useState } from "react";
import type { DebtDto } from "@/lib/types";
import { DebtApi } from "@/lib/api";
import DebtTable from "./components/DebtTable";
import OverviewCards from "../shared/OverviewCards";

export default function Debts() {
    const [debts, setDebts] = useState<DebtDto[]>([]);

    const fetchDebts = async () => {
        const response = await DebtApi.GetAll();
        if (response)
            setDebts(response);
    }

    const handleRefresh = () => {
        fetchDebts();
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
                <h1 className="text-4xl font-bold">Borç Bilgileri</h1>
                <OverviewCards />
            </div>
            <DebtTable data={debts} />
        </div>
    )
}