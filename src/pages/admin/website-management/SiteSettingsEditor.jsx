// src/pages/admin/website-management/SiteSettingsEditor.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sliders, Save, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import { cmsAdminApi } from '../../../api/cmsApi';
import Button from '../../../design-system/primitives/Button';

export default function SiteSettingsEditor() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    'brand.name': 'FD_LMS',
    'brand.tagline': 'Architecture',
    'brand.logoUrl': '',
    'brand.accentColor': '#5B3E57',
    'contact.email': 'lead@cyberlearnix.io',
    'contact.supportPhone': '+1 (800) 412-ARCH',
    'social.github': 'https://github.com/cyberlearnix',
    'social.linkedin': 'https://linkedin.com/company/cyberlearnix',
    'social.discord': 'https://discord.gg/cyberlearnix',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await cmsAdminApi.getSiteSettings();
        const data = res?.data || res;
        if (data && typeof data === 'object') {
          setSettings(prev => ({ ...prev, ...data }));
        }
      } catch {
        toast.error('Could not load site settings');
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const handleChange = (key, val) => {
    setSettings(prev => ({ ...prev, [key]: val }));
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const res = await cmsAdminApi.uploadMedia(file, 'Platform Logo');
      const asset = res?.data || res;
      if (asset?.fileUrl) {
        handleChange('brand.logoUrl', asset.fileUrl);
        toast.success('Logo uploaded and linked');
      }
    } catch {
      toast.error('Failed to upload logo');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await cmsAdminApi.updateSiteSettings(settings);
      toast.success('Site settings and branding saved successfully');
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F2EC] dark:bg-[#151413] text-[#282521] dark:text-[#EDE8E1] p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-[#E3DCD3] dark:border-[#E3DCD3] dark:border-white/[0.06]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/admin/website-management')}
              className="p-2 rounded-xl bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-white/[0.06] hover:border-[#5B3E57]/40 dark:hover:border-[#D1A7CC]/40 text-[#A1A1AA] hover:text-white"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-[#282521] dark:text-[#EDE8E1] flex items-center gap-2">
                <Sliders className="w-5 h-5 text-[#5B3E57] dark:text-[#D1A7CC]" />
                Site Branding & Settings
              </h1>
              <p className="text-xs text-[#756E64] dark:text-[#7A7368] mt-0.5">
                Brand signature, logo asset, contact details, and social channels
              </p>
            </div>
          </div>
          <Button variant="primary" size="sm" onClick={handleSave} disabled={isSaving} leftIcon={Save}>
            {isSaving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>

        {/* Branding Group */}
        <div className="p-6 rounded-2xl bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-[#E3DCD3] dark:border-white/[0.06] space-y-4">
          <h2 className="text-sm font-bold text-[#282521] dark:text-[#EDE8E1]">Brand Identity</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-[#A1A1AA] block mb-1.5">Brand Name</label>
              <input
                type="text"
                value={settings['brand.name'] || ''}
                onChange={e => handleChange('brand.name', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F2EC] dark:bg-[#151413] border border-[#E3DCD3] dark:border-white/[0.08] text-sm text-[#282521] dark:text-[#EDE8E1] outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#A1A1AA] block mb-1.5">Tagline / Sub-label</label>
              <input
                type="text"
                value={settings['brand.tagline'] || ''}
                onChange={e => handleChange('brand.tagline', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F2EC] dark:bg-[#151413] border border-[#E3DCD3] dark:border-white/[0.08] text-sm text-[#282521] dark:text-[#EDE8E1] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#A1A1AA] block mb-1.5">Logo URL or Upload</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="https://... or upload local image"
                value={settings['brand.logoUrl'] || ''}
                onChange={e => handleChange('brand.logoUrl', e.target.value)}
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#F5F2EC] dark:bg-[#151413] border border-[#E3DCD3] dark:border-white/[0.08] text-sm text-[#282521] dark:text-[#EDE8E1] outline-none"
              />
              <label className="px-4 py-2.5 rounded-xl bg-[#F5F2EC] dark:bg-[#151413] border border-[#E3DCD3] dark:border-white/[0.08] hover:border-[#5B3E57]/40 dark:hover:border-[#D1A7CC]/40 text-xs font-semibold text-[#282521] dark:text-[#EDE8E1] flex items-center gap-1.5 cursor-pointer">
                <Upload className="w-3.5 h-3.5 text-[#5B3E57] dark:text-[#D1A7CC]" />
                {isUploading ? 'Uploading...' : 'Upload'}
                <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
              </label>
            </div>
          </div>
        </div>

        {/* Contact Group */}
        <div className="p-6 rounded-2xl bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-[#E3DCD3] dark:border-white/[0.06] space-y-4">
          <h2 className="text-sm font-bold text-[#282521] dark:text-[#EDE8E1]">Contact & Channel Information</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-[#A1A1AA] block mb-1.5">Support Email</label>
              <input
                type="email"
                value={settings['contact.email'] || ''}
                onChange={e => handleChange('contact.email', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F2EC] dark:bg-[#151413] border border-[#E3DCD3] dark:border-white/[0.08] text-sm text-[#282521] dark:text-[#EDE8E1] outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#A1A1AA] block mb-1.5">Support Phone</label>
              <input
                type="text"
                value={settings['contact.supportPhone'] || ''}
                onChange={e => handleChange('contact.supportPhone', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F2EC] dark:bg-[#151413] border border-[#E3DCD3] dark:border-white/[0.08] text-sm text-[#282521] dark:text-[#EDE8E1] outline-none"
              />
            </div>
          </div>
        </div>

        {/* Social Links Group */}
        <div className="p-6 rounded-2xl bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-[#E3DCD3] dark:border-white/[0.06] space-y-4">
          <h2 className="text-sm font-bold text-[#282521] dark:text-[#EDE8E1]">Community & Social Channels</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-[#A1A1AA] block mb-1.5">GitHub URL</label>
              <input
                type="url"
                value={settings['social.github'] || ''}
                onChange={e => handleChange('social.github', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#F5F2EC] dark:bg-[#151413] border border-[#E3DCD3] dark:border-white/[0.08] text-xs text-[#282521] dark:text-[#EDE8E1] outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#A1A1AA] block mb-1.5">LinkedIn URL</label>
              <input
                type="url"
                value={settings['social.linkedin'] || ''}
                onChange={e => handleChange('social.linkedin', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#F5F2EC] dark:bg-[#151413] border border-[#E3DCD3] dark:border-white/[0.08] text-xs text-[#282521] dark:text-[#EDE8E1] outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#A1A1AA] block mb-1.5">Discord Community</label>
              <input
                type="url"
                value={settings['social.discord'] || ''}
                onChange={e => handleChange('social.discord', e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#F5F2EC] dark:bg-[#151413] border border-[#E3DCD3] dark:border-white/[0.08] text-xs text-[#282521] dark:text-[#EDE8E1] outline-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

