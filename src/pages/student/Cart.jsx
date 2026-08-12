import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Loader2, ShoppingCart, Trash2 } from "lucide-react";
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
    id: item.id || item.courseId || item.productId || `item-${idx}`,
    title: item.title || item.courseName || item.name || "Untitled course",
    instructor: item.instructor || item.instructorName || "Instructor",
    image:
      item.thumbnail ||
      item.image ||
      "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800",
    price: Number(item.price || item.amount || item.coursePrice || 0),
    quantity: Number(item.quantity || 1),
  }));
};

const Cart = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCart = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axiosInstance.get("/api/v1/cart");
      const payload = response.data?.data || response.data || [];
      setCartItems(normalizeItems(payload));
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to load cart");
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  const removeItem = async (id) => {
    try {
      await axiosInstance.delete(`/api/v1/cart/${id}`);
      setCartItems((prev) => prev.filter((item) => String(item.id) !== String(id)));
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Unable to remove item");
    }
  };

  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0),
    [cartItems]
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-orange-600 mx-auto mb-3" />
          <p className="text-slate-500">Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="p-6 text-center">
        <ShoppingCart size={64} className="mx-auto text-slate-300 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
        <p className="text-slate-500 mb-4">Browse courses and add your favorites to checkout.</p>
        <button
          onClick={() => navigate("/")}
          className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition"
        >
          Browse Courses
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen py-8 px-4">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="rounded-3xl bg-gradient-to-r from-orange-600 via-amber-500 to-cyan-500 p-6 text-white shadow-xl">
          <h1 className="text-2xl font-bold">Your Cart</h1>
          <p className="text-orange-50 mt-1">Review selections before secure checkout.</p>
        </div>

        {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 text-sm">{error}</div>}

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            {cartItems.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 flex gap-4"
              >
                <img src={item.image} alt={item.title} className="w-24 h-24 object-cover rounded-xl" />
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900">{item.title}</h3>
                  <p className="text-sm text-slate-500">{item.instructor}</p>
                  <p className="text-orange-600 font-bold mt-2">${item.price.toFixed(2)}</p>
                </div>
                <div className="flex flex-col items-end justify-between">
                  <span className="text-xs text-slate-500">Qty {item.quantity}</span>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="md:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sticky top-6">
              <h2 className="font-semibold text-lg mb-4">Order Summary</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="border-t pt-2 mt-2 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
              </div>
              <button
                onClick={() => navigate("/checkout")}
                className="mt-5 w-full bg-orange-600 text-white py-2.5 rounded-xl hover:bg-orange-700 transition flex items-center justify-center gap-2"
              >
                Proceed to Checkout <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Cart;
