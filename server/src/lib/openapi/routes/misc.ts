import { registry } from '../registry';
import { z } from 'zod';
import {
  updateUsernameSchema,
  updatePasswordSchema,
  portalLoginSchema,
} from '@comma/common/schemas';

// User Settings
registry.registerPath({
  method: 'put',
  path: '/settings/username',
  summary: 'Update username',
  tags: ['Settings'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: updateUsernameSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Username updated successfully',
      content: {
        'application/json': {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
          }),
        },
      },
    },
  },
});

registry.registerPath({
  method: 'put',
  path: '/settings/password',
  summary: 'Update password',
  tags: ['Settings'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: updatePasswordSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Password updated successfully',
      content: {
        'application/json': {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
          }),
        },
      },
    },
  },
});

// 2FA
registry.registerPath({
  method: 'get',
  path: '/2fa/status',
  summary: 'Check 2FA status',
  tags: ['2FA'],
  responses: {
    200: {
      description: '2FA status',
      content: {
        'application/json': {
          schema: z.object({
            enabled: z.boolean(),
          }),
        },
      },
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/2fa/setup',
  summary: 'Initiate 2FA setup',
  tags: ['2FA'],
  responses: {
    200: {
      description: '2FA setup data',
      content: {
        'application/json': {
          schema: z.object({
            qrCode: z.string(),
            secret: z.string(),
            setupToken: z.string(),
          }),
        },
      },
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/2fa/verify-setup',
  summary: 'Verify 2FA setup',
  tags: ['2FA'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            setupToken: z.string(),
            code: z.string(),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: '2FA setup completed',
      content: {
        'application/json': {
          schema: z.object({
            success: z.boolean(),
            recoveryCodes: z.array(z.string()),
            message: z.string(),
          }),
        },
      },
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/2fa/verify',
  summary: 'Verify 2FA code during login',
  tags: ['2FA'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            code: z.string(),
            tempToken: z.string().optional(),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: '2FA verified',
      content: {
        'application/json': {
          schema: z.object({
            success: z.boolean(),
            username: z.string(),
            role: z.number(),
          }),
        },
      },
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/2fa/recovery',
  summary: 'Use 2FA recovery code',
  tags: ['2FA'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            code: z.string(),
            tempToken: z.string().optional(),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: '2FA recovery code used',
      content: {
        'application/json': {
          schema: z.object({
            success: z.boolean(),
            remainingCodes: z.number(),
            username: z.string(),
            role: z.number(),
          }),
        },
      },
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/2fa/disable',
  summary: 'Disable 2FA',
  tags: ['2FA'],
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
      description: '2FA disabled',
      content: {
        'application/json': {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
          }),
        },
      },
    },
  },
});

// Stats
registry.registerPath({
  method: 'get',
  path: '/stats/monthly',
  summary: 'Get monthly statistics',
  tags: ['Stats'],
  request: {
    query: z.object({
      startDate: z.string().optional(),
      months: z.string().optional(),
    }),
  },
  responses: {
    200: {
      description: 'Monthly statistics',
      content: {
        'application/json': {
          schema: z.object({
            success: z.boolean(),
            data: z.any(),
          }),
        },
      },
    },
  },
});

// Portal
registry.registerPath({
  method: 'post',
  path: '/portal/login',
  summary: 'Customer portal login',
  tags: ['Portal'],
  request: {
    body: {
      content: {
        'application/json': {
          schema: portalLoginSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: 'Portal login successful',
      content: {
        'application/json': {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
          }),
        },
      },
    },
  },
});

registry.registerPath({
  method: 'get',
  path: '/portal/company/{id}',
  summary: 'Get public company info for portal',
  tags: ['Portal'],
  request: {
    params: z.object({
      id: z.string(),
    }),
  },
  responses: {
    200: {
      description: 'Public company info',
      content: {
        'application/json': {
          schema: z.object({
            success: z.boolean(),
            data: z.object({
              name: z.string(),
              small_logo_path: z.string().nullable(),
              large_logo_path: z.string().nullable(),
            }),
          }),
        },
      },
    },
  },
});

registry.registerPath({
  method: 'get',
  path: '/portal/overview',
  summary: 'Get portal overview',
  tags: ['Portal'],
  responses: {
    200: {
      description: 'Portal overview',
      content: {
        'application/json': {
          schema: z.object({
            success: z.boolean(),
            data: z.object({
              customer: z.any(),
            }),
          }),
        },
      },
    },
  },
});

registry.registerPath({
  method: 'get',
  path: '/portal/statement',
  summary: 'Get portal statement',
  tags: ['Portal'],
  request: {
    query: z.object({
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    }),
  },
  responses: {
    200: {
      description: 'Portal statement',
      content: {
        'application/json': {
          schema: z.object({
            success: z.boolean(),
            data: z.any(),
          }),
        },
      },
    },
  },
});
