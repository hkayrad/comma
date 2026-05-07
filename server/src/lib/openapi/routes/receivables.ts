import { registry } from '../registry';
import {
  customerSchema,
  debtSchema,
  paymentSchema,
  batchCustomerSchema,
  batchDebtSchema,
  batchPaymentSchema,
} from '@comma/common/schemas';
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

// Receivable Customers
registry.registerPath({
  method: 'post',
  path: '/receivables/customers',
  summary: 'Create a new receivable customer',
  tags: ['Receivables - Customers'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: customerSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Customer created successfully',
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
  method: 'post',
  path: '/receivables/customers/batch',
  summary: 'Create multiple receivable customers',
  tags: ['Receivables - Customers'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: batchCustomerSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Customers created successfully',
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
  method: 'get',
  path: '/receivables/customers',
  summary: 'Get all receivable customers',
  tags: ['Receivables - Customers'],
  parameters: paginationParams,
  responses: {
    200: {
      description: 'Successful retrieval of customers',
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
  path: '/receivables/customers/{id}/statement',
  summary: 'Get customer statement',
  tags: ['Receivables - Customers'],
  parameters: [
    {
      name: 'id',
      in: 'path',
      required: true,
      schema: { type: 'string', format: 'uuid' },
    },
    {
      name: 'startDate',
      in: 'query',
      schema: { type: 'string', format: 'date-time' },
    },
    {
      name: 'endDate',
      in: 'query',
      schema: { type: 'string', format: 'date-time' },
    },
  ],
  responses: {
    200: {
      description: 'Successful retrieval of statement',
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
  path: '/receivables/customers/id-name',
  summary: 'Get customer IDs and names',
  tags: ['Receivables - Customers'],
  responses: {
    200: {
      description: 'Successful retrieval of customer IDs and names',
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(true),
            data: z.array(z.object({
              id: z.string().uuid(),
              name: z.string(),
            })),
          }),
        },
      },
    },
  },
});

registry.registerPath({
  method: 'put',
  path: '/receivables/customers/{id}',
  summary: 'Update receivable customer',
  tags: ['Receivables - Customers'],
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
          schema: customerSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Customer updated successfully',
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
  path: '/receivables/customers/{id}',
  summary: 'Delete receivable customer',
  tags: ['Receivables - Customers'],
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
      description: 'Customer deleted successfully',
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
  path: '/receivables/customers/{id}/restore',
  summary: 'Restore receivable customer',
  tags: ['Receivables - Customers'],
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
      description: 'Customer restored successfully',
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

// Receivable Debts
registry.registerPath({
  method: 'post',
  path: '/receivables/debts',
  summary: 'Create a new receivable debt',
  tags: ['Receivables - Debts'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: debtSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Debt created successfully',
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
  method: 'post',
  path: '/receivables/debts/batch',
  summary: 'Create multiple receivable debts',
  tags: ['Receivables - Debts'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: batchDebtSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Debts created successfully',
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
  method: 'get',
  path: '/receivables/debts/totals',
  summary: 'Get receivable debt totals',
  tags: ['Receivables - Debts'],
  parameters: [
    {
      name: 'currency',
      in: 'query',
      schema: { type: 'string' },
    },
  ],
  responses: {
    200: {
      description: 'Successful retrieval of debt totals',
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
  path: '/receivables/debts',
  summary: 'Get all receivable debts',
  tags: ['Receivables - Debts'],
  parameters: paginationParams,
  responses: {
    200: {
      description: 'Successful retrieval of debts',
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
  path: '/receivables/debts/{id}',
  summary: 'Update receivable debt',
  tags: ['Receivables - Debts'],
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
          schema: debtSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Debt updated successfully',
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
  path: '/receivables/debts/{id}',
  summary: 'Delete receivable debt',
  tags: ['Receivables - Debts'],
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
      description: 'Debt deleted successfully',
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
  path: '/receivables/debts/{id}/restore',
  summary: 'Restore receivable debt',
  tags: ['Receivables - Debts'],
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
      description: 'Debt restored successfully',
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
  path: '/receivables/debts/upcoming-due-dates',
  summary: 'Get upcoming due dates for receivable debts',
  tags: ['Receivables - Debts'],
  parameters: [
    {
      name: 'days',
      in: 'query',
      schema: { type: 'integer', default: 7 },
    },
  ],
  responses: {
    200: {
      description: 'Successful retrieval of upcoming due dates',
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

// Receivable Payments
registry.registerPath({
  method: 'post',
  path: '/receivables/payments',
  summary: 'Create a new receivable payment',
  tags: ['Receivables - Payments'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: paymentSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Payment created successfully',
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
  method: 'post',
  path: '/receivables/payments/batch',
  summary: 'Create multiple receivable payments',
  tags: ['Receivables - Payments'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: batchPaymentSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: 'Payments created successfully',
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
  method: 'get',
  path: '/receivables/payments',
  summary: 'Get all receivable payments',
  tags: ['Receivables - Payments'],
  parameters: paginationParams,
  responses: {
    200: {
      description: 'Successful retrieval of payments',
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
  path: '/receivables/payments/{id}',
  summary: 'Update receivable payment',
  tags: ['Receivables - Payments'],
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
          schema: paymentSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Payment updated successfully',
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
  path: '/receivables/payments/{id}',
  summary: 'Delete receivable payment',
  tags: ['Receivables - Payments'],
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
      description: 'Payment deleted successfully',
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
  path: '/receivables/payments/{id}/restore',
  summary: 'Restore receivable payment',
  tags: ['Receivables - Payments'],
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
      description: 'Payment restored successfully',
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
  path: '/receivables/payments/upcoming-checks',
  summary: 'Get upcoming checks for receivable payments',
  tags: ['Receivables - Payments'],
  parameters: [
    {
      name: 'days',
      in: 'query',
      schema: { type: 'integer', default: 7 },
    },
  ],
  responses: {
    200: {
      description: 'Successful retrieval of upcoming checks',
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
