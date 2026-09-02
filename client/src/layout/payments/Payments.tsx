import { PayablePaymentApi, ReceivablePaymentApi } from "@/lib/api/payment";
import PaymentTable from "./components/PaymentTable";
import AccountingTablePage from "@/layout/shared/AccountingTablePage";

export default function Payments() {
  return (
    <AccountingTablePage
      entityKey="payments"
      getApi={(type) => (type === "payable" ? PayablePaymentApi : ReceivablePaymentApi)}
      TableComponent={PaymentTable}
    />
  );
}
