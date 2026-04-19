import { CreateUserDto, UserDto, UUID, SortItem, FilterItem } from "@common/types";
import { Logger } from "../../lib/utils/logger";
import { UserRepository } from "../../repositories/UserRepository";
import { NotFoundError, ValidationError } from "../../lib/errors/AppError";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

export class UserManagementService {
	static async Create(user: CreateUserDto, createdBy: UUID) {
		Logger.info("[UserManagement] Creating user", { username: user.username, companyId: user.company_id });

		const { company_id, username, password, role } = user;
		if (!company_id || !username || !password) throw new ValidationError("Company ID, username, and password are required");

		const existingUser = await UserRepository.findByUsername(username);
		if (existingUser) throw new ValidationError("Username already exists");

		const passHash = await bcrypt.hash(password, SALT_ROUNDS);
		const newUser = await UserRepository.create({
			company_id, username, pass_hash: passHash, role: role ?? 0, created_by: createdBy,
		});

		Logger.info("[UserManagement] User created successfully", { userId: newUser.id });
		return newUser.id;
	}

	static async GetAllByCompany(companyId: UUID, page: number, limit: number, sorting: SortItem[] = [], filters: FilterItem[] = []) {
		Logger.info("[UserManagement] GetAllByCompany", { companyId, page, limit });
		const offset = page * limit;
		const result = await UserRepository.findAllByCompany(companyId, limit, offset, sorting, filters);
		Logger.debug("[UserManagement] Users fetched", { companyId, count: result.rows.length, totalCount: result.count });
		return { rows: result.rows, count: result.count };
	}

	static async GetById(id: UUID) {
		Logger.info("[UserManagement] GetById", { id });
		const user = await UserRepository.findById(id);
		if (!user || user.deleted_at !== null) throw new NotFoundError("User not found");

		const userDto: UserDto = {
			id: user.id, company_id: user.company_id, username: user.username,
			role: user.role as UserDto["role"],
			created_at: user.created_at, created_by: user.created_by, updated_at: user.updated_at,
		};

		Logger.info("[UserManagement] Fetched user successfully", { id });
		return userDto;
	}

	static async Update(id: UUID, userData: Partial<UserDto & { password?: string }>, updatedBy: UUID) {
		Logger.info("[UserManagement] Update", { id });
		const { username, role, password } = userData;
		const updateData: Record<string, unknown> = {};

		if (username) {
			const existingUser = await UserRepository.findByUsername(username);
			if (existingUser && existingUser.id !== id) throw new ValidationError("Username already exists");
			updateData.username = username;
		}
		if (role !== undefined) updateData.role = role;
		if (password) updateData.pass_hash = await bcrypt.hash(password, SALT_ROUNDS);

		if (Object.keys(updateData).length === 0) throw new ValidationError("No update data provided");

		const [affectedRows] = await UserRepository.update(id, updateData);
		if (affectedRows === 0) {
			const exists = await UserRepository.findById(id);
			if (!exists) throw new NotFoundError("User not found");
		}

		Logger.info("[UserManagement] Updated user successfully", { id });
		return { id };
	}

	static async Delete(id: UUID, deletedBy: UUID) {
		Logger.info("[UserManagement] Delete", { id });
		const deletedCount = await UserRepository.delete(id, deletedBy);
		if (deletedCount === 0) throw new NotFoundError("User not found");
		Logger.info("[UserManagement] Deleted user successfully", { id });
	}

	static async ResetPassword(id: UUID, newPassword: string) {
		Logger.info("[UserManagement] ResetPassword", { id });
		const passHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
		const [affectedRows] = await UserRepository.update(id, { pass_hash: passHash });
		if (affectedRows === 0) {
			const exists = await UserRepository.findById(id);
			if (!exists) throw new NotFoundError("User not found");
		}
		Logger.info("[UserManagement] Password reset successfully", { id });
	}
}