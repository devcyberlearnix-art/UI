// src/components/order/OrderCard.jsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useOrders } from "../../context/OrderContext";
import OrderStatusBadge from "./OrderStatusBadge";
import { ChevronDown, ChevronUp, XCircle, RefreshCw } from "lucide-react";

const OrderCard = ({ order, onCancel }) => {
  const [expanded, setExpanded] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const { handleCancelOrder } = useOrders();
  const status = String(order.status || "pending").toLowerCase();
  const items = Array.isArray(order.items) ? order.items : [];

  const handleCancel = async () => {
    if (window.confirm("Are you sure you want to cancel this order?")) {
      setCancelling(true);
      const success = await handleCancelOrder(order.id);
      if (success && onCancel) onCancel();
      setCancelling(false);
    }
  };

  const canCancel = status === "pending" || status === "processing";

  return (
    <motion.div
      layout
      className="bg-white rounded-xl border shadow-sm hover:shadow-md transition-all"
    >
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-gray-500">Order #{String(order.id || "").slice(-8)}</p>
            <p className="font-medium">{new Date(order.createdAt || Date.now()).toLocaleDateString()}</p>
          </div>
          <div className="flex items-center gap-3">
            <OrderStatusBadge status={status} />
            {canCancel && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCancel}
                disabled={cancelling}
                className="text-red-600 hover:bg-red-50 p-1 rounded transition"
              >
                {cancelling ? <RefreshCw size={18} className="animate-spin" /> : <XCircle size={18} />}
              </motion.button>
            )}
            <button onClick={() => setExpanded(!expanded)} className="text-gray-500 hover:text-gray-700">
              {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
          </div>
        </div>
        <div className="mt-2 flex justify-between">
          <span className="text-gray-700">Total: ${Number(order.totalAmount || 0).toFixed(2)}</span>
          <span className="text-gray-500 text-sm">{items.length} item(s)</span>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t px-4 py-3 space-y-2 bg-gray-50 rounded-b-xl"
          >
            <p className="text-sm font-medium">Order Details</p>
            {items.map((item, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span>{item.title || item.name || "Course"} x{item.quantity || 1}</span>
                <span>${(Number(item.price || 0) * (item.quantity || 1)).toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t pt-2 mt-2">
              <p className="text-sm"><strong>Shipping Address:</strong> {order.shippingAddress || "-"}</p>
              <p className="text-sm"><strong>Payment Method:</strong> {order.paymentMethod || "-"}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default OrderCard;