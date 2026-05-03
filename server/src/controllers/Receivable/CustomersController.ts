import ReceivableCustomersService from "@/services/Receivable/CustomersService";
import { createCustomerController } from "../Generic/BaseCustomerController";

export default createCustomerController(ReceivableCustomersService, "ReceivableCustomers");
