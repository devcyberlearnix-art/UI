import fs from 'fs';

const filePath = 'c:/Users/SHIVASAI/OneDrive/Desktop/FD_LMS/UI/src/pages/admin/Courses.jsx';
let content = fs.readFileSync(filePath, 'utf8').replace(/\r\n/g, '\n');

// 1. Add filteredCourses and paginatedCourses definitions right before if (loading)
const oldLoading = `  if (loading) {`;
const newFilteredLogic = `  const filteredCourses = courses.filter((c) => {
    const matchesSearch = !search ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      String(c.instructor).toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "All" || c.category === selectedCategory;
    const matchesStatus = selectedStatusFilter === "All" ||
      String(c.status).toUpperCase() === selectedStatusFilter.toUpperCase();
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const paginatedCourses = filteredCourses.slice((currentPage - 1) * coursesPerPage, currentPage * coursesPerPage);
  const totalCoursePages = Math.ceil(filteredCourses.length / coursesPerPage) || 1;

  if (loading) {`;

if (content.includes(oldLoading)) {
  content = content.replace(oldLoading, newFilteredLogic);
  console.log('Added filteredCourses logic');
}

// 2. Add toolbar right before {/* Course Table */}
const oldTableMarker = `      {/* Course Table */}
      <div className="rounded-3xl bg-[#0F0F13] border border-white/[0.04] shadow-sm overflow-hidden">`;

const newToolbarAndTable = `      {/* Control Matrix Toolbar */}
      <div className="rounded-2xl bg-[#0F0F13] border border-white/[0.04] p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            placeholder="Search by course title or instructor..."
            className="w-full pl-4 pr-4 py-2 bg-[#14141A] border border-white/[0.08] rounded-xl text-sm text-[#F5F5F7] placeholder-[#71717A] focus:outline-none focus:border-[#C5A880]"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
            className="px-3 py-2 bg-[#14141A] border border-white/[0.08] rounded-xl text-xs text-[#F5F5F7] focus:outline-none focus:border-[#C5A880] cursor-pointer"
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select
            value={selectedStatusFilter}
            onChange={(e) => { setSelectedStatusFilter(e.target.value); setCurrentPage(1); }}
            className="px-3 py-2 bg-[#14141A] border border-white/[0.08] rounded-xl text-xs text-[#F5F5F7] focus:outline-none focus:border-[#C5A880] cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Draft</option>
            <option value="ARCHIVED">Archived</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Course Table */}
      <div className="rounded-3xl bg-[#0F0F13] border border-white/[0.04] shadow-sm overflow-hidden">`;

if (content.includes(oldTableMarker)) {
  content = content.replace(oldTableMarker, newToolbarAndTable);
  console.log('Added control toolbar');
}

// 3. Change courses.map to paginatedCourses.map in tbody
content = content.replace(
  '{courses.map((course) => (',
  '{paginatedCourses.map((course) => ('
);

// 4. Add pagination footer right after </table>
const oldTableEnd = `        </table>
      </div>`;

const newTableEnd = `        </table>

        {/* Pagination Bar */}
        <div className="px-6 py-4 bg-[#14141A]/50 border-t border-white/[0.04] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <span className="text-[#8E8E93]">
            Showing <strong className="text-[#F5F5F7]">{(currentPage - 1) * coursesPerPage + 1}</strong> to{" "}
            <strong className="text-[#F5F5F7]">{Math.min(currentPage * coursesPerPage, filteredCourses.length)}</strong> of{" "}
            <strong className="text-[#C5A880]">{filteredCourses.length}</strong> total courses
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="px-3 py-1.5 rounded-xl bg-[#14141A] border border-white/[0.08] hover:border-white/20 disabled:opacity-40 disabled:cursor-not-allowed text-[#F5F5F7] transition-all"
            >
              Previous
            </button>
            <span className="px-3 py-1 font-mono text-xs text-[#A1A1AA]">
              Page <strong className="text-[#C5A880]">{currentPage}</strong> / {totalCoursePages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalCoursePages, p + 1))}
              disabled={currentPage >= totalCoursePages}
              className="px-3 py-1.5 rounded-xl bg-[#14141A] border border-white/[0.08] hover:border-white/20 disabled:opacity-40 disabled:cursor-not-allowed text-[#F5F5F7] transition-all"
            >
              Next
            </button>
          </div>
        </div>
      </div>`;

if (content.includes(oldTableEnd)) {
  content = content.replace(oldTableEnd, newTableEnd);
  console.log('Added pagination footer');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Courses.jsx updated successfully.');

