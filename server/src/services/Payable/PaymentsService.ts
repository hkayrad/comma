import { BasePaymentService } from "../Generic/BasePaymentService";
import type { PaymentDto, UUID, SortItem, FilterItem } from "@comma/common/types";

const service = new BasePaymentService("payable");

export default class PayablePaymentsService {
	static async Create(payment: PaymentDto, userId: UUID, companyId: UUID) {
		return service.Create(payment, userId, companyId);
	}

	static async CreateBatch(payments: PaymentDto[], userId: UUID, companyId: UUID) {
		return service.CreateBatch(payments, userId, companyId);
	}

	static async GetAll(companyId: UUID, page: number, limit: number, sorting: SortItem[] = [], filters: FilterItem[] = []) {
		return service.GetAll(companyId, page, limit, sorting, filters);
	}

	static async Update(paymentId: UUID, payment: PaymentDto, companyId: UUID) {
		return service.Update(paymentId, payment, companyId);
	}

	static async Delete(paymentId: UUID, userId: UUID, companyId: UUID) {
		return service.Delete(paymentId, userId, companyId);
	}

	static async DeleteBatch(ids: UUID[], userId: UUID, companyId: UUID) {
		return service.DeleteBatch(ids, userId, companyId);
	}

	static async Restore(paymentId: UUID, userId: UUID, companyId: UUID) {
		return service.Restore(paymentId, userId, companyId);
	}

	static async GetUpcomingChecks(companyId: string, daysThreshold: number = 7) {
		return service.GetUpcomingChecks(companyId, daysThreshold);
	}
}
