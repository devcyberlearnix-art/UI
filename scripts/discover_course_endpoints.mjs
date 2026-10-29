import fs from 'fs';
import path from 'path';

const controllerDir = 'C:/Users/SHIVASAI/OneDrive/Desktop/LMS/course-service/src/main/java/com/lms/courseservice/controller';
const files = fs.readdirSync(controllerDir).filter(f => f.endsWith('Controller.java'));

const allEndpoints = [];

for (const file of files) {
  const fullPath = path.join(controllerDir, file);
  const content = fs.readFileSync(fullPath, 'utf8');

  // Extract class-level @RequestMapping
  const classMatch = content.match(/@RequestMapping\((?:value\s*=\s*)?["']([^"']+)["']/);
  const basePath = classMatch ? classMatch[1] : '';

  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const mapMatch = line.match(/@(GetMapping|PostMapping|PutMapping|DeleteMapping|PatchMapping)(?:\((.*)\))?/);
    if (mapMatch) {
      const verb = mapMatch[1].replace('Mapping', '').toUpperCase();
      let subPath = '';
      const rawArg = mapMatch[2] ? mapMatch[2].trim() : '';
      if (rawArg) {
        // match value="..." or path="..." or "..."
        const pathMatch = rawArg.match(/(?:value\s*=\s*|path\s*=\s*)?["']([^"']+)["']/);
        if (pathMatch) subPath = pathMatch[1];
      }
      let fullPath = (basePath + (subPath.startsWith('/') ? subPath : (subPath ? '/' + subPath : ''))).replace(/\/+/g, '/');
      if (!fullPath.startsWith('/')) fullPath = '/' + fullPath;

      // Extract Java method name
      let methodSig = '';
      for (let j = i + 1; j < Math.min(i + 8, lines.length); j++) {
        const nextLine = lines[j].trim();
        if (nextLine.startsWith('public ') || nextLine.includes('ResponseEntity') || nextLine.includes('ApiResponse')) {
          methodSig = nextLine.split('{')[0].trim();
          break;
        }
      }

      allEndpoints.push({
        controller: file,
        method: verb,
        path: fullPath,
        signature: methodSig
      });
    }
  }
}

console.log(`Discovered ${allEndpoints.length} Course Service Endpoints across ${files.length} Controllers:\n`);
allEndpoints.forEach((ep, idx) => {
  console.log(`${String(idx + 1).padStart(2)}. [${ep.method.padEnd(6)}] ${ep.path.padEnd(55)} (${ep.controller})`);
});

fs.writeFileSync('scripts/course_endpoints.json', JSON.stringify(allEndpoints, null, 2));

