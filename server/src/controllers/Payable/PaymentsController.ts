import PayablePaymentsService from "@/services/Payable/PaymentsService";
import { createPaymentController } from "../Generic/BasePaymentController";

export default createPaymentController(PayablePaymentsService, "PayablePayments");
