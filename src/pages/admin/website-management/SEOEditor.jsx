// src/pages/admin/website-management/SEOEditor.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, Save, Globe } from 'lucide-react';
import toast from 'react-hot-toast';
import { cmsAdminApi } from '../../../api/cmsApi';
import Button from '../../../design-system/primitives/Button';

export default function SEOEditor() {
  const navigate = useNavigate();
  const [seo, setSeo] = useState({
    pageKey: 'home',
    title: 'FD_LMS — Master Engineering on Real Architecture',
    description: 'Learn distributed microservices, fullstack design systems, security verification, and cloud-native resilience directly from verified engineering leads.',
    keywords: 'microservices, distributed systems, spring boot, react, cloud architecture, system design',
    canonicalUrl: 'https://fd-lms.cyberlearnix.io',
    ogTitle: 'FD_LMS | Real Architecture Engineering Curriculum',
    ogDescription: 'Zero synthetic boilerplate. Learn real architecture from verified engineering leads.',
    ogImage: '',
    robotsDirective: 'index, follow',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await cmsAdminApi.getSeoMetadata('home');
        const data = res?.data || res;
        if (data && typeof data === 'object') {
          setSeo(prev => ({ ...prev, ...data }));
        }
      } catch {
        toast.error('Using default SEO metadata');
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await cmsAdminApi.updateSeoMetadata('home', seo);
      toast.success('SEO configuration saved successfully');
    } catch {
      toast.error('Failed to save SEO metadata');
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
                <Search className="w-5 h-5 text-[#5B3E57] dark:text-[#D1A7CC]" />
                SEO & Open Graph Metadata
              </h1>
              <p className="text-xs text-[#756E64] dark:text-[#7A7368] mt-0.5">
                Optimize search indexability, rich snippet cards, and social sharing previews
              </p>
            </div>
          </div>
          <Button variant="primary" size="sm" onClick={handleSave} disabled={isSaving} leftIcon={Save}>
            {isSaving ? 'Saving...' : 'Save SEO'}
          </Button>
        </div>

        {/* Standard SEO */}
        <div className="p-6 rounded-2xl bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-[#E3DCD3] dark:border-white/[0.06] space-y-4">
          <h2 className="text-sm font-bold text-[#282521] dark:text-[#EDE8E1]">Standard Search Engine Meta Tags</h2>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-[#A1A1AA] block mb-1">Page Title Tag (Title)</label>
              <input
                type="text"
                value={seo.title || ''}
                onChange={e => setSeo({ ...seo, title: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F2EC] dark:bg-[#151413] border border-[#E3DCD3] dark:border-white/[0.08] text-sm text-[#282521] dark:text-[#EDE8E1] outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#A1A1AA] block mb-1">Meta Description</label>
              <textarea
                rows={3}
                value={seo.description || ''}
                onChange={e => setSeo({ ...seo, description: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F2EC] dark:bg-[#151413] border border-[#E3DCD3] dark:border-white/[0.08] text-sm text-[#282521] dark:text-[#EDE8E1] outline-none"
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-[#A1A1AA] block mb-1">Keywords (Comma-separated)</label>
                <input
                  type="text"
                  value={seo.keywords || ''}
                  onChange={e => setSeo({ ...seo, keywords: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#F5F2EC] dark:bg-[#151413] border border-[#E3DCD3] dark:border-white/[0.08] text-xs text-[#282521] dark:text-[#EDE8E1] outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#A1A1AA] block mb-1">Canonical URL</label>
                <input
                  type="url"
                  value={seo.canonicalUrl || ''}
                  onChange={e => setSeo({ ...seo, canonicalUrl: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#F5F2EC] dark:bg-[#151413] border border-[#E3DCD3] dark:border-white/[0.08] text-xs text-[#282521] dark:text-[#EDE8E1] outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* OpenGraph Preview */}
        <div className="p-6 rounded-2xl bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-[#E3DCD3] dark:border-white/[0.06] space-y-4">
          <h2 className="text-sm font-bold text-[#282521] dark:text-[#EDE8E1]">Open Graph / Social Sharing Card</h2>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-[#A1A1AA] block mb-1">OG Title</label>
              <input
                type="text"
                value={seo.ogTitle || ''}
                onChange={e => setSeo({ ...seo, ogTitle: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F2EC] dark:bg-[#151413] border border-[#E3DCD3] dark:border-white/[0.08] text-sm text-[#282521] dark:text-[#EDE8E1] outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#A1A1AA] block mb-1">OG Description</label>
              <textarea
                rows={2}
                value={seo.ogDescription || ''}
                onChange={e => setSeo({ ...seo, ogDescription: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F2EC] dark:bg-[#151413] border border-[#E3DCD3] dark:border-white/[0.08] text-sm text-[#282521] dark:text-[#EDE8E1] outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#A1A1AA] block mb-1">OG Image URL</label>
              <input
                type="text"
                placeholder="https://... (1200x630px recommended)"
                value={seo.ogImage || ''}
                onChange={e => setSeo({ ...seo, ogImage: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F2EC] dark:bg-[#151413] border border-[#E3DCD3] dark:border-white/[0.08] text-sm text-[#282521] dark:text-[#EDE8E1] outline-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

