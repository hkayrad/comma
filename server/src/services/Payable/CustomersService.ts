import { BaseCustomerService } from "../Generic/BaseCustomerService";
import type { CustomerDto, UUID, SortItem, FilterItem } from "@comma/common/types";

const service = new BaseCustomerService("payable");

export default class PayableCustomersService {
  static Create = (customer: CustomerDto, userId: UUID, companyId: UUID) => service.Create(customer, userId, companyId);
  static CreateBatch = (customers: CustomerDto[], userId: UUID, companyId: UUID) => service.CreateBatch(customers, userId, companyId);
  static GetAll = (companyId: UUID, page: number, limit: number, sorting: SortItem[] = [], filters: FilterItem[] = []) => service.GetAll(companyId, page, limit, sorting, filters);
  static GetSummary = (customerId: UUID, companyId: UUID) => service.GetSummary(customerId, companyId);
  static GetStatement = (customerId: UUID, companyId: UUID, startDate?: string, endDate?: string) => service.GetStatement(customerId, companyId, startDate, endDate);
  static GetIdAndName = (companyId: UUID) => service.GetIdAndName(companyId);
  static Update = (id: UUID, customer: CustomerDto, companyId: UUID) => service.Update(id, customer, companyId);
  static Delete = (id: UUID, userId: UUID, companyId: UUID) => service.Delete(id, userId, companyId);
  static DeleteBatch = (ids: UUID[], userId: UUID, companyId: UUID) => service.DeleteBatch(ids, userId, companyId);
  static Restore = (id: UUID, userId: UUID, companyId: UUID) => service.Restore(id, userId, companyId);
}
