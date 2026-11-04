// src/pages/admin/website-management/TestimonialEditor.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, MessageSquare, Trash2, Edit2, Star, Eye, EyeOff, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { cmsAdminApi } from '../../../api/cmsApi';
import Button from '../../../design-system/primitives/Button';

export default function TestimonialEditor() {
  const navigate = useNavigate();
  const [testimonials, setTestimonials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    authorName: '',
    authorRole: '',
    company: '',
    content: '',
    rating: 5.0,
    avatarUrl: '',
    isVisible: true,
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await cmsAdminApi.getTestimonials();
      const list = res?.data || res || [];
      setTestimonials(Array.isArray(list) ? list : []);
    } catch {
      toast.error('Failed to load testimonials');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingItem(null);
    setFormData({
      authorName: '',
      authorRole: 'Senior Staff Engineer',
      company: 'Distributed Systems Org',
      content: 'The production resilience tracks replaced months of trial-and-error with verified architectures.',
      rating: 5.0,
      avatarUrl: '',
      isVisible: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({ ...item });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.authorName.trim() || !formData.content.trim()) {
      toast.error('Author name and testimonial text are required');
      return;
    }

    try {
      if (editingItem) {
        const res = await cmsAdminApi.updateTestimonial(editingItem.id, formData);
        const updated = res?.data || res;
        setTestimonials(prev => prev.map(t => (t.id === updated.id ? updated : t)));
        toast.success('Testimonial updated');
      } else {
        const res = await cmsAdminApi.createTestimonial(formData);
        const created = res?.data || res;
        setTestimonials(prev => [...prev, created]);
        toast.success('Testimonial created');
      }
      setIsModalOpen(false);
    } catch {
      toast.error('Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this testimonial?')) return;
    try {
      await cmsAdminApi.deleteTestimonial(id);
      setTestimonials(prev => prev.filter(t => t.id !== id));
      toast.success('Testimonial deleted');
    } catch {
      toast.error('Failed to delete testimonial');
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
                <MessageSquare className="w-5 h-5 text-[#5B3E57] dark:text-[#D1A7CC]" />
                Learner & Lead Testimonials
              </h1>
              <p className="text-xs text-[#756E64] dark:text-[#7A7368] mt-0.5">
                Curate verified peer reviews and feedback for the storefront
              </p>
            </div>
          </div>
          <Button variant="primary" size="sm" onClick={openCreateModal} leftIcon={Plus}>
            Add Testimonial
          </Button>
        </div>

        {/* List */}
        {isLoading ? (
          <div className="p-12 text-center text-sm text-[#756E64] dark:text-[#7A7368] bg-[#FFFEFA] dark:bg-[#1D1C1A] rounded-2xl border border-[#E3DCD3] dark:border-[#E3DCD3] dark:border-white/[0.06]">
            Hydrating testimonials...
          </div>
        ) : testimonials.length === 0 ? (
          <div className="p-12 text-center bg-[#FFFEFA] dark:bg-[#1D1C1A] rounded-2xl border border-[#E3DCD3] dark:border-[#E3DCD3] dark:border-white/[0.06] space-y-2">
            <MessageSquare className="w-8 h-8 text-[#756E64] dark:text-[#7A7368] mx-auto" />
            <p className="text-sm font-semibold text-[#282521] dark:text-[#EDE8E1]">No testimonials yet</p>
            <p className="text-xs text-[#756E64] dark:text-[#7A7368]">Add engineer endorsements to build platform credibility</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {testimonials.map(item => (
              <div
                key={item.id}
                className="p-5 rounded-2xl bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-[#E3DCD3] dark:border-white/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#282521] dark:text-[#EDE8E1]">{item.authorName}</span>
                    <span className="text-xs text-[#756E64] dark:text-[#7A7368]">· {item.authorRole} ({item.company})</span>
                    <div className="flex items-center text-[#5B3E57] dark:text-[#D1A7CC] text-xs gap-0.5 ml-2">
                      <Star className="w-3.5 h-3.5 fill-[#C29B38]" />
                      <span>{item.rating}</span>
                    </div>
                  </div>
                  <p className="text-xs text-[#A1A1AA] italic">"{item.content}"</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => openEditModal(item)}
                    className="p-2 rounded-xl text-[#A1A1AA] hover:text-[#5B3E57] dark:hover:text-[#D1A7CC] hover:bg-white/[0.04]"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 rounded-xl text-[#A1A1AA] hover:text-rose-400 hover:bg-rose-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-lg bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-white/[0.08] rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-[#282521] dark:text-[#EDE8E1]">
                  {editingItem ? 'Edit Testimonial' : 'New Testimonial'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-[#756E64] dark:text-[#7A7368] hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-[#A1A1AA] block mb-1">Author Name</label>
                  <input
                    type="text"
                    required
                    value={formData.authorName}
                    onChange={e => setFormData({ ...formData, authorName: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#F5F2EC] dark:bg-[#151413] border border-[#E3DCD3] dark:border-white/[0.08] text-sm text-[#282521] dark:text-[#EDE8E1] outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-[#A1A1AA] block mb-1">Author Role</label>
                    <input
                      type="text"
                      value={formData.authorRole}
                      onChange={e => setFormData({ ...formData, authorRole: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-[#F5F2EC] dark:bg-[#151413] border border-[#E3DCD3] dark:border-white/[0.08] text-sm text-[#282521] dark:text-[#EDE8E1] outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#A1A1AA] block mb-1">Company / Team</label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={e => setFormData({ ...formData, company: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-xl bg-[#F5F2EC] dark:bg-[#151413] border border-[#E3DCD3] dark:border-white/[0.08] text-sm text-[#282521] dark:text-[#EDE8E1] outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#A1A1AA] block mb-1">Testimonial Quote</label>
                  <textarea
                    rows={4}
                    required
                    value={formData.content}
                    onChange={e => setFormData({ ...formData, content: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#F5F2EC] dark:bg-[#151413] border border-[#E3DCD3] dark:border-white/[0.08] text-sm text-[#282521] dark:text-[#EDE8E1] outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#A1A1AA] block mb-1">Rating (1 to 5)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={formData.rating}
                    onChange={e => setFormData({ ...formData, rating: parseFloat(e.target.value) || 5.0 })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#F5F2EC] dark:bg-[#151413] border border-[#E3DCD3] dark:border-white/[0.08] text-sm text-[#282521] dark:text-[#EDE8E1] outline-none"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="secondary" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="primary" size="sm" type="submit">
                    Save Testimonial
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

