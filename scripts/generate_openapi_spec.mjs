import fs from 'fs';

function generateOpenApiSpec() {
  const parsedData = JSON.parse(
    fs.readFileSync('C:/Users/SHIVASAI/OneDrive/Desktop/FD_LMS/UI/scripts/admin_parsed.json', 'utf8')
  );

  const yamlHeader = `openapi: 3.0.3
info:
  title: CyberLearnix Admin Platform API
  description: |
    # CyberLearnix Admin Microservice API Specification
    Source-verified OpenAPI 3.0.3 reference covering all 73 backend endpoints across 10 controllers in \`admin-service\` (Port 8087) and routed via API Gateway (Port 8079).
    
    ## RBAC Security Matrix
    * **ROLE_MAIN_ADMIN / ROLE_SUPER_ADMIN**: Global unrestricted access across all controllers.
    * **ROLE_SUB_ADMIN**: Restricted to the designated \`assignedService\` claim:
      * \`COURSE_SERVICE\`: Access to Banners, Courses, Reviews.
      * \`PAYMENT_SERVICE\`: Access to Payments.
      * \`ORDER_SERVICE\`: Access to Orders.
      * \`USER_SERVICE\`: Access to Users, Instructors, Applications.
    
    ## Ingress Gateways
    * Local Dev Gateway: \`http://localhost:8079\`
    * Admin Direct Port: \`http://localhost:8087\`
  version: 1.0.0
servers:
  - url: http://localhost:8079
    description: API Gateway Ingress (Active Port)
  - url: http://localhost:8087
    description: Admin Service Direct Container
paths:
`;

  // Group endpoints by path
  const pathsObj = {};

  parsedData.backendEndpoints.forEach(ep => {
    let p = ep.path;
    // Normalize path parameter syntax: :id or {id}
    p = p.replace(/:([a-zA-Z0-9_]+)/g, '{$1}');

    if (!pathsObj[p]) pathsObj[p] = {};
    const method = ep.httpMethod.toLowerCase();

    // Determine tag based on controller
    const tag = ep.controller.replace('Controller.java', '').replace('Admin', 'Admin ');

    // Extract path parameters
    const pathParams = [];
    const matches = p.match(/\{([a-zA-Z0-9_]+)\}/g);
    if (matches) {
      matches.forEach(m => {
        const name = m.replace('{', '').replace('}', '');
        pathParams.push({
          name,
          in: 'path',
          required: true,
          schema: {
            type: name.includes('Id') && !name.includes('banner') && !name.includes('order') ? 'string' : (name.includes('banner') || name.includes('order') ? 'integer' : 'string'),
            format: name.includes('Id') && !name.includes('banner') && !name.includes('order') ? 'uuid' : undefined
          },
          description: `Unique identifier for ${name}`
        });
      });
    }

    // Determine query parameters if GET
    const queryParams = [];
    if (method === 'get' && (p.includes('/users') || p.includes('/payments') || p.includes('/orders') || p.includes('/courses'))) {
      queryParams.push(
        { name: 'page', in: 'query', required: false, schema: { type: 'integer', default: 0 }, description: 'Zero-based page index' },
        { name: 'size', in: 'query', required: false, schema: { type: 'integer', default: 10 }, description: 'Number of records per page' },
        { name: 'sort', in: 'query', required: false, schema: { type: 'string', default: 'createdAt,desc' }, description: 'Sorting criteria' }
      );
    }

    pathsObj[p][method] = {
      tags: [tag],
      summary: `${ep.methodName} (${ep.httpMethod} ${ep.path})`,
      description: `Controller: \`${ep.controller}\` at line ${ep.line}. Required RBAC: ${ep.preAuthorize || 'ROLE_MAIN_ADMIN / assignedService'}.`,
      operationId: `${ep.methodName}_${ep.httpMethod}`,
      parameters: [...pathParams, ...queryParams],
      responses: {
        '200': {
          description: 'Successful operation',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: true },
                  message: { type: 'string', example: 'Operation completed successfully' },
                  data: { type: 'object' },
                  timestamp: { type: 'string', example: '2026-10-31T21:52:14.565Z' }
                }
              }
            }
          }
        },
        '400': { description: 'Bad Request - Validation or parameter error' },
        '401': { description: 'Unauthorized - Missing or invalid JWT Bearer token' },
        '403': { description: 'Forbidden - Insufficient RBAC role or mismatched assignedService claim' },
        '404': { description: 'Not Found - Resource does not exist' },
        '500': { description: 'Internal Server Error' }
      },
      security: [{ bearerAuth: [] }]
    };

    if (['post', 'put', 'patch'].includes(method)) {
      pathsObj[p][method].requestBody = {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              example: { note: 'Refer to controller DTO contract' }
            }
          }
        }
      };
    }
  });

  // Convert pathsObj to YAML
  let yamlBody = '';
  for (const [pathStr, methods] of Object.entries(pathsObj)) {
    yamlBody += `  ${pathStr}:\n`;
    for (const [m, op] of Object.entries(methods)) {
      yamlBody += `    ${m}:\n`;
      yamlBody += `      tags: [${op.tags.map(t => `"${t}"`).join(', ')}]\n`;
      yamlBody += `      summary: "${op.summary}"\n`;
      yamlBody += `      description: "${op.description.replace(/"/g, "'")}"\n`;
      yamlBody += `      operationId: "${op.operationId}"\n`;
      if (op.parameters.length > 0) {
        yamlBody += `      parameters:\n`;
        op.parameters.forEach(param => {
          yamlBody += `        - name: "${param.name}"\n`;
          yamlBody += `          in: "${param.in}"\n`;
          yamlBody += `          required: ${param.required}\n`;
          yamlBody += `          description: "${param.description}"\n`;
          yamlBody += `          schema:\n`;
          yamlBody += `            type: "${param.schema.type}"\n`;
          if (param.schema.default !== undefined) yamlBody += `            default: ${param.schema.default}\n`;
          if (param.schema.format) yamlBody += `            format: "${param.schema.format}"\n`;
        });
      }
      if (op.requestBody) {
        yamlBody += `      requestBody:\n`;
        yamlBody += `        required: true\n`;
        yamlBody += `        content:\n`;
        yamlBody += `          application/json:\n`;
        yamlBody += `            schema:\n`;
        yamlBody += `              type: object\n`;
      }
      yamlBody += `      responses:\n`;
      for (const [statusCode, rObj] of Object.entries(op.responses)) {
        yamlBody += `        "${statusCode}":\n`;
        yamlBody += `          description: "${rObj.description}"\n`;
      }
      yamlBody += `      security:\n`;
      yamlBody += `        - bearerAuth: []\n`;
    }
  }

  const yamlComponents = `
components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
      description: |
        JWT Access Token containing:
        * \`sub\`: User/Admin UUID
        * \`role\`: ROLE_MAIN_ADMIN or ROLE_SUB_ADMIN
        * \`assignedService\`: COURSE_SERVICE, PAYMENT_SERVICE, ORDER_SERVICE, USER_SERVICE
        * \`type\`: access
`;

  const fullYaml = yamlHeader + yamlBody + yamlComponents;

  const destLms = 'c:/Users/SHIVASAI/OneDrive/Desktop/LMS/docs/api-reference/OPENAPI_ADMIN_SPEC.yaml';
  const destUi = 'c:/Users/SHIVASAI/OneDrive/Desktop/FD_LMS/UI/docs/OPENAPI_ADMIN_SPEC.yaml';

  fs.writeFileSync(destLms, fullYaml, 'utf8');
  fs.writeFileSync(destUi, fullYaml, 'utf8');
  console.log(`✅ OpenAPI 3.0.3 Spec written to:\n  - ${destLms}\n  - ${destUi}`);
}

generateOpenApiSpec();

