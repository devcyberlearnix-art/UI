import fs from 'fs';

let file = fs.readFileSync('src/pages/CourseDetail.jsx', 'utf8');
const target = `{course.subtitle && (
                <p className="text-sm sm:text-base text-[#9A6B56] dark:text-[#D9A48F] font-medium leading-relaxed">
                  {course.subtitle}
                </p>
              )}`;

const replacement = `{(course.subtitle || course.shortDescription || course.description) && (
                <p className="text-sm sm:text-base text-[#9A6B56] dark:text-[#D9A48F] font-medium leading-relaxed">
                  {course.subtitle || course.shortDescription || (course.description && course.description.length > 130 ? course.description.slice(0, 130) + '…' : course.description)}
                </p>
              )}`;

if (file.includes(target)) {
  file = file.replace(target, replacement);
  fs.writeFileSync('src/pages/CourseDetail.jsx', file, 'utf8');
  console.log('Replaced LF');
} else {
  const targetCRLF = target.replace(/\n/g, '\r\n');
  const replacementCRLF = replacement.replace(/\n/g, '\r\n');
  if (file.includes(targetCRLF)) {
    file = file.replace(targetCRLF, replacementCRLF);
    fs.writeFileSync('src/pages/CourseDetail.jsx', file, 'utf8');
    console.log('Replaced CRLF');
  } else {
    console.log('Target not found');
  }
}

