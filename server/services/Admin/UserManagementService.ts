import { CreateUserDto, UserDto, UUID , SortItem, FilterItem} from "@common/types";
import { Logger } from "../../lib/utils/logger";
import { ApiResponse } from "../../lib/utils/apiResponse";
import { Users } from "../../models";
import { sequelize } from "../../lib/db/sequelize";
import { QueryTypes } from "sequelize";
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
			const existingUser = await Users.findOne({ where: { username } });
			if (existingUser) {
				Logger.error("[UserManagementService] Username already exists", { username });
				return ApiResponse.error("Username already exists");
			}

			// Hash the password
			const passHash = await bcrypt.hash(password, SALT_ROUNDS);

			const newUser = await Users.create({
				company_id,
				username,
				pass_hash: passHash,
				role: role ?? 0,
				created_by: createdBy,
			} as any);

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

			const colMap: Record<string, string> = {
				username: "u.username",
				role: "u.role",
				created_at: "u.created_at",
			};

			let whereClause = "WHERE u.company_id = ? AND u.deleted_at IS NULL";
			const replacements: any[] = [companyId];

			if (filters && filters.length > 0) {
				filters.forEach((filter) => {
					const { id, value } = filter;

					if (id === "role") {
						const roleValues = Array.isArray(value) ? value : [value];
						const mapped = roleValues.map((v) => parseInt(String(v), 10));
						if (mapped.length > 0) {
							whereClause += ` AND u.role IN (?)`;
							replacements.push(mapped);
						}
						return;
					}

					const dbCol = colMap[id];
					if (!dbCol) return;

					if (Array.isArray(value) && value.length > 0) {
						whereClause += ` AND ${dbCol} IN (?)`;
						replacements.push(value);
					} else if (typeof value === "string" && value.trim() !== "") {
						whereClause += ` AND ${dbCol} LIKE ?`;
						replacements.push(`%${value}%`);
					}
				});
			}

			let orderClause = "ORDER BY u.created_at DESC";
			if (sorting && sorting.length > 0) {
				const sortParts = sorting
					.map((sort) => {
						const dbCol = colMap[sort.id];
						if (!dbCol) return null;
						return `${dbCol} ${sort.desc ? "DESC" : "ASC"}`;
					})
					.filter(Boolean);

				if (sortParts.length > 0) {
					orderClause = `ORDER BY ${sortParts.join(", ")}`;
				}
			}

			const countQuery = `
				SELECT COUNT(*) as count
				FROM users u
				${whereClause}
			`;

			const countResult = (await sequelize.query(countQuery, {
				replacements,
				type: QueryTypes.SELECT,
			})) as { count: number }[];

			const totalCount = countResult[0]?.count || 0;

			const query = `
				SELECT
					u.id,
					u.company_id,
					u.username,
					u.role,
					u.created_at,
					u.created_by,
					u.updated_at
				FROM users u
				${whereClause}
				${orderClause}
				LIMIT ? OFFSET ?;
			`;

			const result = (await sequelize.query(query, {
				replacements: [...replacements, limit, offset],
				type: QueryTypes.SELECT,
			})) as UserDto[];

			Logger.debug("[UserManagementService] Users fetched successfully", {
				companyId,
				count: result.length,
				totalCount,
			});

			return ApiResponse.success({ rows: result, count: totalCount }, "Users retrieved successfully");
		} catch (err: unknown) {
			const error = err instanceof Error ? err : new Error(String(err));
			Logger.error("[UserManagementService] Error fetching users", error);
			return ApiResponse.error("Failed to fetch users");
		}
	}

	static async GetById(id: UUID) {
		Logger.info("[UserManagementService] GetById called", { id });

		try {
			const query = `
				SELECT
					u.id,
					u.company_id,
					u.username,
					u.role,
					u.created_at,
					u.created_by,
					u.updated_at
				FROM users u
				WHERE u.id = ? AND u.deleted_at IS NULL
			`;

			const result = (await sequelize.query(query, {
				replacements: [id],
				type: QueryTypes.SELECT,
			})) as UserDto[];

			if (!result || result.length === 0) {
				Logger.warn("[UserManagementService] User not found", { id });
				return ApiResponse.success(null, "User not found");
			}

			Logger.info("[UserManagementService] Fetched user successfully", { id });
			return ApiResponse.success(result[0], "User retrieved successfully");
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
				const existingUser = await Users.findOne({ where: { username } });
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

			const [affectedRows] = await Users.update(updateData, {
				where: { id },
			});

			if (affectedRows === 0) {
				const exists = await Users.findByPk(id);
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

			// First update deleted_by
			await Users.update({ deleted_by: deletedBy } as any, { where: { id } });

			// Then soft delete
			const deletedCount = await Users.destroy({
				where: { id },
			});

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

			const [affectedRows] = await Users.update(
				{ pass_hash: passHash } as any,
				{ where: { id } }
			);

			if (affectedRows === 0) {
				const exists = await Users.findByPk(id);
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