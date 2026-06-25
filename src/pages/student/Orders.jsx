// src/pages/student/Orders.jsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useOrders } from "../../context/OrderContext";
import OrderCard from "../../components/order/OrderCard";
import { Package, RefreshCw } from "lucide-react";

const Orders = () => {
  const { orders, loading, loadUserOrders } = useOrders();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadUserOrders();
    setTimeout(() => setRefreshing(false), 500);
  };

  if (loading && !orders.length) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
        <p className="mt-2 text-gray-500">Loading orders...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 max-w-4xl mx-auto"
    >
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Orders</h1>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
        >
          <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {orders.length === 0 ? (
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="text-center py-12 bg-gray-50 rounded-xl border"
        >
          <Package size={48} className="mx-auto text-gray-400 mb-3" />
          <p className="text-gray-500">You haven't placed any orders yet.</p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {orders.map((order, idx) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <OrderCard order={order} onCancel={() => loadUserOrders()} />
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default Orders;