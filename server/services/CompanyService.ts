import { UploadedFile } from "express-fileupload";
import path from "path";
import { ApiResponse } from "../lib/utils/apiResponse";
import { Logger } from "../lib/utils/logger";
import fs from "fs";
import { pool } from "../lib/db/pool";
import { CompanyDto, LogoSize, UUID } from "@common/types";

// Ensure uploads directory exists
const uploadDir = path.resolve(process.cwd(), "uploads", "logos");

export class CompanyService {
	static async GetCompanyById(companyId: UUID) {
		let conn;

		Logger.info("[CompanyService] GetCompanyById called", { companyId });

		if (!companyId) {
			Logger.error("[CompanyService] Company ID is required");
			return ApiResponse.error("Company ID is required");
		}

		try {
			conn = await pool.getConnection();
			Logger.debug("[CompanyService] Fetching company details", { companyId });

			const query = `
				SELECT *
				FROM companies
				WHERE id = ? AND deleted_at IS NULL
			`;

			const rows = (await conn.query(query, [companyId])) as CompanyDto[];

			if (Array.isArray(rows) && rows.length > 0) {
				const company = rows[0];

				Logger.info("[CompanyService] Company details fetched successfully", { companyId });

				return ApiResponse.success(
					{
						id: company.id,
						name: company.name,
						address: company.address,
						phone: company.phone,
						email: company.email,
						is_company: company.is_company,
						tax_number: company.tax_number,
						tax_office: company.tax_office,
						mersis_no: company.mersis_no,
						small_logo_path: company.small_logo_path,
						large_logo_path: company.large_logo_path,
					},
					"Company details fetched successfully",
				);
			} else {
				Logger.error("[CompanyService] Company not found", { companyId });
				return ApiResponse.error("Company not found");
			}
		} catch (error: any) {
			Logger.error("[CompanyService] Error fetching company details", { companyId, error: error.message });
			return ApiResponse.error(error.message || "Failed to fetch company details");
		} finally {
			if (conn) conn.release();
		}
	}

	static async UpdateCompanyDetails(companyId: UUID, details: CompanyDto) {
		let conn;

		Logger.info("[CompanyService] UpdateCompanyDetails called", { companyId });

		if (!companyId || !details.name || details.is_company === undefined || details.is_company === null) {
			Logger.error("[CompanyService] Company ID and required details are missing", { companyId });
			return ApiResponse.error("Company ID and required details are missing");
		}

		try {
			conn = await pool.getConnection();
			Logger.debug("[CompanyService] Updating company details", { companyId });
			await conn.query(
				`UPDATE companies SET name = ?, is_company = ?, address = ?, phone = ?, email = ?, tax_number = ?, tax_office = ?, mersis_no = ? WHERE id = ?`,
				[
					details.name,
					details.is_company,
					details.address || null,
					details.phone || null,
					details.email || null,
					details.tax_number || null,
					details.tax_office || null,
					details.mersis_no || null,
					companyId,
				],
			);

			Logger.info("[CompanyService] Company details updated successfully", { companyId });

			return ApiResponse.success(null, "Company details updated successfully");
		} catch (error: any) {
			Logger.error("[CompanyService] Error updating company details", { companyId, error: error.message });
			return ApiResponse.error(error.message || "Failed to update company details");
		} finally {
			if (conn) conn.release();
		}
	}

