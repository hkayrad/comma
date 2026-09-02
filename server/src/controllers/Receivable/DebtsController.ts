import ReceivableDebtsService from "@/services/Receivable/DebtsService";
import { createDebtController } from "../Generic/BaseDebtController";

export default createDebtController(ReceivableDebtsService, "ReceivableDebts");
