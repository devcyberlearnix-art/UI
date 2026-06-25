// src/pages/admin/OrderDetails.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getAuthHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
  });

  const fetchOrderDetails = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://iodine-pesticide-bulge.ngrok-free.dev/admin/orders/${orderId}`,
        { headers: getAuthHeaders() }
      );
      if (!response.ok) throw new Error(await response.text());
      const data = await response.json();
      setOrder(data);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  if (loading) return <div className="p-6 text-center">Loading order details...</div>;
  if (error) return <div className="p-6 text-center text-red-500">Error: {error}</div>;
  if (!order) return <div className="p-6 text-center">Order not found</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate("/admin/orders")} className="flex items-center gap-2 text-gray-600 hover:text-gray-800">
          <ArrowLeft size={20} /> Back to Orders
        </button>
        <h1 className="text-2xl font-bold">Order Details</h1>
        <button onClick={fetchOrderDetails} className="ml-auto flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-lg">
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Order Information */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4">Order Information</h2>
          <div className="space-y-2">
            <p><strong>Order ID:</strong> {order.id}</p>
            <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleString()}</p>
            <p><strong>Status:</strong> 
              <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                order.status === "completed" ? "bg-green-100 text-green-700" :
                order.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                order.status === "cancelled" ? "bg-red-100 text-red-700" :
                "bg-gray-100 text-gray-700"
              }`}>
                {order.status}
              </span>
            </p>
            <p><strong>Total Amount:</strong> ${order.totalAmount}</p>
            <p><strong>Payment Method:</strong> {order.paymentMethod}</p>
          </div>
        </div>

        {/* Customer Information */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4">Customer Information</h2>
          <div className="space-y-2">
            <p><strong>Name:</strong> {order.userName || "N/A"}</p>
            <p><strong>Email:</strong> {order.userEmail}</p>
            <p><strong>Phone:</strong> {order.userPhone || "N/A"}</p>
          </div>
        </div>

        {/* Shipping Information */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4">Shipping Address</h2>
          <div className="space-y-2">
            <p>{order.shippingAddress}</p>
            <p>{order.shippingCity}, {order.shippingPostalCode}</p>
            <p>{order.shippingCountry}</p>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-xl shadow-sm border p-6 md:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Order Items</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {order.items?.map((item, idx) => (
                  <tr key={idx}>
                    <td className="px-4 py-2">{item.title}</td>
                    <td className="px-4 py-2">{item.quantity}</td>
                    <td className="px-4 py-2">${item.price}</td>
                    <td className="px-4 py-2">${item.price * item.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default OrderDetails;