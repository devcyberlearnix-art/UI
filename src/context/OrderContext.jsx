import { createContext, useContext, useState, useEffect } from "react";
import { getOrdersByUserId, updateOrderStatus, cancelOrder, refundOrder } from "../services/orderService";
import { orderApi } from "../api/orderApi";
import { useSafeAuth } from "./AuthContext"; // ✅ Import the safe version

const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
  const { user } = useSafeAuth(); // ✅ Use safe version
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadUserOrders = async () => {
    if (!user) {
      console.log('OrderProvider: No user, skipping orders load');
      return;
    }
    setLoading(true);
    try {
      const response = await orderApi.getMyOrders();
      const rawOrders = response?.data || response || [];
      const userOrders = Array.isArray(rawOrders) ? rawOrders : (rawOrders.orders || []);
      const normalized = userOrders.map(o => ({
        ...o,
        id: o.orderId || o.id,
        items: o.items || (o.courseIds || []).map(cid => ({
          courseId: cid,
          title: `Course #${cid}`,
          price: (Number(o.totalAmount || 0) / (o.courseIds?.length || 1)),
          quantity: 1,
        })),
      }));
      setOrders(normalized);
    } catch (err) {
      console.warn('Backend order fetch failed, falling back to local storage:', err.message);
      try {
        const userOrders = await getOrdersByUserId(user.id);
        setOrders(userOrders);
      } catch (e) {}
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    try {
      await orderApi.cancelOrder(orderId);
      await loadUserOrders();
      return true;
    } catch (err) {
      try {
        const updated = await cancelOrder(orderId);
        setOrders(prev => prev.map(o => o.id === orderId ? updated : o));
        return true;
      } catch (e) {
        alert(err.message || e.message);
        return false;
      }
    }
  };

  const handleRefundOrder = async (orderId) => {
    try {
      const updated = await refundOrder(orderId);
      setOrders(prev => prev.map(o => o.id === orderId ? updated : o));
      return true;
    } catch (err) {
      alert(err.message);
      return false;
    }
  };

  useEffect(() => {
    if (user) {
      loadUserOrders();
    }
  }, [user]);

  const value = {
    orders,
    loading,
    loadUserOrders,
    handleCancelOrder,
    handleRefundOrder,
    updateOrderStatus,
  };

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};

export default OrderContext;