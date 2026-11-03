const fs = require('fs');
const filePath = 'C:/Users/SHIVASAI/OneDrive/Desktop/FD_LMS/UI/src/layouts/Navbar.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add isCoursesPage check right after location declaration
if (!content.includes('const isCoursesPage =')) {
  content = content.replace(
    'const location = useLocation();',
    'const location = useLocation();\n  const isCoursesPage = location.pathname === \'/courses\';'
  );
}

// 2. Wrap desktop search form in {!isCoursesPage && (...)}
const desktopSearchForm = `{/* Architectural Search Input */}
            <form
              onSubmit={handleSearchSubmit}
              className="hidden md:flex flex-1 max-w-sm mx-4"
            >
              <div className="relative w-full group">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search curriculum..."
                  className="w-full pl-9 pr-4 py-2 bg-[#0F0F13] border border-white/[0.06] rounded-xl text-xs text-[#F5F5F7] placeholder-[#71717A] focus:outline-none focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880]/30 transition-all"
                />
                <button type="submit" className="absolute left-3 top-2.5 text-[#71717A] group-focus-within:text-[#C5A880] transition-colors cursor-pointer" aria-label="Submit search"><Search className="h-3.5 w-3.5" /></button>
              </div>
            </form>`;

const replacementDesktop = `{/* Architectural Search Input - Context-Aware: Hidden on /courses where dedicated in-page catalog search is active */}
            {!isCoursesPage && (
              <form
                onSubmit={handleSearchSubmit}
                className="hidden md:flex flex-1 max-w-sm mx-4"
              >
                <div className="relative w-full group">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search curriculum..."
                    className="w-full pl-9 pr-4 py-2 bg-[#0F0F13] border border-white/[0.06] rounded-xl text-xs text-[#F5F5F7] placeholder-[#71717A] focus:outline-none focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880]/30 transition-all"
                  />
                  <button type="submit" className="absolute left-3 top-2.5 text-[#71717A] group-focus-within:text-[#C5A880] transition-colors cursor-pointer" aria-label="Submit search"><Search className="h-3.5 w-3.5" /></button>
                </div>
              </form>
            )}`;

if (content.includes(desktopSearchForm)) {
  content = content.replace(desktopSearchForm, replacementDesktop);
} else {
  // Regex fallback
  content = content.replace(
    /\{\/\* Architectural Search Input \*\/\}[\s\S]*?<\/form>/,
    replacementDesktop
  );
}

// 3. Wrap mobile search form in {!isCoursesPage && (...)}
const mobileSearchFormRegex = /<form onSubmit=\{handleSearchSubmit\} className="relative">[\s\S]*?<\/form>/;
const replacementMobile = `{!isCoursesPage && (
                <form onSubmit={handleSearchSubmit} className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search courses..."
                    className="w-full pl-9 pr-4 py-2 bg-[#0F0F13] border border-white/[0.06] rounded-xl text-xs text-[#F5F5F7] placeholder-[#71717A] focus:outline-none focus:border-[#C5A880]"
                  />
                  <button type="submit" className="absolute left-3 top-2.5 text-[#71717A] cursor-pointer" aria-label="Submit search"><Search className="h-3.5 w-3.5" /></button>
                </form>
              )}`;

content = content.replace(mobileSearchFormRegex, replacementMobile);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated Navbar.jsx!');

