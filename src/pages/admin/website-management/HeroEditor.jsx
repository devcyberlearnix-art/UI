// src/pages/admin/website-management/HeroEditor.jsx
// Hero Section Editor — edit all hero content fields

import React, { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Layout,
  Save,
  Zap,
  Eye,
  EyeOff,
  Upload,
  X,
  ChevronLeft,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Image as ImageIcon,
  Type,
  MousePointer2,
  Search as SearchIcon,
  Palette,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { cmsAdminApi } from '../../../api/cmsApi';
import Button from '../../../design-system/primitives/Button';
import Badge from '../../../design-system/primitives/Badge';

const EASING = [0.16, 1, 0.3, 1];

// ── Default hero content (current hardcoded values as fallbacks) ─────────
const DEFAULT_HERO = {
  badge: {
    text: 'ENGINEERING LEARNING PLATFORM',
    isVisible: true,
  },
  verificationLabel: {
    text: 'Production Standards',
    isVisible: true,
  },
  heading: {
    text: 'Build Production-Ready Engineering Skills.',
    emphasisText: 'Production-Ready',
  },
  description: {
    text: 'Master backend engineering, distributed systems, cloud architecture, and application security through practical projects and real-world engineering workflows.',
    isVisible: true,
  },
  primaryCta: {
    label: 'Explore Courses',
    destination: '/courses',
    isVisible: true,
  },
  secondaryCta: {
    label: 'Get Started',
    destination: '/register',
    isVisible: true,
  },
  search: {
    placeholder: 'Search courses by topic, distributed architecture, or instructor...',
    isVisible: true,
  },
  stats: {
    isVisible: true,
  },
  appearance: {
    textAlignment: 'center',
    backgroundImageUrl: '',
    backgroundPosition: 'center',
  },
};

// ── Form field components ──────────────────────────────────────────────────

const FieldGroup = ({ title, icon: Icon, children }) => (
  <div className="p-5 rounded-2xl bg-[#0F0F13] border border-white/[0.04] space-y-4">
    <div className="flex items-center gap-2 pb-3 border-b border-white/[0.04]">
      {Icon && <Icon className="w-4 h-4 text-[#C5A880]" />}
      <h3 className="text-sm font-bold text-[#F5F5F7] tracking-tight">{title}</h3>
    </div>
    {children}
  </div>
);

const TextField = ({ label, value, onChange, placeholder, maxLength, multiline, hint }) => (
  <div>
    <div className="flex items-center justify-between mb-1.5">
      <label className="text-xs font-semibold text-[#A1A1AA]">{label}</label>
      {maxLength && (
        <span className={`text-[10px] font-mono ${value?.length > maxLength * 0.9 ? 'text-amber-400' : 'text-[#52525B]'}`}>
          {value?.length || 0}/{maxLength}
        </span>
      )}
    </div>
    {multiline ? (
      <textarea
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        rows={3}
        className="lms-input resize-none text-sm"
      />
    ) : (
      <input
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className="lms-input text-sm"
      />
    )}
    {hint && <p className="text-[10px] text-[#52525B] mt-1">{hint}</p>}
  </div>
);

const UrlField = ({ label, value, onChange, placeholder, hint }) => (
  <div>
    <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">{label}</label>
    <input
      type="text"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder || 'https:// or /internal-path'}
      className="lms-input text-sm font-mono"
    />
    {hint && <p className="text-[10px] text-[#52525B] mt-1">{hint}</p>}
  </div>
);

const VisibilityToggle = ({ label, checked, onChange }) => (
  <label className="flex items-center gap-3 cursor-pointer group select-none">
    <div
      onClick={() => onChange(!checked)}
      className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${checked ? 'bg-[#C5A880]' : 'bg-[#1B1B24] border border-white/[0.08]'
        }`}
    >
      <div
        className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0.5'
          }`}
      />
    </div>
    <span className="text-xs font-semibold text-[#A1A1AA] group-hover:text-[#F5F5F7] transition-colors">
      {label}
    </span>
    {checked ? (
      <Eye className="w-3.5 h-3.5 text-emerald-400" />
    ) : (
      <EyeOff className="w-3.5 h-3.5 text-[#52525B]" />
    )}
  </label>
);

// ── Main Editor ────────────────────────────────────────────────────────────

