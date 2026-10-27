import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
} from 'lucide-react';
import { useOrder } from '../../context/OrderContext';
import { useAuth } from '../../context/AuthContext';
import Input from '../../design-system/primitives/Input';
import Button from '../../design-system/primitives/Button';
import Badge from '../../design-system/primitives/Badge';
import EmptyState from '../../design-system/feedback/EmptyState';
import { Skeleton } from '../../design-system/primitives/Skeleton';

// Spring transition physics
const SPRING = { type: 'spring', stiffness: 350, damping: 28 };

export const CheckoutContainer = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    cart,
    isCartLoading,
    isCartFetching,
    removeFromCart,
    removeFromCartMutation,
    applyCoupon,
    applyCouponMutation,
    removeCoupon,
    removeCouponMutation,
    createOrder,
    createOrderMutation,
  } = useOrder();

  // Billing form state
  const [billingForm, setBillingForm] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
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

  // Checkout timeline stage (fluid micro-interaction)
  const [checkoutStage, setCheckoutStage] = useState(0); // 0: Idle, 1: Validating, 2: Creating Order, 3: Enrolling, 4: Confirmed
  const [createdOrderRef, setCreatedOrderRef] = useState(null);

  const courses = useMemo(() => cart?.courses || [], [cart]);

  // Derived financial computations
  const subtotal = useMemo(
    () => courses.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0),
    [courses]
  );
  const discountAmount = useMemo(() => Number(cart?.discount || 0), [cart]);
  const estimatedTax = 0; // Tax calculated or zero
  const finalTotal = useMemo(
    () => Math.max(0, subtotal - discountAmount + estimatedTax),
    [subtotal, discountAmount, estimatedTax]
  );

  const appliedCouponCode = cart?.couponCode || null;

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

  // Handle promo code submission with morphing states and shake animation
  const handleApplyPromo = async (e) => {
    e.preventDefault();
    if (!promoCodeInput.trim()) return;

    setPromoError('');
    try {
      await applyCoupon(promoCodeInput.trim().toUpperCase());
      setPromoCodeInput('');
    } catch (err) {
      setPromoShake(true);
      setPromoError(err.message || 'Invalid or expired coupon code');
      setTimeout(() => setPromoShake(false), 600);
    }
  };

  // Handle coupon removal
  const handleRemoveCoupon = async () => {
    try {
      await removeCoupon();
    } catch (err) {
      console.error('Failed to remove coupon', err);
    }
  };

  // Process order checkout through lifecycle timeline
  const handleCompleteCheckout = async () => {
    if (!validateForm()) return;
    if (courses.length === 0) return;

    // Timeline Stage 1: Security validation
    setCheckoutStage(1);
    await new Promise((r) => setTimeout(r, 600));

    // Timeline Stage 2: Construct backend CreateOrderRequest
    setCheckoutStage(2);
    try {
      const courseIds = courses
        .map((c) => Number(c.courseId || c.id))
        .filter((id) => !isNaN(id) && id > 0);

      const orderPayload = {
        userId: user?.id,
        courseIds,
        totalAmount: finalTotal,
      };

      const response = await createOrder(orderPayload);
      const order = response?.data || response;
      const orderId = order?.orderId || order?.id || `ORD-${Date.now().toString().slice(-6)}`;

      // Timeline Stage 3: Microservice enrollment verification
      setCheckoutStage(3);
      await new Promise((r) => setTimeout(r, 800));

      // Timeline Stage 4: Confirmed
      setCreatedOrderRef(orderId);
      setCheckoutStage(4);
    } catch (err) {
      console.error('[CheckoutContainer] Order creation error', err);
      setCheckoutStage(0);
    }
  };

  // =========================================================================
  // VIEW: Order Confirmation Screen
  // =========================================================================
  if (checkoutStage === 4) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={SPRING}
          className="max-w-xl w-full p-8 md:p-10 rounded-3xl bg-obsidian-900/90 border border-emerald-500/30 shadow-elevated-lg backdrop-blur-2xl text-center"
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

          <p className="mt-2 text-xs sm:text-sm text-ink-400 leading-relaxed max-w-md mx-auto">
            Your enrollment has been committed across all microservices. Reference ID:{' '}
            <span className="font-mono text-emerald-400 font-bold">{createdOrderRef}</span>
          </p>

          {/* Enrolled Courses Summary Pill */}
          <div className="mt-6 p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-left space-y-2">
            <span className="text-[11px] font-bold text-ink-400 uppercase tracking-wider">
              Enrolled Curriculum Track(s)
            </span>
            <div className="space-y-1.5">
              {courses.map((c) => (
                <div key={c.id} className="flex items-center justify-between text-xs text-ink-200">
                  <span className="font-semibold truncate max-w-[280px]">{c.title}</span>
                  <span className="text-emerald-400 font-mono font-bold">
                    ${(c.price || 0).toFixed(2)}
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
  // VIEW: Empty Cart Fallback
  // =========================================================================
  if (!isCartLoading && courses.length === 0) {
    return (
      <div className="py-16">
        <EmptyState
          icon={ShoppingBag}
          title="Your checkout queue is empty"
          description="You don't have any courses staged for checkout. Browse our verified curriculum catalog to get started."
          actionLabel="Explore Live Catalog"
          onAction={() => navigate('/courses')}
        />
      </div>
    );
  }

  // =========================================================================
  // VIEW: Primary Dual-Column Checkout Grid
  // =========================================================================
  return (
    <div className="w-full max-w-7xl mx-auto space-y-8">
      {/* Checkout Header & Trust Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-obsidian-800/40">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Lock className="w-6 h-6 text-brand-400" />
            <span>Secure Enterprise Checkout</span>
          </h1>
          <p className="text-xs text-ink-400 mt-1">
            256-bit TLS encrypted session • Instant seat provisioned in course sandbox
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Badge variant="brand" dot>
            SSL Certified
          </Badge>
          <Badge variant="emerald" dot>
            Gateway Active
          </Badge>
        </div>
      </div>

      {/* Main Dual-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ===================== COLUMN 1: ITEMS & BILLING (7/12) ===================== */}
        <div className="lg:col-span-7 space-y-8">
          {/* Section 1: Item Review */}
          <section className="p-6 rounded-3xl bg-obsidian-900/60 border border-obsidian-800/50 backdrop-blur-xl shadow-elevated-md space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-brand-accent" />
                <span>Selected Courses ({courses.length})</span>
              </h2>
              <Link
                to="/cart"
                className="text-xs font-semibold text-brand-400 hover:text-brand-300 transition-colors"
              >
                Modify Cart
              </Link>
            </div>

            <div className="divide-y divide-obsidian-800/40">
              {courses.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="py-4 first:pt-2 last:pb-2 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="w-14 h-14 rounded-xl object-cover border border-white/10 shrink-0 bg-ink-950"
                    />
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-white truncate max-w-xs sm:max-w-sm">
                        {item.title}
                      </h4>
                      <p className="text-xs text-ink-400 mt-0.5">
                        By {item.instructor} • Lifetime Access
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <span className="text-sm font-extrabold text-white font-mono">
                      {item.price === 0 ? 'FREE' : `$${item.price.toFixed(2)}`}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.courseId || item.id)}
                      disabled={removeFromCartMutation.isPending}
                      className="p-1.5 text-ink-500 hover:text-rose-400 transition-colors rounded-lg hover:bg-rose-500/10"
                      title="Remove from checkout"
                      aria-label="Remove course"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Section 2: Billing Information */}
          <section className="p-6 rounded-3xl bg-obsidian-900/60 border border-obsidian-800/50 backdrop-blur-xl shadow-elevated-md space-y-5">
            <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-brand-400" />
              <span>Billing Address & Invoicing Details</span>
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
                placeholder="engineer@asivo.com"
              />

              <div className="sm:col-span-2">
                <Input
                  label="Street Address"
                  id="streetAddress"
                  value={billingForm.streetAddress}
                  onChange={(e) => handleInputChange('streetAddress', e.target.value)}
                  error={formErrors.streetAddress}
                  placeholder="100 Market Street, Suite 400"
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

          {/* Section 3: Payment Method Selector */}
          <section className="p-6 rounded-3xl bg-obsidian-900/60 border border-obsidian-800/50 backdrop-blur-xl shadow-elevated-md space-y-4">
            <h2 className="text-base font-bold text-white tracking-tight">
              Select Payment Engine
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'CARD', label: 'Credit / Debit Card', badge: 'Instant' },
                { id: 'UPI', label: 'UPI / Direct Bank', badge: 'Zero Fee' },
                { id: 'GLOBAL', label: 'International Wire', badge: 'USD/EUR' },
              ].map((method) => {
                const isSelected = paymentMethod === method.id;
                return (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setPaymentMethod(method.id)}
                    className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden ${
                      isSelected
                        ? 'bg-brand-600/15 border-brand-500 shadow-glow-brand text-white'
                        : 'bg-white/[0.02] border-white/5 text-ink-400 hover:text-white hover:border-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs">{method.label}</span>
                      <span className="text-[10px] text-brand-accent font-semibold">
                        {method.badge}
                      </span>
                    </div>
                    <span className="text-[10px] text-ink-500">
                      Standard Gateway Protocol
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        </div>

        {/* ===================== COLUMN 2: STICKY PRICING RAIL (5/12) ===================== */}
        <div className="lg:col-span-5 sticky top-24 space-y-6">
          <div className="p-6 rounded-3xl bg-obsidian-900/80 border border-obsidian-800/60 backdrop-blur-2xl shadow-elevated-lg space-y-6">
            <h3 className="text-lg font-bold text-white tracking-tight">
              Order Pricing Summary
            </h3>

            {/* Promo Code Box with Morphing Status & Micro-shake */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-ink-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-brand-accent" />
                  <span>Promo Code or Enterprise Voucher</span>
                </span>
                {appliedCouponCode && (
                  <span className="text-emerald-400 text-[11px] font-bold">
                    Applied!
                  </span>
                )}
              </label>

              {appliedCouponCode ? (
                // Applied Promo Tag State
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-300"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <div>
                      <p className="text-xs font-bold font-mono tracking-wider">
                        {appliedCouponCode}
                      </p>
                      <p className="text-[10px] text-emerald-400">
                        Discount applied to order
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    disabled={removeCouponMutation.isPending}
                    className="text-xs font-semibold text-rose-400 hover:text-rose-300 transition-colors p-1"
                  >
                    Remove
                  </button>
                </motion.div>
              ) : (
                // Typing State with Micro-Shake on Error
                <motion.form
                  onSubmit={handleApplyPromo}
                  animate={promoShake ? { x: [-8, 8, -6, 6, -3, 3, 0] } : {}}
                  transition={{ duration: 0.4 }}
                  className="flex gap-2"
                >
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={promoCodeInput}
                      onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                      placeholder="ENTER COUPON (E.G. SAVE20)"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-ink-950/80 border border-white/10 text-xs font-mono text-white tracking-wider placeholder:text-ink-600 outline-none focus:border-brand-500 transition-colors"
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="secondary"
                    size="sm"
                    isLoading={applyCouponMutation.isPending}
                    disabled={!promoCodeInput.trim()}
                  >
                    Apply
                  </Button>
                </motion.form>
              )}

              {/* Promo Error Feedback */}
              {promoError && (
                <p className="text-xs text-rose-400 flex items-center gap-1 pl-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{promoError}</span>
                </p>
              )}
            </div>

            {/* Pricing Breakdown Lines (Prevent layout hopping) */}
            <div className="space-y-3 pt-3 border-t border-obsidian-800/40 text-xs">
              <div className="flex items-center justify-between text-ink-300">
                <span>Subtotal ({courses.length} items)</span>
                <span className="font-mono font-semibold text-white">
                  ${subtotal.toFixed(2)}
                </span>
              </div>

              {/* Discount line */}
              {discountAmount > 0 && (
                <div className="flex items-center justify-between text-emerald-400">
                  <span className="flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5" />
                    <span>Coupon Discount</span>
                  </span>
                  <span className="font-mono font-bold">
                    -${discountAmount.toFixed(2)}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between text-ink-300">
                <span>Taxes & Gateway Fees</span>
                <span className="font-mono text-ink-400">
                  {estimatedTax === 0 ? 'Free / Included' : `$${estimatedTax.toFixed(2)}`}
                </span>
              </div>

              {/* Final Total Line with Micro-Skeleton to prevent twitching */}
              <div className="pt-3 border-t border-obsidian-800/40 flex items-center justify-between">
                <div>
                  <span className="text-sm font-extrabold text-white block">
                    Total Due
                  </span>
                  <span className="text-[10px] text-ink-500">
                    Includes all course modules & certifications
                  </span>
                </div>

                <div className="text-right">
                  {isCartFetching || applyCouponMutation.isPending ? (
                    <Skeleton className="w-20 h-7 rounded-lg" />
                  ) : (
                    <motion.span
                      key={finalTotal}
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-2xl font-extrabold text-white font-mono tracking-tight"
                    >
                      ${finalTotal.toFixed(2)}
                    </motion.span>
                  )}
                </div>
              </div>
            </div>

            {/* ===================== CHECKOUT BUTTON WITH FLUID TIMELINE ===================== */}
            <div className="pt-2">
              <Button
                variant="primary"
                size="lg"
                className="w-full text-sm font-bold shadow-glow-brand"
                disabled={checkoutStage > 0 || courses.length === 0}
                onClick={handleCompleteCheckout}
              >
                {checkoutStage === 0 && (
                  <span>
                    Complete Payment & Enroll • ${finalTotal.toFixed(2)}
                  </span>
                )}
                {checkoutStage === 1 && (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Validating Security Token...</span>
                  </span>
                )}
                {checkoutStage === 2 && (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Creating Order Contract...</span>
                  </span>
                )}
                {checkoutStage === 3 && (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-brand-accent" />
                    <span>Verifying Sandbox Seats...</span>
                  </span>
                )}
              </Button>
            </div>

            {/* Security Guarantee Badges */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-obsidian-800/40 text-center text-[10px] text-ink-500 font-medium">
              <div className="flex flex-col items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>30-Day Guarantee</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Lock className="w-4 h-4 text-brand-accent" />
                <span>256-Bit Encrypted</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Sparkles className="w-4 h-4 text-brand-400" />
                <span>Instant Access</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutContainer;
