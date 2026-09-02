import ReceivablePaymentsService from "@/services/Receivable/PaymentsService";
import { createPaymentController } from "../Generic/BasePaymentController";

export default createPaymentController(ReceivablePaymentsService, "ReceivablePayments");
