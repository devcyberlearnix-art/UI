// src/context/OrderContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { getOrdersByUserId, updateOrderStatus, cancelOrder, refundOrder } from "../services/orderService";
import { useAuth } from "./AuthContext";

const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadUserOrders = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const userOrders = await getOrdersByUserId(user.id);
      setOrders(userOrders);
    } catch (err) {
      console.error(err);
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
    loadUserOrders();
  }, [user]);

  return (
    <OrderContext.Provider value={{ orders, loading, loadUserOrders, handleCancelOrder, handleRefundOrder, updateOrderStatus }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => useContext(OrderContext);