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

export function registerAccountingRoutes(domain: 'payables' | 'receivables') {
  const isPayable = domain === 'payables';
  const tagPrefix = isPayable ? 'Payables' : 'Receivables';
  const singular = isPayable ? 'payable' : 'receivable';

  // Customers
  registry.registerPath({
    method: 'post',
    path: `/${domain}/customers`,
    summary: `Create a new ${singular} customer`,
    tags: [`${tagPrefix} - Customers`],
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
    path: `/${domain}/customers/batch`,
    summary: `Create multiple ${singular} customers`,
    tags: [`${tagPrefix} - Customers`],
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
    path: `/${domain}/customers`,
    summary: `Get all ${singular} customers`,
    tags: [`${tagPrefix} - Customers`],
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
    path: `/${domain}/customers/{id}/statement`,
    summary: 'Get customer statement',
    tags: [`${tagPrefix} - Customers`],
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
    path: `/${domain}/customers/id-name`,
    summary: 'Get customer IDs and names',
    tags: [`${tagPrefix} - Customers`],
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
    path: `/${domain}/customers/{id}`,
    summary: `Update ${singular} customer`,
    tags: [`${tagPrefix} - Customers`],
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
    path: `/${domain}/customers/{id}`,
    summary: `Delete ${singular} customer`,
    tags: [`${tagPrefix} - Customers`],
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
    path: `/${domain}/customers/{id}/restore`,
    summary: `Restore ${singular} customer`,
    tags: [`${tagPrefix} - Customers`],
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

  // Debts
  registry.registerPath({
    method: 'post',
    path: `/${domain}/debts`,
    summary: `Create a new ${singular} debt`,
    tags: [`${tagPrefix} - Debts`],
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
    path: `/${domain}/debts/batch`,
    summary: `Create multiple ${singular} debts`,
    tags: [`${tagPrefix} - Debts`],
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
    path: `/${domain}/debts/totals`,
    summary: `Get ${singular} debt totals`,
    tags: [`${tagPrefix} - Debts`],
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
    path: `/${domain}/debts`,
    summary: `Get all ${singular} debts`,
    tags: [`${tagPrefix} - Debts`],
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
    path: `/${domain}/debts/{id}`,
    summary: `Update ${singular} debt`,
    tags: [`${tagPrefix} - Debts`],
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
    path: `/${domain}/debts/{id}`,
    summary: `Delete ${singular} debt`,
    tags: [`${tagPrefix} - Debts`],
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
    path: `/${domain}/debts/{id}/restore`,
    summary: `Restore ${singular} debt`,
    tags: [`${tagPrefix} - Debts`],
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
    path: `/${domain}/debts/upcoming-due-dates`,
    summary: `Get upcoming due dates for ${singular} debts`,
    tags: [`${tagPrefix} - Debts`],
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

  // Payments
  registry.registerPath({
    method: 'post',
    path: `/${domain}/payments`,
    summary: `Create a new ${singular} payment`,
    tags: [`${tagPrefix} - Payments`],
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
    path: `/${domain}/payments/batch`,
    summary: `Create multiple ${singular} payments`,
    tags: [`${tagPrefix} - Payments`],
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
    path: `/${domain}/payments`,
    summary: `Get all ${singular} payments`,
    tags: [`${tagPrefix} - Payments`],
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
    path: `/${domain}/payments/{id}`,
    summary: `Update ${singular} payment`,
    tags: [`${tagPrefix} - Payments`],
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
    path: `/${domain}/payments/{id}`,
    summary: `Delete ${singular} payment`,
    tags: [`${tagPrefix} - Payments`],
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
    path: `/${domain}/payments/{id}/restore`,
    summary: `Restore ${singular} payment`,
    tags: [`${tagPrefix} - Payments`],
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
    path: `/${domain}/payments/upcoming-checks`,
    summary: `Get upcoming checks for ${singular} payments`,
    tags: [`${tagPrefix} - Payments`],
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
}

// Auto-register both domains
registerAccountingRoutes('payables');
registerAccountingRoutes('receivables');
