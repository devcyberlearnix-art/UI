// src/pages/admin/website-management/WebsiteManagementHub.jsx
// CMS Overview Dashboard — entry point for all landing page management

import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Layout,
  Navigation,
  AlignJustify,
  Image,
  MessageSquare,
  TrendingUp,
  Globe,
  Search,
  History,
  Sliders,
  ChevronRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Zap,
  Eye,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { cmsAdminApi } from '../../../api/cmsApi';
import Button from '../../../design-system/primitives/Button';
import Badge from '../../../design-system/primitives/Badge';

const EASING = [0.16, 1, 0.3, 1];

// Status badge for published/draft
const StatusBadge = ({ status }) => {
  if (status === 'PUBLISHED') return <Badge variant="emerald" dot>Published</Badge>;
  if (status === 'DRAFT') return <Badge variant="amber" dot>Draft</Badge>;
  return <Badge variant="default">Unknown</Badge>;
};

// Individual CMS section card
const CMSCard = ({ icon: Icon, title, description, path, status, onClick }) => (
  <motion.button
    type="button"
    onClick={onClick}
    whileHover={{ y: -2 }}
    whileTap={{ scale: 0.98 }}
    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    className="w-full text-left p-5 rounded-2xl bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-[#E3DCD3] dark:border-white/[0.06] hover:border-[#5B3E57]/40 dark:hover:border-[#D1A7CC]/40 transition-all duration-200 group"
  >
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-start gap-3 min-w-0">
        <div className="w-9 h-9 rounded-xl bg-[#F5F2EC] dark:bg-[#151413] border border-[#E3DCD3] dark:border-white/[0.06] flex items-center justify-center shrink-0 text-[#5B3E57] dark:text-[#D1A7CC] group-hover:border-[#5B3E57]/40 dark:hover:border-[#D1A7CC]/40 transition-colors">
          <Icon className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#282521] dark:text-[#EDE8E1] leading-tight">{title}</p>
          <p className="text-xs text-[#756E64] dark:text-[#7A7368] mt-0.5 leading-relaxed">{description}</p>
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-[#52525B] group-hover:text-[#5B3E57] dark:hover:text-[#D1A7CC] transition-colors shrink-0 mt-0.5" />
    </div>
    {status && (
      <div className="mt-3 pt-3 border-t border-[#E3DCD3] dark:border-[#E3DCD3] dark:border-white/[0.06]">
        <StatusBadge status={status} />
      </div>
    )}
  </motion.button>
);

const WebsiteManagementHub = () => {
  const navigate = useNavigate();
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSummary, setPublishSummary] = useState('');
  const [showPublishDialog, setShowPublishDialog] = useState(false);

  // CMS sections registry — each card navigates to its editor
  const cmsSections = [
    {
      icon: Layout,
      title: 'Hero Section',
      description: 'Badge, heading, description, CTAs, search bar, and hero appearance',
      path: '/admin/website-management/hero',
    },
    {
      icon: Navigation,
      title: 'Header & Navigation',
      description: 'Navigation links, brand name, logo, and authentication buttons',
      path: '/admin/website-management/navigation',
    },
    {
      icon: AlignJustify,
      title: 'Page Sections',
      description: 'Manage visibility and order of all landing page sections',
      path: '/admin/website-management/sections',
    },
    {
      icon: Image,
      title: 'Banners & Media',
      description: 'Promotional banners with scheduling, targeting, and analytics',
      path: '/admin/banners',
    },
    {
      icon: MessageSquare,
      title: 'Testimonials',
      description: 'Student and instructor testimonials shown on the landing page',
      path: '/admin/website-management/testimonials',
    },
    {
      icon: TrendingUp,
      title: 'Platform Statistics',
      description: 'Configure the headline numbers shown in the hero stats bar',
      path: '/admin/website-management/statistics',
    },
    {
      icon: Globe,
      title: 'Footer',
      description: 'Footer link groups, brand description, and social media links',
      path: '/admin/website-management/footer',
    },
    {
      icon: Sliders,
      title: 'Site Settings',
      description: 'Brand name, logo URL, tagline, and global platform configuration',
      path: '/admin/website-management/settings',
    },
    {
      icon: Search,
      title: 'SEO Metadata',
      description: 'Page titles, descriptions, Open Graph tags, and robots directives',
      path: '/admin/website-management/seo',
    },
    {
      icon: History,
      title: 'Revision History',
      description: 'Browse previous published versions and restore any prior state',
      path: '/admin/website-management/revisions',
    },
  ];

  const handlePublish = useCallback(async () => {
    setIsPublishing(true);
    try {
      await cmsAdminApi.publishPage(publishSummary || 'Manual publish from CMS overview');
      toast.success('Landing page published successfully. Public site updated.');
      setShowPublishDialog(false);
      setPublishSummary('');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to publish. Check your changes and try again.';
      toast.error(msg);
    } finally {
      setIsPublishing(false);
    }
  }, [publishSummary]);

  return (
    <div className="min-h-screen bg-[#F5F2EC] dark:bg-[#151413] text-[#282521] dark:text-[#EDE8E1] p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* ── PAGE HEADER ────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASING }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-8 h-8 rounded-lg bg-[#F2ECF1] dark:bg-[#D1A7CC]/15 border border-[#5B3E57]/30 dark:border-[#D1A7CC]/30 flex items-center justify-center">
                <Globe className="w-4 h-4 text-[#5B3E57] dark:text-[#D1A7CC]" />
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight text-[#282521] dark:text-[#EDE8E1]">
                Website Management
              </h1>
            </div>
            <p className="text-sm text-[#756E64] dark:text-[#7A7368] ml-10.5">
              Control every element of the public landing page without code changes.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={Eye}
              onClick={() => window.open('/', '_blank')}
            >
              View Live Site
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={Zap}
              onClick={() => setShowPublishDialog(true)}
            >
              Publish Changes
            </Button>
          </div>
        </motion.div>

        {/* ── STATUS BAR ──────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05, ease: EASING }}
          className="p-4 rounded-2xl bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-[#E3DCD3] dark:border-white/[0.06] flex flex-wrap gap-6 items-center"
        >
          <div className="flex items-center gap-2 text-xs text-[#A1A1AA]">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Public landing page is <span className="text-emerald-400 font-semibold">Live</span></span>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#A1A1AA]">
            <Clock className="w-4 h-4 text-[#5B3E57] dark:text-[#D1A7CC]" />
            <span>Draft changes will be published atomically</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#A1A1AA]">
            <AlertCircle className="w-4 h-4 text-[#756E64] dark:text-[#7A7368]" />
            <span>Backend CMS APIs required for live data</span>
          </div>
          <div className="ml-auto">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-[#5B3E57] dark:text-[#D1A7CC] hover:text-[#D4BC98] transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Open landing page
            </a>
          </div>
        </motion.div>

        {/* ── CMS SECTION CARDS GRID ──────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: EASING }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-[#282521] dark:text-[#EDE8E1] uppercase tracking-wider">
              CMS Modules
            </h2>
            <span className="text-xs text-[#52525B]">{cmsSections.length} modules</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {cmsSections.map((section, idx) => (
              <motion.div
                key={section.path}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.12 + idx * 0.04, ease: EASING }}
              >
                <CMSCard
                  {...section}
                  onClick={() => navigate(section.path)}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ── QUICK ACTIONS ────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2, ease: EASING }}
          className="p-5 rounded-2xl bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-[#E3DCD3] dark:border-white/[0.06]"
        >
          <h3 className="text-xs font-bold text-[#A1A1AA] uppercase tracking-wider mb-4">
            Quick Actions
          </h3>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={Layout}
              onClick={() => navigate('/admin/website-management/hero')}
            >
              Edit Hero
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={Navigation}
              onClick={() => navigate('/admin/website-management/navigation')}
            >
              Edit Navigation
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={Image}
              onClick={() => navigate('/admin/banners')}
            >
              Manage Banners
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={History}
              onClick={() => navigate('/admin/website-management/revisions')}
            >
              View Revisions
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={ExternalLink}
              onClick={() => window.open('/', '_blank')}
            >
              Preview Public Site
            </Button>
          </div>
        </motion.div>
      </div>

      {/* ── PUBLISH CONFIRMATION DIALOG ──────────────────────── */}
      {showPublishDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            className="w-full max-w-md bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-white/[0.08] rounded-2xl p-6 shadow-[0_24px_64px_rgba(0,0,0,0.9)]"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#F2ECF1] dark:bg-[#D1A7CC]/15 border border-[#5B3E57]/30 dark:border-[#D1A7CC]/30 flex items-center justify-center text-[#5B3E57] dark:text-[#D1A7CC]">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#282521] dark:text-[#EDE8E1]">Publish Landing Page</h3>
                <p className="text-xs text-[#756E64] dark:text-[#7A7368]">This will update the live public website.</p>
              </div>
            </div>

            <div className="space-y-3 mb-5">
              <div className="p-3 rounded-xl bg-[#F5F2EC] dark:bg-[#151413] border border-[#E3DCD3] dark:border-[#E3DCD3] dark:border-white/[0.06] text-xs text-[#A1A1AA] space-y-1">
                <p>• All draft changes will become publicly visible</p>
                <p>• A revision snapshot will be created automatically</p>
                <p>• The CDN cache will be invalidated</p>
                <p>• This action cannot be undone (use Restore to revert)</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">
                  Change summary <span className="text-[#52525B] font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={publishSummary}
                  onChange={(e) => setPublishSummary(e.target.value)}
                  placeholder="e.g. Updated hero heading and CTA labels"
                  className="lms-input text-sm"
                  maxLength={200}
                  onKeyDown={(e) => e.key === 'Enter' && handlePublish()}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="md"
                className="flex-1"
                onClick={() => setShowPublishDialog(false)}
                disabled={isPublishing}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                className="flex-1"
                leftIcon={Zap}
                isLoading={isPublishing}
                onClick={handlePublish}
              >
                Publish Now
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default WebsiteManagementHub;
