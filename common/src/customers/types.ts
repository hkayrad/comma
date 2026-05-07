import type { UUID } from "../shared/types";
import type { DebtDto } from "../debts/types";
import type { PaymentDto } from "../payments/types";

export type CustomerDto = {
  id?: UUID;
	company_id?: UUID;
	name: string;
	phone?: string | null;
	is_company: boolean;
	tax_number?: string | null;
	tax_office?: string | null;
	mersis_no?: string | null;
	email?: string | null;
	address?: string | null;
	small_logo_path?: string | null;
	total_debt?: number;
	total_payments?: number;
	remaining_debt?: number;
	created_at?: Date;
	updated_at?: Date;
};

export type CustomerIdName = { id: UUID; name: string };

export type CustomerStatement = {
	customer: CustomerDto;
	debts: DebtDto[];
	payments: PaymentDto[];
};
