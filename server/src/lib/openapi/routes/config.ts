import { registry } from '../registry';
import { configSchema } from '@comma/common/schemas';
import { z } from 'zod';

registry.registerPath({
  method: 'get',
  path: '/configs',
  summary: 'Get all configurations',
  tags: ['Config'],
  responses: {
    200: {
      description: 'Successful retrieval of configs',
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(true),
            configs: z.record(z.string(), z.string()),
          }),
        },
      },
    },
    404: {
      description: 'No configs found',
    },
  },
});

registry.registerPath({
  method: 'get',
  path: '/configs/{configKey}',
  summary: 'Get configuration by key',
  tags: ['Config'],
  parameters: [
    {
      name: 'configKey',
      in: 'path',
      required: true,
      schema: { type: 'string' },
    },
  ],
  responses: {
    200: {
      description: 'Successful retrieval of config',
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(true),
            configKey: z.string(),
            configValue: z.string(),
          }),
        },
      },
    },
    404: {
      description: 'Config not found',
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/configs',
  summary: 'Set configuration',
  description: 'Requires Admin role',
  tags: ['Config'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: configSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Config set successfully',
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(true),
            message: z.string(),
          }),
        },
      },
    },
    403: {
      description: 'Unauthorized',
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/configs/start-maintenance',
  summary: 'Start maintenance mode',
  description: 'Requires Admin role',
  tags: ['Config'],
  responses: {
    200: {
      description: 'Maintenance mode started successfully',
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(true),
            message: z.string(),
          }),
        },
      },
    },
    403: {
      description: 'Unauthorized',
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/configs/end-maintenance',
  summary: 'End maintenance mode',
  description: 'Requires Admin role',
  tags: ['Config'],
  responses: {
    200: {
      description: 'Maintenance mode ended successfully',
      content: {
        'application/json': {
          schema: z.object({
            success: z.literal(true),
            message: z.string(),
          }),
        },
      },
    },
    403: {
      description: 'Unauthorized',
    },
  },
});
