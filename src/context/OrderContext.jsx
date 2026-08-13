// src/context/OrderContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "./AuthContext";

const OrderContext = createContext();

const normalizeOrders = (raw) => {
  const items = Array.isArray(raw)
    ? raw
    : Array.isArray(raw?.orders)
    ? raw.orders
    : Array.isArray(raw?.data)
    ? raw.data
    : [];

  return items.map((order) => ({
    id: String(order.id || order.orderId || order._id || ""),
    createdAt: order.createdAt || order.orderDate || new Date().toISOString(),
    status: String(order.status || "pending").toLowerCase(),
    totalAmount: Number(order.totalAmount || order.total || order.amount || 0),
    shippingAddress: order.shippingAddress || order.address || "-",
    paymentMethod: order.paymentMethod || order.paymentType || "-",
    items: Array.isArray(order.items)
      ? order.items.map((item) => ({
          title: item.title || item.courseName || item.name || "Course",
          quantity: Number(item.quantity || 1),
          price: Number(item.price || item.amount || 0),
        }))
      : [],
  }));
};

export const OrderProvider = ({ children }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadUserOrders = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const response = await axiosInstance.get("/api/v1/orders");
      const payload = response.data?.data || response.data || [];
      setOrders(normalizeOrders(payload));
    } catch (err) {
      console.error(err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    try {
      await axiosInstance.delete(`/api/v1/orders/${orderId}/cancel`);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: "cancelled" } : o)));
      return true;
    } catch (err) {
      alert(err.response?.data?.message || err.message);
      return false;
    }
  };

  const handleRefundOrder = async (orderId) => {
    try {
      await axiosInstance.post(`/api/v1/orders/${orderId}/refund`);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: "refunded" } : o)));
      return true;
    } catch (err) {
      alert(err.response?.data?.message || err.message);
      return false;
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    const response = await axiosInstance.put(`/api/v1/orders/${orderId}/status`, { status });
    const updated = response.data?.data || response.data || {};
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: String(updated.status || status || o.status).toLowerCase(),
            }
          : o
      )
    );
    return updated;
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