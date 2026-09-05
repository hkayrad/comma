import { BasePaymentService } from "../Generic/BasePaymentService";
import type { PaymentDto, UUID, SortItem, FilterItem } from "@comma/common/types";

const service = new BasePaymentService("receivable");

export default class ReceivablePaymentsService {
	static Create = (payment: PaymentDto, userId: UUID, companyId: UUID) => service.Create(payment, userId, companyId);
	static CreateBatch = (payments: PaymentDto[], userId: UUID, companyId: UUID) => service.CreateBatch(payments, userId, companyId);
	static GetAll = (companyId: UUID, page: number, limit: number, sorting: SortItem[] = [], filters: FilterItem[] = []) => service.GetAll(companyId, page, limit, sorting, filters);
	static Update = (paymentId: UUID, payment: PaymentDto, companyId: UUID) => service.Update(paymentId, payment, companyId);
	static Delete = (paymentId: UUID, userId: UUID, companyId: UUID) => service.Delete(paymentId, userId, companyId);
	static DeleteBatch = (ids: UUID[], userId: UUID, companyId: UUID) => service.DeleteBatch(ids, userId, companyId);
	static Restore = (paymentId: UUID, userId: UUID, companyId: UUID) => service.Restore(paymentId, userId, companyId);
	static GetUpcomingChecks = (companyId: string, daysThreshold: number = 7) => service.GetUpcomingChecks(companyId, daysThreshold);
}
