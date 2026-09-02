import PayableDebtsService from "@/services/Payable/DebtsService";
import { createDebtController } from "../Generic/BaseDebtController";

export default createDebtController(PayableDebtsService, "PayableDebts");
