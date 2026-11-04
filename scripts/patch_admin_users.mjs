import fs from 'fs';

let content = fs.readFileSync('src/pages/admin/Users.jsx', 'utf8');

// 1. Replace header buttons
const oldButtons = `<div className="flex items-center gap-3">
          <button
            onClick={() => {
              fetchMetrics();
              fetchUsers(currentPage, search, selectedRole);
              toast.success("Identity directory refreshed");
            }}
            className="p-2.5 bg-[#FAF7F2] dark:bg-[#272523] border border-[#D5C0D1] dark:border-white/10 hover:border-white/20 rounded-xl text-white/70 hover:text-white transition-all cursor-pointer flex items-center gap-2 text-xs font-medium"
            title="Refresh Directory"
          >
            <RefreshCw className={\`w-4 h-4 \${loading ? 'animate-spin text-[#9A6B56] dark:text-[#D9A48F]' : ''}\`} />
            <span>Sync Telemetry</span>
          </button>
          
          <button
            onClick={handleExport}
            className="px-4 py-2.5 bg-[#FAF7F2] dark:bg-[#272523] border border-[#D5C0D1] dark:border-white/10 hover:border-[#5B3E57] dark:border-[#D1A7CC]/40 rounded-xl text-white/80 hover:text-white transition-all cursor-pointer flex items-center gap-2 text-xs font-medium"
          >
            <Download className="w-4 h-4 text-[#9A6B56] dark:text-[#D9A48F]" />
            <span>Export CSV</span>
          </button>
        </div>`;

const newButtons = `<div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => {
              fetchMetrics();
              fetchUsers(currentPage, search, selectedRole);
              toast.success("Identity directory refreshed");
            }}
            className="px-3.5 py-2.5 bg-white dark:bg-[#272523] border border-[#D5C0D1] dark:border-white/10 hover:border-[#5B3E57] dark:hover:border-[#D1A7CC] rounded-xl text-[#282521] dark:text-[#EDE8E1] hover:text-[#5B3E57] dark:hover:text-[#D1A7CC] transition-all cursor-pointer flex items-center gap-2 text-xs font-semibold shadow-xs"
            title="Refresh Directory"
          >
            <RefreshCw className={\`w-4 h-4 text-[#5B3E57] dark:text-[#D1A7CC] \${loading ? 'animate-spin' : ''}\`} />
            <span>Sync Telemetry</span>
          </button>
          
          <button
            onClick={handleExport}
            className="px-4 py-2.5 bg-white dark:bg-[#272523] border border-[#D5C0D1] dark:border-white/10 hover:border-[#5B3E57] dark:hover:border-[#D1A7CC] rounded-xl text-[#282521] dark:text-[#EDE8E1] hover:text-[#5B3E57] dark:hover:text-[#D1A7CC] transition-all cursor-pointer flex items-center gap-2 text-xs font-semibold shadow-xs"
          >
            <Download className="w-4 h-4 text-[#5B3E57] dark:text-[#D1A7CC]" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-[#5B3E57] hover:bg-[#462D42] text-[#FFFEFA] rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Provision User</span>
          </button>
        </div>`;

if (content.includes(oldButtons)) {
  content = content.replace(oldButtons, newButtons);
  console.log('Replaced buttons (LF)');
} else {
  const oldButtonsCRLF = oldButtons.replace(/\n/g, '\r\n');
  const newButtonsCRLF = newButtons.replace(/\n/g, '\r\n');
  if (content.includes(oldButtonsCRLF)) {
    content = content.replace(oldButtonsCRLF, newButtonsCRLF);
    console.log('Replaced buttons (CRLF)');
  } else {
    console.log('Old buttons target not found');
  }
}

// 2. Replace IAM strip numbers
content = content.replace(
  '<span>IAM Federation Matrix: <strong className="text-white">263</strong> user-service directory identities (<span className="text-[#5B3E57] dark:text-[#D1A7CC]">247 Students</span> + <span className="text-[#9A6B56] dark:text-[#D9A48F]">16 Instructors</span>) + <strong className="text-emerald-400">2</strong> root admin-service platform authorities.</span>',
  '<span>IAM Federation Matrix: <strong className="text-[#282521] dark:text-[#EDE8E1] font-bold">263</strong> user-service directory identities (<span className="text-[#5B3E57] dark:text-[#D1A7CC] font-semibold">247 Students</span> + <span className="text-[#9A6B56] dark:text-[#D9A48F] font-semibold">16 Instructors</span>) + <strong className="text-[#2B6747] dark:text-emerald-400 font-bold">2</strong> root admin-service platform authorities.</span>'
);

// 3. Replace Modal white texts
content = content.replace(
  '<span className="font-semibold text-white text-sm">{selectedUser.name}</span>',
  '<span className="font-semibold text-[#282521] dark:text-[#EDE8E1] text-sm">{selectedUser.name}</span>'
);
content = content.replace(
  '<span className="font-bold text-white text-sm">{selectedUser.role}</span>',
  '<span className="font-bold text-[#282521] dark:text-[#EDE8E1] text-sm">{selectedUser.role}</span>'
);
content = content.replace(
  '<span className="font-mono text-white font-semibold">{selectedUser.courses} Active Enrollments</span>',
  '<span className="font-mono text-[#282521] dark:text-[#EDE8E1] font-semibold">{selectedUser.courses} Active Enrollments</span>'
);
content = content.replace(
  'className="p-2 rounded-xl bg-[#FAF7F2] dark:bg-[#272523] border border-[#D5C0D1] dark:border-white/10 text-[#756E64] dark:text-[#A69F94] hover:text-white"',
  'className="p-2 rounded-xl bg-white dark:bg-[#272523] border border-[#D5C0D1] dark:border-white/10 text-[#756E64] dark:text-[#A69F94] hover:text-[#5B3E57] dark:hover:text-white transition-colors"'
);
content = content.replace(
  'className="px-5 py-2.5 bg-[#FAF7F2] dark:bg-[#272523] border border-[#D5C0D1] dark:border-white/10 hover:border-white/20 rounded-xl text-xs font-semibold text-white transition-all cursor-pointer"',
  'className="px-5 py-2.5 bg-white dark:bg-[#272523] border border-[#D5C0D1] dark:border-white/10 hover:border-[#5B3E57] rounded-xl text-xs font-semibold text-[#282521] dark:text-[#EDE8E1] hover:text-[#5B3E57] transition-all cursor-pointer shadow-xs"'
);

fs.writeFileSync('src/pages/admin/Users.jsx', content, 'utf8');
console.log('Users.jsx patched successfully');

