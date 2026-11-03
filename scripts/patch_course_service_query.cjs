const fs = require('fs');
const file = 'C:/Users/SHIVASAI/OneDrive/Desktop/LMS/course-service/src/main/java/com/lms/courseservice/service/CourseService.java';
let content = fs.readFileSync(file, 'utf8');

const target = 'return courseRepository.findAll(pageable);';
const replacement = 'return courseRepository.findByStatusIgnoreCase("PUBLISHED", pageable);';

if (!content.includes(target)) {
  console.error('Target string not found in CourseService.java!');
  process.exit(1);
}

content = content.replace(target, replacement);
fs.writeFileSync(file, content, 'utf8');
console.log('Successfully updated CourseService.java to return only published courses!');

