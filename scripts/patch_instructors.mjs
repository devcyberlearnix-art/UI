import fs from "fs";

let code = fs.readFileSync("src/pages/admin/Instructors.jsx", "utf8");

// Fix loading
code = code.replace(
  `<div className="bg-gray-50 min-h-screen p-6 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading instructors...</p>
        </div>
      </div>`,
  `<div className="bg-[#070709] min-h-screen p-6 flex flex-col items-center justify-center space-y-4">
    <Loader2 className="w-10 h-10 text-[#C5A880] animate-spin" />
    <p className="text-sm font-medium text-[#8E8E93]">Loading faculty governance roster...</p>
  </div>`
);

// Fix error
code = code.replace(
  `<div className="bg-gray-50 min-h-screen p-6 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-sm border border-red-200 p-8 text-center max-w-md">`,
  `<div className="bg-[#070709] min-h-screen p-6 flex items-center justify-center">
        <div className="bg-[#0F0F13] border border-red-500/20 rounded-3xl p-8 text-center max-w-md space-y-4 shadow-2xl">`
);

// Fix pagination
const oldPagination = `<div className="flex items-center justify-center gap-4 px-4 py-3 bg-white border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Showing {(currentPage - 1) * instructorsPerPage + 1}-{Math.min(currentPage * instructorsPerPage, filteredInstructors.length)} of {filteredInstructors.length} instructors
          </p>
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            &lt; Prev
          </button>
          <span className="text-sm text-gray-600">
            Page {currentPage} of {Math.ceil(filteredInstructors.length / instructorsPerPage)}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredInstructors.length / instructorsPerPage)))}
            disabled={currentPage === Math.ceil(filteredInstructors.length / instructorsPerPage)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next &gt;
          </button>
        </div>`;

const newPagination = `<div className="flex items-center justify-between px-6 py-4 bg-[#14141A]/50 border-t border-white/[0.04] text-xs">
          <p className="text-[#8E8E93]">
            Showing <strong className="text-white">{(currentPage - 1) * instructorsPerPage + 1}</strong> to <strong className="text-white">{Math.min(currentPage * instructorsPerPage, filteredInstructors.length)}</strong> of <strong className="text-white">{filteredInstructors.length}</strong> faculty members
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 bg-[#14141A] border border-white/10 hover:border-white/20 text-[#8E8E93] hover:text-white rounded-lg disabled:opacity-30 disabled:pointer-events-none transition"
            >
              Previous
            </button>
            <span className="font-mono text-[#F5F5F7] px-2">
              Page {currentPage} of {Math.ceil(filteredInstructors.length / instructorsPerPage) || 1}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredInstructors.length / instructorsPerPage)))}
              disabled={currentPage === Math.ceil(filteredInstructors.length / instructorsPerPage)}
              className="px-3 py-1.5 bg-[#14141A] border border-white/10 hover:border-white/20 text-[#8E8E93] hover:text-white rounded-lg disabled:opacity-30 disabled:pointer-events-none transition"
            >
              Next
            </button>
          </div>
        </div>`;

code = code.replace(oldPagination, newPagination);

// Fix modal
const modalIdx = code.indexOf("{/* Instructor Details Modal */");
if (modalIdx !== -1) {
  const newModal = `{/* Instructor Details Modal (Ink & Onyx) */}
      {showModal && selectedInstructor && (
        <Portal>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setShowModal(false)}>
            <div className="bg-[#0F0F13] border border-white/10 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden text-left" onClick={(e) => e.stopPropagation()}>
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg text-[#F5F5F7]">Faculty Profile Inspection</h3>
                  <p className="text-xs text-[#8E8E93]">Federated microservice instructor record</p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 rounded-xl bg-[#14141A] border border-white/10 text-[#8E8E93] hover:text-white"
                >
                  ✕
                </button>
              </div>
              <div className="p-6 space-y-4 text-xs">
                {/* Profile Section */}
                <div className="p-4 rounded-2xl bg-[#14141A] border border-white/5 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-[#0F0F13] border border-[#C5A880]/30 flex items-center justify-center text-[#C5A880] font-bold text-2xl shadow-sm shrink-0">
                    {selectedInstructor.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-base text-white truncate">{selectedInstructor.name}</p>
                    <p className="text-xs font-mono text-[#C5A880] truncate mt-0.5">{selectedInstructor.email}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#C5A880]/10 text-[#C5A880] border border-[#C5A880]/30">
                        INSTRUCTOR
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {selectedInstructor.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl bg-[#14141A] border border-white/5 space-y-1">
                    <span className="text-[#8E8E93] block text-[11px]">Assigned Role</span>
                    <span className="font-bold text-white text-sm">Faculty Member</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-[#14141A] border border-white/5 space-y-1">
                    <span className="text-[#8E8E93] block text-[11px]">Verification</span>
                    <span className="font-bold text-emerald-400 text-sm">Certified Author</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#14141A] border border-white/5 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[#8E8E93]">Faculty Identifier</span>
                    <span className="font-mono text-[#A1A1AA]">{selectedInstructor.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8E8E93]">Induction Timestamp</span>
                    <span className="font-mono text-[#71717A]">{selectedInstructor.createdAt}</span>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-5 py-2.5 bg-[#C5A880] hover:bg-[#B3936A] text-[#070709] rounded-xl text-xs font-bold transition-all shadow-lg shadow-[#C5A880]/10"
                  >
                    Close Inspection
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </motion.div>
  );
};

export default Instructors;
`;
  code = code.substring(0, modalIdx) + newModal;
}

fs.writeFileSync("src/pages/admin/Instructors.jsx", code, "utf8");
console.log("Successfully patched Instructors.jsx with Ink & Onyx dark styling!");
