import { BaseCustomerService } from "../Generic/BaseCustomerService";
import type { CustomerDto, UUID, SortItem, FilterItem } from "@comma/common/types";

const service = new BaseCustomerService("receivable");

export default class ReceivableCustomersService {
  static async Create(customer: CustomerDto, userId: UUID, companyId: UUID) {
    return service.Create(customer, userId, companyId);
  }

  static async CreateBatch(customers: CustomerDto[], userId: UUID, companyId: UUID) {
    return service.CreateBatch(customers, userId, companyId);
  }

  static async GetAll(companyId: UUID, page: number, limit: number, sorting: SortItem[] = [], filters: FilterItem[] = []) {
    return service.GetAll(companyId, page, limit, sorting, filters);
  }

  static async GetSummary(customerId: UUID, companyId: UUID) {
    return service.GetSummary(customerId, companyId);
  }

  static async GetStatement(customerId: UUID, companyId: UUID, startDate?: string, endDate?: string) {
    return service.GetStatement(customerId, companyId, startDate, endDate);
  }

  static async GetIdAndName(companyId: UUID) {
    return service.GetIdAndName(companyId);
  }

  static async Update(id: UUID, customer: CustomerDto, companyId: UUID) {
    return service.Update(id, customer, companyId);
  }

  static async Delete(id: UUID, userId: UUID, companyId: UUID) {
    return service.Delete(id, userId, companyId);
  }

  static async Restore(id: UUID, userId: UUID, companyId: UUID) {
    return service.Restore(id, userId, companyId);
  }
}
