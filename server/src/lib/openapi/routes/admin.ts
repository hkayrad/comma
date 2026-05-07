import { registry } from '../registry';
import { companySchema, createUserSchema } from '@comma/common/schemas';
import { z } from 'zod';

const paginationParams = [
  {
    name: 'page',
    in: 'query' as const,
    schema: { type: 'integer' as const, default: 0 },
  },
  {
    name: 'limit',
    in: 'query' as const,
    schema: { type: 'integer' as const, default: 20 },
  },
  {
    name: 'sorting',
    in: 'query' as const,
    schema: { type: 'string' as const },
    description: 'JSON string for sorting',
  },
  {
    name: 'filters',
    in: 'query' as const,
    schema: { type: 'string' as const },
    description: 'JSON string for filters',
  },
];

// Admin Companies
registry.registerPath({
  method: 'post',
  path: '/admin/companies',
  summary: 'Create a new company',
  tags: ['Admin - Companies'],
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
      description: 'Company created successfully',
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(true),
            data: z.string().uuid(),
            message: z.string(),
          }),
        },
      },
    },
  },
});

registry.registerPath({
  method: 'get',
  path: '/admin/companies',
  summary: 'Get all companies',
  tags: ['Admin - Companies'],
  parameters: paginationParams,
  responses: {
    200: {
      description: 'Successful retrieval of companies',
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(true),
            data: z.any(),
          }),
        },
      },
    },
  },
});

registry.registerPath({
  method: 'get',
  path: '/admin/companies/{id}',
  summary: 'Get company by ID',
  tags: ['Admin - Companies'],
  parameters: [
    {
      name: 'id',
      in: 'path',
      required: true,
      schema: { type: 'string', format: 'uuid' },
    },
  ],
  responses: {
    200: {
      description: 'Successful retrieval of company',
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(true),
            data: z.any(),
          }),
        },
      },
    },
  },
});

registry.registerPath({
  method: 'put',
  path: '/admin/companies/{id}',
  summary: 'Update company',
  tags: ['Admin - Companies'],
  parameters: [
    {
      name: 'id',
      in: 'path',
      required: true,
      schema: { type: 'string', format: 'uuid' },
    },
  ],
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
      description: 'Company updated successfully',
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(true),
            data: z.any(),
            message: z.string(),
          }),
        },
      },
    },
  },
});

registry.registerPath({
  method: 'delete',
  path: '/admin/companies/{id}',
  summary: 'Delete company',
  tags: ['Admin - Companies'],
  parameters: [
    {
      name: 'id',
      in: 'path',
      required: true,
      schema: { type: 'string', format: 'uuid' },
    },
  ],
  responses: {
    200: {
      description: 'Company deleted successfully',
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
  method: 'post',
  path: '/admin/companies/{id}/restore',
  summary: 'Restore company',
  tags: ['Admin - Companies'],
  parameters: [
    {
      name: 'id',
      in: 'path',
      required: true,
      schema: { type: 'string', format: 'uuid' },
    },
  ],
  responses: {
    200: {
      description: 'Company restored successfully',
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

// Admin Users
registry.registerPath({
  method: 'post',
  path: '/admin/users',
  summary: 'Create a new user',
  tags: ['Admin - Users'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: createUserSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'User created successfully',
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(true),
            data: z.string().uuid(),
            message: z.string(),
          }),
        },
      },
    },
  },
});

registry.registerPath({
  method: 'get',
  path: '/admin/users/company/{companyId}',
  summary: 'Get all users for a company',
  tags: ['Admin - Users'],
  parameters: [
    {
      name: 'companyId',
      in: 'path',
      required: true,
      schema: { type: 'string', format: 'uuid' },
    },
    ...paginationParams,
  ],
  responses: {
    200: {
      description: 'Successful retrieval of users',
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(true),
            data: z.any(),
          }),
        },
      },
    },
  },
});

registry.registerPath({
  method: 'get',
  path: '/admin/users/{id}',
  summary: 'Get user by ID',
  tags: ['Admin - Users'],
  parameters: [
    {
      name: 'id',
      in: 'path',
      required: true,
      schema: { type: 'string', format: 'uuid' },
    },
  ],
  responses: {
    200: {
      description: 'Successful retrieval of user',
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(true),
            data: z.any(),
          }),
        },
      },
    },
  },
});

registry.registerPath({
  method: 'put',
  path: '/admin/users/{id}',
  summary: 'Update user',
  tags: ['Admin - Users'],
  parameters: [
    {
      name: 'id',
      in: 'path',
      required: true,
      schema: { type: 'string', format: 'uuid' },
    },
  ],
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            username: z.string().optional(),
            role: z.number().optional(),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'User updated successfully',
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(true),
            data: z.any(),
            message: z.string(),
          }),
        },
      },
    },
  },
});

registry.registerPath({
  method: 'delete',
  path: '/admin/users/{id}',
  summary: 'Delete user',
  tags: ['Admin - Users'],
  parameters: [
    {
      name: 'id',
      in: 'path',
      required: true,
      schema: { type: 'string', format: 'uuid' },
    },
  ],
  responses: {
    200: {
      description: 'User deleted successfully',
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
  method: 'post',
  path: '/admin/users/{id}/restore',
  summary: 'Restore user',
  tags: ['Admin - Users'],
  parameters: [
    {
      name: 'id',
      in: 'path',
      required: true,
      schema: { type: 'string', format: 'uuid' },
    },
  ],
  responses: {
    200: {
      description: 'User restored successfully',
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
  method: 'post',
  path: '/admin/users/{id}/reset-password',
  summary: 'Reset user password',
  tags: ['Admin - Users'],
  parameters: [
    {
      name: 'id',
      in: 'path',
      required: true,
      schema: { type: 'string', format: 'uuid' },
    },
  ],
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            password: z.string(),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Password reset successfully',
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
