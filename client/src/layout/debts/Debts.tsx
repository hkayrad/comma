import { useEffect, useState } from "react";
import type { DebtDto } from "@/lib/types";
import { PayableDebtApi, ReceivableDebtApi } from "@/lib/api/debt";
import DebtTable from "./components/DebtTable";
import OverviewCards from "@/layout/shared/OverviewCards";
import { useLocation } from "react-router";
import type { PaginationState } from "@tanstack/react-table";

export default function Debts() {
  const location = useLocation();
  const type: "payable" | "receivable" =
    location.pathname.split("/")[1] === "alacaklar" ? "receivable" : "payable";
  const [debts, setDebts] = useState<DebtDto[]>([]);
  const [rowCount, setRowCount] = useState(0);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  });

  useEffect(() => {
    const fetchDebts = async () => {
      const API = type === "payable" ? PayableDebtApi : ReceivableDebtApi;
      const response = await API.GetAll(pagination.pageIndex, pagination.pageSize);
      if (response) {
        setDebts(response.rows);
        setRowCount(response.count);
      }
    };

    const handleRefresh = () => {
      fetchDebts();
    };

    handleRefresh();
    window.addEventListener("global:refresh", handleRefresh);
    return () => {
      window.removeEventListener("global:refresh", handleRefresh);
    };
  }, [type, pagination]);

  return (
    <div className="px-4 py-4 h-[calc(100vh-3.5rem)] overflow-hidden scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-500 dark:hover:scrollbar-thumb-gray-500 flex flex-col gap-2">
      <OverviewCards type={type} />
      <div>
        <DebtTable
          data={debts}
          type={type}
          rowCount={rowCount}
          pagination={pagination}
          onPaginationChange={setPagination}
        />
      </div>
    </div>
  );
}
