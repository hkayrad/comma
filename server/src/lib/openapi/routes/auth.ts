import { registry } from '../registry';
import { loginSchema } from '@comma/common/schemas';
import { z } from 'zod';

registry.registerPath({
  method: 'post',
  path: '/login',
  summary: 'Login to the application',
  tags: ['Auth'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: loginSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Successful login',
      content: {
        'application/json': {
          schema: z.union([
            z.object({
              username: z.string(),
              role: z.number(),
            }),
            z.object({
              requires2FA: z.literal(true),
              tempToken: z.string(),
              username: z.string().optional(),
            }),
          ]),
        },
      },
    },
    401: {
      description: 'Unauthorized',
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/refresh',
  summary: 'Refresh access token',
  tags: ['Auth'],
  responses: {
    200: {
      description: 'Token refreshed successfully',
      content: {
        'application/json': {
          schema: z.object({
            username: z.string(),
            role: z.number(),
          }),
        },
      },
    },
    401: {
      description: 'Unauthorized',
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/logout',
  summary: 'Logout from the application',
  tags: ['Auth'],
  responses: {
    200: {
      description: 'Logged out successfully',
      content: {
        'application/json': {
          schema: z.object({
            message: z.string(),
          }),
        },
      },
    },
  },
});
