import fs from 'fs';
import path from 'path';

const controllerFiles = [
  'C:/Users/SHIVASAI/OneDrive/Desktop/LMS/instructor-service/src/main/java/com/example/instructorservice/controller/AnnouncementController.java',
  'C:/Users/SHIVASAI/OneDrive/Desktop/LMS/instructor-service/src/main/java/com/example/instructorservice/controller/ContentController.java',
  'C:/Users/SHIVASAI/OneDrive/Desktop/LMS/instructor-service/src/main/java/com/example/instructorservice/controller/CourseController.java',
  'C:/Users/SHIVASAI/OneDrive/Desktop/LMS/instructor-service/src/main/java/com/example/instructorservice/controller/CourseMessageController.java',
  'C:/Users/SHIVASAI/OneDrive/Desktop/LMS/instructor-service/src/main/java/com/example/instructorservice/controller/DashboardController.java',
  'C:/Users/SHIVASAI/OneDrive/Desktop/LMS/instructor-service/src/main/java/com/example/instructorservice/controller/ModuleController.java',
  'C:/Users/SHIVASAI/OneDrive/Desktop/LMS/instructor-service/src/main/java/com/example/instructorservice/controller/PublicCourseController.java',
  'C:/Users/SHIVASAI/OneDrive/Desktop/LMS/user-service/src/main/java/com/user/register/controller/InstructorProfileController.java'
];

const allEndpoints = [];

for (const f of controllerFiles) {
  if (!fs.existsSync(f)) {
    console.log('Not found:', f);
    continue;
  }
  const content = fs.readFileSync(f, 'utf8');
  const baseMatch = content.match(/@RequestMapping\((?:value\s*=\s*)?["']([^"']+)["']/);
  const basePath = baseMatch ? baseMatch[1] : '';

  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const mapMatch = line.match(/@(GetMapping|PostMapping|PutMapping|DeleteMapping|PatchMapping)(?:\((.*)\))?/);
    if (mapMatch) {
      const verb = mapMatch[1].replace('Mapping', '').toUpperCase();
      let subPath = '';
      const rawArg = mapMatch[2] ? mapMatch[2].trim() : '';
      if (rawArg) {
        const pathMatch = rawArg.match(/["']([^"']+)["']/);
        if (pathMatch) subPath = pathMatch[1];
      }
      let fullPath = (basePath + (subPath.startsWith('/') ? subPath : (subPath ? '/' + subPath : ''))).replace(/\/+/g, '/');
      if (!fullPath.startsWith('/')) fullPath = '/' + fullPath;

      // Extract Java method name
      let methodSig = '';
      for (let j = i + 1; j < Math.min(i + 8, lines.length); j++) {
        const nextLine = lines[j].trim();
        if (nextLine.startsWith('public ') || nextLine.startsWith('public ResponseEntity') || nextLine.includes('ResponseEntity<')) {
          methodSig = nextLine.split('{')[0].trim();
          break;
        }
      }

      allEndpoints.push({
        controller: path.basename(f),
        method: verb,
        path: fullPath,
        signature: methodSig
      });
    }
  }
}

console.log(`Found ${allEndpoints.length} Instructor Endpoints:\n`);
allEndpoints.forEach((ep, idx) => {
  console.log(`${String(idx + 1).padStart(2)}. [${ep.method.padEnd(6)}] ${ep.path.padEnd(52)} (${ep.controller})`);
});

fs.writeFileSync('scripts/instructor_endpoints.json', JSON.stringify(allEndpoints, null, 2));

