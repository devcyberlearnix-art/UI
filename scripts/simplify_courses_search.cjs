const fs = require('fs');
const filePath = 'C:/Users/SHIVASAI/OneDrive/Desktop/FD_LMS/UI/src/pages/Courses.jsx';
let content = fs.readFileSync(filePath, 'utf8');

const target = `<div className="relative flex-1 max-w-xl flex items-center gap-2">
                <AdvancedTypeaheadSearch
                  initialValue={searchQuery}
                  onExecuteSearch={(val) => {
                    updateSearchQuery(val);
                  }}
                  placeholder="Search items by title, subtitle, tag category or author..."
                  className="flex-1"
                />
                <button
                  type="button"
                  onClick={() => updateSearchQuery(searchQuery)}
                  className="px-3.5 py-3 rounded-xl bg-[#C5A880] hover:bg-[#D4B991] text-[#070709] font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shrink-0 cursor-pointer"
                  aria-label="Search"
                >
                  <Search size={14} className="text-[#070709]" />
                  <span className="hidden sm:inline">Search</span>
                </button>
              </div>`;

const replacement = `<div className="relative flex-1 max-w-xl">
                <AdvancedTypeaheadSearch
                  initialValue={searchQuery}
                  onExecuteSearch={(val) => {
                    updateSearchQuery(val);
                  }}
                  placeholder="Search items by title, subtitle, tag category or author..."
                  className="w-full"
                />
              </div>`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Successfully simplified Courses.jsx search container!');
} else {
  console.error('Target block not found in Courses.jsx');
}

