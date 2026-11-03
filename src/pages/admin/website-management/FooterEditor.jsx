// src/pages/admin/website-management/FooterEditor.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Globe, Save, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { cmsAdminApi } from '../../../api/cmsApi';
import Button from '../../../design-system/primitives/Button';

export default function FooterEditor() {
  const navigate = useNavigate();
  const [footer, setFooter] = useState({
    brandDescription: 'Engineering education built on actual distributed microservices architectures. No synthetic toys.',
    copyright: '© 2026 FD_LMS / Asivo Inc. All rights reserved.',
    links: [
      { groupName: 'Curriculum', label: 'Microservices Track', destination: '/courses', openInNewTab: false },
      { groupName: 'Curriculum', label: 'Cloud Architecture', destination: '/courses', openInNewTab: false },
      { groupName: 'Credentials', label: 'Certifications', destination: '/certifications', openInNewTab: false },
      { groupName: 'Platform', label: 'Teach on FD_LMS', destination: '/instructor/apply', openInNewTab: false },
      { groupName: 'Legal', label: 'Terms of Service', destination: '/terms', openInNewTab: false },
      { groupName: 'Legal', label: 'Privacy Policy', destination: '/privacy', openInNewTab: false },
    ],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await cmsAdminApi.getFooter();
        const data = res?.data || res;
        if (data && typeof data === 'object') {
          setFooter(prev => ({
            ...prev,
            ...data,
            links: Array.isArray(data.links) && data.links.length > 0 ? data.links : prev.links,
          }));
        }
      } catch {
        toast.error('Could not fetch footer from backend, showing defaults');
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const handleAddLink = () => {
    setFooter(prev => ({
      ...prev,
      links: [
        ...prev.links,
        { groupName: 'Curriculum', label: 'New Link', destination: '/', openInNewTab: false },
      ],
    }));
  };

  const handleRemoveLink = (idx) => {
    setFooter(prev => ({
      ...prev,
      links: prev.links.filter((_, i) => i !== idx),
    }));
  };

  const handleLinkChange = (idx, field, value) => {
    setFooter(prev => {
      const copy = [...prev.links];
      copy[idx] = { ...copy[idx], [field]: value };
      return { ...prev, links: copy };
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await cmsAdminApi.updateFooter(footer);
      toast.success('Footer configuration saved successfully');
    } catch {
      toast.error('Failed to save footer');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070709] text-[#F5F5F7] p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-white/[0.04]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/admin/website-management')}
              className="p-2 rounded-xl bg-[#0F0F13] border border-white/[0.06] hover:border-[#C5A880]/30 text-[#A1A1AA] hover:text-white"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-[#F5F5F7] flex items-center gap-2">
                <Globe className="w-5 h-5 text-[#C5A880]" />
                Footer Configuration
              </h1>
              <p className="text-xs text-[#71717A] mt-0.5">
                Brand narrative, copyright notice, and categorical footer navigation links
              </p>
            </div>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            leftIcon={Save}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>

        {/* Global Footer Details */}
        <div className="p-6 rounded-2xl bg-[#0F0F13] border border-white/[0.04] space-y-4">
          <h2 className="text-sm font-bold text-[#F5F5F7]">Footer Narrative & Legal</h2>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-[#A1A1AA] block mb-1.5">Brand Description</label>
              <textarea
                rows={3}
                value={footer.brandDescription || ''}
                onChange={e => setFooter({ ...footer, brandDescription: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#14141A] border border-white/[0.08] text-sm text-[#F5F5F7] outline-none focus:border-[#C5A880]/60"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#A1A1AA] block mb-1.5">Copyright Notice</label>
              <input
                type="text"
                value={footer.copyright || ''}
                onChange={e => setFooter({ ...footer, copyright: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#14141A] border border-white/[0.08] text-sm text-[#F5F5F7] outline-none focus:border-[#C5A880]/60"
              />
            </div>
          </div>
        </div>

        {/* Links Matrix */}
        <div className="p-6 rounded-2xl bg-[#0F0F13] border border-white/[0.04] space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#F5F5F7]">Categorical Links</h2>
            <Button variant="secondary" size="sm" onClick={handleAddLink} leftIcon={Plus}>
              Add Link
            </Button>
          </div>

          <div className="space-y-3">
            {footer.links.map((link, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-[#14141A] border border-white/[0.04] flex flex-col sm:flex-row items-center gap-3"
              >
                <div className="w-full sm:w-1/4">
                  <input
                    type="text"
                    placeholder="Group (e.g. Legal)"
                    value={link.groupName || ''}
                    onChange={e => handleLinkChange(idx, 'groupName', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-[#0F0F13] border border-white/[0.06] text-xs text-[#F5F5F7] outline-none"
                  />
                </div>
                <div className="w-full sm:w-1/3">
                  <input
                    type="text"
                    placeholder="Link Label"
                    value={link.label || ''}
                    onChange={e => handleLinkChange(idx, 'label', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-[#0F0F13] border border-white/[0.06] text-xs text-[#F5F5F7] outline-none"
                  />
                </div>
                <div className="w-full sm:w-1/3">
                  <input
                    type="text"
                    placeholder="Destination (e.g. /terms)"
                    value={link.destination || ''}
                    onChange={e => handleLinkChange(idx, 'destination', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-[#0F0F13] border border-white/[0.06] text-xs text-[#F5F5F7] outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveLink(idx)}
                  className="p-1.5 rounded-lg text-[#71717A] hover:text-rose-400 hover:bg-rose-500/10"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

