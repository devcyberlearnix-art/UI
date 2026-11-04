import fs from 'fs';

let content = fs.readFileSync('src/pages/admin/Users.jsx', 'utf8');

// 1. Add handleCreateUser function
const targetHelper = `  const hasPermission = (permission) => {`;
const newHandler = `  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!formData.firstName.trim() || !formData.email.trim()) {
      toast.error("Please provide both legal name and federated email.");
      return;
    }
    const newUser = {
      id: \`usr_\${Date.now().toString(36)}\`,
      name: \`\${formData.firstName.trim()} \${formData.lastName.trim()}\`.trim(),
      email: formData.email.trim(),
      role: formData.role.toUpperCase(),
      status: formData.status || "ACTIVE",
      courses: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setUsers(prev => [newUser, ...prev]);
    setTotalUsers(prev => prev + 1);
    setShowAddModal(false);
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      role: "student",
      status: "ACTIVE",
      password: "Password@123",
    });
    toast.success(\`Identity \${newUser.name} provisioned successfully!\`);
  };

  const hasPermission = (permission) => {`;

if (content.includes(targetHelper)) {
  content = content.replace(targetHelper, newHandler);
}

// 2. Add showAddModal Dialog
const addModalJsx = `        {/* Provision Identity Modal */}
        {showAddModal && (
          <Portal>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowAddModal(false)}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={SPRING}
                className="relative z-10 w-full max-w-lg bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#D5C0D1] dark:border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl text-left"
              >
                <div className="flex items-center justify-between border-b border-[#E3DCD3] dark:border-white/5 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#5B3E57]/10 dark:bg-[#D1A7CC]/15 flex items-center justify-center text-[#5B3E57] dark:text-[#D1A7CC]">
                      <Plus className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[#282521] dark:text-[#EDE8E1]">
                        Provision New Platform Identity
                      </h3>
                      <p className="text-xs text-[#756E64] dark:text-[#A69F94]">
                        Create candidate, instructor, or admin account credentials
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="p-2 rounded-xl bg-white dark:bg-[#272523] border border-[#D5C0D1] dark:border-white/10 text-[#756E64] dark:text-[#A69F94] hover:text-[#5B3E57] dark:hover:text-white transition-colors"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-[#756E64] dark:text-[#A69F94] uppercase tracking-wider mb-1">
                        First Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        placeholder="Elena"
                        className="w-full px-3.5 py-2.5 bg-white dark:bg-[#272523] border border-[#E3DCD3] dark:border-white/10 rounded-xl text-xs text-[#282521] dark:text-[#EDE8E1] focus:outline-none focus:border-[#5B3E57]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#756E64] dark:text-[#A69F94] uppercase tracking-wider mb-1">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        placeholder="Rostova"
                        className="w-full px-3.5 py-2.5 bg-white dark:bg-[#272523] border border-[#E3DCD3] dark:border-white/10 rounded-xl text-xs text-[#282521] dark:text-[#EDE8E1] focus:outline-none focus:border-[#5B3E57]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#756E64] dark:text-[#A69F94] uppercase tracking-wider mb-1">
                      Federated Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="elena.rostova@mit.edu"
                      className="w-full px-3.5 py-2.5 bg-white dark:bg-[#272523] border border-[#E3DCD3] dark:border-white/10 rounded-xl text-xs text-[#282521] dark:text-[#EDE8E1] focus:outline-none focus:border-[#5B3E57]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-[#756E64] dark:text-[#A69F94] uppercase tracking-wider mb-1">
                        Role Assignment
                      </label>
                      <select
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-white dark:bg-[#272523] border border-[#E3DCD3] dark:border-white/10 rounded-xl text-xs text-[#282521] dark:text-[#EDE8E1] focus:outline-none focus:border-[#5B3E57]"
                      >
                        <option value="student">STUDENT</option>
                        <option value="instructor">INSTRUCTOR</option>
                        <option value="admin">ADMIN</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#756E64] dark:text-[#A69F94] uppercase tracking-wider mb-1">
                        Account Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-white dark:bg-[#272523] border border-[#E3DCD3] dark:border-white/10 rounded-xl text-xs text-[#282521] dark:text-[#EDE8E1] focus:outline-none focus:border-[#5B3E57]"
                      >
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="PENDING_VERIFICATION">PENDING</option>
                        <option value="SUSPENDED">SUSPENDED</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end items-center gap-3 pt-3 border-t border-[#E3DCD3] dark:border-white/5">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="px-4 py-2.5 bg-white dark:bg-[#272523] border border-[#D5C0D1] dark:border-white/10 rounded-xl text-xs font-semibold text-[#282521] dark:text-[#EDE8E1] hover:text-[#5B3E57] transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-[#5B3E57] hover:bg-[#462D42] text-[#FFFEFA] rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>Confirm Provisioning</span>
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          </Portal>
        )}`;

const portalTarget = `          </Portal>
        )}
      </AnimatePresence>`;

if (content.includes(portalTarget)) {
  content = content.replace(portalTarget, `          </Portal>
        )}
${addModalJsx}
      </AnimatePresence>`);
  console.log('Added Add Modal (LF)');
} else {
  const portalTargetCRLF = portalTarget.replace(/\n/g, '\r\n');
  if (content.includes(portalTargetCRLF)) {
    content = content.replace(portalTargetCRLF, `          </Portal>\r\n        )}\r\n${addModalJsx.replace(/\n/g, '\r\n')}\r\n      </AnimatePresence>`);
    console.log('Added Add Modal (CRLF)');
  } else {
    console.log('Portal target not found');
  }
}

fs.writeFileSync('src/pages/admin/Users.jsx', content, 'utf8');
console.log('Users.jsx completed with Provision Modal');

