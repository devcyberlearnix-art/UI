// src/pages/admin/website-management/NavigationEditor.jsx
// Navigation Manager — CRUD for header nav items with reordering

import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Navigation,
  ChevronLeft,
  Plus,
  Edit2,
  Trash2,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Save,
  X,
  AlertCircle,
  ExternalLink,
  Link as LinkIcon,
  Check,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { cmsAdminApi } from '../../../api/cmsApi';
import Button from '../../../design-system/primitives/Button';
import Badge from '../../../design-system/primitives/Badge';

const EASING = [0.16, 1, 0.3, 1];

// ── Default navigation (current hardcoded values) ──────────────────────────
const DEFAULT_NAV_ITEMS = [
  { id: 1, label: 'Explore Courses', destination: '/courses', itemType: 'LINK', displayOrder: 0, isVisible: true, openInNewTab: false },
  { id: 2, label: 'Certifications', destination: '/certifications', itemType: 'LINK', displayOrder: 1, isVisible: true, openInNewTab: false },
  { id: 3, label: 'For Instructors', destination: '/instructor/apply', itemType: 'LINK', displayOrder: 2, isVisible: true, openInNewTab: false },
];

const ITEM_TYPES = [
  { value: 'LINK', label: 'Navigation Link' },
  { value: 'BUTTON_PRIMARY', label: 'Primary Button' },
  { value: 'BUTTON_SECONDARY', label: 'Secondary Button' },
];

// ── Item type badge ────────────────────────────────────────────────────────
const ItemTypeBadge = ({ type }) => {
  if (type === 'BUTTON_PRIMARY') return <Badge variant="gold">Primary Button</Badge>;
  if (type === 'BUTTON_SECONDARY') return <Badge variant="mercury">Secondary Button</Badge>;
  return <Badge variant="default">Link</Badge>;
};

// ── Nav Item Row ───────────────────────────────────────────────────────────
const NavItemRow = ({ item, index, total, onEdit, onDelete, onMove, onToggleVisibility }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 6 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -6, scale: 0.98 }}
    transition={{ duration: 0.2 }}
    className={`flex items-center gap-3 p-3.5 rounded-xl border transition-colors ${item.isVisible
      ? 'bg-[#FFFEFA] dark:bg-[#1D1C1A] border-[#E3DCD3] dark:border-[#E3DCD3] dark:border-white/[0.06] hover:border-[#E3DCD3] dark:border-white/[0.08]'
      : 'bg-[#FFFEFA] dark:bg-[#1D1C1A]/50 border-white/[0.02] opacity-60'
      }`}
  >
    {/* Order controls */}
    <div className="flex flex-col gap-0.5">
      <button
        type="button"
        onClick={() => onMove(index, 'up')}
        disabled={index === 0}
        className="p-1 rounded text-[#52525B] hover:text-[#282521] dark:text-[#EDE8E1] hover:bg-white/[0.04] disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
      >
        <ArrowUp className="w-3 h-3" />
      </button>
      <button
        type="button"
        onClick={() => onMove(index, 'down')}
        disabled={index === total - 1}
        className="p-1 rounded text-[#52525B] hover:text-[#282521] dark:text-[#EDE8E1] hover:bg-white/[0.04] disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
      >
        <ArrowDown className="w-3 h-3" />
      </button>
    </div>

    {/* Icon */}
    <div className="w-7 h-7 rounded-lg bg-[#F5F2EC] dark:bg-[#151413] border border-[#E3DCD3] dark:border-[#E3DCD3] dark:border-white/[0.06] flex items-center justify-center text-[#756E64] dark:text-[#7A7368] shrink-0">
      {item.openInNewTab ? <ExternalLink className="w-3.5 h-3.5" /> : <LinkIcon className="w-3.5 h-3.5" />}
    </div>

    {/* Content */}
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm font-semibold text-[#282521] dark:text-[#EDE8E1] truncate">{item.label}</span>
        <ItemTypeBadge type={item.itemType} />
        {item.openInNewTab && (
          <Badge variant="default">New Tab</Badge>
        )}
      </div>
      <p className="text-xs text-[#52525B] font-mono truncate mt-0.5">{item.destination}</p>
    </div>

    {/* Actions */}
    <div className="flex items-center gap-1 shrink-0">
      <button
        type="button"
        onClick={() => onToggleVisibility(item)}
        title={item.isVisible ? 'Hide from navigation' : 'Show in navigation'}
        className={`p-1.5 rounded-lg transition-colors ${item.isVisible
          ? 'text-emerald-400 hover:bg-emerald-500/10'
          : 'text-[#52525B] hover:bg-white/[0.04]'
          }`}
      >
        {item.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
      </button>
      <button
        type="button"
        onClick={() => onEdit(item)}
        className="p-1.5 rounded-lg text-[#A1A1AA] hover:text-[#282521] dark:text-[#EDE8E1] hover:bg-white/[0.04] transition-colors"
      >
        <Edit2 className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => onDelete(item)}
        className="p-1.5 rounded-lg text-[#756E64] dark:text-[#7A7368] hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  </motion.div>
);

