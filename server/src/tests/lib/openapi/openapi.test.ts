import { describe, it, expect } from 'vitest';
import { generateOpenApiSpec } from '../../../lib/openapi/generator';

describe('OpenAPI Generator', () => {
  it('should generate a valid OpenAPI 3.0.0 document structure', () => {
    const spec = generateOpenApiSpec();

    expect(spec.openapi).toBe('3.0.0');
    expect(spec.info.title).toBe('Comma API');
    expect(spec.info.version).toBe('1.0.0');
    expect(spec.paths).toHaveProperty('/login');
    expect(spec.paths['/login']).toHaveProperty('post');
    expect(spec.paths).toHaveProperty('/refresh');
    expect(spec.paths['/refresh']).toHaveProperty('post');
    expect(spec.paths).toHaveProperty('/logout');
    expect(spec.paths['/logout']).toHaveProperty('post');
  });
});
