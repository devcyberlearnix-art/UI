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
    <div className="min-h-screen bg-[#F5F2EC] dark:bg-[#151413] text-[#282521] dark:text-[#EDE8E1] p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
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
                <ImageIcon className="w-5 h-5 text-[#5B3E57] dark:text-[#D1A7CC]" />
                Media Asset Library
              </h1>
              <p className="text-xs text-[#756E64] dark:text-[#7A7368] mt-0.5">
                Centralized storage for landing page imagery, badges, and brand vectors
              </p>
            </div>
          </div>
          <label className="px-4 py-2 rounded-xl bg-[#5B3E57] dark:bg-[#D1A7CC] text-[#FFFEFA] dark:text-[#151413] hover:bg-[#462D42] dark:hover:bg-[#C293BD] text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors shadow-lg shadow-sm">
            <Upload className="w-4 h-4" />
            {isUploading ? 'Uploading...' : 'Upload Asset'}
            <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
          </label>
        </div>

        {/* Media Grid */}
        {isLoading ? (
          <div className="p-12 text-center text-sm text-[#756E64] dark:text-[#7A7368] bg-[#FFFEFA] dark:bg-[#1D1C1A] rounded-2xl border border-[#E3DCD3] dark:border-[#E3DCD3] dark:border-white/[0.06]">
            Hydrating media catalog...
          </div>
        ) : media.length === 0 ? (
          <div className="p-12 text-center bg-[#FFFEFA] dark:bg-[#1D1C1A] rounded-2xl border border-[#E3DCD3] dark:border-[#E3DCD3] dark:border-white/[0.06] space-y-2">
            <ImageIcon className="w-8 h-8 text-[#756E64] dark:text-[#7A7368] mx-auto" />
            <p className="text-sm font-semibold text-[#282521] dark:text-[#EDE8E1]">No media uploaded yet</p>
            <p className="text-xs text-[#756E64] dark:text-[#7A7368]">Upload banners, badges, and logos to link them in sections</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {media.map(item => (
              <div
                key={item.id}
                className="group relative rounded-2xl bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-[#E3DCD3] dark:border-white/[0.06] overflow-hidden flex flex-col hover:border-[#5B3E57]/40 dark:hover:border-[#D1A7CC]/40 transition-all"
              >
                <div className="aspect-video w-full bg-[#F5F2EC] dark:bg-[#151413] flex items-center justify-center overflow-hidden">
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
                  <p className="text-xs font-semibold text-[#282521] dark:text-[#EDE8E1] truncate">{item.fileName}</p>
                  <p className="text-[10px] text-[#756E64] dark:text-[#7A7368]">
                    {(item.fileSize / 1024).toFixed(1)} KB · {item.mimeType?.split('/')[1]?.toUpperCase()}
                  </p>
                  <div className="flex items-center justify-between pt-2 border-t border-[#E3DCD3] dark:border-[#E3DCD3] dark:border-white/[0.06]">
                    <button
                      type="button"
                      onClick={() => handleCopyUrl(item.fileUrl, item.id)}
                      className="p-1.5 rounded-lg text-[#756E64] dark:text-[#7A7368] hover:text-[#5B3E57] dark:hover:text-[#D1A7CC] hover:bg-white/[0.04] flex items-center gap-1 text-[10px]"
                    >
                      {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedId === item.id ? 'Copied' : 'Copy URL'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 rounded-lg text-[#756E64] dark:text-[#7A7368] hover:text-rose-400 hover:bg-rose-500/10"
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

