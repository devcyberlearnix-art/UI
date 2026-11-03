// src/api/cmsApi.js
// CMS API module — Landing Page Content Management System
// Follows the same Axios patterns as adminApi.js
// Public endpoints: no JWT required
// Admin endpoints: JWT required (handled automatically by axiosInstance)

import axiosInstance from './axiosInstance';

// ============================================================
// PUBLIC ENDPOINTS — No authentication required
// These serve only PUBLISHED content
// ============================================================

export const cmsPublicApi = {
  /**
   * Fetch the complete published landing page configuration.
   * Returns all sections, hero config, navigation, footer, and stats.
   * Redis-cached on the backend (5 min TTL).
   */
  getLandingPage: async () => {
    const response = await axiosInstance.get('/api/v1/public/landing-page');
    return response.data;
  },

  /**
   * Fetch published navigation items.
   * Returns ordered nav links for the public header.
   */
  getNavigation: async () => {
    const response = await axiosInstance.get('/api/v1/public/navigation');
    return response.data;
  },

  /**
   * Fetch published site settings (brand name, logo, social links).
   */
  getSiteSettings: async () => {
    const response = await axiosInstance.get('/api/v1/public/site-settings');
    return response.data;
  },

  /**
   * Fetch published banners for a specific position.
   * @param {string} position - 'home' | 'course' | 'sidebar'
   */
  getPublicBanners: async (position = 'home') => {
    const response = await axiosInstance.get(`/api/v1/public/banners?position=${position}`);
    return response.data;
  },

  /**
   * Fetch SEO metadata for a specific page.
   * @param {string} pageKey - e.g. 'home', 'courses', 'certifications'
   */
  getSeoMetadata: async (pageKey = 'home') => {
    const response = await axiosInstance.get(`/api/v1/public/seo/${pageKey}`);
    return response.data;
  },

  /**
   * Fetch published testimonials.
   */
  getTestimonials: async () => {
    const response = await axiosInstance.get('/api/v1/public/testimonials');
    return response.data;
  },

  /**
   * Fetch admin-configured website statistics.
   */
  getWebsiteStats: async () => {
    const response = await axiosInstance.get('/api/v1/public/website-stats');
    return response.data;
  },

  /**
   * Fetch published footer configuration.
   */
  getFooter: async () => {
    const response = await axiosInstance.get('/api/v1/public/footer');
    return response.data;
  },
};

// ============================================================
// ADMIN ENDPOINTS — JWT required
// These manage draft and published CMS content
// ============================================================