const HeroEditor = () => {
  const navigate = useNavigate();
  const [hero, setHero] = useState(DEFAULT_HERO);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const fileInputRef = useRef(null);

  // ── Field update helpers ───────────────────────────────────────────────

  const update = useCallback((path, value) => {
    setHero((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      const keys = path.split('.');
      let obj = next;
      for (let i = 0; i < keys.length - 1; i++) {
        obj = obj[keys[i]];
      }
      obj[keys[keys.length - 1]] = value;
      return next;
    });
    setIsDirty(true);
    setSaveSuccess(false);
  }, []);

  // ── Image upload ───────────────────────────────────────────────────────

  const handleImageUpload = useCallback(async (file) => {
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a JPG, PNG, WebP, or AVIF image.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be smaller than 5MB.');
      return;
    }

    setIsUploadingImage(true);
    try {
      const result = await cmsAdminApi.uploadHeroImage(file, 'background');
      const url = result?.data?.url || result?.url;
      if (url) {
        update('appearance.backgroundImageUrl', url);
        toast.success('Image uploaded successfully.');
      } else {
        toast.error('Upload failed — no URL returned from server.');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Image upload failed. Please try again.');
    } finally {
      setIsUploadingImage(false);
    }
  }, [update]);

  // ── Save draft ─────────────────────────────────────────────────────────

  const handleSave = useCallback(async () => {
    // Validate required fields
    if (!hero.heading?.text?.trim()) {
      toast.error('Hero heading is required.');
      return;
    }
    if (!hero.primaryCta?.label?.trim()) {
      toast.error('Primary CTA label is required.');
      return;
    }

    setIsSaving(true);
    try {
      await cmsAdminApi.updateHero(hero);
      setIsDirty(false);
      setSaveSuccess(true);
      toast.success('Hero section saved as draft. Publish to make it live.');
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save hero section.');
    } finally {
      setIsSaving(false);
    }
  }, [hero]);

  return (
    <div className="min-h-screen bg-[#070709] text-[#F5F5F7] p-6 lg:p-8">
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
            className="p-2 rounded-xl text-[#71717A] hover:text-[#F5F5F7] hover:bg-white/[0.04] transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#C5A880]/10 border border-[#C5A880]/20 flex items-center justify-center">
              <Layout className="w-4 h-4 text-[#C5A880]" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-[#F5F5F7]">Hero Section</h1>
              <p className="text-xs text-[#71717A]">Edit the landing page hero content and appearance</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {isDirty && (
              <Badge variant="amber" dot>Unsaved changes</Badge>
            )}
            {saveSuccess && (
              <Badge variant="emerald" dot>Saved</Badge>
            )}
            <Button
              variant="primary"
              size="sm"
              leftIcon={isSaving ? Loader2 : (saveSuccess ? CheckCircle2 : Save)}
              isLoading={isSaving}
              onClick={handleSave}
              disabled={!isDirty && !saveSuccess}
            >
              Save Draft
            </Button>
          </div>
        </motion.div>

        {/* ── NOTE ABOUT BACKEND ───────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.35, delay: 0.05, ease: EASING }}
          className="flex items-start gap-2.5 p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs text-amber-200/80"
        >
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <span>
            <strong className="text-amber-300">Backend required:</strong> Changes are saved to the CMS API.
            Current values show hardcoded defaults — they'll be replaced with live data once the backend is implemented.
          </span>
        </motion.div>

        {/* ── CONTENT GROUP ────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.08, ease: EASING }}
        >
          <FieldGroup title="Hero Content" icon={Type}>
            <TextField
              label="Badge Text"
              value={hero.badge.text}
              onChange={(v) => update('badge.text', v)}
              placeholder="e.g. Architecture Curriculum"
              maxLength={80}
              hint="Displayed in the small pill above the main heading"
            />
            <VisibilityToggle
              label="Show badge"
              checked={hero.badge.isVisible}
              onChange={(v) => update('badge.isVisible', v)}
            />

            <div className="pt-2 border-t border-white/[0.04]" />

            <TextField
              label="Verification Label"
              value={hero.verificationLabel.text}
              onChange={(v) => update('verificationLabel.text', v)}
              placeholder="e.g. Verified Production Track"
              maxLength={80}
            />
            <VisibilityToggle
              label="Show verification label"
              checked={hero.verificationLabel.isVisible}
              onChange={(v) => update('verificationLabel.isVisible', v)}
            />

            <div className="pt-2 border-t border-white/[0.04]" />

            <TextField
              label="Main Heading *"
              value={hero.heading.text}
              onChange={(v) => update('heading.text', v)}
              placeholder="e.g. Master Engineering On Real Architecture."
              maxLength={200}
              hint="The large H1 heading displayed prominently in the hero"
            />
            <TextField
              label="Heading Emphasis (underlined portion)"
              value={hero.heading.emphasisText}
              onChange={(v) => update('heading.emphasisText', v)}
              placeholder="e.g. On Real Architecture."
              maxLength={100}
              hint="This portion of the heading receives the gold underline treatment"
            />

            <div className="pt-2 border-t border-white/[0.04]" />

            <TextField
              label="Description"
              value={hero.description.text}
              onChange={(v) => update('description.text', v)}
              placeholder="Write a compelling description of the platform..."
              maxLength={600}
              multiline
            />
            <VisibilityToggle
              label="Show description"
              checked={hero.description.isVisible}
              onChange={(v) => update('description.isVisible', v)}
            />
          </FieldGroup>
        </motion.div>

        {/* ── PRIMARY CTA GROUP ────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.12, ease: EASING }}
        >
          <FieldGroup title="Primary Action" icon={MousePointer2}>
            <TextField
              label="Button Label *"
              value={hero.primaryCta.label}
              onChange={(v) => update('primaryCta.label', v)}
              placeholder="e.g. Get Started"
              maxLength={80}
            />
            <UrlField
              label="Destination URL"
              value={hero.primaryCta.destination}
              onChange={(v) => update('primaryCta.destination', v)}
              hint="Use /register for the registration page, or a full URL for external links"
            />
            <VisibilityToggle
              label="Show primary button"
              checked={hero.primaryCta.isVisible}
              onChange={(v) => update('primaryCta.isVisible', v)}
            />
          </FieldGroup>
        </motion.div>

        {/* ── SECONDARY CTA GROUP ──────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.14, ease: EASING }}
        >
          <FieldGroup title="Secondary Action" icon={MousePointer2}>
            <TextField
              label="Button Label"
              value={hero.secondaryCta.label}
              onChange={(v) => update('secondaryCta.label', v)}
              placeholder="e.g. Sign In"
              maxLength={80}
            />
            <UrlField
              label="Destination URL"
              value={hero.secondaryCta.destination}
              onChange={(v) => update('secondaryCta.destination', v)}
              hint="Use /login for the sign-in page"
            />
            <VisibilityToggle
              label="Show secondary button"
              checked={hero.secondaryCta.isVisible}
              onChange={(v) => update('secondaryCta.isVisible', v)}
            />
          </FieldGroup>
        </motion.div>

        {/* ── SEARCH GROUP ─────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.16, ease: EASING }}
        >
          <FieldGroup title="Search Bar" icon={SearchIcon}>
            <TextField
              label="Placeholder Text"
              value={hero.search.placeholder}
              onChange={(v) => update('search.placeholder', v)}
              placeholder="Search tracks by topic..."
              maxLength={120}
            />
            <VisibilityToggle
              label="Show search bar"
              checked={hero.search.isVisible}
              onChange={(v) => update('search.isVisible', v)}
            />
          </FieldGroup>
        </motion.div>

        {/* ── APPEARANCE GROUP ─────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.18, ease: EASING }}
        >
          <FieldGroup title="Appearance" icon={Palette}>
            <div>
              <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">
                Text Alignment
              </label>
              <div className="flex items-center gap-1.5 bg-[#14141A] p-1 rounded-xl border border-white/[0.04] w-fit">
                {['left', 'center', 'right'].map((align) => (
                  <button
                    key={align}
                    type="button"
                    onClick={() => update('appearance.textAlignment', align)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${hero.appearance.textAlignment === align
                      ? 'bg-[#C5A880] text-[#070709]'
                      : 'text-[#71717A] hover:text-[#F5F5F7]'
                      }`}
                  >
                    {align}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">
                Background Image
              </label>
              {hero.appearance.backgroundImageUrl ? (
                <div className="relative rounded-xl overflow-hidden border border-white/[0.06] h-32">
                  <img
                    src={hero.appearance.backgroundImageUrl}
                    alt="Hero background"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => update('appearance.backgroundImageUrl', '')}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white hover:bg-red-500/80 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingImage}
                  className="w-full flex flex-col items-center justify-center gap-2 h-24 rounded-xl border-2 border-dashed border-white/[0.08] hover:border-[#C5A880]/40 transition-colors text-[#71717A] hover:text-[#C5A880] disabled:opacity-50"
                >
                  {isUploadingImage ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Upload className="w-5 h-5" />
                  )}
                  <span className="text-xs font-semibold">
                    {isUploadingImage ? 'Uploading...' : 'Upload background image'}
                  </span>
                  <span className="text-[10px]">JPG, PNG, WebP — Max 5MB</span>
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                className="hidden"
                onChange={(e) => handleImageUpload(e.target.files?.[0])}
              />
            </div>

            <VisibilityToggle
              label="Show platform statistics bar"
              checked={hero.stats.isVisible}
              onChange={(v) => update('stats.isVisible', v)}
            />
          </FieldGroup>
        </motion.div>

        {/* ── BOTTOM SAVE BAR ──────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.2, ease: EASING }}
          className="flex items-center justify-between p-4 rounded-2xl bg-[#0F0F13] border border-white/[0.04] sticky bottom-4"
        >
          <div className="text-xs text-[#71717A]">
            {isDirty ? (
              <span className="flex items-center gap-1.5 text-amber-400">
                <AlertCircle className="w-3.5 h-3.5" />
                Unsaved changes — save as draft before publishing
              </span>
            ) : saveSuccess ? (
              <span className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Draft saved — go to CMS Overview to publish
              </span>
            ) : (
              <span>All changes auto-validated on save</span>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/admin/website-management')}
            >
              Back to Overview
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={Save}
              isLoading={isSaving}
              onClick={handleSave}
              disabled={!isDirty}
            >
              Save Draft
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HeroEditor;
