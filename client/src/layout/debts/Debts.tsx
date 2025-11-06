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
        <div className="py-4 px-8 space-y-8">
            <div className="flex items-center gap-4">
                <OverviewCards type={type} />
            </div>
            <DebtTable data={debts} type={type} />
        </div>
    )
}