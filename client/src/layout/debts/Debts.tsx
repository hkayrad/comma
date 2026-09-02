import { PayableDebtApi, ReceivableDebtApi } from "@/lib/api/debt";
import DebtTable from "./components/DebtTable";
import AccountingTablePage from "@/layout/shared/AccountingTablePage";

export default function Debts() {
  return (
    <AccountingTablePage
      entityKey="debts"
      getApi={(type) => (type === "payable" ? PayableDebtApi : ReceivableDebtApi)}
      TableComponent={DebtTable}
    />
  );
}
