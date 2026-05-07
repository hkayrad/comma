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
    schema: { type: 'integer', default: 0 },
  },
  {
    name: 'limit',
    in: 'query' as const,
    schema: { type: 'integer', default: 20 },
  },
  {
    name: 'sorting',
    in: 'query' as const,
    schema: { type: 'string' },
    description: 'JSON string for sorting',
  },
  {
    name: 'filters',
    in: 'query' as const,
    schema: { type: 'string' },
    description: 'JSON string for filters',
  },
];

// Payable Customers
registry.registerPath({
  method: 'post',
  path: '/payables/customers',
  summary: 'Create a new payable customer',
  tags: ['Payables - Customers'],
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
  path: '/payables/customers/batch',
  summary: 'Create multiple payable customers',
  tags: ['Payables - Customers'],
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
  path: '/payables/customers',
  summary: 'Get all payable customers',
  tags: ['Payables - Customers'],
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
  path: '/payables/customers/{id}/statement',
  summary: 'Get customer statement',
  tags: ['Payables - Customers'],
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
  path: '/payables/customers/id-name',
  summary: 'Get customer IDs and names',
  tags: ['Payables - Customers'],
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
  path: '/payables/customers/{id}',
  summary: 'Update payable customer',
  tags: ['Payables - Customers'],
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
  path: '/payables/customers/{id}',
  summary: 'Delete payable customer',
  tags: ['Payables - Customers'],
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
  path: '/payables/customers/{id}/restore',
  summary: 'Restore payable customer',
  tags: ['Payables - Customers'],
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

// Payable Debts
registry.registerPath({
  method: 'post',
  path: '/payables/debts',
  summary: 'Create a new payable debt',
  tags: ['Payables - Debts'],
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
  path: '/payables/debts/batch',
  summary: 'Create multiple payable debts',
  tags: ['Payables - Debts'],
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
  path: '/payables/debts/totals',
  summary: 'Get payable debt totals',
  tags: ['Payables - Debts'],
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
  path: '/payables/debts',
  summary: 'Get all payable debts',
  tags: ['Payables - Debts'],
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
  path: '/payables/debts/{id}',
  summary: 'Update payable debt',
  tags: ['Payables - Debts'],
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
  path: '/payables/debts/{id}',
  summary: 'Delete payable debt',
  tags: ['Payables - Debts'],
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
  path: '/payables/debts/{id}/restore',
  summary: 'Restore payable debt',
  tags: ['Payables - Debts'],
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
  path: '/payables/debts/upcoming-due-dates',
  summary: 'Get upcoming due dates for payable debts',
  tags: ['Payables - Debts'],
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

// Payable Payments
registry.registerPath({
  method: 'post',
  path: '/payables/payments',
  summary: 'Create a new payable payment',
  tags: ['Payables - Payments'],
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
  path: '/payables/payments/batch',
  summary: 'Create multiple payable payments',
  tags: ['Payables - Payments'],
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
  path: '/payables/payments',
  summary: 'Get all payable payments',
  tags: ['Payables - Payments'],
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
  path: '/payables/payments/{id}',
  summary: 'Update payable payment',
  tags: ['Payables - Payments'],
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
  path: '/payables/payments/{id}',
  summary: 'Delete payable payment',
  tags: ['Payables - Payments'],
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
  path: '/payables/payments/{id}/restore',
  summary: 'Restore payable payment',
  tags: ['Payables - Payments'],
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
  path: '/payables/payments/upcoming-checks',
  summary: 'Get upcoming checks for payable payments',
  tags: ['Payables - Payments'],
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
