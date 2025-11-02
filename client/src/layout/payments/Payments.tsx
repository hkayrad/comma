import { useEffect, useState } from "react";
import type { PaymentDto } from "@/lib/types";
import { PayablePaymentApi, ReceivablePaymentApi } from "@/lib/api";
import OverviewCards from "../shared/OverviewCards";
import PaymentTable from "./components/PaymentTable";

type Props = {
    type: 'receivable' | 'payable';
}

export default function Payments(props: Props) {
    const { type } = props;
    const [payments, setPayments] = useState<PaymentDto[]>([]);


    useEffect(() => {
        const fetchPayments = async () => {
            const API = type === 'payable' ? PayablePaymentApi : ReceivablePaymentApi;
            const response = await API.GetAll();
            if (response)
                setPayments(response);
        }

        const handleRefresh = () => {
            fetchPayments();
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
                <h1 className="text-4xl font-bold">{type === 'receivable' ? 'Gelen' : 'Giden'} Ödemeler</h1>
                <OverviewCards type={type} />
            </div>
            <PaymentTable data={payments} type={type} />
        </div>
    )
}