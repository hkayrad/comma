import { CreateUserDto, UserDto, UUID , SortItem, FilterItem} from "@common/types";
import { Logger } from "../../lib/utils/logger";
import { ApiResponse } from "../../lib/utils/apiResponse";
import { UserRepository } from "../../repositories/UserRepository";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

export class UserManagementService {
	static async Create(user: CreateUserDto, createdBy: UUID) {
		try {
			Logger.info("[UserManagementService] Creating user", { username: user.username, companyId: user.company_id });

			const { company_id, username, password, role } = user;

			if (!company_id || !username || !password) {
				Logger.error("[UserManagementService] Invalid user data", { user });
				return ApiResponse.error("Invalid user data");
			}

			// Check if username already exists
			const existingUser = await UserRepository.findByUsername(username);
			if (existingUser) {
				Logger.error("[UserManagementService] Username already exists", { username });
				return ApiResponse.error("Username already exists");
			}

			// Hash the password
			const passHash = await bcrypt.hash(password, SALT_ROUNDS);

			const newUser = await UserRepository.create({
				company_id,
				username,
				pass_hash: passHash,
				role: role ?? 0,
				created_by: createdBy,
			});

			Logger.info("[UserManagementService] User created successfully", { userId: newUser.id });
			return ApiResponse.success(newUser.id, "User created successfully");
		} catch (err: unknown) {
			const error = err instanceof Error ? err : new Error(String(err));
			Logger.error("[UserManagementService] Error creating user", error);
			return ApiResponse.error("Failed to create user");
		}
	}

	static async GetAllByCompany(companyId: UUID, page: number, limit: number, sorting: SortItem[] = [], filters: FilterItem[] = []) {
		try {
			Logger.info("[UserManagementService] GetAllByCompany called", { companyId, page, limit, sorting, filters });

			const offset = page * limit;

			const result = await UserRepository.findAllByCompany(companyId, limit, offset, sorting, filters);

			Logger.debug("[UserManagementService] Users fetched successfully", {
				companyId,
				count: result.rows.length,
				totalCount: result.count,
			});

			return ApiResponse.success({ rows: result.rows, count: result.count }, "Users retrieved successfully");
		} catch (err: unknown) {
			const error = err instanceof Error ? err : new Error(String(err));
			Logger.error("[UserManagementService] Error fetching users", error);
			return ApiResponse.error("Failed to fetch users");
		}
	}

	static async GetById(id: UUID) {
		Logger.info("[UserManagementService] GetById called", { id });

		try {
			const user = await UserRepository.findById(id);

			if (!user || user.deleted_at !== null) {
				Logger.warn("[UserManagementService] User not found", { id });
				return ApiResponse.success(null, "User not found");
			}

			const userDto: UserDto = {
				id: user.id,
				company_id: user.company_id,
				username: user.username,
				role: user.role as any,
				created_at: user.created_at,
				created_by: user.created_by,
				updated_at: user.updated_at,
			};

			Logger.info("[UserManagementService] Fetched user successfully", { id });
			return ApiResponse.success(userDto, "User retrieved successfully");
		} catch (err: unknown) {
			const error = err instanceof Error ? err : new Error(String(err));
			Logger.error("[UserManagementService] Error fetching user", error);
			return ApiResponse.error("Failed to fetch user");
		}
	}

	static async Update(id: UUID, userData: Partial<UserDto & { password?: string }>, updatedBy: UUID) {
		try {
			Logger.info("[UserManagementService] Update called", { id, userData });

			const { username, role, password } = userData;

			const updateData: any = {};

			if (username) {
				// Check if username already exists for a different user
				const existingUser = await UserRepository.findByUsername(username);
				if (existingUser && existingUser.id !== id) {
					Logger.error("[UserManagementService] Username already exists", { username });
					return ApiResponse.error("Username already exists");
				}
				updateData.username = username;
			}

			if (role !== undefined) {
				updateData.role = role;
			}

			if (password) {
				updateData.pass_hash = await bcrypt.hash(password, SALT_ROUNDS);
			}

			if (Object.keys(updateData).length === 0) {
				Logger.warn("[UserManagementService] No update data provided");
				return ApiResponse.error("No update data provided");
			}

			const [affectedRows] = await UserRepository.update(id, updateData);

			if (affectedRows === 0) {
				const exists = await UserRepository.findById(id);
				if (!exists) {
					Logger.warn("[UserManagementService] User not found", { id });
					return ApiResponse.error("User not found");
				}
			}

			Logger.info("[UserManagementService] Updated user successfully", { id });
			return ApiResponse.success({ id }, "User updated successfully");
		} catch (err: unknown) {
			const error = err instanceof Error ? err : new Error(String(err));
			Logger.error("[UserManagementService] Error updating user", error);
			return ApiResponse.error("Failed to update user");
		}
	}

	static async Delete(id: UUID, deletedBy: UUID) {
		try {
			Logger.info("[UserManagementService] Delete called", { id });

			const deletedCount = await UserRepository.delete(id, deletedBy);

			if (deletedCount === 0) {
				Logger.warn("[UserManagementService] User not found", { id });
				return ApiResponse.error("User not found");
			}

			Logger.info("[UserManagementService] Deleted user successfully", { id });
			return ApiResponse.success({ id }, "User deleted successfully");
		} catch (err: unknown) {
			const error = err instanceof Error ? err : new Error(String(err));
			Logger.error("[UserManagementService] Error deleting user", error);
			return ApiResponse.error("Failed to delete user");
		}
	}

	static async ResetPassword(id: UUID, newPassword: string) {
		try {
			Logger.info("[UserManagementService] ResetPassword called", { id });

			const passHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

			const [affectedRows] = await UserRepository.update(id, { pass_hash: passHash });

			if (affectedRows === 0) {
				const exists = await UserRepository.findById(id);
				if (!exists) {
					Logger.warn("[UserManagementService] User not found", { id });
					return ApiResponse.error("User not found");
				}
			}

			Logger.info("[UserManagementService] Password reset successfully", { id });
			return ApiResponse.success({ id }, "Password reset successfully");
		} catch (err: unknown) {
			const error = err instanceof Error ? err : new Error(String(err));
			Logger.error("[UserManagementService] Error resetting password", error);
			return ApiResponse.error("Failed to reset password");
		}
	}
}