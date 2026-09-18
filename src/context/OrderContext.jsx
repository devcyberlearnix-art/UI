// src/context/OrderContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { getOrdersByUserId, updateOrderStatus, cancelOrder, refundOrder } from "../services/orderService";
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
      const userOrders = await getOrdersByUserId(user.id);
      setOrders(userOrders);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    try {
      const updated = await cancelOrder(orderId);
      setOrders(prev => prev.map(o => o.id === orderId ? updated : o));
      return true;
    } catch (err) {
      alert(err.message);
      return false;
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