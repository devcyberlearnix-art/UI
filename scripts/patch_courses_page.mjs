import fs from 'fs';

const filePath = 'c:/Users/SHIVASAI/OneDrive/Desktop/FD_LMS/UI/src/pages/admin/Courses.jsx';
let content = fs.readFileSync(filePath, 'utf8').replace(/\r\n/g, '\n');

// 1. Add pagination & filter states right after const [selectedCourse, setSelectedCourse] = useState(null);
const oldStateMarker = `  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showModal, setShowModal] = useState(false);`;

const newStateMarker = `  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [coursesPerPage] = useState(10);`;

if (content.includes(oldStateMarker)) {
  content = content.replace(oldStateMarker, newStateMarker);
  console.log('Added pagination & filter state');
}

// 2. Update loading state container
content = content.replace(
  'className="bg-gray-50 min-h-screen p-6 flex items-center justify-center"',
  'className="min-h-screen bg-[#070709] p-6 flex items-center justify-center"'
);

// 3. Update main container
content = content.replace(
  'className="space-y-6 pb-12"',
  'className="min-h-screen bg-[#070709] text-[#F5F5F7] p-6 lg:p-10 space-y-8 font-sans selection:bg-[#C5A880]/30 selection:text-white pb-12"'
);

// 4. Update header
content = content.replace(
  `<h1 className="text-2xl font-bold">Course Management</h1>
          <p className="text-gray-500 text-sm">Approve, edit, publish, and manage real-time courses</p>`,
  `<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#14141A] border border-[#C5A880]/30 text-xs font-semibold text-[#C5A880] mb-2">
            <span className="tracking-wider uppercase text-[10px] font-bold">Curriculum Governance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F5F5F7] tracking-tight">Curriculum Audit & Course Management</h1>
          <p className="text-xs sm:text-sm text-[#8E8E93]">Review syllabus catalogs, govern publication workflows, and audit multi-tenant courses</p>`
);

content = content.replace(
  'className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-500 transition"',
  'className="p-2.5 rounded-xl bg-[#14141A] border border-white/10 hover:border-white/20 text-white/70 hover:text-white transition"'
);

content = content.replace(
  'className="flex items-center gap-2 bg-orange-500 text-white px-5 py-2.5 rounded-xl hover:bg-orange-600 transition font-semibold text-sm shadow-md shadow-orange-100"',
  'className="flex items-center gap-2 bg-[#C5A880] text-black px-5 py-2.5 rounded-xl hover:bg-[#D4BC98] transition font-bold text-xs shadow-md"'
);

// 5. Update stats cards
content = content.replace(/className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm"/g, 'className="p-5 rounded-2xl bg-[#0F0F13] border border-white/[0.04] shadow-sm hover:border-[#C5A880]/30 transition-all"');
content = content.replace(/className="text-xs text-gray-500 font-medium"/g, 'className="text-xs text-[#8E8E93] font-semibold tracking-wide uppercase text-[10px]"');
content = content.replace(/className="text-2xl font-bold mt-1 text-gray-900"/g, 'className="text-3xl font-extrabold font-mono mt-1 text-[#F5F5F7]"');

// 6. Update table container
content = content.replace(
  'className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"',
  'className="rounded-3xl bg-[#0F0F13] border border-white/[0.04] shadow-sm overflow-hidden"'
);

content = content.replace(
  'className="bg-gray-50"',
  'className="bg-[#14141A] text-[#8E8E93] border-b border-white/[0.04]"'
);

content = content.replace(
  'className="divide-y divide-gray-100 bg-white"',
  'className="divide-y divide-white/[0.02] bg-[#0F0F13]"'
);

content = content.replace(
  'className="hover:bg-orange-50/30 transition"',
  'className="hover:bg-white/[0.02] transition-colors text-xs"'
);

content = content.replace(
  'className="px-6 py-4 text-sm font-semibold text-gray-900 cursor-pointer hover:text-orange-600 transition"',
  'className="px-6 py-4 text-sm font-semibold text-[#F5F5F7] cursor-pointer hover:text-[#C5A880] transition"'
);

content = content.replace(
  'className="px-6 py-4 text-sm text-gray-600"',
  'className="px-6 py-4 text-xs text-[#8E8E93]"'
);

content = content.replace(
  'className="px-6 py-4 text-sm font-semibold text-gray-900"',
  'className="px-6 py-4 font-mono font-bold text-[#C5A880]"'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully patched Courses.jsx');

