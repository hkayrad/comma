import instance from "../instance";
import type { CompanyDto } from "../../../../common/types";
import { Logger } from "../utils/logger";

export class CompanyApi {
	static async GetCompanyById() {
		try {
			const response = await instance.get(`/companies/id`);
			return response.data;
		} catch (error) {
			Logger.error("Error fetching company details:", error);
			throw error;
		}
	}

	static async UpdateCompanyDetails(details: CompanyDto) {
		try {
			const response = await instance.put(`/companies`, details);
			return response.data;
		} catch (error) {
			Logger.error("Error updating company details:", error);
			throw error;
		}
	}

	static async UploadLogo(logo: File, size: "small" | "large" = "small") {
		try {
			const formData = new FormData();
			formData.append("logo", logo);

			const response = await instance.post(`/companies/logo/${size}`, formData, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
			});
			return response.data;
		} catch (error) {
			Logger.error("Error uploading company logo:", error);
			throw error;
		}
	}

	static async GetLogos() {
		try {
			const response = await instance.get(`/companies/logos`);
			Logger.info("Logos response:", response);
			return response.data;
		} catch (error) {
			Logger.error("Error fetching company logos:", error);
			throw error;
		}
	}

	static async DeleteLogo(size: "small" | "large" = "small") {
		try {
			const response = await instance.delete(`/companies/logo/${size}`);
			return response.data;
		} catch (error) {
			Logger.error("Error deleting company logo:", error);
			throw error;
		}
	}
}
