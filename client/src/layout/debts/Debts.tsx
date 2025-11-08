import { useEffect, useState } from "react";
import type { DebtDto } from "@/lib/types";
import { PayableDebtApi, ReceivableDebtApi } from "@/lib/api";
import DebtTable from "./components/DebtTable";
import OverviewCards from "../shared/OverviewCards";

type Props = {
    type: 'receivable' | 'payable';
}

export default function Debts(props: Props) {
    const { type } = props;
    const [debts, setDebts] = useState<DebtDto[]>([]);

    useEffect(() => {
        const fetchDebts = async () => {
            const API = type === 'payable' ? PayableDebtApi : ReceivableDebtApi;
            const response = await API.GetAll();
            if (response)
                setDebts(response);
        }

        const handleRefresh = () => {
            fetchDebts();
        }

        handleRefresh();
        window.addEventListener("global:refresh", handleRefresh);
        return () => {
            window.removeEventListener("global:refresh", handleRefresh);
        }
    }, [type])

    return (
        <div className="px-4 py-4 h-[calc(100vh-3.5rem)] overflow-auto scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-500 dark:hover:scrollbar-thumb-gray-500">
            <div className="flex items-center gap-4">
                <OverviewCards type={type} />
            </div>
            <DebtTable data={debts} type={type} />
        </div>
    )
}