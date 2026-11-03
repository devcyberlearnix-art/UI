import fs from 'fs';
import path from 'path';

const CONTROLLERS_DIR = 'C:/Users/SHIVASAI/OneDrive/Desktop/LMS/admin-service/src/main/java/com/example/admin/controller';
const ADMIN_API_JS = 'C:/Users/SHIVASAI/OneDrive/Desktop/FD_LMS/UI/src/api/adminApi.js';

function parseEndpoints() {
  const files = fs.readdirSync(CONTROLLERS_DIR).filter(f => f.endsWith('.java'));
  const endpoints = [];

  for (const file of files) {
    const filePath = path.join(CONTROLLERS_DIR, file);
    const content = fs.readFileSync(filePath, 'utf8');

    // Base request mapping
    const baseMatch = content.match(/@RequestMapping\(\s*(?:value\s*=\s*)?["']([^"']+)["']/);
    const basePath = baseMatch ? baseMatch[1] : '';

    // Split into method blocks
    const lines = content.split('\n');
    let currentAnnotations = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (line.startsWith('@')) {
        currentAnnotations.push(line);
      }

      const mappingMatch = line.match(/@(GetMapping|PostMapping|PutMapping|DeleteMapping|PatchMapping)(?:\((.*)\))?/);
      if (mappingMatch) {
        const httpMethod = mappingMatch[1].replace('Mapping', '').toUpperCase();
        const argStr = mappingMatch[2] || '';
        
        let subPath = '';
        const pathValMatch = argStr.match(/(?:value\s*=\s*|path\s*=\s*)?["']([^"']*)["']/);
        if (pathValMatch) {
          subPath = pathValMatch[1];
        }

        const fullPath = (basePath + (subPath ? (subPath.startsWith('/') ? subPath : '/' + subPath) : '')).replace(/\/+/g, '/');

        // Look for @PreAuthorize in currentAnnotations
        const preAuth = currentAnnotations.find(a => a.includes('@PreAuthorize')) || '';
        const isTransactional = currentAnnotations.some(a => a.includes('@Transactional'));

        // Look ahead for method name
        let methodName = 'unknown';
        for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
          const mSig = lines[j].trim().match(/(?:public|protected|private)\s+[\w<>\[\],\s]+\s+(\w+)\s*\(/);
          if (mSig) {
            methodName = mSig[1];
            break;
          }
        }

        endpoints.push({
          controller: file,
          httpMethod,
          path: fullPath,
          methodName,
          preAuthorize: preAuth.replace('@PreAuthorize(', '').replace(/\)$/, ''),
          isTransactional,
          line: i + 1
        });

        currentAnnotations = [];
      } else if (!line.startsWith('@') && line.length > 0) {
        currentAnnotations = [];
      }
    }
  }

  return endpoints;
}

// Parse frontend SDK
function parseAdminApi() {
  const content = fs.readFileSync(ADMIN_API_JS, 'utf8');
  const methods = [];
  const lines = content.split('\n');

  let currentMethod = null;
  let methodLines = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const defMatch = line.match(/^\s*([a-zA-Z0-9_]+)\s*:\s*async\s*\(([^)]*)\)\s*=>\s*\{?/);
    if (defMatch) {
      if (currentMethod) {
        methods.push(analyzeSdkMethod(currentMethod, methodLines));
      }
      currentMethod = { name: defMatch[1], params: defMatch[2], line: i + 1 };
      methodLines = [line];
    } else if (currentMethod) {
      methodLines.push(line);
      if (line.match(/^\s*\},?\s*$/)) {
        methods.push(analyzeSdkMethod(currentMethod, methodLines));
        currentMethod = null;
        methodLines = [];
      }
    }
  }
  if (currentMethod) {
    methods.push(analyzeSdkMethod(currentMethod, methodLines));
  }

  return methods;
}

function analyzeSdkMethod(meta, lines) {
  const text = lines.join('\n');
  const callMatch = text.match(/axiosInstance\.(get|post|put|delete|patch)\(\s*([`'"][^`'"]+[`'"])/i);
  let httpMethod = 'UNKNOWN';
  let urlPattern = '';

  if (callMatch) {
    httpMethod = callMatch[1].toUpperCase();
    urlPattern = callMatch[2].replace(/[`'"]/g, '');
  }

  return {
    name: meta.name,
    line: meta.line,
    httpMethod,
    urlPattern,
    rawText: text
  };
}

const backendEndpoints = parseEndpoints();
const sdkMethods = parseAdminApi();

fs.writeFileSync('C:/Users/SHIVASAI/OneDrive/Desktop/FD_LMS/UI/scripts/admin_parsed.json', JSON.stringify({ backendEndpoints, sdkMethods }, null, 2), 'utf8');
console.log(`Saved admin_parsed.json: ${backendEndpoints.length} endpoints, ${sdkMethods.length} SDK methods`);
