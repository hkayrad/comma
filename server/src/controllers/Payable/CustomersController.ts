import PayableCustomersService from "@/services/Payable/CustomersService";
import { createCustomerController } from "../Generic/BaseCustomerController";

export default createCustomerController(PayableCustomersService, "PayableCustomers");
