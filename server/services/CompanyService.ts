import { UploadedFile } from 'express-fileupload';
import path from 'path';
import { ApiResponse } from '../utils/apiResponse';
import { Logger } from '../utils/logger';
import fs from 'fs';
import { pool } from '../utils/db/pool';

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads/logos');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

export class CompanyService {
    static async UploadLogo(logoSize: 'small' | 'large', logo: UploadedFile, companyId: string) {
        try {
            if (!logo) {
                return ApiResponse.error('No file uploaded');
            }

            // Validate file type
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
            if (!allowedTypes.includes(logo.mimetype)) {
                return ApiResponse.error('Invalid file type. Only JPG and PNG are allowed.');
            }

            // Generate unique filename
            const fileExtension = path.extname(logo.name);
            const fileName = `${logoSize}-logo-${companyId}-${Date.now()}${fileExtension}`;
            const filePath = path.join(uploadDir, fileName);

            // Move file to uploads directory
            await logo.mv(filePath);

            const conn = await pool.getConnection();
            await conn.query(`UPDATE companies SET ${logoSize}_logo_path = ? WHERE id = ?`, [fileName, companyId]);
            conn.release();

            Logger.info(`${logoSize} logo uploaded: ${fileName}`);

            return ApiResponse.success({
                filename: fileName,
                path: `/uploads/logos/${fileName}`
            }, 'Logo uploaded successfully');

        } catch (error: any) {
            Logger.error('Error uploading logo:', error);
            return ApiResponse.error(error.message || 'Failed to upload logo');
        }
    }

    static async GetLogos(companyId: string) {
        let conn;

        try {
            conn = await pool.getConnection();
            const rows = await conn.query('SELECT small_logo_path, large_logo_path FROM companies WHERE id = ?', [companyId]);

            Logger.info(`Fetching logos for company: ${companyId}`);

            if (Array.isArray(rows) && rows.length > 0) {
                const company = rows[0] as any;

                return ApiResponse.success({
                    smallLogo: company.small_logo_path
                        ? `/uploads/logos/${company.small_logo_path}`
                        : null,
                    largeLogo: company.large_logo_path
                        ? `/uploads/logos/${company.large_logo_path}`
                        : null
                }, 'Logos fetched successfully');
            } else {
                return ApiResponse.error('Company not found');
            }
        } catch (error: any) {
            Logger.error('Error fetching logos:', error);
            return ApiResponse.error(error.message || 'Failed to fetch logos');
        } finally {
            if (conn) conn.release();
        }
    }

    static async DeleteLogo(logoSize: 'small' | 'large', companyId: string) {
        let conn;

        try {
            conn = await pool.getConnection();
            const rows = await conn.query(`SELECT ${logoSize}_logo_path FROM companies WHERE id = ?`, [companyId]);

            Logger.info(`Deleting ${logoSize} logo for company: ${companyId}`);

            if (Array.isArray(rows) && rows.length > 0) {
                const company = rows[0] as any;
                const logoPath = company[`${logoSize}_logo_path`];

                if (logoPath) {
                    const fullPath = path.join(uploadDir, logoPath);
                    if (fs.existsSync(fullPath)) {
                        fs.unlinkSync(fullPath);
                    }

                    await conn.query(`UPDATE companies SET ${logoSize}_logo_path = NULL WHERE id = ?`, [companyId]);

                    return ApiResponse.success(null, 'Logo deleted successfully');
                } else {
                    return ApiResponse.error('No logo to delete');
                }
            } else {
                return ApiResponse.error('Company not found');
            }
        } catch (error: any) {
            Logger.error('Error deleting logo:', error);
            return ApiResponse.error(error.message || 'Failed to delete logo');
        } finally {
            if (conn) conn.release();
        }
    }
}