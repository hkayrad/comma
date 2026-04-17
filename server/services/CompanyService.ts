import { UploadedFile } from "express-fileupload";
import path from "path";
import { Logger } from "../lib/utils/logger";
import { ApiResponse } from "../lib/utils/apiResponse";
import fs from "fs";
import { CompanyDto, LogoSize, UUID } from "@common/types";
import { CompanyRepository } from "../repositories/CompanyRepository";
import sharp from "sharp";

// Ensure uploads directory exists
const uploadDir = path.resolve(process.cwd(), "uploads", "logos");

export class CompanyService {
	static async GetCompanyById(companyId: UUID) {
		Logger.info("[CompanyService] GetCompanyById called", { companyId });

		if (!companyId) {
			Logger.error("[CompanyService] Company ID is required");
			return ApiResponse.error("Company ID is required");
		}

		try {
			Logger.debug("[CompanyService] Fetching company details", { companyId });

			const company = await CompanyRepository.findById(companyId);

			if (company) {
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
		} catch (err: unknown) {
			const error = err instanceof Error ? err : new Error(String(err));
			Logger.error("[CompanyService] Error fetching company details", { companyId, error: error.message });
			return ApiResponse.error(error.message || "Failed to fetch company details");
		}
	}

	static async UpdateCompanyDetails(companyId: UUID, details: CompanyDto) {
		Logger.info("[CompanyService] UpdateCompanyDetails called", { companyId });

		if (!companyId || !details.name || details.is_company === undefined || details.is_company === null) {
			Logger.error("[CompanyService] Company ID and required details are missing", { companyId });
			return ApiResponse.error("Company ID and required details are missing");
		}

		try {
			Logger.debug("[CompanyService] Updating company details", { companyId });

			const [affectedRows] = await CompanyRepository.update(companyId, {
				name: details.name,
				is_company: details.is_company,
				address: details.address || null,
				phone: details.phone || null,
				email: details.email || null,
				tax_number: details.tax_number || null,
				tax_office: details.tax_office || null,
				mersis_no: details.mersis_no || null,
			});

			if (affectedRows > 0) {
				Logger.info("[CompanyService] Company details updated successfully", { companyId });
				return ApiResponse.success(null, "Company details updated successfully");
			} else {
				Logger.warn("[CompanyService] Company not found or no changes made", { companyId });
				return ApiResponse.success(null, "Company details updated successfully");
			}
		} catch (err: unknown) {
			const error = err instanceof Error ? err : new Error(String(err));
			Logger.error("[CompanyService] Error updating company details", { companyId, error: error.message });
			return ApiResponse.error(error.message || "Failed to update company details");
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
			const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
			if (!allowedTypes.includes(logo.mimetype)) {
				Logger.error("[CompanyService] Invalid file type", { logoSize, companyId, mimetype: logo.mimetype });
				return ApiResponse.error("Invalid file type. Only JPG, PNG and WebP are allowed.");
			}

			// Generate unique filename
			const fileName = `${logoSize}-logo-${companyId}.webp`;
			const filePath = path.join(uploadDir, fileName);

			Logger.debug("[CompanyService] Processing and moving file to uploads directory", { fileName, filePath });

			// Process with Sharp
			const transformer = sharp(logo.tempFilePath);

			if (logoSize === "small") {
				transformer.resize(200);
			} else if (logoSize === "large") {
				transformer.resize(500);
			}

			await transformer.webp({ quality: 80 }).toFile(filePath);

			await CompanyRepository.update(companyId, { [`${logoSize}_logo_path`]: fileName });

			Logger.info("[CompanyService] Logo uploaded successfully", { logoSize, companyId, fileName });

			return ApiResponse.success(
				{
					filename: fileName,
					path: `/uploads/logos/${fileName}`,
				},
				"Logo uploaded successfully",
			);
		} catch (err: unknown) {
			const error = err instanceof Error ? err : new Error(String(err));
			Logger.error("[CompanyService] Error uploading logo", { logoSize, companyId, error: error.message });
			return ApiResponse.error(error.message || "Failed to upload logo");
		}
	}

	static async GetLogos(companyId: UUID) {
		Logger.debug("[CompanyService] Fetching logos", { companyId });

		try {
			const company = await CompanyRepository.findByIdWithSpecificFields(companyId, ["small_logo_path", "large_logo_path"]);

			if (company) {
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
		} catch (err: unknown) {
			const error = err instanceof Error ? err : new Error(String(err));
			Logger.error("[CompanyService] Error fetching logos", { companyId, error: error.message });
			return ApiResponse.error(error.message || "Failed to fetch logos");
		}
	}

	static async DeleteLogo(logoSize: LogoSize, companyId: UUID) {
		Logger.info("[CompanyService] Deleting logo", { logoSize, companyId });

		try {
			const company = await CompanyRepository.findByIdWithSpecificFields(companyId, [`${logoSize}_logo_path`]);

			if (company) {
				// @ts-ignore - dynamic access
				const logoPath = company[`${logoSize}_logo_path`];

				if (logoPath) {
					const fullPath = path.join(uploadDir, logoPath);

					Logger.debug("[CompanyService] Deleting logo file", { logoSize, companyId, fullPath });

					if (fs.existsSync(fullPath)) {
						fs.unlinkSync(fullPath);
					}

					await CompanyRepository.update(companyId, { [`${logoSize}_logo_path`]: null });

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
		} catch (err: unknown) {
			const error = err instanceof Error ? err : new Error(String(err));
			Logger.error("[CompanyService] Error deleting logo", { logoSize, companyId, error: error.message });
			return ApiResponse.error(error.message || "Failed to delete logo");
		}
	}
}
