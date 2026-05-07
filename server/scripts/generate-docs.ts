import fs from 'fs';
import path from 'path';
import { generateOpenApiSpec } from '../src/lib/openapi/generator';

const spec = generateOpenApiSpec();
const specJson = JSON.stringify(spec, null, 2);

const rootDir = path.join(__dirname, '../../');
fs.writeFileSync(path.join(rootDir, 'openapi.json'), specJson);

let markdown = '# Comma API Documentation\n\n';
markdown += 'Automated API documentation generated from OpenAPI spec.\n\n';

if (spec.paths) {
  Object.entries(spec.paths).forEach(([urlPath, methods]) => {
    Object.entries(methods as any).forEach(([method, detail]: [string, any]) => {
      markdown += `## ${detail.summary || urlPath}\n\n`;
      markdown += `- **Method:** \`${method.toUpperCase()}\`\n`;
      markdown += `- **Endpoint:** \`${urlPath}\`\n`;
      if (detail.description) markdown += `- **Description:** ${detail.description}\n`;
      
      markdown += '\n### Responses\n\n';
      if (detail.responses) {
        Object.entries(detail.responses).forEach(([code, res]: [string, any]) => {
          markdown += `- **${code}:** ${res.description}\n`;
        });
      }
      markdown += '\n---\n\n';
    });
  });
}

fs.writeFileSync(path.join(rootDir, 'API.md'), markdown);
console.log('Docs generated successfully.');
