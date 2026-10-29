import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Tag,
  Plus,
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  Trash2,
  Power,
  Layers,
  Sparkles,
  Percent,
  Check,
  AlertCircle,
  Loader2,
  Send,
  Zap,
} from 'lucide-react';
import { couponApi } from '../../api/couponApi';
import toast from 'react-hot-toast';

const SPRING = { type: 'spring', stiffness: 300, damping: 25 };

export const Coupons = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCampaign, setSelectedCampaign] = useState('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);

  // Test sandbox state
  const [testCode, setTestCode] = useState('WELCOME50');
  const [testPrice, setTestPrice] = useState(2999);
  const [testResult, setTestResult] = useState(null);
  const [isTesting, setIsTesting] = useState(false);

  // Create form state
  const [createForm, setCreateForm] = useState({
    code: '',
    title: '',
    description: '',
    discountType: 'PERCENTAGE',
    discountValue: 20,
    minimumOrderAmount: 499,
    maximumDiscountAmount: 2000,
    usageLimit: 100,
    usageLimitPerUser: 1,
    applicableTo: 'ALL',
    status: 'ACTIVE',
  });

  // Bulk form state
  const [bulkForm, setBulkForm] = useState({
    campaignName: 'SUMMER_DEAL',
    discountType: 'PERCENTAGE',
    discountValue: 15,
    totalCoupons: 5,
    creatorRole: 'MAIN_ADMIN',
  });

  // =========================================================================
  // 1. DATA INGESTION: TanStack Queries
  // =========================================================================
  const { data: coupons = [], isLoading, refetch, isFetching } = useQuery({
    queryKey: ['admin-coupons'],
    queryFn: async () => {
      const data = await couponApi.getAllCoupons();
      return Array.isArray(data) ? data : [];
    },
  });

  const { data: campaigns = [] } = useQuery({
    queryKey: ['admin-campaigns'],
    queryFn: async () => {
      const data = await couponApi.getCampaigns();
      return Array.isArray(data) ? data : [];
    },
  });

  // =========================================================================
  // 2. MUTATIONS: Activate, Deactivate, Delete, Create, Bulk
  // =========================================================================
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, isActive }) => {
      if (isActive) {
        return await couponApi.deactivateCoupon(id);
      } else {
        return await couponApi.activateCoupon(id);
      }
    },
    onSuccess: (_, vars) => {
      toast.success(`Coupon ${vars.isActive ? 'deactivated' : 'activated'} successfully.`);
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Failed to update coupon status.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => await couponApi.deleteCoupon(id),
    onSuccess: () => {
      toast.success('Coupon removed permanently.');
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Failed to delete coupon.');
    },
  });

  const createMutation = useMutation({
    mutationFn: async (payload) => {
      const now = new Date();
      const expiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      return await couponApi.createCoupon({
        ...payload,
        validFrom: now.toISOString(),
        validUntil: expiry.toISOString(),
      });
    },
    onSuccess: () => {
      toast.success('Coupon created successfully.');
      setShowCreateModal(false);
      setCreateForm({
        code: '',
        title: '',
        description: '',
        discountType: 'PERCENTAGE',
        discountValue: 20,
        minimumOrderAmount: 499,
        maximumDiscountAmount: 2000,
        usageLimit: 100,
        usageLimitPerUser: 1,
        applicableTo: 'ALL',
        status: 'ACTIVE',
      });
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Failed to create coupon.');
    },
  });

  const bulkMutation = useMutation({
    mutationFn: async (payload) => {
      const expiry = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19);
      return await couponApi.bulkGenerate({
        ...payload,
        expiryDate: expiry,
      });
    },
    onSuccess: (res) => {
      toast.success(`Generated ${res?.totalGenerated || 'bulk'} campaign coupons successfully.`);
      setShowBulkModal(false);
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
      queryClient.invalidateQueries({ queryKey: ['admin-campaigns'] });
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'Failed to generate bulk coupons.');
    },
  });

  // =========================================================================
  // 3. TESTING SANDBOX ENGINE
  // =========================================================================
  const handleRunValidationTest = async (e) => {
    e.preventDefault();
    if (!testCode.trim()) return;
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await couponApi.validateCoupon({
        couponCode: testCode.trim().toUpperCase(),
        price: Number(testPrice) || 2999,
      });
      setTestResult({ success: true, data: res });
      toast.success(`Validated: ₹${res.discount || 0} discount applied!`);
    } catch (err) {
      setTestResult({
        success: false,
        error: err?.response?.data?.message || 'Validation rejected by coupon service.',
      });
      toast.error('Validation test rejected');
    } finally {
      setIsTesting(false);
    }
  };

  const handleRunAutoApplyTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await couponApi.getBestDiscount({
        price: Number(testPrice) || 4999,
      });
      setTestResult({ success: true, data: res, isAuto: true });
      toast.success(`Auto-Applied best coupon: ${res.message || 'Success'}`);
    } catch (err) {
      setTestResult({
        success: false,
        error: err?.response?.data?.message || 'No suitable coupon found.',
      });
      toast.error('Auto-apply search failed');
    } finally {
      setIsTesting(false);
    }
  };

  // Filtered coupons list
  const filteredCoupons = coupons.filter((c) => {
    const matchesSearch =
      (c.code || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.title || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCampaign =
      selectedCampaign === 'ALL' || c.campaignId === selectedCampaign;
    return matchesSearch && matchesCampaign;
  });

  // Derived metrics
  const activeCount = coupons.filter((c) => c.status === 'ACTIVE' || c.isActive).length;
  const totalRedeemed = coupons.reduce((sum, c) => sum + (c.usedCount || 0), 0);

  return (
    <div className="min-h-screen bg-[#070709] text-[#F5F5F7] p-6 lg:p-10 space-y-8 font-sans">
      {/* Header telemetry node */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#C5A880] tracking-wider uppercase mb-1">
            <Tag className="w-3.5 h-3.5" />
            <span>Platform Promotional Engine</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-white">
            Promotions & Coupon Matrix
          </h1>
          <p className="text-sm text-[#8E8E93] mt-1">
            Centrally govern discount schemas, campaign batches, and test real-time validation telemetry.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2.5 bg-[#14141A] border border-white/10 hover:border-white/20 rounded-xl text-white/70 hover:text-white transition-all cursor-pointer"
            title="Refresh Ledger"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin text-[#C5A880]' : ''}`} />
          </button>
          <button
            onClick={() => setShowBulkModal(true)}
            className="px-4 py-2.5 bg-[#14141A] border border-white/10 hover:border-[#C5A880]/40 rounded-xl text-xs font-mono font-bold tracking-wider text-[#F5F5F7] hover:text-white transition-all flex items-center gap-2 cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>Bulk Campaign</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 bg-[#C5A880] hover:bg-[#D4BC98] text-[#070709] rounded-xl text-xs font-bold tracking-wider uppercase transition-all shadow-lg shadow-[#C5A880]/15 flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Coupon</span>
          </button>
        </div>
      </div>

      {/* Metrics Rail */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#14141A]/60 border border-white/5 rounded-2xl p-5 space-y-2">
          <span className="text-xs font-mono text-[#8E8E93] uppercase tracking-wider">Total Coupons</span>
          <div className="text-2xl font-bold text-white font-mono">{coupons.length}</div>
          <p className="text-[11px] text-[#8E8E93]">Configured discount tokens</p>
        </div>
        <div className="bg-[#14141A]/60 border border-white/5 rounded-2xl p-5 space-y-2">
          <span className="text-xs font-mono text-[#8E8E93] uppercase tracking-wider">Active Status</span>
          <div className="text-2xl font-bold text-emerald-400 font-mono">{activeCount}</div>
          <p className="text-[11px] text-[#8E8E93]">Live and eligible for redemption</p>
        </div>
        <div className="bg-[#14141A]/60 border border-white/5 rounded-2xl p-5 space-y-2">
          <span className="text-xs font-mono text-[#8E8E93] uppercase tracking-wider">Total Redemptions</span>
          <div className="text-2xl font-bold text-[#C5A880] font-mono">{totalRedeemed}</div>
          <p className="text-[11px] text-[#8E8E93]">Applied across verified orders</p>
        </div>
        <div className="bg-[#14141A]/60 border border-white/5 rounded-2xl p-5 space-y-2">
          <span className="text-xs font-mono text-[#8E8E93] uppercase tracking-wider">Campaign Batches</span>
          <div className="text-2xl font-bold text-blue-400 font-mono">{campaigns.length}</div>
          <p className="text-[11px] text-[#8E8E93]">Unique promotional tracks</p>
        </div>
      </div>

      {/* Live Validation Sandbox Node */}
      <div className="bg-[#14141A]/80 border border-white/10 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-[#C5A880]" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-white">Live Validation Telemetry Sandbox</h2>
        </div>
        <p className="text-xs text-[#8E8E93]">
          Directly execute queries against the Coupon Service microservice to test code redemption logic and auto-apply algorithms.
        </p>

        <form onSubmit={handleRunValidationTest} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          <div className="md:col-span-4 space-y-1">
            <label className="text-[10px] font-mono text-[#8E8E93] uppercase font-bold">Coupon Code</label>
            <input
              type="text"
              value={testCode}
              onChange={(e) => setTestCode(e.target.value.toUpperCase())}
              placeholder="WELCOME50"
              className="w-full bg-[#070709] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-white/20 focus:outline-none focus:border-[#C5A880]/50 uppercase"
            />
          </div>
          <div className="md:col-span-3 space-y-1">
            <label className="text-[10px] font-mono text-[#8E8E93] uppercase font-bold">Base Price (₹)</label>
            <input
              type="number"
              value={testPrice}
              onChange={(e) => setTestPrice(e.target.value)}
              className="w-full bg-[#070709] border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-white/20 focus:outline-none focus:border-[#C5A880]/50"
            />
          </div>
          <div className="md:col-span-5 flex gap-2">
            <button
              type="submit"
              disabled={isTesting || !testCode.trim()}
              className="flex-1 py-2 px-3 bg-[#14141A] border border-[#C5A880]/40 hover:bg-[#C5A880]/10 text-[#C5A880] rounded-xl text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
            >
              {isTesting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              <span>Validate Code</span>
            </button>
            <button
              type="button"
              onClick={handleRunAutoApplyTest}
              disabled={isTesting}
              className="flex-1 py-2 px-3 bg-[#14141A] border border-white/10 hover:border-white/20 text-[#F5F5F7] rounded-xl text-xs font-mono transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
              <span>Auto-Apply Best</span>
            </button>
          </div>
        </form>

        {testResult && (
          <div className={`p-4 rounded-xl border text-xs font-mono ${testResult.success ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300' : 'bg-red-950/20 border-red-500/30 text-red-300'}`}>
            {testResult.success ? (
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <div className="font-bold">VALIDATION CONFIRMED: {testResult.data.message || 'Valid'}</div>
                  <div className="text-[11px] text-emerald-400/80 mt-1">
                    Discount Amount: ₹{testResult.data.discount} | Final Net Payable: ₹{testResult.data.finalPrice}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                <div>
                  <div className="font-bold">VALIDATION FAILED: {testResult.error}</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search coupon code or title..."
            className="w-full bg-[#14141A] border border-white/5 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#C5A880]/50"
          />
        </div>

        {campaigns.length > 0 && (
          <div className="flex items-center gap-2 self-start sm:self-auto overflow-x-auto pb-1 max-w-full">
            <button
              onClick={() => setSelectedCampaign('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${selectedCampaign === 'ALL' ? 'bg-[#C5A880] text-[#070709] font-bold' : 'bg-[#14141A] text-white/60 hover:text-white'}`}
            >
              ALL
            </button>
            {campaigns.map((camp) => (
              <button
                key={camp}
                onClick={() => setSelectedCampaign(camp)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${selectedCampaign === camp ? 'bg-[#C5A880] text-[#070709] font-bold' : 'bg-[#14141A] text-white/60 hover:text-white'}`}
              >
                {camp}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Coupons Matrix Table */}
      <div className="bg-[#14141A]/50 border border-white/5 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#070709]/80 border-b border-white/5 text-[10px] font-mono uppercase tracking-wider text-[#8E8E93]">
              <tr>
                <th className="py-3 px-4">Coupon Code</th>
                <th className="py-3 px-4">Discount</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Usage / Limit</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#8E8E93]">
                    <Loader2 className="w-6 h-6 animate-spin text-[#C5A880] mx-auto mb-2" />
                    <span>Synchronizing Promotional Matrix...</span>
                  </td>
                </tr>
              ) : filteredCoupons.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#8E8E93]">
                    No promotional coupons matched current filter criteria.
                  </td>
                </tr>
              ) : (
                filteredCoupons.map((coupon) => {
                  const id = coupon.couponId || coupon.id;
                  const isActive = coupon.status === 'ACTIVE' || coupon.isActive;
                  return (
                    <tr key={id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-white text-sm tracking-wider flex items-center gap-1.5">
                          <span>{coupon.code}</span>
                        </div>
                        {coupon.title && (
                          <div className="text-[11px] text-[#8E8E93] truncate max-w-xs">{coupon.title}</div>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-[#C5A880]">
                        {coupon.discountType === 'PERCENTAGE' || coupon.discountType === 'PERCENT'
                          ? `${coupon.discountValue}% OFF`
                          : `₹${coupon.discountValue} FLAT`}
                      </td>
                      <td className="py-3 px-4 font-mono text-[#8E8E93] uppercase text-[11px]">
                        {coupon.discountType}
                      </td>
                      <td className="py-3 px-4 font-mono text-[#F5F5F7]">
                        {coupon.usedCount || 0} / {coupon.usageLimit || '∞'}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold ${
                            isActive
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                          }`}
                        >
                          {isActive ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => toggleStatusMutation.mutate({ id, isActive })}
                            disabled={toggleStatusMutation.isPending}
                            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                              isActive
                                ? 'border-amber-500/30 text-amber-400 hover:bg-amber-500/10'
                                : 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'
                            }`}
                            title={isActive ? 'Deactivate Coupon' : 'Activate Coupon'}
                          >
                            <Power className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Permanently delete coupon "${coupon.code}"?`)) {
                                deleteMutation.mutate(id);
                              }
                            }}
                            disabled={deleteMutation.isPending}
                            className="p-1.5 rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
                            title="Delete Coupon"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE COUPON MODAL */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={SPRING}
              className="bg-[#14141A] border border-white/10 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Plus className="w-4 h-4 text-[#C5A880]" />
                  <span>Create Discount Coupon</span>
                </h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-white/40 hover:text-white transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  createMutation.mutate(createForm);
                }}
                className="space-y-3 text-xs"
              >
                <div>
                  <label className="block text-[10px] font-mono text-[#8E8E93] uppercase mb-1">Coupon Code *</label>
                  <input
                    type="text"
                    required
                    value={createForm.code}
                    onChange={(e) => setCreateForm({ ...createForm, code: e.target.value.toUpperCase() })}
                    placeholder="WINTER2026"
                    className="w-full bg-[#070709] border border-white/10 rounded-xl px-3 py-2 text-white font-mono uppercase focus:outline-none focus:border-[#C5A880]/50"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-[#8E8E93] uppercase mb-1">Title</label>
                  <input
                    type="text"
                    value={createForm.title}
                    onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                    placeholder="Winter Engineering Sale"
                    className="w-full bg-[#070709] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#C5A880]/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono text-[#8E8E93] uppercase mb-1">Discount Type</label>
                    <select
                      value={createForm.discountType}
                      onChange={(e) => setCreateForm({ ...createForm, discountType: e.target.value })}
                      className="w-full bg-[#070709] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#C5A880]/50"
                    >
                      <option value="PERCENTAGE">PERCENTAGE (%)</option>
                      <option value="FLAT">FLAT (₹)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-[#8E8E93] uppercase mb-1">Discount Value</label>
                    <input
                      type="number"
                      required
                      value={createForm.discountValue}
                      onChange={(e) => setCreateForm({ ...createForm, discountValue: Number(e.target.value) })}
                      className="w-full bg-[#070709] border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-[#C5A880]/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono text-[#8E8E93] uppercase mb-1">Min Order (₹)</label>
                    <input
                      type="number"
                      value={createForm.minimumOrderAmount}
                      onChange={(e) => setCreateForm({ ...createForm, minimumOrderAmount: Number(e.target.value) })}
                      className="w-full bg-[#070709] border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-[#C5A880]/50"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-[#8E8E93] uppercase mb-1">Usage Limit</label>
                    <input
                      type="number"
                      value={createForm.usageLimit}
                      onChange={(e) => setCreateForm({ ...createForm, usageLimit: Number(e.target.value) })}
                      className="w-full bg-[#070709] border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-[#C5A880]/50"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 bg-[#070709] text-white/60 hover:text-white rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="px-4 py-2 bg-[#C5A880] text-[#070709] font-bold rounded-xl flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {createMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Deploy Coupon</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* BULK GENERATOR MODAL */}
      <AnimatePresence>
        {showBulkModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={SPRING}
              className="bg-[#14141A] border border-white/10 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#C5A880]" />
                  <span>Generate Campaign Batch</span>
                </h3>
                <button
                  onClick={() => setShowBulkModal(false)}
                  className="text-white/40 hover:text-white transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  bulkMutation.mutate(bulkForm);
                }}
                className="space-y-3 text-xs"
              >
                <div>
                  <label className="block text-[10px] font-mono text-[#8E8E93] uppercase mb-1">Campaign Prefix *</label>
                  <input
                    type="text"
                    required
                    value={bulkForm.campaignName}
                    onChange={(e) => setBulkForm({ ...bulkForm, campaignName: e.target.value.toUpperCase() })}
                    placeholder="TECHFEST"
                    className="w-full bg-[#070709] border border-white/10 rounded-xl px-3 py-2 text-white font-mono uppercase focus:outline-none focus:border-[#C5A880]/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono text-[#8E8E93] uppercase mb-1">Discount Type</label>
                    <select
                      value={bulkForm.discountType}
                      onChange={(e) => setBulkForm({ ...bulkForm, discountType: e.target.value })}
                      className="w-full bg-[#070709] border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#C5A880]/50"
                    >
                      <option value="PERCENTAGE">PERCENTAGE (%)</option>
                      <option value="FLAT">FLAT (₹)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-[#8E8E93] uppercase mb-1">Discount Value</label>
                    <input
                      type="number"
                      required
                      value={bulkForm.discountValue}
                      onChange={(e) => setBulkForm({ ...bulkForm, discountValue: Number(e.target.value) })}
                      className="w-full bg-[#070709] border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-[#C5A880]/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-[#8E8E93] uppercase mb-1">Number of Coupons</label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    required
                    value={bulkForm.totalCoupons}
                    onChange={(e) => setBulkForm({ ...bulkForm, totalCoupons: Number(e.target.value) })}
                    className="w-full bg-[#070709] border border-white/10 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-[#C5A880]/50"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => setShowBulkModal(false)}
                    className="px-4 py-2 bg-[#070709] text-white/60 hover:text-white rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={bulkMutation.isPending}
                    className="px-4 py-2 bg-[#C5A880] text-[#070709] font-bold rounded-xl flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {bulkMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Generate Batch</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Coupons;

