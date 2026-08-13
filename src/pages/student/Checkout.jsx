import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AlertCircle, CheckCircle, ChevronRight, CreditCard, Loader2, ShoppingBag, Truck } from "lucide-react";
import axiosInstance from "../../api/axiosInstance";

const normalizeItems = (payload) => {
  const list = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.items)
    ? payload.items
    : Array.isArray(payload?.cartItems)
    ? payload.cartItems
    : [];

  return list.map((item, idx) => ({
    id: item.id || item.courseId || `item-${idx}`,
    title: item.title || item.courseName || item.name || "Untitled course",
    price: Number(item.price || item.amount || item.coursePrice || 0),
    quantity: Number(item.quantity || 1),
  }));
};

const Checkout = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    shippingAddress: "",
    city: "",
    postalCode: "",
    paymentMethod: "CARD",
    notes: "",
  });

  useEffect(() => {
    const loadCart = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await axiosInstance.get("/api/v1/cart");
        const payload = response.data?.data || response.data || [];
        const items = normalizeItems(payload);
        if (!items.length) {
          navigate("/cart");
          return;
        }
        setCart(items);
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Failed to load checkout items");
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, [navigate]);

  const totalAmount = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0),
    [cart]
  );

  const handleInputChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePlaceOrder = async () => {
    if (!formData.shippingAddress.trim() || !formData.city.trim()) {
      setError("Please fill in all required address fields.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const payload = {
        shippingAddress: `${formData.shippingAddress}, ${formData.city}, ${formData.postalCode}`,
        paymentMethod: formData.paymentMethod,
        notes: formData.notes,
      };

      try {
        await axiosInstance.post("/api/v1/cart/checkout", payload);
      } catch (checkoutError) {
        await axiosInstance.post("/api/v1/orders/create", payload);
      }

      setSuccess(true);
      setTimeout(() => navigate("/student/orders"), 1400);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Order failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-72">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-orange-600 mx-auto mb-3" />
          <p className="text-slate-500">Preparing checkout...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl border border-emerald-100 p-9 text-center max-w-md">
          <CheckCircle size={62} className="mx-auto text-emerald-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Order placed</h2>
          <p className="text-slate-600">Your enrollment is being processed. Redirecting to orders...</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="py-8 px-4">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="rounded-3xl bg-gradient-to-r from-orange-600 via-amber-500 to-cyan-500 p-6 text-white shadow-xl">
          <h1 className="text-2xl font-bold">Secure Checkout</h1>
          <p className="text-orange-50 mt-1">Confirm your order and unlock your learning instantly.</p>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 text-sm flex items-center gap-2">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-5">
            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <h2 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <ShoppingBag size={18} /> Order Items
              </h2>
              <div className="space-y-3">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <div>
                      <p className="font-medium text-slate-800">{item.title}</p>
                      <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-slate-900">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <h2 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <Truck size={18} /> Shipping Details
              </h2>
              <div className="space-y-3">
                <input
                  type="text"
                  name="shippingAddress"
                  value={formData.shippingAddress}
                  onChange={handleInputChange}
                  className="w-full border border-slate-200 rounded-xl p-2.5"
                  placeholder="Street address"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full border border-slate-200 rounded-xl p-2.5"
                    placeholder="City"
                  />
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    className="w-full border border-slate-200 rounded-xl p-2.5"
                    placeholder="Postal code"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5">
              <h2 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <CreditCard size={18} /> Payment
              </h2>
              <div className="grid sm:grid-cols-3 gap-2">
                {["CARD", "UPI", "PAYPAL"].map((method) => (
                  <label key={method} className="flex items-center gap-2 p-2 border border-slate-200 rounded-xl">
                    <input type="radio" name="paymentMethod" value={method} checked={formData.paymentMethod === method} onChange={handleInputChange} />
                    <span className="text-sm">{method}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="md:col-span-1">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 sticky top-6 shadow-sm">
              <h3 className="font-semibold text-lg mb-3">Total</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="border-t pt-2 mt-2 flex justify-between font-bold text-lg">
                  <span>Grand Total</span>
                  <span>${totalAmount.toFixed(2)}</span>
                </div>
              </div>
              <button
                onClick={handlePlaceOrder}
                disabled={submitting}
                className="mt-5 w-full bg-orange-600 text-white py-2.5 rounded-xl hover:bg-orange-700 transition flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {submitting ? "Placing..." : "Place Order"} <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Checkout;
