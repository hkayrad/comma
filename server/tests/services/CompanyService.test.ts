import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CompanyService } from '../../services/CompanyService';
import { CompanyRepository } from '../../repositories/CompanyRepository';
import { NotFoundError, ValidationError } from '../../lib/errors/AppError';
import fs from 'fs';
import sharp from 'sharp';

vi.mock('sharp', () => {
  const sharpMock = {
    resize: vi.fn().mockReturnThis(),
    webp: vi.fn().mockReturnThis(),
    toFile: vi.fn().mockResolvedValue({}),
  };
  return { default: vi.fn(() => sharpMock) };
});

describe('CompanyService', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('GetCompanyById', () => {
    it('should throw ValidationError if companyId missing', async () => {
      await expect(CompanyService.GetCompanyById('')).rejects.toThrow(ValidationError);
    });

    it('should throw NotFoundError if company not found', async () => {
      vi.spyOn(CompanyRepository, 'findById').mockResolvedValue(null);
      await expect(CompanyService.GetCompanyById('1')).rejects.toThrow(NotFoundError);
    });

    it('should return company details', async () => {
      const mockCompany = { id: '1', name: 'Test' };
      vi.spyOn(CompanyRepository, 'findById').mockResolvedValue(mockCompany as any);
      
      const result = await CompanyService.GetCompanyById('1');
      expect(result.name).toBe('Test');
    });
  });

  describe('UpdateCompanyDetails', () => {
    it('should throw ValidationError if required fields missing', async () => {
      await expect(CompanyService.UpdateCompanyDetails('1', {} as any)).rejects.toThrow(ValidationError);
    });

    it('should update company details', async () => {
      vi.spyOn(CompanyRepository, 'update').mockResolvedValue([1] as any);
      await CompanyService.UpdateCompanyDetails('1', { name: 'New Name', is_company: true } as any);
      expect(CompanyRepository.update).toHaveBeenCalled();
    });
  });

  describe('UploadLogo', () => {
      it('should throw ValidationError if no file', async () => {
          await expect(CompanyService.UploadLogo('small', null as any, '1')).rejects.toThrow(ValidationError);
      });

      it('should throw ValidationError if invalid type', async () => {
          const mockFile = { mimetype: 'text/plain' };
          await expect(CompanyService.UploadLogo('small', mockFile as any, '1')).rejects.toThrow(ValidationError);
      });

      it('should process and upload logo', async () => {
          const mockFile = { mimetype: 'image/png', tempFilePath: '/tmp/test.png' };
          vi.spyOn(CompanyRepository, 'update').mockResolvedValue([1]);

          const result = await CompanyService.UploadLogo('small', mockFile as any, '1');
          expect(result.filename).toContain('small-logo-1.webp');
          expect(CompanyRepository.update).toHaveBeenCalled();
          expect(sharp).toHaveBeenCalledWith('/tmp/test.png');
      });
  });

  describe('GetLogos', () => {
    it('should return logo paths', async () => {
      vi.spyOn(CompanyRepository, 'findByIdWithSpecificFields').mockResolvedValue({ small_logo_path: 'small.png' } as any);
      const result = await CompanyService.GetLogos('1');
      expect(result.smallLogo).toBe('/uploads/logos/small.png');
    });

    it('should throw NotFoundError if company not found', async () => {
        vi.spyOn(CompanyRepository, 'findByIdWithSpecificFields').mockResolvedValue(null);
        await expect(CompanyService.GetLogos('1')).rejects.toThrow(NotFoundError);
    });
  });

  describe('DeleteLogo', () => {
    it('should delete logo file and update repository', async () => {
      vi.spyOn(CompanyRepository, 'findByIdWithSpecificFields').mockResolvedValue({ small_logo_path: 'small.png' } as any);
      vi.spyOn(fs, 'existsSync').mockReturnValue(true);
      vi.spyOn(fs, 'unlinkSync').mockReturnValue(undefined);
      vi.spyOn(CompanyRepository, 'update').mockResolvedValue([1] as any);

      await CompanyService.DeleteLogo('small', '1');
      
      expect(fs.unlinkSync).toHaveBeenCalled();
      expect(CompanyRepository.update).toHaveBeenCalledWith('1', { small_logo_path: null });
    });

    it('should throw NotFoundError if no logo found to delete', async () => {
        vi.spyOn(CompanyRepository, 'findByIdWithSpecificFields').mockResolvedValue({ small_logo_path: null } as any);
        await expect(CompanyService.DeleteLogo('small', '1')).rejects.toThrow(NotFoundError);
    });
  });
});
