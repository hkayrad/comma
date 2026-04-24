import { Users, RefreshTokens } from "@/models";
import type { UserDto, UUID, SortItem, FilterItem } from "@comma/common/types";
import { sequelize } from "@/lib/db/sequelize";
import { QueryTypes, Transaction, LOCK } from "sequelize";

/** Data required to create a new user */
interface CreateUserData {
	company_id: string;
	username: string;
	pass_hash: string;
	role: number;
	created_by: string;
}

/** Fields that can be updated on a user record */
interface UserUpdateData {
	username?: string;
	pass_hash?: string;
	role?: number;
	deleted_by?: string;
	totp_secret?: string | null;
	totp_enabled?: boolean;
	totp_recovery_codes?: string | null;
	totp_failed_attempts?: number;
	totp_lockout_until?: Date | null;
}

/** Data required to create a refresh token */
interface RefreshTokenData {
	user_id: string;
	token_hash: string;
	expires_at: Date;
}

export class UserRepository {
	static async findByUsername(username: string, transaction?: Transaction) {
		return await Users.findOne({ where: { username }, transaction });
	}

	static async findById(id: UUID, transaction?: Transaction) {
		return await Users.findByPk(id, { transaction });
	}

	static async create(userData: CreateUserData, transaction?: Transaction) {
		return await Users.create(userData as Users["_creationAttributes"], { transaction });
	}

	static async update(id: UUID, updateData: UserUpdateData, transaction?: Transaction) {
		return await Users.update(updateData as Partial<Users>, { where: { id }, transaction });
	}

	static async delete(id: UUID, deletedBy: UUID, transaction?: Transaction) {
		await Users.update({ deleted_by: deletedBy } as Partial<Users>, { where: { id }, transaction });
		return await Users.destroy({ where: { id }, transaction });
	}

	static async restore(id: UUID, transaction?: Transaction) {
		return await (Users as any).restore({ where: { id }, transaction });
	}

	static async findAllByCompany(
		companyId: UUID,
		limit: number,
		offset: number,
		sorting: SortItem[] = [],
		filters: FilterItem[] = []
	): Promise<{ rows: UserDto[]; count: number }> {
		const colMap: Record<string, string> = {
			username: "u.username",
			role: "u.role",
			created_at: "u.created_at",
		};

		let whereClause = "WHERE u.company_id = ? AND u.deleted_at IS NULL";
		const replacements: (string | number | number[] | string[])[] = [companyId];

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
					replacements.push(value as string[]);
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

		return { rows: result, count: totalCount };
	}

	// Refresh Tokens specific operations
	static async createRefreshToken(tokenData: RefreshTokenData, transaction?: Transaction) {
		return await RefreshTokens.create(tokenData as RefreshTokens["_creationAttributes"], { transaction });
	}

	static async findRefreshTokenByHash(tokenHash: string, transaction?: Transaction, lock?: LOCK) {
		return await RefreshTokens.findOne({
			where: { token_hash: tokenHash },
			lock,
			transaction,
		});
	}

	static async deleteExpiredRefreshTokens(userId: UUID, transaction?: Transaction) {
		const { Op } = await import("sequelize");
		return await RefreshTokens.destroy({
			where: {
				user_id: userId,
				expires_at: { [Op.lt]: new Date() },
			},
			transaction,
		});
	}

	static async deleteRefreshToken(tokenHash: string, transaction?: Transaction) {
		return await RefreshTokens.destroy({
			where: { token_hash: tokenHash },
			transaction,
		});
	}

	static async revokeAllRefreshTokens(userId: UUID, transaction?: Transaction) {
		return await RefreshTokens.update(
			{ revoked: true },
			{ where: { user_id: userId }, transaction }
		);
	}
}
