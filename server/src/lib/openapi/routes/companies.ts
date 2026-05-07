import { registry } from '../registry';
import { companySchema } from '@comma/common/schemas';
import { z } from 'zod';

const CompanyDtoSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string(),
  is_company: z.boolean(),
  address: z.string().nullish(),
  phone: z.string().nullish(),
  email: z.string().email().nullish(),
  tax_number: z.string().nullish(),
  tax_office: z.string().nullish(),
  mersis_no: z.string().nullish(),
  small_logo_path: z.string().nullish(),
  large_logo_path: z.string().nullish(),
  created_at: z.date().optional(),
  updated_at: z.date().optional(),
});

registry.registerPath({
  method: 'put',
  path: '/companies',
  summary: 'Update company details',
  tags: ['Companies'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: companySchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Company details updated successfully',
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(true),
            message: z.string(),
          }),
        },
      },
    },
  },
});

registry.registerPath({
  method: 'get',
  path: '/companies/id',
  summary: 'Get company details by ID (from session)',
  tags: ['Companies'],
  responses: {
    200: {
      description: 'Successful retrieval of company details',
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(true),
            data: CompanyDtoSchema,
          }),
        },
      },
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/companies/logo/small',
  summary: 'Upload small logo',
  tags: ['Companies'],
  request: {
    body: {
      content: {
        'multipart/form-data': {
          schema: z.object({
            logo: z.any().openapi({ type: 'string', format: 'binary' }),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Logo uploaded successfully',
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(true),
            data: z.string(),
            message: z.string(),
          }),
        },
      },
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/companies/logo/large',
  summary: 'Upload large logo',
  tags: ['Companies'],
  request: {
    body: {
      content: {
        'multipart/form-data': {
          schema: z.object({
            logo: z.any().openapi({ type: 'string', format: 'binary' }),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Logo uploaded successfully',
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(true),
            data: z.string(),
            message: z.string(),
          }),
        },
      },
    },
  },
});

registry.registerPath({
  method: 'delete',
  path: '/companies/logo/small',
  summary: 'Delete small logo',
  tags: ['Companies'],
  responses: {
    200: {
      description: 'Logo deleted successfully',
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(true),
            message: z.string(),
          }),
        },
      },
    },
  },
});

registry.registerPath({
  method: 'delete',
  path: '/companies/logo/large',
  summary: 'Delete large logo',
  tags: ['Companies'],
  responses: {
    200: {
      description: 'Logo deleted successfully',
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(true),
            message: z.string(),
          }),
        },
      },
    },
  },
});

registry.registerPath({
  method: 'get',
  path: '/companies/logos',
  summary: 'Get company logos',
  tags: ['Companies'],
  responses: {
    200: {
      description: 'Successful retrieval of logos',
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(true),
            data: z.object({
              small_logo_path: z.string().nullable(),
              large_logo_path: z.string().nullable(),
            }),
          }),
        },
      },
    },
  },
});
