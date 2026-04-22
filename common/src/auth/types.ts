import type { UUID } from "../shared/types";
import type { UserRole } from "../enums";

export type DecodedJwtToken = {
	aud: string;
	exp: number;
	iat: number;
	id: string;
	iss: string;
	username: string;
	companyId: string;
	role: number;
};

export type UserDto = {
	id?: UUID;
	company_id: UUID;
	username: string;
	role: UserRole;
	created_at?: Date;
	created_by?: UUID;
	updated_at?: Date;
	deleted_at?: Date;
	deleted_by?: UUID;
};

export type CreateUserDto = {
	company_id: UUID;
	username: string;
	password: string;
	role: UserRole;
};
