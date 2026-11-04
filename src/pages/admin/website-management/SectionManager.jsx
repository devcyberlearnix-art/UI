// src/pages/admin/website-management/SectionManager.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Plus,
  Eye,
  EyeOff,
  ChevronUp,
  ChevronDown,
  Trash2,
  Edit2,
  Layers,
  Save,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';
import { cmsAdminApi } from '../../../api/cmsApi';
import Button from '../../../design-system/primitives/Button';
import Badge from '../../../design-system/primitives/Badge';

const EASING = [0.16, 1, 0.3, 1];

const SECTION_TYPES = [
  { value: 'HERO', label: 'Hero Section', desc: 'Main headline, badges, CTAs and search' },
  { value: 'FEATURED_COURSES', label: 'Featured Courses', desc: 'Grid/carousel of curated production courses' },
  { value: 'COURSE_CAROUSEL', label: 'Course Carousel', desc: 'Horizontal scroll of tracks' },
  { value: 'BANNER', label: 'Promotional Banner', desc: 'Targeted campaign banners' },
  { value: 'STATISTICS', label: 'Platform Telemetry', desc: 'Stats counters bar' },
  { value: 'CERTIFICATIONS', label: 'Certifications', desc: 'Verified credentials and badges' },
  { value: 'INSTRUCTORS', label: 'Lead Instructors', desc: 'Verified staff and architect profiles' },
  { value: 'TESTIMONIALS', label: 'Learner Testimonials', desc: 'Quotes and reviews from engineers' },
  { value: 'CTA', label: 'Call to Action Bar', desc: 'Portal initialization conversion banner' },
  { value: 'FOOTER', label: 'Footer Section', desc: 'Bottom links, copyright, and socials' },
];

