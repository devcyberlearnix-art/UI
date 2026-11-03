import fs from "fs";

let code = fs.readFileSync("src/pages/admin/Courses.jsx", "utf8");

// 1. Edit Course Modal
const oldEditStart = code.indexOf("{/* EDIT COURSE MODAL */}");
const oldPatchStart = code.indexOf("{/* QUICK PATCH PRICE MODAL");
const oldCreateStart = code.indexOf("{/* CREATE COURSE MODAL */}");
const oldDetailsStart = code.indexOf("{/* Course Details Modal */}");
const endOfModals = code.lastIndexOf("</motion.div>");

const newModalsSection = `{/* EDIT COURSE MODAL (Ink & Onyx) */}
      {showEditModal && (
        <Portal>
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={() => setShowEditModal(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} onClick={(e) => e.stopPropagation()} className="bg-[#0F0F13] border border-white/10 text-[#F5F5F7] rounded-3xl p-6 sm:p-8 w-full max-w-xl shadow-2xl space-y-5 text-left">
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <h2 className="text-lg font-bold text-[#F5F5F7] flex items-center gap-2">
                <Edit size={18} className="text-[#C5A880]" /> Edit Course Record
              </h2>
              <button onClick={() => setShowEditModal(false)} className="p-2 rounded-xl bg-[#14141A] border border-white/10 text-[#8E8E93] hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAdminUpdateCourse} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#8E8E93] mb-1">Course Title *</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => updateEdit("title", e.target.value)}
                  placeholder="Course Title"
                  className="w-full px-4 py-2.5 bg-[#14141A] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-[#C5A880]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8E8E93] mb-1">Description</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => updateEdit("description", e.target.value)}
                  placeholder="Course description..."
                  rows={3}
                  className="w-full px-4 py-2.5 bg-[#14141A] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-[#C5A880] resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#8E8E93] mb-1">Category</label>
                  <select
                    value={editForm.category}
                    onChange={(e) => updateEdit("category", e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#14141A] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-[#C5A880]"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c} className="bg-[#14141A] text-white">{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#8E8E93] mb-1">Skill Level</label>
                  <select
                    value={editForm.level}
                    onChange={(e) => updateEdit("level", e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#14141A] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-[#C5A880]"
                  >
                    {LEVELS.map(l => <option key={l} value={l} className="bg-[#14141A] text-white">{l}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#8E8E93] mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={editForm.price}
                    onChange={(e) => updateEdit("price", e.target.value)}
                    placeholder="1299.99"
                    className="w-full px-4 py-2.5 bg-[#14141A] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-[#C5A880] font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#8E8E93] mb-1">Language</label>
                  <select
                    value={editForm.language}
                    onChange={(e) => updateEdit("language", e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#14141A] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-[#C5A880]"
                  >
                    {["English", "Hindi", "Telugu", "Tamil", "Kannada"].map(l => <option key={l} value={l} className="bg-[#14141A] text-white">{l}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2.5 bg-[#14141A] border border-white/10 hover:border-white/20 text-[#8E8E93] hover:text-white rounded-xl text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="flex items-center gap-2 px-6 py-2.5 bg-[#C5A880] hover:bg-[#B3936A] text-[#070709] rounded-xl text-xs font-bold transition-all shadow-lg shadow-[#C5A880]/10 disabled:opacity-60"
                >
                  {updating ? <Loader2 size={15} className="animate-spin" /> : <Edit size={15} />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
        </Portal>
      )}

      {/* QUICK PATCH PRICE MODAL (Ink & Onyx) */}
      {showPatchModal && (
        <Portal>
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={() => setShowPatchModal(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} onClick={(e) => e.stopPropagation()} className="bg-[#0F0F13] border border-white/10 text-[#F5F5F7] rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl space-y-4 text-left">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <h2 className="text-base font-bold text-[#F5F5F7] flex items-center gap-2">
                <Star size={18} className="text-[#C5A880]" /> Quick Price Adjustment
              </h2>
              <button onClick={() => setShowPatchModal(false)} className="p-2 rounded-xl bg-[#14141A] border border-white/10 text-[#8E8E93] hover:text-white">✕</button>
            </div>

            <p className="text-xs text-[#8E8E93]">
              Directly patches Course Service catalog price via <code className="bg-[#14141A] text-[#C5A880] px-1.5 py-0.5 rounded font-mono border border-white/5">PATCH /api/v1/courses/{patchingCourseId}</code>.
            </p>

            <form onSubmit={handleAdminPatchCourse} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#8E8E93] mb-1">New Catalog Price (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={patchPrice}
                  onChange={(e) => setPatchPrice(e.target.value)}
                  placeholder="899.99"
                  className="w-full px-4 py-2.5 bg-[#14141A] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-[#C5A880] font-mono font-bold"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowPatchModal(false)}
                  className="px-4 py-2.5 bg-[#14141A] border border-white/10 hover:border-white/20 text-[#8E8E93] hover:text-white rounded-xl text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={patching}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#C5A880] hover:bg-[#B3936A] text-[#070709] rounded-xl text-xs font-bold transition-all shadow-lg shadow-[#C5A880]/10 disabled:opacity-60"
                >
                  {patching ? <Loader2 size={15} className="animate-spin" /> : <Star size={15} />}
                  <span>Commit Price</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
        </Portal>
      )}

      {/* CREATE COURSE MODAL (Ink & Onyx) */}
      {showCreateModal && (
        <Portal>
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={() => setShowCreateModal(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} onClick={(e) => e.stopPropagation()} className="bg-[#0F0F13] border border-white/10 text-[#F5F5F7] rounded-3xl p-6 sm:p-8 w-full max-w-xl shadow-2xl space-y-4 text-left">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <h2 className="text-lg font-bold text-[#F5F5F7] flex items-center gap-2">
                <Plus size={18} className="text-[#C5A880]" /> Author New Curriculum
              </h2>
              <button onClick={() => setShowCreateModal(false)} className="p-2 rounded-xl bg-[#14141A] border border-white/10 text-[#8E8E93] hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAdminCreateCourse} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#8E8E93] mb-1">Course Title *</label>
                <input
                  type="text"
                  value={createForm.title}
                  onChange={(e) => updateCreate("title", e.target.value)}
                  placeholder="e.g. Advanced Distributed Systems"
                  className="w-full px-4 py-2.5 bg-[#14141A] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-[#C5A880]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8E8E93] mb-1">Description *</label>
                <textarea
                  value={createForm.description}
                  onChange={(e) => updateCreate("description", e.target.value)}
                  placeholder="Course content summary..."
                  rows={3}
                  className="w-full px-4 py-2.5 bg-[#14141A] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-[#C5A880] resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#8E8E93] mb-1">Category</label>
                  <select
                    value={createForm.category}
                    onChange={(e) => updateCreate("category", e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#14141A] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-[#C5A880]"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c} className="bg-[#14141A] text-white">{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#8E8E93] mb-1">Skill Level</label>
                  <select
                    value={createForm.level}
                    onChange={(e) => updateCreate("level", e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#14141A] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-[#C5A880]"
                  >
                    {LEVELS.map(l => <option key={l} value={l} className="bg-[#14141A] text-white">{l}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#8E8E93] mb-1">Price (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={createForm.price}
                    onChange={(e) => updateCreate("price", e.target.value)}
                    placeholder="1499.99"
                    className="w-full px-4 py-2.5 bg-[#14141A] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-[#C5A880] font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#8E8E93] mb-1">Language</label>
                  <select
                    value={createForm.language}
                    onChange={(e) => updateCreate("language", e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#14141A] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-[#C5A880]"
                  >
                    {["English", "Hindi", "Telugu", "Tamil", "Kannada"].map(l => <option key={l} value={l} className="bg-[#14141A] text-white">{l}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 bg-[#14141A] border border-white/10 hover:border-white/20 text-[#8E8E93] hover:text-white rounded-xl text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex items-center gap-2 px-6 py-2.5 bg-[#C5A880] hover:bg-[#B3936A] text-[#070709] rounded-xl text-xs font-bold transition-all shadow-lg shadow-[#C5A880]/10 disabled:opacity-60"
                >
                  {creating ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
                  <span>Publish Curriculum</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
        </Portal>
      )}

      {/* Course Details Modal (Ink & Onyx) */}
      {showModal && selectedCourse && (
        <Portal>
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={() => setShowModal(false)}>
            <div className="bg-[#0F0F13] border border-white/10 rounded-3xl p-6 sm:p-8 w-full max-w-xl space-y-5 shadow-2xl max-h-[85vh] overflow-y-auto text-left" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <h2 className="text-lg font-bold text-[#F5F5F7] flex items-center gap-2">
                <FileText size={18} className="text-[#C5A880]" /> Curriculum Audit Details
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setShowModal(false);
                    navigate(\`/admin/courses/\${selectedCourse.id}/students\`);
                  }}
                  className="px-3 py-1.5 bg-[#14141A] border border-white/10 hover:border-white/20 text-[#8E8E93] hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Users size={14} /> Enrolled
                </button>
                <button
                  onClick={() => {
                    setShowModal(false);
                    handleOpenEdit(selectedCourse);
                  }}
                  className="px-3 py-1.5 bg-[#C5A880]/10 border border-[#C5A880]/30 hover:bg-[#C5A880]/20 text-[#C5A880] rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Edit size={14} /> Edit
                </button>
                <button onClick={() => setShowModal(false)} className="p-2 rounded-xl bg-[#14141A] border border-white/10 text-[#8E8E93] hover:text-white">✕</button>
              </div>
            </div>

            {contentLoading ? (
              <div className="flex flex-col items-center justify-center py-8 space-y-2">
                <Loader2 size={24} className="animate-spin text-[#C5A880]" />
                <p className="text-xs text-[#8E8E93]">Loading course syllabus & sections...</p>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div>
                  <p className="text-[11px] text-[#8E8E93] uppercase font-semibold">Course Title</p>
                  <p className="font-bold text-[#F5F5F7] text-base mt-0.5">{selectedCourse.title}</p>
                </div>
                {courseContentData?.description && (
                  <div>
                    <p className="text-[11px] text-[#8E8E93] uppercase font-semibold">Description</p>
                    <p className="text-[#A1A1AA] text-xs mt-1 leading-relaxed">{courseContentData.description}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3 bg-[#14141A] p-4 rounded-2xl border border-white/5">
                  <div>
                    <p className="text-[10px] text-[#8E8E93] uppercase font-semibold">Instructor</p>
                    <p className="font-semibold text-white mt-0.5">{selectedCourse.instructor}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#8E8E93] uppercase font-semibold">Category</p>
                    <p className="font-semibold text-white mt-0.5">{selectedCourse.category}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#8E8E93] uppercase font-semibold">Catalog Price</p>
                    <p className="font-bold font-mono text-[#C5A880] text-sm mt-0.5">₹{selectedCourse.price}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#8E8E93] uppercase font-semibold">Publication Status</p>
                    <span className="px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 inline-block mt-0.5">
                      {selectedCourse.status}
                    </span>
                  </div>
                </div>

                {courseContentData?.sections && courseContentData.sections.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[11px] font-bold text-[#8E8E93] uppercase tracking-wider">Curriculum Syllabus & Modules ({courseContentData.sections.length})</p>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {courseContentData.sections.map((sec, idx) => (
                        <div key={sec.id || idx} className="p-3 bg-[#14141A] rounded-xl border border-white/5 flex items-center justify-between">
                          <p className="font-semibold text-xs text-white">{sec.title || \`Section \${idx + 1}\`}</p>
                          {sec.lectures && (
                            <span className="text-[10px] text-[#8E8E93] font-mono bg-[#0F0F13] px-2 py-0.5 rounded border border-white/5">{sec.lectures.length} Lectures</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        </Portal>
      )}
`;

code = code.substring(0, oldEditStart) + newModalsSection + "\n    </motion.div>\n  );\n};\n\nexport default Courses;\n";
fs.writeFileSync("src/pages/admin/Courses.jsx", code, "utf8");
console.log("Successfully patched all Courses.jsx modals with Ink & Onyx dark styling!");

