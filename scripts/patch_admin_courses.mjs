import fs from 'fs';

let file = fs.readFileSync('src/pages/admin/Courses.jsx', 'utf8');

const target = `<td
                  className="px-6 py-4 text-sm font-semibold text-stone-900 cursor-pointer hover:text-[#5B3E57] transition max-w-[300px]"
                  onClick={() => handleOpenEdit(course)}
                  title="Click to Edit Course"
                >
                  {course.title}
                </td>`;

const replacement = `<td
                  className="px-6 py-4 text-sm font-semibold text-stone-900 cursor-pointer hover:text-[#5B3E57] transition max-w-[320px]"
                  onClick={() => handleOpenEdit(course)}
                  title="Click to Edit Course"
                >
                  <p className="font-semibold text-stone-900 line-clamp-1 hover:text-[#5B3E57]">{course.title}</p>
                  <p className="text-xs text-stone-500 font-normal line-clamp-1 mt-0.5">
                    {course.subtitle || course.description || "Production engineering curriculum track"}
                  </p>
                </td>`;

if (file.includes(target)) {
  file = file.replace(target, replacement);
  fs.writeFileSync('src/pages/admin/Courses.jsx', file, 'utf8');
  console.log('Replaced Courses.jsx LF');
} else {
  const targetCRLF = target.replace(/\n/g, '\r\n');
  const replacementCRLF = replacement.replace(/\n/g, '\r\n');
  if (file.includes(targetCRLF)) {
    file = file.replace(targetCRLF, replacementCRLF);
    fs.writeFileSync('src/pages/admin/Courses.jsx', file, 'utf8');
    console.log('Replaced Courses.jsx CRLF');
  } else {
    console.log('Target not found in Courses.jsx');
  }
}

