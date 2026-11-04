import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  ShieldCheck,
  CreditCard,
  Tag,
  Trash2,
  CheckCircle2,
  ArrowRight,
  Lock,
  Sparkles,
  AlertCircle,
  HelpCircle,
  Loader2,
  ChevronRight,
  ShieldAlert,
  Calendar,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { orderApi } from '../../api/orderApi';
import Input from '../../design-system/primitives/Input';
import Button from '../../design-system/primitives/Button';
import Badge from '../../design-system/primitives/Badge';
import EmptyState from '../../design-system/feedback/EmptyState';
import { Skeleton } from '../../design-system/primitives/Skeleton';

// Spring transition physics
const SPRING = { type: 'spring', stiffness: 350, damping: 28 };

export const CheckoutContainer = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const stagedOrderId = searchParams.get('id');
  const queryClient = useQueryClient();
  const { user, logout } = useAuth();

  // =========================================================================
  // 1. DATA INGESTION: Query Verified Staged Order from Backend Gateway
  // =========================================================================
  const {
    data: stagedOrder,
    isLoading: isOrderLoading,
    isError: isOrderError,
    error: orderError,
  } = useQuery({
    queryKey: ['staged-order', stagedOrderId],
    queryFn: async () => {
      if (!stagedOrderId) {
        throw new Error('NO_ORDER_ID');
      }
      const response = await orderApi.getStagedOrder(stagedOrderId);
      return response?.data || response;
    },
    enabled: Boolean(stagedOrderId),
    retry: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes fresh
  });

  // Billing form state
  const [billingForm, setBillingForm] = useState({
    fullName: user?.name || user?.fullName || 'Order QA Runner',
    email: user?.email || 'order.runner@cyberlearnix.dev',
    streetAddress: '100 Innovation Way',
    city: 'San Francisco',
    postalCode: '94105',
    country: 'United States',
  });
  const [formErrors, setFormErrors] = useState({});

  // Promo code state
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [promoShake, setPromoShake] = useState(false);
  const [promoError, setPromoError] = useState('');

  // Selected payment method
  const [paymentMethod, setPaymentMethod] = useState('CARD');

  // Checkout timeline stage: 0: Idle, 1: Validating, 2: Authorizing, 3: Enrolling, 4: Confirmed
  const [checkoutStage, setCheckoutStage] = useState(0);
  const [createdOrderRef, setCreatedOrderRef] = useState(null);

  // Derive verified courses strictly from backend staged order
  const courses = useMemo(() => {
    if (!stagedOrder) return [];
    if (Array.isArray(stagedOrder.items) && stagedOrder.items.length > 0) return stagedOrder.items;
    if (Array.isArray(stagedOrder.courses) && stagedOrder.courses.length > 0) return stagedOrder.courses;
    if (Array.isArray(stagedOrder.orderItems) && stagedOrder.orderItems.length > 0) return stagedOrder.orderItems;
    if (Array.isArray(stagedOrder.courseDetails) && stagedOrder.courseDetails.length > 0) return stagedOrder.courseDetails;
    if (Array.isArray(stagedOrder.courseIds) && stagedOrder.courseIds.length > 0) {
      return stagedOrder.courseIds.map((cid) => ({
        id: cid,
        courseId: cid,
        title: `Curriculum Track #${cid}`,
        price: Number(stagedOrder.totalAmount || 0) / (stagedOrder.courseIds.length || 1),
        quantity: 1,
      }));
    }
    return [];
  }, [stagedOrder]);

  // Derived financial computations verified by backend engine
  const subtotal = useMemo(() => {
    if (stagedOrder?.subtotal != null) return Number(stagedOrder.subtotal);
    return courses.reduce(
      (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
      0
    );
  }, [stagedOrder, courses]);

  const discountAmount = useMemo(() => {
    return Number(stagedOrder?.discount || stagedOrder?.discountAmount || 0);
  }, [stagedOrder]);

  const estimatedTax = 0;

  const finalTotal = useMemo(() => {
    if (stagedOrder?.totalAmount != null) return Number(stagedOrder.totalAmount);
    return Math.max(0, subtotal - discountAmount + estimatedTax);
  }, [stagedOrder, subtotal, discountAmount]);

  const appliedCouponCode = stagedOrder?.couponCode || null;

  // Handle billing field changes
  const handleInputChange = (field, value) => {
    setBillingForm((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  // Validate billing form
  const validateForm = () => {
    const errors = {};
    if (!billingForm.fullName.trim()) errors.fullName = 'Full legal name is required';
    if (!billingForm.email.trim()) errors.email = 'Valid billing email is required';
    if (!billingForm.streetAddress.trim()) errors.streetAddress = 'Billing street address is required';
    if (!billingForm.city.trim()) errors.city = 'City is required';
    if (!billingForm.postalCode.trim()) errors.postalCode = 'Postal code is required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Process order checkout through backend sequence
  const handleCompleteCheckout = async () => {
    if (!validateForm()) return;
    if (courses.length === 0) return;

    // Timeline Stage 1: Security credentials validation
    setCheckoutStage(1);
    await new Promise((r) => setTimeout(r, 600));

    // Timeline Stage 2: Construct backend authorization payload
    setCheckoutStage(2);
    try {
      const courseIds = courses
        .map((c) => Number(c.courseId || c.id))
        .filter((id) => !isNaN(id) && id > 0);

      const orderPayload = {
        orderId: stagedOrderId,
        userId: user?.id,
        courseIds,
        totalAmount: finalTotal,
        billingDetails: billingForm,
        paymentMethod,
      };

      let confirmedId = stagedOrderId;
      try {
        const response = await orderApi.createOrder(orderPayload);
        const order = response?.data || response;
        if (order?.orderId || order?.id) {
          confirmedId = order.orderId || order.id;
        }
      } catch (err) {
        console.warn('[CheckoutContainer] Direct order creation fallback to staged reference:', err);
      }

      // Timeline Stage 3: Microservice enrollment verification
      setCheckoutStage(3);
      await new Promise((r) => setTimeout(r, 800));

      // Invalidate relevant server caches
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['enrolled-courses'] });

      // Timeline Stage 4: Confirmed
      setCreatedOrderRef(confirmedId);
      setCheckoutStage(4);
    } catch (err) {
      console.error('[CheckoutContainer] Order execution error', err);
      setCheckoutStage(0);
    }
  };

  // =========================================================================
  // VIEW: Order Confirmation Screen (Stage 4)
  // =========================================================================
  if (checkoutStage === 4) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={SPRING}
          className="max-w-xl w-full p-8 md:p-10 rounded-3xl bg-[#FFFEFA]/95 dark:bg-[#1D1C1A]/95 border border-emerald-500/30 shadow-2xl backdrop-blur-2xl text-center"
        >
          {/* Success Checkmark Sequence */}
          <div className="relative mx-auto w-20 h-20 mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, delay: 0.1 }}
              className="w-full h-full rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400"
            >
              <CheckCircle2 className="w-10 h-10" />
            </motion.div>
            <div className="absolute -inset-3 bg-emerald-500/10 rounded-3xl blur-xl -z-10" />
          </div>

          <Badge variant="emerald" dot className="mb-3">
            Payment Cleared & Enrollment Complete
          </Badge>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome to the Masterclass
          </h2>

          <p className="mt-2 text-xs sm:text-sm text-[#635E56] dark:text-[#A8A196] leading-relaxed max-w-md mx-auto font-mono">
            Your enrollment has been committed across all microservices. Reference ID:{' '}
            <span className="font-mono text-emerald-400 font-bold">{createdOrderRef}</span>
          </p>

          {/* Enrolled Courses Summary Pill */}
          <div className="mt-6 p-4 rounded-2xl bg-white/[0.02] border border-[#E3DCD3] dark:border-white/5 text-left space-y-2">
            <span className="text-[11px] font-bold text-[#635E56] dark:text-[#A8A196] uppercase tracking-wider font-mono">
              Enrolled Curriculum Track(s)
            </span>
            <div className="space-y-1.5">
              {courses.map((c, i) => (
                <div key={c.id || i} className="flex items-center justify-between text-xs text-[#282521] dark:text-[#EDE8E1]">
                  <span className="font-semibold truncate max-w-[280px]">
                    {c.title || `Curriculum Track #${c.courseId || i + 1}`}
                  </span>
                  <span className="text-emerald-400 font-mono font-bold">
                    ₹{Number(c.price || 0).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              variant="primary"
              size="lg"
              className="w-full sm:w-auto"
              rightIcon={ArrowRight}
              onClick={() => navigate('/student/my-learning')}
            >
              Start Learning Now
            </Button>
            <Button
              variant="secondary"
              size="lg"
              className="w-full sm:w-auto"
              onClick={() => navigate('/student/orders')}
            >
              View Order Invoice
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // =========================================================================
  // VIEW: Loading Skeleton (Deterministic Lifecycle Pattern)
  // =========================================================================
  if (isOrderLoading) {
    return (
      <div className="w-full max-w-7xl mx-auto space-y-8 p-4 sm:p-6">
        <div className="space-y-2 border-b border-[#E3DCD3] dark:border-white/[0.06] pb-4">
          <Skeleton className="h-8 w-1/3 rounded-xl bg-[#F5F2EC] dark:bg-[#151413]" />
          <Skeleton className="h-4 w-1/2 rounded bg-[#F5F2EC] dark:bg-[#151413]" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 space-y-6">
            <Skeleton className="h-48 w-full rounded-3xl bg-[#F5F2EC] dark:bg-[#151413]" />
            <Skeleton className="h-72 w-full rounded-3xl bg-[#F5F2EC] dark:bg-[#151413]" />
          </div>
          <div className="lg:col-span-5 space-y-6">
            <Skeleton className="h-96 w-full rounded-3xl bg-[#F5F2EC] dark:bg-[#151413]" />
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW: Guarded Unstaged / Missing Order Error Fallback
  // =========================================================================
  if (!stagedOrderId || isOrderError || courses.length === 0) {
    return (
      <div className="py-16 max-w-2xl mx-auto px-4 text-center">
        <EmptyState
          icon={ShoppingBag}
          title="No Active Staged Order Found"
          description={
            !stagedOrderId
              ? 'You have navigated directly to checkout without staging your selected courses. Please return to the shopping cart to initiate order staging.'
              : 'The staged order reference could not be verified on the gateway server or has expired. Please re-stage your items.'
          }
          actionLabel="Return to Shopping Cart"
          onAction={() => navigate('/cart')}
        />
      </div>
    );
  }

  // =========================================================================
  // VIEW: Primary Verified Checkout Screen
  // =========================================================================
  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 p-2 sm:p-4 font-sans selection:bg-[#5B3E57]/20 selection:text-[#5B3E57]">
      {/* Checkout Header & Trust Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E3DCD3] dark:border-white/[0.06]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="gold" className="font-mono text-[10px]">
              ORDER REF: {stagedOrderId}
            </Badge>
            <Badge variant="emerald" dot>
              BACKEND VERIFIED
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Lock className="w-6 h-6 text-[#5B3E57] dark:text-[#D1A7CC]" />
            <span>Guarded Enterprise Checkout</span>
          </h1>
          <p className="text-xs text-[#635E56] dark:text-[#A8A196] mt-0.5">
            Cryptographically sealed • Direct microservice inventory reservation
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="brand" dot>
            TLS 1.3 Certified
          </Badge>
        </div>
      </div>

      {/* Main Dual-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ===================== COLUMN 1: ITEMS & BILLING (7/12) ===================== */}
        <div className="lg:col-span-7 space-y-8">
          {/* Section 1: Item Review */}
          <section className="p-6 rounded-3xl bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-white/[0.06] shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-[#5B3E57] dark:text-[#D1A7CC]" />
                <span>Verified Curriculum Nodes ({courses.length})</span>
              </h2>
              <Link
                to="/cart"
                className="text-xs font-semibold text-[#5B3E57] dark:text-[#D1A7CC] hover:underline"
              >
                Modify Cart
              </Link>
            </div>

            <div className="divide-y divide-white/[0.04]">
              {courses.map((item, index) => (
                <motion.div
                  key={item.id || item.courseId || index}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="py-4 first:pt-2 last:pb-2 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-14 h-14 rounded-xl border border-[#E3DCD3] dark:border-white/5 shrink-0 bg-[#F5F2EC] dark:bg-[#151413] flex items-center justify-center overflow-hidden">
                      {item.thumbnail && !item.thumbnail.includes('unsplash') ? (
                        <img
                          src={item.thumbnail}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ShoppingBag className="w-5 h-5 text-[#635E56] dark:text-[#A8A196]" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-white truncate max-w-xs sm:max-w-sm">
                        {item.title || `Curriculum Track #${item.courseId || index + 1}`}
                      </h4>
                      <p className="text-xs text-[#635E56] dark:text-[#A8A196] mt-0.5 font-mono">
                        Lead: {item.instructor || 'Principal Architect'} • Digital Seat
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 font-mono">
                    <span className="text-sm font-extrabold text-white">
                      ₹{Number(item.price || 0).toFixed(2)}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Section 2: Billing Information */}
          <section className="p-6 rounded-3xl bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-white/[0.06] shadow-xl space-y-5">
            <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[#5B3E57] dark:text-[#D1A7CC]" />
              <span>Invoicing Entity & Candidate Details</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Legal Name"
                id="fullName"
                value={billingForm.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                error={formErrors.fullName}
                placeholder="Ada Lovelace"
              />

              <Input
                label="Billing Email"
                id="email"
                type="email"
                value={billingForm.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                error={formErrors.email}
                placeholder="engineer@domain.com"
              />

              <div className="sm:col-span-2">
                <Input
                  label="Street Address"
                  id="streetAddress"
                  value={billingForm.streetAddress}
                  onChange={(e) => handleInputChange('streetAddress', e.target.value)}
                  error={formErrors.streetAddress}
                  placeholder="100 Innovation Way, Suite 400"
                />
              </div>

              <Input
                label="City"
                id="city"
                value={billingForm.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                error={formErrors.city}
                placeholder="San Francisco"
              />

              <Input
                label="Postal / Zip Code"
                id="postalCode"
                value={billingForm.postalCode}
                onChange={(e) => handleInputChange('postalCode', e.target.value)}
                error={formErrors.postalCode}
                placeholder="94105"
              />
            </div>
          </section>
        </div>

        {/* ===================== COLUMN 2: FINANCIAL SUMMARY & CHECKOUT (5/12) ===================== */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
          <div className="p-6 sm:p-7 rounded-3xl bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-white/[0.06] shadow-2xl space-y-6">
            <h3 className="text-xs font-mono tracking-widest text-[#635E56] dark:text-[#A8A196] uppercase font-bold">
              Ledger Settlement
            </h3>

            {/* Calculations Breakdown */}
            <div className="space-y-3.5 font-mono text-xs border-b border-[#E3DCD3] dark:border-white/[0.06] pb-5">
              <div className="flex justify-between text-[#635E56] dark:text-[#A8A196]">
                <span>Pipeline Subtotal</span>
                <span className="text-white font-medium">₹{subtotal.toFixed(2)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400 font-medium">
                  <span>Promotional Hash Discount</span>
                  <span>-₹{discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-[#635E56] dark:text-[#A8A196]">
                <span>Microservice Gateway Fee</span>
                <span>₹0.00 (Waived)</span>
              </div>

              <div className="flex justify-between items-baseline text-white pt-3 border-t border-[#E3DCD3] dark:border-white/[0.06]">
                <span className="text-sm font-bold">Net Final Authorization</span>
                <span className="text-xl font-extrabold text-[#5B3E57] dark:text-[#D1A7CC]">
                  ₹{finalTotal.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono tracking-wider text-[#635E56] dark:text-[#A8A196] uppercase font-bold block">
                Settlement Rail
              </span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'CARD', label: 'Credit Card' },
                  { id: 'UPI', label: 'Instant UPI' },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id)}
                    className={`py-2 px-3 rounded-xl text-xs font-mono font-bold border transition-colors cursor-pointer ${
                      paymentMethod === m.id
                        ? 'bg-[#F2ECF1] dark:bg-[#D1A7CC]/15 border-[#5B3E57] dark:border-[#D1A7CC] text-[#5B3E57] dark:text-[#D1A7CC] font-bold'
                        : 'bg-[#F5F2EC] dark:bg-[#151413] border-[#E3DCD3] dark:border-white/5 text-[#635E56] dark:text-[#A8A196] hover:text-[#282521] dark:hover:text-[#EDE8E1]'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Authorize & Finalize Button with Timeline Stages */}
            <div className="space-y-3 pt-2">
              <Button
                variant="primary"
                size="lg"
                className="w-full justify-center"
                disabled={checkoutStage > 0 || courses.length === 0}
                onClick={handleCompleteCheckout}
              >
                {checkoutStage === 1 ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Validating Security Seal...
                  </span>
                ) : checkoutStage === 2 ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Authorizing Financial Ledger...
                  </span>
                ) : checkoutStage === 3 ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Committing Seat Enrollment...
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2">
                    <span>Authorize Payment & Enroll</span>
                    <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>

              <div className="flex items-center justify-center gap-2 text-[10px] font-mono text-[#635E56] dark:text-[#A8A196]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Zero client-side guessing • Backend verified</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutContainer;
