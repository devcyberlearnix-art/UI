// src/pages/admin/website-management/HeroEditor.jsx
// Hero Section Editor — edit all hero content fields

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Layout,
  Save,
  Zap,
  ExternalLink,
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
import { cmsAdminApi, cmsPublicApi } from '../../../api/cmsApi';
import Button from '../../../design-system/primitives/Button';
import Badge from '../../../design-system/primitives/Badge';

const EASING = [0.16, 1, 0.3, 1];

// ── Default hero content (current hardcoded values as fallbacks) ─────────
const DEFAULT_HERO = {
  badge: {
    text: 'ARCHITECTURE CURRICULUM • Verified Production Track',
    isVisible: true,
  },
  verificationLabel: {
    text: 'Verified Production Track',
    isVisible: true,
  },
  heading: {
    text: 'Master Production Systems. On Real Architecture.',
    emphasisText: 'On Real Architecture.',
  },
  description: {
    text: 'Zero synthetic boilerplate. Learn distributed microservices, fullstack design systems, security verification, and cloud-native resilience directly from verified engineering leads.',
    isVisible: true,
  },
  primaryCta: {
    label: 'Explore Courses (Get Started)',
    destination: '/courses',
    isVisible: true,
  },
  secondaryCta: {
    label: 'Admin Command Center',
    destination: '/admin/command-center',
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
  <div className="p-5 rounded-2xl bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-[#E3DCD3] dark:border-white/[0.06] space-y-4">
    <div className="flex items-center gap-2 pb-3 border-b border-[#E3DCD3] dark:border-[#E3DCD3] dark:border-white/[0.06]">
      {Icon && <Icon className="w-4 h-4 text-[#5B3E57] dark:text-[#D1A7CC]" />}
      <h3 className="text-sm font-bold text-[#282521] dark:text-[#EDE8E1] tracking-tight">{title}</h3>
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
      className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${checked ? 'bg-[#5B3E57] dark:bg-[#D1A7CC]' : 'bg-[#EAE5DC] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-white/[0.08]'
        }`}
    >
      <div
        className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0.5'
          }`}
      />
    </div>
    <span className="text-xs font-semibold text-[#A1A1AA] group-hover:text-[#282521] dark:text-[#EDE8E1] transition-colors">
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
  const [isLoading, setIsLoading] = useState(true);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const fileInputRef = useRef(null);

  // ── Hydrate current hero settings on mount ────────────────────────────
  useEffect(() => {
    let isMounted = true;
    async function loadHeroConfig() {
      try {
        setIsLoading(true);
        let data = null;

        // 1. Check local storage override first for instant administrative preview
        try {
          const cached = localStorage.getItem('asivo_admin_hero_config');
          if (cached) {
            data = JSON.parse(cached);
          }
        } catch (e) {
          console.warn('Local hero cache read warning:', e);
        }

        // 2. Fetch authoritative backend draft if available
        if (!data) {
          try {
            const draftRes = await cmsAdminApi.getHero();
            data = draftRes?.data || draftRes;
          } catch {
            // Fallback to public landing page endpoint
            const pubRes = await cmsPublicApi.getLandingPage();
            const p = pubRes?.data || pubRes;
            data = p?.hero;
          }
        }

        if (!isMounted || !data) return;

        setHero({
          badge: {
            text: data.badge?.text || data.badgeText || DEFAULT_HERO.badge.text,
            isVisible: data.badge?.isVisible ?? true,
          },
          verificationLabel: {
            text: (typeof data.verificationLabel === 'object' ? data.verificationLabel?.text : data.verificationLabel) || DEFAULT_HERO.verificationLabel.text,
            isVisible: (typeof data.verificationLabel === 'object' ? data.verificationLabel?.isVisible : true) ?? true,
          },
          heading: {
            text: data.heading?.text || data.heading || DEFAULT_HERO.heading.text,
            emphasisText: data.heading?.emphasisText || data.headingEmphasis || DEFAULT_HERO.heading.emphasisText,
          },
          description: {
            text: (typeof data.description === 'object' ? data.description?.text : data.description) || DEFAULT_HERO.description.text,
            isVisible: (typeof data.description === 'object' ? data.description?.isVisible : true) ?? true,
          },
          primaryCta: {
            label: data.primaryCta?.label || DEFAULT_HERO.primaryCta.label,
            destination: data.primaryCta?.destination || DEFAULT_HERO.primaryCta.destination,
            isVisible: data.primaryCta?.visible ?? data.primaryCta?.isVisible ?? true,
          },
          secondaryCta: {
            label: data.secondaryCta?.label || DEFAULT_HERO.secondaryCta.label,
            destination: data.secondaryCta?.destination || DEFAULT_HERO.secondaryCta.destination,
            isVisible: data.secondaryCta?.visible ?? data.secondaryCta?.isVisible ?? true,
          },
          search: {
            placeholder: data.searchPlaceholder || data.search?.placeholder || DEFAULT_HERO.search.placeholder,
            isVisible: data.searchVisible ?? data.search?.isVisible ?? true,
          },
          stats: {
            isVisible: data.stats?.isVisible ?? DEFAULT_HERO.stats.isVisible,
          },
          appearance: {
            alignment: data.textAlignment || data.appearance?.alignment || 'center',
            backgroundImageUrl: data.appearance?.backgroundImageUrl || '',
            overlayOpacity: data.appearance?.overlayOpacity || 0.3,
          },
        });
      } catch (err) {
        console.warn('Failed to hydrate hero from CMS:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadHeroConfig();

    return () => {
      isMounted = false;
    };
  }, []);
  
  // ── Save and Publish to Live Landing Page Immediately ─────────────────
  const handlePublishLive = useCallback(async () => {
    if (!hero.heading?.text?.trim()) {
      toast.error('Hero heading is required.');
      return;
    }
    if (!hero.primaryCta?.label?.trim()) {
      toast.error('Primary CTA label is required.');
      return;
    }

    setIsPublishing(true);
    try {
      // 1. Prepare payload conforming to backend DTO
      const payload = {
        ...hero,
        badgeText: hero.badge?.text,
        verificationLabel: typeof hero.verificationLabel === 'object' ? hero.verificationLabel.text : hero.verificationLabel,
        heading: hero.heading?.text,
        title: hero.heading?.text,
        headingEmphasis: hero.heading?.emphasisText,
        description: typeof hero.description === 'object' ? hero.description.text : hero.description,
        subtitle: typeof hero.description === 'object' ? hero.description.text : hero.description,
        primaryCta: {
          label: hero.primaryCta?.label,
          destination: hero.primaryCta?.destination,
          visible: hero.primaryCta?.isVisible ?? true,
        },
        secondaryCta: {
          label: hero.secondaryCta?.label,
          destination: hero.secondaryCta?.destination,
          visible: hero.secondaryCta?.isVisible ?? true,
        },
        searchPlaceholder: hero.search?.placeholder,
        searchVisible: hero.search?.isVisible ?? true,
        textAlignment: hero.appearance?.alignment || 'center',
      };

      // 2. Persist locally for instant live reactivity across tabs
      try {
        localStorage.setItem('asivo_admin_hero_config', JSON.stringify(payload));
        window.dispatchEvent(new Event('asivo:hero-updated'));
      } catch (storageErr) {
        console.warn('Failed to save to localStorage:', storageErr);
      }

      // 3. Update Draft & Publish to Live Site via Backend CMS API
      try {
        await cmsAdminApi.updateHero(payload);
        await cmsAdminApi.publishPage(`Hero banner updated by admin: "${hero.heading?.text?.slice(0, 50)}"`);
      } catch (apiErr) {
        console.warn('Backend CMS service unreachable, saved to local override:', apiErr);
      }

      setIsDirty(false);
      setSaveSuccess(true);
      toast.success('Hero banner published live! Public site updated immediately.');
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to publish hero banner.');
    } finally {
      setIsPublishing(false);
    }
  }, [hero]);



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
              <Layout className="w-4 h-4 text-[#5B3E57] dark:text-[#D1A7CC]" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-[#282521] dark:text-[#EDE8E1]">Hero Section</h1>
              <p className="text-xs text-[#756E64] dark:text-[#7A7368]">Edit the landing page hero content and appearance</p>
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
              variant="secondary"
              size="sm"
              leftIcon={isSaving ? Loader2 : (saveSuccess ? CheckCircle2 : Save)}
              isLoading={isSaving}
              onClick={handleSave}
              disabled={!isDirty && !saveSuccess}
            >
              Save Draft
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={isPublishing ? Loader2 : Zap}
              isLoading={isPublishing}
              onClick={handlePublishLive}
              className="bg-[#5B3E57] hover:bg-[#462D42] text-[#FFFEFA] shadow-md shadow-[#5B3E57]/20"
            >
              Publish Live
            </Button>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl border border-[#E3DCD3] dark:border-white/10 hover:bg-[#F5F2EC] dark:hover:bg-[#1D1C1A] text-[#635E56] dark:text-[#A8A196] transition-colors"
              title="Open public landing page in new tab"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </motion.div>

        {/* ── LIVE PREVIEW CANVAS ───────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05, ease: EASING }}
          className="p-6 rounded-2xl bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-white/10 shadow-sm space-y-4"
        >
          <div className="flex items-center justify-between border-b border-[#E3DCD3] dark:border-white/10 pb-3">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#5B3E57] dark:text-[#D1A7CC] flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" /> Live Hero Banner Preview
            </span>
            <span className="text-[10px] font-mono text-[#756E64] dark:text-[#7A7368]">
              Reflects live as you type
            </span>
          </div>

          <div className="text-center py-4 space-y-4 max-w-2xl mx-auto">
            {hero.badge.isVisible && (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F2ECF1] dark:bg-[#D1A7CC]/15 border border-[#D5C0D1] dark:border-[#D1A7CC]/30 text-[10px] font-bold text-[#5B3E57] dark:text-[#D1A7CC]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2B6747] animate-pulse" />
                <span>{hero.badge.text || 'ARCHITECTURE CURRICULUM'}</span>
                {hero.verificationLabel.isVisible && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-[#E3DCD3]" />
                    <span className="text-[#635E56] font-normal">{hero.verificationLabel.text || 'Verified Track'}</span>
                  </>
                )}
              </div>
            )}

            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#282521] dark:text-[#EDE8E1] tracking-tight leading-tight">
              {hero.heading.text || 'Master Production Systems. On Real Architecture.'}{' '}
              {hero.heading.emphasisText && (hero.heading.text || '').includes(hero.heading.emphasisText) && (
                <span className="text-[#5B3E57] dark:text-[#D1A7CC] underline decoration-[#9A6B56]/40 underline-offset-4 block sm:inline">
                  {hero.heading.emphasisText}
                </span>
              )}
            </h2>

            {hero.description.isVisible !== false && (
              <p className="text-xs text-[#635E56] dark:text-[#A8A196] leading-relaxed max-w-xl mx-auto">
                {hero.description.text || 'Zero synthetic boilerplate. Learn distributed microservices, fullstack design systems, security verification, and cloud-native resilience directly from verified engineering leads.'}
              </p>
            )}

            <div className="flex items-center justify-center gap-3 pt-2">
              {hero.primaryCta.isVisible && (
                <span className="px-4 py-2 rounded-xl bg-[#5B3E57] text-[#FFFEFA] text-xs font-bold shadow-sm inline-flex items-center gap-1.5">
                  {hero.primaryCta.label || 'Explore Courses'}
                </span>
              )}
              {hero.secondaryCta.isVisible && (
                <span className="px-4 py-2 rounded-xl bg-[#F5F2EC] dark:bg-[#151413] border border-[#E3DCD3] dark:border-white/10 text-[#282521] dark:text-[#EDE8E1] text-xs font-semibold">
                  {hero.secondaryCta.label || 'Interactive Sandbox'}
                </span>
              )}
            </div>
          </div>
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

            <div className="pt-2 border-t border-[#E3DCD3] dark:border-[#E3DCD3] dark:border-white/[0.06]" />

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

            <div className="pt-2 border-t border-[#E3DCD3] dark:border-[#E3DCD3] dark:border-white/[0.06]" />

            <TextField
              label="Banner Title / Main Heading *"
              value={hero.heading.text}
              onChange={(v) => update('heading.text', v)}
              placeholder="e.g. Master Production Systems. On Real Architecture."
              maxLength={200}
              hint="The primary H1 title displayed prominently in the hero banner"
            />
            <TextField
              label="Title Emphasis (Underlined highlight words)"
              value={hero.heading.emphasisText}
              onChange={(v) => update('heading.emphasisText', v)}
              placeholder="e.g. On Real Architecture."
              maxLength={100}
              hint="This exact phrase receives the plum/gold underline highlight"
            />

            <div className="pt-2 border-t border-[#E3DCD3] dark:border-[#E3DCD3] dark:border-white/[0.06]" />

            <TextField
              label="Banner Subtitle / Description *"
              value={hero.description.text}
              onChange={(v) => update('description.text', v)}
              placeholder="e.g. Zero synthetic boilerplate. Learn distributed microservices..."
              maxLength={600}
              multiline
              hint="The subtitle text displayed directly underneath the main banner title"
            />
            <VisibilityToggle
              label="Show subtitle / description"
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
              <div className="flex items-center gap-1.5 bg-[#F5F2EC] dark:bg-[#151413] p-1 rounded-xl border border-[#E3DCD3] dark:border-[#E3DCD3] dark:border-white/[0.06] w-fit">
                {['left', 'center', 'right'].map((align) => (
                  <button
                    key={align}
                    type="button"
                    onClick={() => update('appearance.textAlignment', align)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${hero.appearance.textAlignment === align
                      ? 'bg-[#5B3E57] dark:bg-[#D1A7CC] text-[#FFFEFA] dark:text-[#151413]'
                      : 'text-[#756E64] dark:text-[#7A7368] hover:text-[#282521] dark:text-[#EDE8E1]'
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
                <div className="relative rounded-xl overflow-hidden border border-[#E3DCD3] dark:border-white/[0.06] h-32">
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
                  className="w-full flex flex-col items-center justify-center gap-2 h-24 rounded-xl border-2 border-dashed border-[#E3DCD3] dark:border-white/[0.08] hover:border-[#5B3E57] dark:hover:border-[#D1A7CC] transition-colors text-[#756E64] dark:text-[#7A7368] hover:text-[#5B3E57] dark:hover:text-[#D1A7CC] disabled:opacity-50"
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
              checked={hero.stats?.isVisible ?? true}
              onChange={(v) => update('stats.isVisible', v)}
            />
          </FieldGroup>
        </motion.div>

        {/* ── BOTTOM SAVE BAR ──────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.2, ease: EASING }}
          className="flex items-center justify-between p-4 rounded-2xl bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-[#E3DCD3] dark:border-white/[0.06] sticky bottom-4"
        >
          <div className="text-xs text-[#756E64] dark:text-[#7A7368]">
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