	static async UploadLogo(logoSize: LogoSize, logo: UploadedFile, companyId: UUID) {
		Logger.info("[CompanyService] Uploading logo", { logoSize, companyId, fileName: logo?.name });

		try {
			if (!logo) {
				Logger.error("[CompanyService] No file uploaded", { logoSize, companyId });
				return ApiResponse.error("No file uploaded");
			}

			// Validate file type
			const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
			if (!allowedTypes.includes(logo.mimetype)) {
				Logger.error("[CompanyService] Invalid file type", { logoSize, companyId, mimetype: logo.mimetype });
				return ApiResponse.error("Invalid file type. Only JPG and PNG are allowed.");
			}

			// Generate unique filename
			const fileExtension = path.extname(logo.name);
			const fileName = `${logoSize}-logo-${companyId}${fileExtension}`;
			const filePath = path.join(uploadDir, fileName);

			Logger.debug("[CompanyService] Moving file to uploads directory", { fileName, filePath });

			// Move file to uploads directory
			await logo.mv(filePath);

			const conn = await pool.getConnection();
			await conn.query(`UPDATE companies SET ${logoSize}_logo_path = ? WHERE id = ?`, [fileName, companyId]);
			conn.release();

			Logger.info("[CompanyService] Logo uploaded successfully", { logoSize, companyId, fileName });

			return ApiResponse.success(
				{
					filename: fileName,
					path: `/uploads/logos/${fileName}`,
				},
				"Logo uploaded successfully",
			);
		} catch (error: any) {
			Logger.error("[CompanyService] Error uploading logo", { logoSize, companyId, error: error.message });
			return ApiResponse.error(error.message || "Failed to upload logo");
		}
	}

	static async GetLogos(companyId: UUID) {
		let conn;

		Logger.debug("[CompanyService] Fetching logos", { companyId });

		try {
			conn = await pool.getConnection();
			const rows = (await conn.query("SELECT small_logo_path, large_logo_path FROM companies WHERE id = ?", [
				companyId,
			])) as { small_logo_path: string | null; large_logo_path: string | null }[];

			if (Array.isArray(rows) && rows.length > 0) {
				const company = rows[0];

				Logger.debug("[CompanyService] Logos fetched successfully", { companyId });

				return ApiResponse.success(
					{
						smallLogo: company.small_logo_path ? `/uploads/logos/${company.small_logo_path}` : null,
						largeLogo: company.large_logo_path ? `/uploads/logos/${company.large_logo_path}` : null,
					},
					"Logos fetched successfully",
				);
			} else {
				Logger.error("[CompanyService] Company not found", { companyId });
				return ApiResponse.error("Company not found");
			}
		} catch (error: any) {
			Logger.error("[CompanyService] Error fetching logos", { companyId, error: error.message });
			return ApiResponse.error(error.message || "Failed to fetch logos");
		} finally {
			if (conn) conn.release();
		}
	}

	static async DeleteLogo(logoSize: LogoSize, companyId: UUID) {
		let conn;

		Logger.info("[CompanyService] Deleting logo", { logoSize, companyId });

		try {
			conn = await pool.getConnection();
			const rows = (await conn.query(`SELECT ${logoSize}_logo_path FROM companies WHERE id = ?`, [companyId])) as any[];

			if (Array.isArray(rows) && rows.length > 0) {
				const company = rows[0];
				const logoPath = company[`${logoSize}_logo_path`];

				if (logoPath) {
					const fullPath = path.join(uploadDir, logoPath);

					Logger.debug("[CompanyService] Deleting logo file", { logoSize, companyId, fullPath });

					if (fs.existsSync(fullPath)) {
						fs.unlinkSync(fullPath);
					}

					await conn.query(`UPDATE companies SET ${logoSize}_logo_path = NULL WHERE id = ?`, [companyId]);

					Logger.info("[CompanyService] Logo deleted successfully", { logoSize, companyId });

					return ApiResponse.success(null, "Logo deleted successfully");
				} else {
					Logger.error("[CompanyService] No logo to delete", { logoSize, companyId });
					return ApiResponse.error("No logo to delete");
				}
			} else {
				Logger.error("[CompanyService] Company not found", { logoSize, companyId });
				return ApiResponse.error("Company not found");
			}
		} catch (error: any) {
			Logger.error("[CompanyService] Error deleting logo", { logoSize, companyId, error: error.message });
			return ApiResponse.error(error.message || "Failed to delete logo");
		} finally {
			if (conn) conn.release();
		}
	}
}