// ── Item Form Modal ────────────────────────────────────────────────────────
const ItemFormModal = ({ item, onSave, onClose, isSaving }) => {
  const [form, setForm] = useState(
    item || {
      label: '',
      destination: '',
      itemType: 'LINK',
      isVisible: true,
      openInNewTab: false,
    }
  );

  const isEdit = Boolean(item?.id);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.label.trim()) { toast.error('Label is required.'); return; }
    if (!form.destination.trim()) { toast.error('Destination URL is required.'); return; }
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        className="w-full max-w-md bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-white/[0.08] rounded-2xl p-6 shadow-[0_24px_64px_rgba(0,0,0,0.9)]"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-[#282521] dark:text-[#EDE8E1]">
            {isEdit ? 'Edit Navigation Item' : 'Add Navigation Item'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#756E64] dark:text-[#7A7368] hover:text-[#282521] dark:text-[#EDE8E1] hover:bg-white/[0.04] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">Label *</label>
            <input
              type="text"
              value={form.label}
              onChange={(e) => handleChange('label', e.target.value)}
              placeholder="e.g. Explore"
              maxLength={100}
              className="lms-input text-sm"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">Destination URL *</label>
            <input
              type="text"
              value={form.destination}
              onChange={(e) => handleChange('destination', e.target.value)}
              placeholder="/courses or https://example.com"
              className="lms-input text-sm font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">Item Type</label>
            <select
              value={form.itemType}
              onChange={(e) => handleChange('itemType', e.target.value)}
              className="lms-input text-sm"
            >
              {ITEM_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-3 pt-1">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <div
                onClick={() => handleChange('isVisible', !form.isVisible)}
                className={`relative w-9 h-5 rounded-full transition-colors ${form.isVisible ? 'bg-[#5B3E57] dark:bg-[#D1A7CC]' : 'bg-[#EAE5DC] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-white/[0.08]'
                  }`}
              >
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${form.isVisible ? 'translate-x-4' : 'translate-x-0.5'
                  }`} />
              </div>
              <span className="text-xs font-semibold text-[#A1A1AA]">Visible in navigation</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer select-none">
              <div
                onClick={() => handleChange('openInNewTab', !form.openInNewTab)}
                className={`relative w-9 h-5 rounded-full transition-colors ${form.openInNewTab ? 'bg-[#5B3E57] dark:bg-[#D1A7CC]' : 'bg-[#EAE5DC] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-white/[0.08]'
                  }`}
              >
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${form.openInNewTab ? 'translate-x-4' : 'translate-x-0.5'
                  }`} />
              </div>
              <span className="text-xs font-semibold text-[#A1A1AA]">Open in new tab</span>
            </label>
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="secondary" size="md" className="flex-1" onClick={onClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button variant="primary" size="md" className="flex-1" type="submit" isLoading={isSaving} leftIcon={isEdit ? Save : Plus}>
              {isEdit ? 'Save Changes' : 'Add Item'}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// ── Confirm Delete Modal ───────────────────────────────────────────────────
const DeleteConfirmModal = ({ item, onConfirm, onClose, isDeleting }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-sm bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-white/[0.08] rounded-2xl p-6 shadow-2xl"
    >
      <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-4">
        <Trash2 className="w-5 h-5 text-rose-400" />
      </div>
      <h3 className="text-base font-bold text-[#282521] dark:text-[#EDE8E1] mb-1">Remove Navigation Item</h3>
      <p className="text-sm text-[#A1A1AA] mb-5">
        Remove <strong className="text-[#282521] dark:text-[#EDE8E1]">"{item?.label}"</strong> from the navigation?
        This will take effect after you publish.
      </p>
      <div className="flex gap-2">
        <Button variant="secondary" size="md" className="flex-1" onClick={onClose} disabled={isDeleting}>
          Cancel
        </Button>
        <Button variant="danger" size="md" className="flex-1" isLoading={isDeleting} onClick={onConfirm} leftIcon={Trash2}>
          Remove
        </Button>
      </div>
    </motion.div>
  </div>
);

// ── Main Editor ────────────────────────────────────────────────────────────
const NavigationEditor = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState(DEFAULT_NAV_ITEMS);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [deletingItem, setDeletingItem] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formSaving, setFormSaving] = useState(false);

  const handleMove = useCallback((index, direction) => {
    setItems((prev) => {
      const next = [...prev];
      const targetIdx = direction === 'up' ? index - 1 : index + 1;
      if (targetIdx < 0 || targetIdx >= next.length) return prev;
      [next[index], next[targetIdx]] = [next[targetIdx], next[index]];
      return next.map((item, i) => ({ ...item, displayOrder: i }));
    });
    setIsDirty(true);
  }, []);

  const handleToggleVisibility = useCallback((item) => {
    setItems((prev) =>
      prev.map((i) => i.id === item.id ? { ...i, isVisible: !i.isVisible } : i)
    );
    setIsDirty(true);
  }, []);

  const handleSaveItem = useCallback(async (formData) => {
    setFormSaving(true);
    try {
      if (editingItem?.id) {
        // Optimistic update
        setItems((prev) =>
          prev.map((i) => i.id === editingItem.id ? { ...i, ...formData } : i)
        );
        await cmsAdminApi.updateNavItem(editingItem.id, formData);
        toast.success('Navigation item updated.');
      } else {
        // Create new item
        const newItem = {
          ...formData,
          id: Date.now(), // temp id until backend returns real one
          displayOrder: items.length,
        };
        setItems((prev) => [...prev, newItem]);
        await cmsAdminApi.createNavItem(formData);
        toast.success('Navigation item added.');
      }
      setIsDirty(true);
      setShowForm(false);
      setEditingItem(null);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save navigation item.');
    } finally {
      setFormSaving(false);
    }
  }, [editingItem, items.length]);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deletingItem) return;
    setIsDeleting(true);
    try {
      setItems((prev) => prev.filter((i) => i.id !== deletingItem.id));
      await cmsAdminApi.deleteNavItem(deletingItem.id);
      toast.success('Navigation item removed.');
      setIsDirty(true);
      setDeletingItem(null);
    } catch (err) {
      toast.error('Failed to remove navigation item.');
    } finally {
      setIsDeleting(false);
    }
  }, [deletingItem]);

  const handleSaveOrder = useCallback(async () => {
    setIsSaving(true);
    try {
      const order = items.map((item, idx) => ({ id: item.id, displayOrder: idx }));
      await cmsAdminApi.reorderNavItems(order);
      setIsDirty(false);
      toast.success('Navigation order saved. Publish to make it live.');
    } catch (err) {
      toast.error('Failed to save navigation order.');
    } finally {
      setIsSaving(false);
    }
  }, [items]);

  return (
    <div className="min-h-screen bg-[#F5F2EC] dark:bg-[#151413] text-[#282521] dark:text-[#EDE8E1] p-6 lg:p-8">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* ── HEADER ──────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: EASING }}
          className="flex items-center gap-3"
        >
          <button
            type="button"
            onClick={() => navigate('/admin/website-management')}
            className="p-2 rounded-xl text-[#756E64] dark:text-[#7A7368] hover:text-[#282521] dark:text-[#EDE8E1] hover:bg-white/[0.04] transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#F2ECF1] dark:bg-[#D1A7CC]/15 border border-[#5B3E57]/30 dark:border-[#D1A7CC]/30 flex items-center justify-center">
              <Navigation className="w-4 h-4 text-[#5B3E57] dark:text-[#D1A7CC]" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-[#282521] dark:text-[#EDE8E1]">Header Navigation</h1>
              <p className="text-xs text-[#756E64] dark:text-[#7A7368]">Manage the public navigation bar links and order</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {isDirty && <Badge variant="amber" dot>Unsaved</Badge>}
            <Button
              variant="secondary"
              size="sm"
              leftIcon={Plus}
              onClick={() => { setEditingItem(null); setShowForm(true); }}
            >
              Add Item
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={Save}
              isLoading={isSaving}
              onClick={handleSaveOrder}
              disabled={!isDirty}
            >
              Save Order
            </Button>
          </div>
        </motion.div>

        {/* ── BACKEND NOTE ─────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.35, delay: 0.05, ease: EASING }}
          className="flex items-start gap-2.5 p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs text-amber-200/80"
        >
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>
            <strong className="text-amber-300">Backend required:</strong> Changes are saved to the CMS API.
            Current items show hardcoded defaults — live data requires backend implementation.
          </span>
        </motion.div>

        {/* ── NAVIGATION ITEMS LIST ────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.08, ease: EASING }}
          className="p-5 rounded-2xl bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-[#E3DCD3] dark:border-white/[0.06] space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#282521] dark:text-[#EDE8E1]">Navigation Items</h3>
            <span className="text-xs text-[#52525B]">{items.length} items · {items.filter(i => i.isVisible).length} visible</span>
          </div>

          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {items.map((item, index) => (
                <NavItemRow
                  key={item.id}
                  item={item}
                  index={index}
                  total={items.length}
                  onEdit={(i) => { setEditingItem(i); setShowForm(true); }}
                  onDelete={(i) => setDeletingItem(i)}
                  onMove={handleMove}
                  onToggleVisibility={handleToggleVisibility}
                />
              ))}
            </AnimatePresence>

            {items.length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Navigation className="w-8 h-8 text-[#52525B] mb-2" />
                <p className="text-sm text-[#756E64] dark:text-[#7A7368]">No navigation items yet</p>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={Plus}
                  className="mt-3"
                  onClick={() => { setEditingItem(null); setShowForm(true); }}
                >
                  Add First Item
                </Button>
              </div>
            )}
          </div>
        </motion.div>

        {/* ── TIPS ─────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.35, delay: 0.15, ease: EASING }}
          className="p-4 rounded-xl bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-[#E3DCD3] dark:border-white/[0.06] text-xs text-[#52525B] space-y-1.5"
        >
          <p className="text-[#A1A1AA] font-semibold">Navigation Tips</p>
          <p>• Use <code className="text-[#5B3E57] dark:text-[#D1A7CC]">/courses</code> for internal links, full URLs for external links.</p>
          <p>• Items marked invisible are hidden from visitors but remain in your configuration.</p>
          <p>• Changes take effect immediately after you publish from the CMS Overview.</p>
          <p>• Auth-aware buttons (Sign In / Get Started) are controlled by the frontend automatically.</p>
        </motion.div>
      </div>

      {/* ── MODALS ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {showForm && (
          <ItemFormModal
            item={editingItem}
            onSave={handleSaveItem}
            onClose={() => { setShowForm(false); setEditingItem(null); }}
            isSaving={formSaving}
          />
        )}
        {deletingItem && (
          <DeleteConfirmModal
            item={deletingItem}
            onConfirm={handleDeleteConfirm}
            onClose={() => setDeletingItem(null)}
            isDeleting={isDeleting}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default NavigationEditor;
