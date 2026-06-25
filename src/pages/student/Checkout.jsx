// src/pages/student/Checkout.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { createOrder } from "../../services/orderService";
import { ShoppingCart, CreditCard, Truck, MapPin, CheckCircle, AlertCircle, ChevronRight } from "lucide-react";

const Checkout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    shippingAddress: "",
    city: "",
    postalCode: "",
    paymentMethod: "Credit Card",
    notes: "",
  });

  useEffect(() => {
    // Load cart from localStorage
    const storedCart = localStorage.getItem("lms_cart");
    if (storedCart) {
      const parsedCart = JSON.parse(storedCart);
      if (parsedCart.length === 0) {
        // Empty cart, redirect back to cart page
        navigate("/cart");
      }
      setCart(parsedCart);
    } else {
      navigate("/cart");
    }
  }, [navigate]);

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async () => {
    if (!formData.shippingAddress || !formData.city) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const fullAddress = `${formData.shippingAddress}, ${formData.city}, ${formData.postalCode}`;
      const order = await createOrder(user.id, cart, fullAddress, formData.paymentMethod);
      setSuccess(true);
      // Clear cart after successful order
      localStorage.removeItem("lms_cart");
      setTimeout(() => {
        navigate("/student/orders");
      }, 2000);
    } catch (err) {
      setError(err.message || "Order failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="min-h-screen flex items-center justify-center p-4"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
          <CheckCircle size={64} className="mx-auto text-green-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Order Placed!</h2>
          <p className="text-gray-600 mb-4">Your order has been successfully placed.</p>
          <p className="text-sm text-gray-500">Redirecting to your orders...</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-gray-50 py-8 px-4"
    >
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Checkout</h1>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Left: Order Summary */}
          <div className="md:col-span-2 space-y-6">
            {/* Cart Items */}
            <div className="bg-white rounded-xl shadow-sm border p-4">
              <h2 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <ShoppingCart size={20} /> Order Summary
              </h2>
              <div className="space-y-3">
                {cart.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center border-b pb-2">
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-gray-500">Qty: {item.quantity || 1}</p>
                    </div>
                    <p className="font-semibold">${((item.price) * (item.quantity || 1)).toFixed(2)}</p>
                  </div>
                ))}
              </div>
              <div className="border-t pt-3 mt-3 flex justify-between font-bold">
                <span>Total</span>
                <span>${totalAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* Shipping Information */}
            <div className="bg-white rounded-xl shadow-sm border p-4">
              <h2 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <Truck size={20} /> Shipping Information
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Street Address *</label>
                  <input
                    type="text"
                    name="shippingAddress"
                    value={formData.shippingAddress}
                    onChange={handleInputChange}
                    className="w-full border rounded-lg p-2"
                    placeholder="123 Main St"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">City *</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full border rounded-lg p-2"
                      placeholder="Hyderabad"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Postal Code</label>
                    <input
                      type="text"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      className="w-full border rounded-lg p-2"
                      placeholder="500001"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-xl shadow-sm border p-4">
              <h2 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <CreditCard size={20} /> Payment Method
              </h2>
              <div className="space-y-2">
                <label className="flex items-center gap-2 p-2 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="Credit Card"
                    checked={formData.paymentMethod === "Credit Card"}
                    onChange={handleInputChange}
                  />
                  <span>Credit / Debit Card</span>
                </label>
                <label className="flex items-center gap-2 p-2 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="PayPal"
                    checked={formData.paymentMethod === "PayPal"}
                    onChange={handleInputChange}
                  />
                  <span>PayPal</span>
                </label>
                <label className="flex items-center gap-2 p-2 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="UPI"
                    checked={formData.paymentMethod === "UPI"}
                    onChange={handleInputChange}
                  />
                  <span>UPI (Google Pay, PhonePe)</span>
                </label>
              </div>
            </div>

            {/* Order Notes */}
            <div className="bg-white rounded-xl shadow-sm border p-4">
              <h2 className="font-semibold text-lg mb-3">Order Notes (Optional)</h2>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                className="w-full border rounded-lg p-2"
                rows="3"
                placeholder="Special instructions for delivery..."
              />
            </div>
          </div>

          {/* Right: Order Summary & Place Order */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border p-4 sticky top-6">
              <h2 className="font-semibold text-lg mb-3">Order Total</h2>
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
                  <span>Total</span>
                  <span>${totalAmount.toFixed(2)}</span>
                </div>
              </div>
              {error && (
                <div className="mt-3 p-2 bg-red-50 text-red-600 rounded-lg text-sm flex items-center gap-2">
                  <AlertCircle size={16} /> {error}
                </div>
              )}
              <button
                onClick={handlePlaceOrder}
                disabled={loading}
                className="mt-4 w-full bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  "Placing Order..."
                ) : (
                  <>
                    Place Order <ChevronRight size={16} />
                  </>
                )}
              </button>
              <p className="text-xs text-gray-400 text-center mt-3">
                By placing your order, you agree to our Terms of Service.
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Checkout;