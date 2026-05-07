import { registry } from '../registry';
import { loginSchema } from '@comma/common/schemas';
import { z } from 'zod';

registry.registerPath({
  method: 'post',
  path: '/login',
  summary: 'Login to the application',
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
          schema: z.object({
            username: z.string(),
            role: z.number(),
          }),
        },
      },
    },
  },
});