export const cmsAdminApi = {

  // ── LANDING PAGE LIFECYCLE ──────────────────────────────────

  /**
   * Fetch the current admin draft configuration.
   */
  getDraft: async () => {
    const response = await axiosInstance.get('/api/v1/admin/landing-page');
    return response.data;
  },

  /**
   * Update the draft configuration (does NOT affect live site).
   * @param {Object} data - Partial or full landing page configuration
   */
  updateDraft: async (data) => {
    const response = await axiosInstance.put('/api/v1/admin/landing-page', data);
    return response.data;
  },

  /**
   * Publish the current draft to production.
   * Backend: validates, creates revision, updates published snapshot, invalidates Redis.
   * @param {string} changeSummary - Brief description of what changed
   */
  publishPage: async (changeSummary = '') => {
    const response = await axiosInstance.post('/api/v1/admin/landing-page/publish', {
      changeSummary,
    });
    return response.data;
  },

  /**
   * Unpublish the landing page (sets status to DRAFT).
   */
  unpublishPage: async () => {
    const response = await axiosInstance.post('/api/v1/admin/landing-page/unpublish');
    return response.data;
  },

  /**
   * Fetch the draft preview configuration (full config, not just published).
   */
  getPreview: async () => {
    const response = await axiosInstance.get('/api/v1/admin/landing-page/preview');
    return response.data;
  },

  // ── HERO SECTION ──────────────────────────────────────────────

  /**
   * Fetch the current hero section configuration (draft).
   */
  getHero: async () => {
    const response = await axiosInstance.get('/api/v1/admin/landing-page/hero');
    return response.data;
  },

  /**
   * Update the hero section configuration.
   * @param {Object} data - Hero config (badge, heading, CTAs, search, appearance)
   */
  updateHero: async (data) => {
    const response = await axiosInstance.put('/api/v1/admin/landing-page/hero', data);
    return response.data;
  },

  /**
   * Upload a hero background or foreground image.
   * @param {File} file - Image file
   * @param {string} imageType - 'background' | 'foreground' | 'mobile'
   */
  uploadHeroImage: async (file, imageType = 'background') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('imageType', imageType);
    const response = await axiosInstance.post('/api/v1/admin/landing-page/hero/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  /**
   * Toggle hero section visibility.
   * @param {boolean} isVisible
   */
  setHeroVisibility: async (isVisible) => {
    const response = await axiosInstance.patch('/api/v1/admin/landing-page/hero/status', {
      isVisible,
    });
    return response.data;
  },

  // ── NAVIGATION MANAGEMENT ──────────────────────────────────────

  /**
   * Fetch all navigation items for admin management.
   */
  getNavigation: async () => {
    const response = await axiosInstance.get('/api/v1/admin/navigation');
    return response.data;
  },

  /**
   * Create a new navigation item.
   * @param {Object} data - { label, destination, itemType, displayOrder, isVisible, openInNewTab, parentId? }
   */
  createNavItem: async (data) => {
    const response = await axiosInstance.post('/api/v1/admin/navigation', data);
    return response.data;
  },

  /**
   * Update an existing navigation item.
   * @param {number} id
   * @param {Object} data
   */
  updateNavItem: async (id, data) => {
    const response = await axiosInstance.put(`/api/v1/admin/navigation/${id}`, data);
    return response.data;
  },

  /**
   * Delete a navigation item.
   * @param {number} id
   */
  deleteNavItem: async (id) => {
    const response = await axiosInstance.delete(`/api/v1/admin/navigation/${id}`);
    return response.data;
  },

  /**
   * Reorder navigation items.
   * @param {Array<{id: number, displayOrder: number}>} order
   */
  reorderNavItems: async (order) => {
    const response = await axiosInstance.patch('/api/v1/admin/navigation/reorder', { order });
    return response.data;
  },

  // ── SECTION MANAGEMENT ──────────────────────────────────────────

  /**
   * Fetch all page sections for admin.
   */
  getSections: async () => {
    const response = await axiosInstance.get('/api/v1/admin/landing-page/sections');
    return response.data;
  },

  /**
   * Create a new section.
   * @param {Object} data - { sectionType, sectionTitle, content, displayOrder, isVisible }
   */
  createSection: async (data) => {
    const response = await axiosInstance.post('/api/v1/admin/landing-page/sections', data);
    return response.data;
  },

  /**
   * Update an existing section.
   * @param {number} id
   * @param {Object} data
   */
  updateSection: async (id, data) => {
    const response = await axiosInstance.put(`/api/v1/admin/landing-page/sections/${id}`, data);
    return response.data;
  },

  /**
   * Delete a section.
   * @param {number} id
   */
  deleteSection: async (id) => {
    const response = await axiosInstance.delete(`/api/v1/admin/landing-page/sections/${id}`);
    return response.data;
  },

  /**
   * Reorder sections.
   * @param {Array<{id: number, displayOrder: number}>} order
   */
  reorderSections: async (order) => {
    const response = await axiosInstance.patch('/api/v1/admin/landing-page/sections/reorder', {
      order,
    });
    return response.data;
  },

  /**
   * Toggle a section's visibility.
   * @param {number} id
   * @param {boolean} isVisible
   */
  toggleSectionVisibility: async (id, isVisible) => {
    const response = await axiosInstance.patch(
      `/api/v1/admin/landing-page/sections/${id}/visibility`,
      { isVisible }
    );
    return response.data;
  },

  // ── TESTIMONIALS ──────────────────────────────────────────────

  getTestimonials: async () => {
    const response = await axiosInstance.get('/api/v1/admin/testimonials');
    return response.data;
  },

  createTestimonial: async (data) => {
    const response = await axiosInstance.post('/api/v1/admin/testimonials', data);
    return response.data;
  },

  updateTestimonial: async (id, data) => {
    const response = await axiosInstance.put(`/api/v1/admin/testimonials/${id}`, data);
    return response.data;
  },

  deleteTestimonial: async (id) => {
    const response = await axiosInstance.delete(`/api/v1/admin/testimonials/${id}`);
    return response.data;
  },

  // ── WEBSITE STATISTICS ────────────────────────────────────────

  getStatistics: async () => {
    const response = await axiosInstance.get('/api/v1/admin/website-stats');
    return response.data;
  },

  updateStatistics: async (data) => {
    const response = await axiosInstance.put('/api/v1/admin/website-stats', data);
    return response.data;
  },

  // ── FOOTER MANAGEMENT ─────────────────────────────────────────

  getFooter: async () => {
    const response = await axiosInstance.get('/api/v1/admin/footer');
    return response.data;
  },

  updateFooter: async (data) => {
    const response = await axiosInstance.put('/api/v1/admin/footer', data);
    return response.data;
  },

  // ── SITE SETTINGS ─────────────────────────────────────────────

  getSiteSettings: async () => {
    const response = await axiosInstance.get('/api/v1/admin/site-settings');
    return response.data;
  },

  updateSiteSettings: async (data) => {
    const response = await axiosInstance.put('/api/v1/admin/site-settings', data);
    return response.data;
  },

  /**
   * Update a single site setting by key.
   * @param {string} key - e.g. 'brand.name'
   * @param {string} value
   */
  updateSetting: async (key, value) => {
    const response = await axiosInstance.patch(`/api/v1/admin/site-settings/${encodeURIComponent(key)}`, {
      value,
    });
    return response.data;
  },

  // ── SEO METADATA ──────────────────────────────────────────────

  getSeoMetadata: async () => {
    const response = await axiosInstance.get('/api/v1/admin/seo');
    return response.data;
  },

  updateSeoMetadata: async (pageKey, data) => {
    const response = await axiosInstance.put(`/api/v1/admin/seo/${pageKey}`, data);
    return response.data;
  },

  // ── MEDIA LIBRARY ─────────────────────────────────────────────

  /**
   * Upload a media asset to the CMS media library.
   * @param {File} file
   * @param {string} altText - Accessibility description
   */
  uploadMedia: async (file, altText = '') => {
    const formData = new FormData();
    formData.append('file', file);
    if (altText) formData.append('altText', altText);
    const response = await axiosInstance.post('/api/v1/admin/media/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  /**
   * List media library assets.
   * @param {number} page
   * @param {number} size
   */
  getMediaLibrary: async (page = 0, size = 20) => {
    const response = await axiosInstance.get(`/api/v1/admin/media?page=${page}&size=${size}`);
    return response.data;
  },

  deleteMedia: async (id) => {
    const response = await axiosInstance.delete(`/api/v1/admin/media/${id}`);
    return response.data;
  },

  // ── REVISION HISTORY ──────────────────────────────────────────

  /**
   * Fetch all revision records for the landing page.
   */
  getRevisions: async () => {
    const response = await axiosInstance.get('/api/v1/admin/landing-page/revisions');
    return response.data;
  },

  /**
   * Fetch a specific revision by ID.
   * @param {number} id
   */
  getRevision: async (id) => {
    const response = await axiosInstance.get(`/api/v1/admin/landing-page/revisions/${id}`);
    return response.data;
  },

  /**
   * Restore a previous revision as the new draft.
   * @param {number} id - Revision ID to restore
   */
  restoreRevision: async (id) => {
    const response = await axiosInstance.post(
      `/api/v1/admin/landing-page/revisions/${id}/restore`
    );
    return response.data;
  },
};

export default { cmsPublicApi, cmsAdminApi };

