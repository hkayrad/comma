import { UploadedFile } from "express-fileupload";
import path from "path";
import { Logger } from "@/lib/utils/logger";
import fs from "fs";
import type { CompanyDto, LogoSize, UUID } from "@comma/common/types";
import { CompanyRepository } from "@/repositories/CompanyRepository";
import sharp from "sharp";
import { NotFoundError, ValidationError } from "@/lib/errors/AppError";

// Ensure uploads directory exists
const uploadDir = path.resolve(process.cwd(), "uploads", "logos");
if (!fs.existsSync(uploadDir)) {
	fs.mkdirSync(uploadDir, { recursive: true });
}

export class CompanyService {
	static async GetCompanyById(companyId: UUID) {
		Logger.info("[CompanyService] GetCompanyById called", { companyId });

		if (!companyId) {
			throw new ValidationError("Company ID is required");
		}

		const company = await CompanyRepository.findById(companyId);

		if (!company) {
			throw new NotFoundError("Company not found");
		}

		Logger.info("[CompanyService] Company details fetched successfully", { companyId });

		return {
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
			work_start_time: company.work_start_time || "08:30",
			work_end_time: company.work_end_time || "18:00",
		};
	}

	static async UpdateCompanyDetails(companyId: UUID, details: CompanyDto) {
		Logger.info("[CompanyService] UpdateCompanyDetails called", { companyId });

		if (!companyId || !details.name || details.is_company === undefined || details.is_company === null) {
			throw new ValidationError("Company ID and required details are missing");
		}

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
			work_start_time: details.work_start_time || "08:30",
			work_end_time: details.work_end_time || "18:00",
		});


		if (affectedRows > 0) {
			Logger.info("[CompanyService] Company details updated successfully", { companyId });
		} else {
			Logger.warn("[CompanyService] Company not found or no changes made", { companyId });
		}
	}

	static async UploadLogo(logoSize: LogoSize, logo: UploadedFile, companyId: UUID) {
		Logger.info("[CompanyService] Uploading logo", { logoSize, companyId, fileName: logo?.name });

		if (!logo) {
			throw new ValidationError("No file uploaded");
		}

		// Validate file type
		const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
		if (!allowedTypes.includes(logo.mimetype)) {
			throw new ValidationError("Invalid file type. Only JPG, PNG and WebP are allowed.");
		}

		// Generate unique filename
		const fileName = `${logoSize}-logo-${companyId}.webp`;
		const filePath = path.join(uploadDir, fileName);

		Logger.debug("[CompanyService] Processing and moving file to uploads directory", { fileName, filePath });

		// Process with Sharp
		await sharp(logo.tempFilePath)
			.resize({
				width: logoSize === "small" ? 200 : 1000,
				height: logoSize === "small" ? 200 : 1000,
				fit: "inside",
				withoutEnlargement: true,
			})
			.rotate() // Auto-rotate based on EXIF
			.webp({ quality: 80, effort: 6 })
			.toFile(filePath);

		await CompanyRepository.update(companyId, { [`${logoSize}_logo_path`]: fileName });

		Logger.info("[CompanyService] Logo uploaded successfully", { logoSize, companyId, fileName });

		return {
			filename: fileName,
			path: `/uploads/logos/${fileName}`,
		};
	}

	static async GetLogos(companyId: UUID) {
		Logger.debug("[CompanyService] Fetching logos", { companyId });

		const company = await CompanyRepository.findByIdWithSpecificFields(companyId, ["small_logo_path", "large_logo_path"]);

		if (!company) {
			throw new NotFoundError("Company not found");
		}

		Logger.debug("[CompanyService] Logos fetched successfully", { companyId });

		return {
			smallLogo: company.small_logo_path ? `/uploads/logos/${company.small_logo_path}` : null,
			largeLogo: company.large_logo_path ? `/uploads/logos/${company.large_logo_path}` : null,
		};
	}

	static async DeleteLogo(logoSize: LogoSize, companyId: UUID) {
		Logger.info("[CompanyService] Deleting logo", { logoSize, companyId });

		const company = await CompanyRepository.findByIdWithSpecificFields(companyId, [`${logoSize}_logo_path`]);

		if (!company) {
			throw new NotFoundError("Company not found");
		}

		// @ts-ignore - dynamic access
		const logoPath = company[`${logoSize}_logo_path`];

		if (!logoPath) {
			throw new NotFoundError("No logo to delete");
		}

		const fullPath = path.join(uploadDir, logoPath);

		Logger.debug("[CompanyService] Deleting logo file", { logoSize, companyId, fullPath });

		if (fs.existsSync(fullPath)) {
			fs.unlinkSync(fullPath);
		}

		await CompanyRepository.update(companyId, { [`${logoSize}_logo_path`]: null });

		Logger.info("[CompanyService] Logo deleted successfully", { logoSize, companyId });
	}
}
