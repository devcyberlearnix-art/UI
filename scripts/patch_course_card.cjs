const fs = require('fs');

const filePath = 'c:/Users/SHIVASAI/OneDrive/Desktop/FD_LMS/UI/src/design-system/components/CourseCard.jsx';
let content = fs.readFileSync(filePath, 'utf8');
const isCRLF = content.includes('\r\n');
let norm = content.replace(/\r\n/g, '\n');

// 1. Update import
norm = norm.replace("import React from 'react';", "import React, { forwardRef } from 'react';");

// 2. Update function signature
norm = norm.replace(
  'export function CourseCard({ course = {} }) {',
  'export const CourseCard = forwardRef(function CourseCard({ course = {} }, ref) {'
);

// 3. Add ref={ref} to motion.div
norm = norm.replace(
  '<motion.div\n      layout',
  '<motion.div\n      ref={ref}\n      layout'
);

// 4. Update closing and add displayName
norm = norm.replace(
  '    </motion.div>\n  );\n}\n\nexport default CourseCard;',
  "    </motion.div>\n  );\n});\n\nCourseCard.displayName = 'CourseCard';\n\nexport default CourseCard;"
);

const finalContent = isCRLF ? norm.replace(/\n/g, '\r\n') : norm;
fs.writeFileSync(filePath, finalContent, 'utf8');
console.log('CourseCard.jsx patched successfully with forwardRef!');

