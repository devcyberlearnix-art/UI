const fs = require('fs');
const filePath = 'C:/Users/SHIVASAI/OneDrive/Desktop/LMS/course-service/src/main/java/com/lms/courseservice/config/SecurityConfig.java';
let content = fs.readFileSync(filePath, 'utf8');
content = content.replace('"/api/v1/courses/featured"', '"/api/v1/courses/featured", "/api/v1/courses/suggestions"');
fs.writeFileSync(filePath, content, 'utf8');
console.log('SecurityConfig updated successfully!');