export default function SectionManager() {
  const navigate = useNavigate();
  const [sections, setSections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editingSection, setEditingSection] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newSection, setNewSection] = useState({
    title: '',
    sectionKey: '',
    sectionType: 'FEATURED_COURSES',
    contentJson: '{}',
    isVisible: true,
  });

  const loadSections = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await cmsAdminApi.getSections();
      const list = res?.data || res || [];
      setSections(Array.isArray(list) ? list : []);
    } catch (err) {
      toast.error('Failed to load sections from backend');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSections();
  }, [loadSections]);

  const handleToggleVisibility = async (id, currentVis) => {
    try {
      await cmsAdminApi.toggleSectionVisibility(id, !currentVis);
      setSections(prev =>
        prev.map(s => (s.id === id ? { ...s, isVisible: !currentVis } : s))
      );
      toast.success(`Section ${!currentVis ? 'enabled' : 'disabled'}`);
    } catch {
      toast.error('Failed to toggle visibility');
    }
  };

  const handleMove = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const copy = [...sections];
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;
    setSections(copy);
  };

  const handleSaveOrder = async () => {
    setIsSaving(true);
    try {
      const orderPayload = sections.map((s, idx) => ({ id: s.id, order: idx }));
      await cmsAdminApi.reorderSections(orderPayload);
      toast.success('Section order saved successfully');
    } catch {
      toast.error('Failed to save section order');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this section?')) return;
    try {
      await cmsAdminApi.deleteSection(id);
      setSections(prev => prev.filter(s => s.id !== id));
      toast.success('Section deleted');
    } catch {
      toast.error('Failed to delete section');
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!newSection.title.trim()) {
      toast.error('Section title is required');
      return;
    }
    const key = newSection.sectionKey.trim() || newSection.title.toUpperCase().replace(/\s+/g, '_');
    try {
      const res = await cmsAdminApi.createSection({
        ...newSection,
        sectionKey: key,
        displayOrder: sections.length,
      });
      const created = res?.data || res;
      setSections(prev => [...prev, created]);
      setIsCreating(false);
      setNewSection({ title: '', sectionKey: '', sectionType: 'FEATURED_COURSES', contentJson: '{}', isVisible: true });
      toast.success('Section created');
    } catch {
      toast.error('Failed to create section');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingSection) return;
    try {
      const res = await cmsAdminApi.updateSection(editingSection.id, editingSection);
      const updated = res?.data || res;
      setSections(prev => prev.map(s => (s.id === updated.id ? updated : s)));
      setEditingSection(null);
      toast.success('Section updated');
    } catch {
      toast.error('Failed to update section');
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F2EC] dark:bg-[#151413] text-[#282521] dark:text-[#EDE8E1] p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[#E3DCD3] dark:border-[#E3DCD3] dark:border-white/[0.06]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/admin/website-management')}
              className="p-2 rounded-xl bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-white/[0.06] hover:border-[#5B3E57]/40 dark:hover:border-[#D1A7CC]/40 text-[#A1A1AA] hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-[#282521] dark:text-[#EDE8E1] flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#5B3E57] dark:text-[#D1A7CC]" />
                Landing Page Sections
              </h1>
              <p className="text-xs text-[#756E64] dark:text-[#7A7368] mt-0.5">
                Organize structure, reorder layout, and configure section visibility
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleSaveOrder}
              disabled={isSaving}
              leftIcon={Save}
            >
              {isSaving ? 'Saving...' : 'Save Order'}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsCreating(true)}
              leftIcon={Plus}
            >
              Add Section
            </Button>
          </div>
        </div>

        {/* Section List */}
        {isLoading ? (
          <div className="p-12 text-center text-sm text-[#756E64] dark:text-[#7A7368] bg-[#FFFEFA] dark:bg-[#1D1C1A] rounded-2xl border border-[#E3DCD3] dark:border-[#E3DCD3] dark:border-white/[0.06]">
            Hydrating section pipeline...
          </div>
        ) : sections.length === 0 ? (
          <div className="p-12 text-center bg-[#FFFEFA] dark:bg-[#1D1C1A] rounded-2xl border border-[#E3DCD3] dark:border-[#E3DCD3] dark:border-white/[0.06] space-y-3">
            <Layers className="w-8 h-8 text-[#756E64] dark:text-[#7A7368] mx-auto" />
            <p className="text-sm font-semibold text-[#282521] dark:text-[#EDE8E1]">No sections configured</p>
            <p className="text-xs text-[#756E64] dark:text-[#7A7368]">Add your first section to build the landing page</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sections.map((section, index) => (
              <motion.div
                key={section.id || index}
                layout
                className={`p-4 rounded-2xl bg-[#FFFEFA] dark:bg-[#1D1C1A] border transition-all ${
                  section.isVisible ? 'border-[#E3DCD3] dark:border-[#E3DCD3] dark:border-white/[0.06]' : 'border-white/[0.02] opacity-60'
                } flex items-center justify-between gap-4`}
              >
                {/* Reorder Buttons & Details */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex flex-col gap-0.5">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMove(index, -1)}
                      className="p-1 rounded hover:bg-white/[0.06] text-[#756E64] dark:text-[#7A7368] hover:text-[#5B3E57] dark:hover:text-[#D1A7CC] disabled:opacity-20"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={index === sections.length - 1}
                      onClick={() => handleMove(index, 1)}
                      className="p-1 rounded hover:bg-white/[0.06] text-[#756E64] dark:text-[#7A7368] hover:text-[#5B3E57] dark:hover:text-[#D1A7CC] disabled:opacity-20"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="w-8 h-8 rounded-lg bg-[#F5F2EC] dark:bg-[#151413] border border-[#E3DCD3] dark:border-white/[0.06] flex items-center justify-center font-mono text-xs text-[#5B3E57] dark:text-[#D1A7CC]">
                    {index + 1}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-[#282521] dark:text-[#EDE8E1] truncate">{section.title}</p>
                      <Badge variant="default">{section.sectionType}</Badge>
                    </div>
                    <p className="text-xs text-[#756E64] dark:text-[#7A7368] font-mono mt-0.5">{section.sectionKey}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleToggleVisibility(section.id, section.isVisible)}
                    className="p-2 rounded-xl text-[#A1A1AA] hover:text-white hover:bg-white/[0.04] transition-colors"
                    title={section.isVisible ? 'Hide Section' : 'Show Section'}
                  >
                    {section.isVisible ? <Eye className="w-4 h-4 text-emerald-400" /> : <EyeOff className="w-4 h-4 text-zinc-500" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingSection(section)}
                    className="p-2 rounded-xl text-[#A1A1AA] hover:text-[#5B3E57] dark:hover:text-[#D1A7CC] hover:bg-white/[0.04] transition-colors"
                    title="Edit Section"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(section.id)}
                    className="p-2 rounded-xl text-[#A1A1AA] hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Delete Section"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Modal: Create Section */}
        <AnimatePresence>
          {isCreating && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-lg bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-white/[0.08] rounded-2xl p-6 space-y-5"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-[#282521] dark:text-[#EDE8E1]">Add New Section</h3>
                  <button onClick={() => setIsCreating(false)} className="text-[#756E64] dark:text-[#7A7368] hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <form onSubmit={handleCreateSubmit} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-[#A1A1AA] block mb-1.5">Section Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Production Architectural Tracks"
                      value={newSection.title}
                      onChange={e => setNewSection({ ...newSection, title: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F2EC] dark:bg-[#151413] border border-[#E3DCD3] dark:border-white/[0.08] text-sm text-[#282521] dark:text-[#EDE8E1] outline-none focus:border-[#5B3E57] dark:focus:border-[#D1A7CC]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#A1A1AA] block mb-1.5">Section Key (Unique)</label>
                    <input
                      type="text"
                      placeholder="e.g. ARCH_TRACKS"
                      value={newSection.sectionKey}
                      onChange={e => setNewSection({ ...newSection, sectionKey: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F2EC] dark:bg-[#151413] border border-[#E3DCD3] dark:border-white/[0.08] text-sm text-[#282521] dark:text-[#EDE8E1] outline-none focus:border-[#5B3E57] dark:focus:border-[#D1A7CC]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#A1A1AA] block mb-1.5">Section Type</label>
                    <select
                      value={newSection.sectionType}
                      onChange={e => setNewSection({ ...newSection, sectionType: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F2EC] dark:bg-[#151413] border border-[#E3DCD3] dark:border-white/[0.08] text-sm text-[#282521] dark:text-[#EDE8E1] outline-none focus:border-[#5B3E57] dark:focus:border-[#D1A7CC]"
                    >
                      {SECTION_TYPES.map(t => (
                        <option key={t.value} value={t.value} className="bg-[#F5F2EC] dark:bg-[#151413]">
                          {t.label} ({t.value})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button variant="secondary" size="sm" type="button" onClick={() => setIsCreating(false)}>
                      Cancel
                    </Button>
                    <Button variant="primary" size="sm" type="submit">
                      Create Section
                    </Button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Modal: Edit Section */}
        <AnimatePresence>
          {editingSection && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-lg bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-white/[0.08] rounded-2xl p-6 space-y-5"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-[#282521] dark:text-[#EDE8E1]">Edit Section: {editingSection.title}</h3>
                  <button onClick={() => setEditingSection(null)} className="text-[#756E64] dark:text-[#7A7368] hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <form onSubmit={handleEditSubmit} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-[#A1A1AA] block mb-1.5">Section Title</label>
                    <input
                      type="text"
                      required
                      value={editingSection.title || ''}
                      onChange={e => setEditingSection({ ...editingSection, title: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F2EC] dark:bg-[#151413] border border-[#E3DCD3] dark:border-white/[0.08] text-sm text-[#282521] dark:text-[#EDE8E1] outline-none focus:border-[#5B3E57] dark:focus:border-[#D1A7CC]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#A1A1AA] block mb-1.5">Section Type</label>
                    <select
                      value={editingSection.sectionType}
                      onChange={e => setEditingSection({ ...editingSection, sectionType: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F2EC] dark:bg-[#151413] border border-[#E3DCD3] dark:border-white/[0.08] text-sm text-[#282521] dark:text-[#EDE8E1] outline-none focus:border-[#5B3E57] dark:focus:border-[#D1A7CC]"
                    >
                      {SECTION_TYPES.map(t => (
                        <option key={t.value} value={t.value} className="bg-[#F5F2EC] dark:bg-[#151413]">
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#A1A1AA] block mb-1.5">Custom Content (JSON)</label>
                    <textarea
                      rows={5}
                      value={editingSection.contentJson || '{}'}
                      onChange={e => setEditingSection({ ...editingSection, contentJson: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F2EC] dark:bg-[#151413] border border-[#E3DCD3] dark:border-white/[0.08] text-xs font-mono text-[#282521] dark:text-[#EDE8E1] outline-none focus:border-[#5B3E57] dark:focus:border-[#D1A7CC]"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button variant="secondary" size="sm" type="button" onClick={() => setEditingSection(null)}>
                      Cancel
                    </Button>
                    <Button variant="primary" size="sm" type="submit">
                      Save Changes
                    </Button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

