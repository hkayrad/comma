import { OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';
import { registry } from './registry';
import './routes/auth';
import './routes/config';
import './routes/tcmb';
import './routes/companies';
import './routes/admin';

export function generateOpenApiSpec() {
  const generator = new OpenApiGeneratorV3(registry.definitions);
  return generator.generateDocument({
    openapi: '3.0.0',
    info: {
      version: '1.0.0',
      title: 'Comma API',
      description: 'Financial Transaction Management API',
    },
    servers: [{ url: '/' }],
  });
}
