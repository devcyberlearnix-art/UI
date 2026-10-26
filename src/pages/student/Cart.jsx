import { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Loader2,
  ShoppingCart,
  Trash2,
  X,
  Plus,
  Minus,
  CheckCircle2,
  AlertCircle,
  Percent,
  RefreshCw,
  ShoppingBag,
} from "lucide-react";
import toast from "react-hot-toast";
import { cartApi, normalizeCart } from "../../api/cartApi";
import { useAuth } from "../../context/AuthContext";

const Cart = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [cartItems, setCartItems] = useState([]);
  const [cartSummary, setCartSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [couponError, setCouponError] = useState("");

  const activeRequestIdRef = useRef(0);

  const loadCart = async () => {
    const requestId = ++activeRequestIdRef.current;
    setLoading(true);
    setError("");
    try {
      const response = await cartApi.getCart();
      if (requestId !== activeRequestIdRef.current) return;

      const normalized = normalizeCart(response);
      setCartItems(normalized.courses);
      setCartSummary({
        subtotal: normalized.subtotal,
        discount: normalized.discount,
        tax: normalized.tax,
        total: normalized.total,
        couponCode: normalized.couponCode,
      });

      if (normalized.couponCode) {
        setAppliedCoupon({ code: normalized.couponCode });
        setCouponCode(normalized.couponCode);
      }
    } catch (err) {
      if (requestId !== activeRequestIdRef.current) return;
      console.error("[Cart] Failed to load cart", err);
      setError(err.response?.data?.message || err.message || "Failed to load cart");
      setCartItems([]);
    } finally {
      if (requestId === activeRequestIdRef.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadCart();
  }, [user]);

  const removeItem = async (itemId) => {
    try {
      await cartApi.removeFromCart(itemId);
      setCartItems((prev) => prev.filter((item) => String(item.id) !== String(itemId)));
      await loadCart();
      toast.success("Item removed from cart");
    } catch (err) {
      toast.error("Failed to remove item");
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    
    try {
      await cartApi.updateCartQuantity(itemId, newQuantity);
      setCartItems((prev) =>
        prev.map((item) =>
          String(item.id) === String(itemId) ? { ...item, quantity: newQuantity } : item
        )
      );
      await loadCart();
    } catch (err) {
      toast.error("Failed to update quantity");
    }
  };

  const clearCart = async () => {
    try {
      await cartApi.clearCart();
      setCartItems([]);
      setCartSummary(null);
      setAppliedCoupon(null);
      toast.success("Cart cleared");
    } catch (err) {
      toast.error("Failed to clear cart");
    }
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code");
      return;
    }

    setValidatingCoupon(true);
    setCouponError("");

    try {
      // Backend Cart Service handles coupon validation internally
      // PUT /api/v1/cart/coupon with CouponRequest { couponCode }
      const response = await cartApi.applyCoupon(couponCode.trim());
      const couponData = response?.data || response;

      // Backend returns CouponApplyResponse: { couponCode, discount, totalAmount }
      // Must verify backend confirmed valid coupon with discount > 0
      if (couponData && couponData.couponCode && Number(couponData.discount) > 0) {
        setAppliedCoupon({
          code: couponData.couponCode,
          discount: Number(couponData.discount),
        });
        setCouponError("");
        toast.success("Coupon applied successfully!");
        await loadCart();
      } else {
        setAppliedCoupon(null);
        const msg = couponData?.message || "Invalid or ineligible coupon code";
        setCouponError(msg);
        toast.error(msg);
      }
    } catch (err) {
      console.error("[Cart] Coupon application failed", err);
      setAppliedCoupon(null);
      const msg = err.response?.data?.message || err.message || "Invalid coupon code";
      setCouponError(msg);
      toast.error(msg);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const removeCoupon = async () => {
    try {
      await cartApi.removeCoupon();
      setAppliedCoupon(null);
      setCouponCode("");
      toast.success("Coupon removed");
      await loadCart();
    } catch (err) {
      toast.error("Failed to remove coupon");
    }
  };

  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0),
    [cartItems]
  );

  const discount = appliedCoupon?.discount ?? cartSummary?.discount ?? 0;
  const total = Math.max(0, subtotal - discount + (cartSummary?.tax || 0));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4">
          <Loader2 className="animate-spin text-orange-500 w-12 h-12 mx-auto" />
          <p className="text-sm text-slate-600">Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-orange-100 flex items-center justify-center">
            <ShoppingCart size={48} className="text-orange-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Your cart is empty</h2>
          <p className="text-slate-500 mb-6">
            Browse our courses and add your favorites to start learning.
          </p>
          <button
            onClick={() => navigate("/courses")}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold hover:from-orange-600 hover:to-amber-600 transition shadow-lg shadow-orange-500/25"
          >
            <ShoppingBag size={18} />
            Browse Courses
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-black text-slate-900 mb-2">Shopping Cart</h1>
          <p className="text-slate-500">
            {cartItems.length} {cartItems.length === 1 ? "course" : "courses"} in your cart
          </p>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 flex items-center gap-3 text-red-700"
          >
            <AlertCircle size={18} />
            <span className="text-sm">{error}</span>
            <button onClick={loadCart} className="ml-auto text-red-600 hover:text-red-800">
              <RefreshCw size={16} />
            </button>
          </motion.div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item, idx) => (
              <motion.div
                key={item.id || item.courseId || `item-${idx}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6"
              >
                <div className="flex gap-4">
                  <div className="relative shrink-0">
                    <img
                      src={item.thumbnail || item.image || "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=300"}
                      alt={item.title}
                      className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-xl"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 mb-1 line-clamp-2">{item.title || item.courseName}</h3>
                    <p className="text-sm text-slate-500 mb-2">
                      by {item.instructor || item.instructorName || "Instructor"}
                    </p>

                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-extrabold text-slate-900 font-mono">
                          ₹{(item.price || 0).toFixed(2)}
                        </span>
                        {item.originalPrice && item.originalPrice > item.price && (
                          <span className="text-sm text-slate-400 line-through font-mono">
                            ₹{item.originalPrice.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center border border-slate-200 rounded-lg">
                        <button
                          onClick={() => updateQuantity(item.id, (item.quantity || 1) - 1)}
                          disabled={(item.quantity || 1) <= 1}
                          className="p-2 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="w-10 text-center font-medium text-slate-900">{item.quantity || 1}</span>
                        <button
                          onClick={() => updateQuantity(item.id, (item.quantity || 1) + 1)}
                          className="p-2 hover:bg-slate-100 transition"
                        >
                          <Plus size={16} />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.id)}
                        className="flex items-center gap-1 text-red-500 hover:text-red-700 text-sm font-medium transition"
                      >
                        <Trash2 size={16} />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {cartItems.length > 0 && (
              <button
                onClick={clearCart}
                className="w-full py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium transition flex items-center justify-center gap-2"
              >
                <Trash2 size={18} />
                Clear Cart
              </button>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sticky top-6"
            >
              <h2 className="font-bold text-lg text-slate-900 mb-6">Order Summary</h2>

              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Subtotal</span>
                  <span className="font-medium text-slate-900">₹{subtotal.toFixed(2)}</span>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between text-sm">
                    <span className="text-emerald-600 flex items-center gap-1">
                      <Percent size={14} />
                      Discount ({appliedCoupon.code})
                    </span>
                    <span className="font-medium text-emerald-600">-₹{discount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Tax</span>
                  <span className="font-medium text-slate-900">₹{(cartSummary?.tax || 0).toFixed(2)}</span>
                </div>

                <div className="border-t border-slate-200 pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span className="text-slate-900">Total</span>
                    <span className="text-slate-900">₹{total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Coupon Section */}
                <div className="pt-4 border-t border-slate-200">
                  <AnimatePresence>
                    {!appliedCoupon ? (
                      <div className="space-y-3">
                        <label className="text-sm font-medium text-slate-700">Have a coupon?</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                            placeholder="Enter coupon code"
                            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition"
                          />
                          <button
                            onClick={applyCoupon}
                            disabled={validatingCoupon || !couponCode.trim()}
                            className="px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
                          >
                            {validatingCoupon ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              "Apply"
                            )}
                          </button>
                        </div>
                        {couponError && (
                          <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-xs text-red-600 flex items-center gap-1"
                          >
                            <AlertCircle size={12} />
                            {couponError}
                          </motion.p>
                        )}
                      </div>
                    ) : (
                      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 size={18} className="text-emerald-600" />
                          <div>
                            <p className="text-sm font-medium text-emerald-900">{appliedCoupon.code}</p>
                            {appliedCoupon.description && (
                              <p className="text-xs text-emerald-700">{appliedCoupon.description}</p>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={removeCoupon}
                          className="text-emerald-600 hover:text-emerald-800 p-1"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )}
                  </AnimatePresence>
                </div>

                <button
                  onClick={() => navigate("/checkout")}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold hover:from-orange-600 hover:to-amber-600 transition shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2"
                >
                  Proceed to Checkout
                  <ArrowRight size={18} />
                </button>

                <div className="flex items-center justify-center gap-2 text-xs text-slate-500 pt-2">
                  <CheckCircle2 size={14} className="text-emerald-500" />
                  <span>Secure checkout with SSL encryption</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
