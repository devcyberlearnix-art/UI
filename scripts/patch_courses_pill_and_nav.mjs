import fs from 'fs';

// 1. Fix Courses.jsx category button styling
const coursesPath = 'C:/Users/SHIVASAI/OneDrive/Desktop/FD_LMS/UI/src/pages/Courses.jsx';
let coursesContent = fs.readFileSync(coursesPath, 'utf8');

const oldCategoryBlock = `                  <motion.button
                    key={cat}
                    type="button"
                    whileTap={{ scale: 0.96 }}
                    onClick={() => updateCategoryFilter(cat)}
                    className={\`relative whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all select-none border cursor-pointer \${
                      isSel
                        ? "text-[#070709] font-bold border-[#C5A880]"
                        : "text-[#8E8E93] hover:text-[#F5F5F7] border-white/[0.04] hover:border-white/20 bg-[#14141A]"
                    }\`}
                  >
                    {isSel && (
                      <motion.div
                        layoutId="activeCatalogCategory"
                        className="absolute inset-0 bg-[#C5A880] rounded-xl -z-10 shadow-[0_0_15px_rgba(197,168,128,0.25)]"
                        transition={SPRING_TRANSITION}
                      />
                    )}
                    <span>{cat}</span>
                  </motion.button>`;

const newCategoryBlock = `                  <motion.button
                    key={cat}
                    type="button"
                    whileTap={{ scale: 0.96 }}
                    onClick={() => updateCategoryFilter(cat)}
                    className={\`relative isolate whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all select-none border cursor-pointer \${
                      isSel
                        ? "text-[#070709] font-bold border-[#C5A880] bg-[#C5A880] shadow-[0_0_15px_rgba(197,168,128,0.25)]"
                        : "text-[#8E8E93] hover:text-[#F5F5F7] border-white/[0.04] hover:border-white/20 bg-[#14141A]"
                    }\`}
                  >
                    <span className="relative z-10">{cat}</span>
                  </motion.button>`;

if (coursesContent.includes(oldCategoryBlock)) {
  coursesContent = coursesContent.replace(oldCategoryBlock, newCategoryBlock);
  fs.writeFileSync(coursesPath, coursesContent, 'utf8');
  console.log('Successfully patched Courses.jsx category pill styling');
} else {
  console.error('Could not find oldCategoryBlock in Courses.jsx');
}

// 2. Fix Navbar.jsx isCoursesPage check
const navbarPath = 'C:/Users/SHIVASAI/OneDrive/Desktop/FD_LMS/UI/src/layouts/Navbar.jsx';
let navbarContent = fs.readFileSync(navbarPath, 'utf8');

if (navbarContent.includes("const isCoursesPage = location.pathname === '/courses';")) {
  navbarContent = navbarContent.replace(
    "const isCoursesPage = location.pathname === '/courses';",
    "const isCoursesPage = location.pathname.startsWith('/courses');"
  );
  fs.writeFileSync(navbarPath, navbarContent, 'utf8');
  console.log('Successfully patched Navbar.jsx isCoursesPage check');
} else {
  console.log('Navbar already has startsWith or different check');
}

