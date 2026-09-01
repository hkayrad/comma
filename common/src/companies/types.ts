import type { UUID } from "../shared/types";

export type CompanyDto = {
	id?: UUID;
	name: string;
	is_company: boolean;
	address?: string | null;
	phone?: string | null;
	email?: string | null;
	tax_number?: string | null;
	tax_office?: string | null;
	mersis_no?: string | null;
	small_logo_path?: string | null;
	large_logo_path?: string | null;
	work_start_time?: string | null;
	work_end_time?: string | null;
	created_at?: Date;
	updated_at?: Date;
};

