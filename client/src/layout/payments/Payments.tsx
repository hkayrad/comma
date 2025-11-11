import { useEffect, useState } from "react";
import type { AvailableCurrency, PaymentDto } from "@/lib/types";
import { PayablePaymentApi, ReceivablePaymentApi } from "@/lib/api";
import OverviewCards from "@/layout/shared/OverviewCards";
import PaymentTable from "./components/PaymentTable";

type Props = {
  type: "receivable" | "payable";
};

export default function Payments(props: Props) {
  const { type } = props;
  const [payments, setPayments] = useState<PaymentDto[]>([]);
  const [selectedCurrency, setSelectedCurrency] =
    useState<AvailableCurrency>("TRY");

  useEffect(() => {
    const fetchPayments = async () => {
      const API = type === "payable" ? PayablePaymentApi : ReceivablePaymentApi;
      const response = await API.GetAll();
      if (response) setPayments(response);
    };

    const handleRefresh = () => {
      fetchPayments();
    };

    handleRefresh();
    window.addEventListener("global:refresh", handleRefresh);
    return () => {
      window.removeEventListener("global:refresh", handleRefresh);
    };
  }, [type]);

  return (
    <div className="px-4 py-4 h-[calc(100vh-3.5rem)] overflow-hidden scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-500 dark:hover:scrollbar-thumb-gray-500 flex flex-col gap-2">
      <OverviewCards type={type} currency={selectedCurrency} />
      <div>
        <PaymentTable
          data={payments}
          type={type}
          currency={{ state: selectedCurrency, onChange: setSelectedCurrency }}
        />
      </div>
    </div>
  );
}
