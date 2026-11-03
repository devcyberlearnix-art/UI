// src/pages/admin/website-management/MediaLibrary.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Image as ImageIcon, Upload, Trash2, Copy, Check, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { cmsAdminApi } from '../../../api/cmsApi';
import Button from '../../../design-system/primitives/Button';

export default function MediaLibrary() {
  const navigate = useNavigate();
  const [media, setMedia] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const loadMedia = async () => {
    setIsLoading(true);
    try {
      const res = await cmsAdminApi.getMediaLibrary(0, 50);
      const data = res?.data || res;
      const list = data?.content || (Array.isArray(data) ? data : []);
      setMedia(list);
    } catch {
      toast.error('Could not load media library');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMedia();
  }, []);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const res = await cmsAdminApi.uploadMedia(file, file.name);
      const asset = res?.data || res;
      setMedia(prev => [asset, ...prev]);
      toast.success('Asset uploaded successfully');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to upload media');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this media asset?')) return;
    try {
      await cmsAdminApi.deleteMedia(id);
      setMedia(prev => prev.filter(m => m.id !== id));
      toast.success('Asset removed');
    } catch {
      toast.error('Failed to delete asset');
    }
  };

  const handleCopyUrl = (url, id) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success('URL copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#070709] text-[#F5F5F7] p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
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
                <ImageIcon className="w-5 h-5 text-[#C5A880]" />
                Media Asset Library
              </h1>
              <p className="text-xs text-[#71717A] mt-0.5">
                Centralized storage for landing page imagery, badges, and brand vectors
              </p>
            </div>
          </div>
          <label className="px-4 py-2 rounded-xl bg-[#C5A880] text-[#070709] hover:bg-[#D4BC98] text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors shadow-lg shadow-[#C5A880]/10">
            <Upload className="w-4 h-4" />
            {isUploading ? 'Uploading...' : 'Upload Asset'}
            <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
          </label>
        </div>

        {/* Media Grid */}
        {isLoading ? (
          <div className="p-12 text-center text-sm text-[#71717A] bg-[#0F0F13] rounded-2xl border border-white/[0.04]">
            Hydrating media catalog...
          </div>
        ) : media.length === 0 ? (
          <div className="p-12 text-center bg-[#0F0F13] rounded-2xl border border-white/[0.04] space-y-2">
            <ImageIcon className="w-8 h-8 text-[#71717A] mx-auto" />
            <p className="text-sm font-semibold text-[#F5F5F7]">No media uploaded yet</p>
            <p className="text-xs text-[#71717A]">Upload banners, badges, and logos to link them in sections</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {media.map(item => (
              <div
                key={item.id}
                className="group relative rounded-2xl bg-[#0F0F13] border border-white/[0.04] overflow-hidden flex flex-col hover:border-[#C5A880]/30 transition-all"
              >
                <div className="aspect-video w-full bg-[#14141A] flex items-center justify-center overflow-hidden">
                  <img
                    src={item.fileUrl}
                    alt={item.altText || item.fileName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={e => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
                <div className="p-3 space-y-1">
                  <p className="text-xs font-semibold text-[#F5F5F7] truncate">{item.fileName}</p>
                  <p className="text-[10px] text-[#71717A]">
                    {(item.fileSize / 1024).toFixed(1)} KB · {item.mimeType?.split('/')[1]?.toUpperCase()}
                  </p>
                  <div className="flex items-center justify-between pt-2 border-t border-white/[0.04]">
                    <button
                      type="button"
                      onClick={() => handleCopyUrl(item.fileUrl, item.id)}
                      className="p-1.5 rounded-lg text-[#71717A] hover:text-[#C5A880] hover:bg-white/[0.04] flex items-center gap-1 text-[10px]"
                    >
                      {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedId === item.id ? 'Copied' : 'Copy URL'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 rounded-lg text-[#71717A] hover:text-rose-400 hover:bg-rose-500/10"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

