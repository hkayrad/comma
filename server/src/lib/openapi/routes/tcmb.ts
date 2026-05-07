import { registry } from '../registry';
import { z } from 'zod';

registry.registerPath({
  method: 'get',
  path: '/tcmb',
  summary: 'Fetch TCMB exchange rates',
  tags: ['TCMB'],
  responses: {
    200: {
      description: 'Successful retrieval of exchange rates',
      content: {
        'application/xml': {
          schema: z.string(),
        },
        'application/json': {
          schema: z.any(),
        },
      },
    },
    500: {
      description: 'Error fetching TCMB data',
    },
  },
});
