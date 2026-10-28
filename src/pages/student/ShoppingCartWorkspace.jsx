// src/pages/student/ShoppingCartWorkspace.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Tag,
  Loader2,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import GlobalLayoutWrapper from '../../design-system/layout/GlobalLayoutWrapper';
import Button from '../../design-system/primitives/Button';
import Badge from '../../design-system/primitives/Badge';
import Skeleton from '../../design-system/primitives/Skeleton';
import EmptyState from '../../design-system/feedback/EmptyState';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cartApi, normalizeCart } from '../../api/cartApi';
import { orderApi } from '../../api/orderApi';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const SPRING = { type: 'spring', stiffness: 280, damping: 26 };

export default function ShoppingCartWorkspace() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [couponCode, setCouponCode] = useState('');
  const [isStaging, setIsStaging] = useState(false);

  const cartQueryKey = ['cart', user?.id || 'guest'];

  // =========================================================================
  // 1. DATA INGESTION: Connect with Microservice Gateway Registers
  // =========================================================================
  const {
    data: cart = { courses: [], subtotal: 0, discount: 0, tax: 0, total: 0 },
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: cartQueryKey,
    queryFn: async () => {
      const response = await cartApi.getCart();
      return normalizeCart(response?.data || response);
    },
    staleTime: 1000 * 60 * 2,
  });

  // =========================================================================
  // 2. DATA MUTATION: Optimistic Removal Pipeline
  // =========================================================================
  const removeItemMutation = useMutation({
    mutationFn: async (courseId) => await cartApi.removeFromCart(courseId),
    onMutate: async (courseId) => {
      await queryClient.cancelQueries({ queryKey: cartQueryKey });
      const previousCart = queryClient.getQueryData(cartQueryKey);

      queryClient.setQueryData(cartQueryKey, (old) => {
        if (!old) return old;
        const updatedCourses = (old.courses || []).filter(
          (c) => String(c.id) !== String(courseId) && String(c.courseId) !== String(courseId)
        );
        const subtotal = updatedCourses.reduce(
          (sum, item) => sum + (item.price || 0),
          0
        );
        return {
          ...old,
          courses: updatedCourses,
          subtotal,
          total: Math.max(0, subtotal - (old.discount || 0)),
        };
      });
      return { previousCart };
    },
    onError: (err, id, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(cartQueryKey, context.previousCart);
      }
      toast.error('Failed to sync cart modification.');
    },
    onSuccess: () => {
      toast.success('Course dropped from pipeline queue.', { icon: '✨' });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: cartQueryKey });
    },
  });

  // =========================================================================
  // 3. DATA MUTATION: Coupon Validation Engine
  // =========================================================================
  const applyCouponMutation = useMutation({
    mutationFn: async (code) => await cartApi.applyCoupon(code),
    onSuccess: (data) => {
      toast.success('Promotional hash applied successfully.');
      queryClient.invalidateQueries({ queryKey: cartQueryKey });
    },
    onError: (err) => {
      toast.error(
        err?.response?.data?.message || 'Invalid promotional hash code.'
      );
    },
  });

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    applyCouponMutation.mutate(couponCode.trim());
  };

  // =========================================================================
  // 4. CHECKOUT STAGING TRIGGER: Post queue to /api/v1/orders/stage
  // =========================================================================
  const handleProceedToCheckout = async () => {
    if (!cart?.courses || cart.courses.length === 0) {
      toast.error('Cannot checkout with an empty cart.');
      return;
    }

    setIsStaging(true);
    try {
      const courseIds = cart.courses
        .map((c) => Number(c.courseId || c.id))
        .filter((id) => !isNaN(id) && id > 0);

      const stagePayload = {
        userId: user?.id || null,
        courseIds,
        items: cart.courses,
        totalAmount: cart.total || cart.subtotal || 0,
        subtotal: cart.subtotal || 0,
        discount: cart.discount || 0,
        couponCode: cart.couponCode || null,
      };

      const stageRes = await orderApi.stageOrder(stagePayload);
      const stagedData = stageRes?.data || stageRes;
      const orderId =
        stagedData?.orderId ||
        stagedData?.id ||
        stagedData?.stagedOrderId ||
        `STG-${Date.now().toString().slice(-8)}`;

      toast.success('Order staged successfully. Transitioning to checkout matrix...', { icon: '🛡️' });
      navigate(`/checkout?id=${orderId}`);
    } catch (err) {
      console.error('[ShoppingCartWorkspace] Order staging error:', err);
      toast.error(err?.response?.data?.message || 'Failed to stage checkout order. Please try again.');
    } finally {
      setIsStaging(false);
    }
  };

  if (isLoading) {
    return (
      <GlobalLayoutWrapper showFooter={false}>
        <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-8 w-1/4 rounded bg-[#0F0F13]" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-28 w-full rounded-2xl bg-[#0F0F13]" />
              <Skeleton className="h-28 w-full rounded-2xl bg-[#0F0F13]" />
            </div>
            <Skeleton className="h-72 w-full rounded-2xl bg-[#0F0F13]" />
          </div>
        </div>
      </GlobalLayoutWrapper>
    );
  }

  return (
    <GlobalLayoutWrapper showFooter={true}>
      <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Title Meta Frame */}
        <div className="border-b border-white/[0.04] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold tracking-tight text-[#F5F5F7]">
                Shopping Cart Matrix
              </h1>
              <AnimatePresence>
                {isFetching && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <Loader2 className="w-4 h-4 text-[#C5A880] animate-spin" />
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
            <p className="text-xs text-[#8E8E93] font-light mt-0.5">
              Review your selected architecture tracks before compilation initialization.
            </p>
          </div>

          <div className="inline-flex items-center gap-2">
            <Badge
              variant="pewter"
              className="bg-[#14141A] text-[#8E8E93] border-white/5 font-mono text-[10px] px-2.5 py-0.5"
            >
              Single Seat Node License
            </Badge>
          </div>
        </div>

        {/* Dynamic Empty State Check */}
        {!cart?.courses || cart.courses.length === 0 ? (
          <EmptyState
            title="Cart Matrix Empty"
            description="No active curriculum nodes stacked in the current session pipeline queue."
            actionLabel="Return to Catalog Matrix"
            onAction={() => navigate('/courses')}
          />
        ) : (
          /* Primary Two-Column Content Grid Workspace (2:1 Asymmetric Split) */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Left Block: Product Summary Deck */}
            <div className="lg:col-span-2 space-y-4">
              <AnimatePresence mode="popLayout">
                {cart.courses.map((course) => (
                  <motion.div
                    key={course.id || course.courseId}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={SPRING}
                    className="p-5 rounded-2xl bg-[#0F0F13] border border-white/[0.04] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-white/10 transition-colors duration-300 relative overflow-hidden group"
                  >
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      {/* Sub-pixel Bounded Symbolic Frame */}
                      <div className="w-16 h-16 rounded-xl bg-[#14141A] border border-white/5 flex items-center justify-center shrink-0 text-[#8E8E93] group-hover:text-[#C5A880] transition-colors relative overflow-hidden">
                        {course.thumbnail && !course.thumbnail.includes('unsplash') ? (
                          <img
                            src={course.thumbnail}
                            alt={course.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <ShoppingBag className="w-5 h-5 opacity-40 group-hover:scale-105 transition-transform" />
                        )}
                      </div>
                      <div className="space-y-1 min-w-0">
                        <h4 className="text-sm font-bold text-[#F5F5F7] tracking-tight truncate pr-4">
                          {course.title || 'Advanced Computing Spec'}
                        </h4>
                        <p className="text-[10px] font-mono text-[#8E8E93] tracking-wide">
                          Node Lead:{' '}
                          <span className="text-[#E5E5E7]">
                            {course.instructor || 'Studio Principal Architect'}
                          </span>
                        </p>
                        <div className="inline-flex items-center gap-1.5 pt-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#C5A880]" />
                          <span className="text-[9px] font-mono uppercase tracking-wider text-[#8E8E93]">
                            Standard Digital License • 1 Seat
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Operational Actions Matrix */}
                    <div className="flex sm:flex-col items-baseline sm:items-end justify-between sm:justify-center gap-3 shrink-0 w-full sm:w-auto border-t sm:border-t-0 border-white/[0.04] pt-3 sm:pt-0">
                      <div className="text-right">
                        <span className="text-base font-black font-mono text-[#F5F5F7] block leading-none">
                          ₹{Number(course.price || 0).toFixed(2)}
                        </span>
                        {course.originalPrice && course.originalPrice > course.price && (
                          <span className="text-[10px] text-[#8E8E93] line-through font-mono">
                            ₹{Number(course.originalPrice).toFixed(2)}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => removeItemMutation.mutate(course.id || course.courseId)}
                        disabled={removeItemMutation.isPending}
                        className="text-[10px] font-mono text-rose-400/80 hover:text-rose-400 flex items-center gap-1.5 bg-rose-500/5 hover:bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/10 hover:border-rose-400/20 transition-all duration-200 cursor-pointer disabled:opacity-40"
                      >
                        <Trash2 className="w-3 h-3" /> Drop Node
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Right Block: Sticky Operational Summary Card */}
            <div className="p-6 rounded-2xl bg-[#0F0F13] border border-white/[0.04] space-y-6 sticky top-24">
              <h3 className="text-xs font-mono tracking-widest text-[#8E8E93] uppercase font-bold flex items-center gap-1.5">
                Billing Blueprint
              </h3>

              {/* Price Calculation Fields */}
              <div className="space-y-3 font-mono text-xs border-b border-white/[0.04] pb-4">
                <div className="flex justify-between text-[#8E8E93]">
                  <span>Pipeline Subtotal</span>
                  <span>₹{Number(cart.subtotal || 0).toFixed(2)}</span>
                </div>
                {cart.discount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-medium">
                    <span>Promotional Discount</span>
                    <span>-₹{Number(cart.discount).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#8E8E93]">
                  <span>Gateway Tax</span>
                  <span>₹0.00</span>
                </div>
                <div className="flex justify-between text-[#F5F5F7] font-bold text-sm pt-2 border-t border-white/[0.04]">
                  <span>Net Matrix Cost</span>
                  <span className="text-[#C5A880] text-base">
                    ₹{Number(cart.total || 0).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Promo Code Submission Engine */}
              <form onSubmit={handleApplyCoupon} className="space-y-2">
                <span className="block text-[10px] font-mono tracking-wider text-[#8E8E93] uppercase font-bold">
                  Apply Promo Hash
                </span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="ENTER_PROMO_CODE"
                    disabled={applyCouponMutation.isPending}
                    className="flex-1 bg-[#14141A] border border-white/5 rounded-xl px-3 py-2 text-xs font-mono text-[#F5F5F7] placeholder-white/20 focus:outline-none focus:border-[#C5A880]/40 transition-colors uppercase disabled:opacity-40"
                  />
                  <button
                    type="submit"
                    disabled={applyCouponMutation.isPending || !couponCode.trim()}
                    className="px-4 bg-[#14141A] border border-white/10 hover:border-[#C5A880]/40 text-xs font-mono font-bold text-[#E5E5E7] hover:text-[#F5F5F7] rounded-xl transition-all duration-200 disabled:opacity-30 flex items-center justify-center cursor-pointer"
                  >
                    {applyCouponMutation.isPending ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#C5A880]" />
                    ) : (
                      'Apply'
                    )}
                  </button>
                </div>
              </form>

              {/* Secure Checkout Activation Node */}
              <div className="space-y-3 pt-2">
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleProceedToCheckout}
                  disabled={isStaging || !cart?.courses || cart.courses.length === 0}
                  className="w-full py-3 bg-[#C5A880] text-[#070709] rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#D4BC98] shadow-lg shadow-[#C5A880]/10 transition-all duration-300 group cursor-pointer disabled:opacity-50"
                >
                  {isStaging ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#070709]" />
                      <span>Staging Order Matrix...</span>
                    </>
                  ) : (
                    <>
                      <span>Proceed to Checkout Matrix</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </motion.button>

                <div className="flex items-center justify-center gap-1.5 text-[10px] font-mono text-[#8E8E93]">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Secure gateway protected via TLS 1.3</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </GlobalLayoutWrapper>
  );
}
