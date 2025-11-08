import instance from "../instance";

export class CompanyApi {
    static async UploadLogo(logo: File, size: 'small' | 'large' = 'small') {
        try {
            const formData = new FormData();
            formData.append('logo', logo);

            const response = await instance.post(`/company/logo/${size}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            console.error("Error uploading company logo:", error);
            throw error;
        }
    }

    static async GetLogos() {
        try {
            const response = await instance.get(`/company/logos`);
            return response.data;
        } catch (error) {
            console.error("Error fetching company logos:", error);
            throw error;
        }
    }

    static async DeleteLogo(size: 'small' | 'large' = 'small') {
        try {
            const response = await instance.delete(`/company/logo/${size}`);
            return response.data;
        } catch (error) {
            console.error("Error deleting company logo:", error);
            throw error;
        }
    }
}