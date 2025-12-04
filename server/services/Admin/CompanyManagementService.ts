import { CompanyDto, InsertResult, UUID } from "@common/types";
import { pool } from "../../lib/db/pool";
import { ApiResponse, Logger } from "../../lib/utils/index";
import dotenv from "dotenv";

dotenv.config();

export class CompanyManagementService {
	static async Create(company: CompanyDto) {
		let conn;

		try {
			Logger.info("[CompanyManagementService] Creating company", { company });

			const { name, phone, is_company, tax_number, tax_office, mersis_no, email, address } = company;

			if (!name || !email) {
				Logger.error("[CompanyManagementService] Invalid company data", { company });
				return ApiResponse.error("Invalid company data");
			}

			const query = `
				INSERT INTO companies (name, phone, is_company, tax_number, tax_office, mersis_no, email, address)
				VALUES (?, ?, ?, ?, ?, ?, ?, ?)
				RETURNING id;
			`;

			conn = await pool.getConnection();

			const result = (await conn.query(query, [
				name,
				phone,
				is_company,
				tax_number,
				tax_office,
				mersis_no,
				email,
				address,
			])) as InsertResult[];

			Logger.debug("[CompanyManagementService] Company creation result", { result });

			if (!result || result.length === 0) {
				Logger.error("[CompanyManagementService] Failed to create company");
				return ApiResponse.error("Failed to create company");
			}

			Logger.info("[CompanyManagementService] Company created successfully");
			return ApiResponse.success(result[0].id, "Company created successfully");
		} catch (error: any) {
			Logger.error("[CompanyManagementService] Error creating company", error);
			return ApiResponse.error("Failed to create company");
		} finally {
			if (conn) {
				conn.release();
			}
		}
	}

	static async GetAll() {
		let conn;

		Logger.info("[CompanyManagementService] GetAll called");

		try {
			conn = await pool.getConnection();
			Logger.debug("[CompanyManagementService] Fetching companies");
			const rows = (await conn.query("SELECT * FROM companies WHERE is_company != 2")) as CompanyDto[];

			if (!rows || rows.length === 0) {
				Logger.warn("[CompanyManagementService] No companies found");
				return ApiResponse.success([]);
			}

			Logger.info("[CompanyManagementService] Fetched companies successfully");
			return ApiResponse.success(rows);
		} catch (error: any) {
			Logger.error("[CompanyManagementService] Error fetching companies", error);
			return ApiResponse.error("Failed to fetch companies");
		} finally {
			if (conn) {
				conn.release();
			}
		}
	}

	static async GetById(id: UUID) {
		let conn;

		Logger.info("[CompanyManagementService] GetById called");

		try {
			conn = await pool.getConnection();
			Logger.debug("[CompanyManagementService] Fetching company");
			const rows = (await conn.query("SELECT * FROM companies WHERE id = ?", [id])) as CompanyDto[];

			if (!rows || rows.length === 0) {
				Logger.warn("[CompanyManagementService] No company found");
				return ApiResponse.success(null);
			}

			Logger.info("[CompanyManagementService] Fetched company successfully");
			return ApiResponse.success(rows[0]);
		} catch (error: any) {
			Logger.error("[CompanyManagementService] Error fetching company", error);
			return ApiResponse.error("Failed to fetch company");
		} finally {
			if (conn) {
				conn.release();
			}
		}
	}

	static async Update(id: UUID, company: CompanyDto) {
		let conn;

		try {
			Logger.info("[CompanyManagementService] Update called", { company });

			const { name, phone, is_company, tax_number, tax_office, mersis_no, email, address } = company;

			if (!name || !email) {
				Logger.error("[CompanyManagementService] Invalid company data", { company });
				return ApiResponse.error("Invalid company data");
			}

			conn = await pool.getConnection();
			Logger.debug("[CompanyManagementService] Updating company");
			const rows = (await conn.query(
				"UPDATE companies SET name = ?, phone = ?, is_company = ?, tax_number = ?, tax_office = ?, mersis_no = ?, email = ?, address = ? WHERE id = ?",
				[name, phone, is_company, tax_number, tax_office, mersis_no, email, address, id],
			)) as CompanyDto[];

			if (!rows || rows.length === 0) {
				Logger.warn("[CompanyManagementService] No company found");
				return ApiResponse.success(null);
			}

			Logger.info("[CompanyManagementService] Updated company successfully");
			return ApiResponse.success(rows[0]);
		} catch (error: any) {
			Logger.error("[CompanyManagementService] Error updating company", error);
			return ApiResponse.error("Failed to update company");
		} finally {
			if (conn) {
				conn.release();
			}
		}
	}

	static async Delete(id: UUID) {
		let conn;

		try {
			Logger.info("[CompanyManagementService] Delete called", { id });

			conn = await pool.getConnection();
			Logger.debug("[CompanyManagementService] Deleting company");
			const rows = (await conn.query("DELETE FROM companies WHERE id = ?", [id])) as InsertResult[];

			if (!rows || rows.length === 0) {
				Logger.warn("[CompanyManagementService] No company found");
				return ApiResponse.success(null);
			}

			Logger.info("[CompanyManagementService] Deleted company successfully");
			return ApiResponse.success(rows[0]);
		} catch (error: any) {
			Logger.error("[CompanyManagementService] Error deleting company", error);
			return ApiResponse.error("Failed to delete company");
		} finally {
			if (conn) {
				conn.release();
			}
		}
	}
}
