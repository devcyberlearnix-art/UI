// src/services/orderService.js
const API_BASE = "https://matted-ascent-specimen.ngrok-free.dev"; // Replace with your actual API

// Helper for localStorage (mock)
const getOrders = () => {
  const stored = localStorage.getItem("lms_orders");
  return stored ? JSON.parse(stored) : [];
};

const saveOrders = (orders) => localStorage.setItem("lms_orders", JSON.stringify(orders));

// Generate unique order ID
const generateOrderId = () => "ORD" + Date.now() + Math.floor(Math.random() * 1000);

// Create order (from cart items)
export const createOrder = async (userId, cartItems, shippingAddress, paymentMethod) => {
  const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const newOrder = {
    id: generateOrderId(),
    userId,
    items: cartItems.map(item => ({
      courseId: item.id,
      title: item.title,
      price: item.price,
      quantity: item.quantity || 1,
    })),
    totalAmount,
    shippingAddress,
    paymentMethod,
    status: "pending", // pending, processing, shipped, delivered, cancelled, refunded
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const orders = getOrders();
  orders.push(newOrder);
  saveOrders(orders);
  // Clear cart after order creation
  localStorage.removeItem("lms_cart");
  return newOrder;
};

// Get order by ID
export const getOrderById = async (orderId) => {
  const orders = getOrders();
  const order = orders.find(o => o.id === orderId);
  if (!order) throw new Error("Order not found");
  return order;
};

// Get all orders by user ID
export const getOrdersByUserId = async (userId) => {
  const orders = getOrders();
  return orders.filter(o => o.userId === userId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

// Update order status (admin)
export const updateOrderStatus = async (orderId, newStatus) => {
  const orders = getOrders();
  const index = orders.findIndex(o => o.id === orderId);
  if (index === -1) throw new Error("Order not found");
  orders[index].status = newStatus;
  orders[index].updatedAt = new Date().toISOString();
  saveOrders(orders);
  return orders[index];
};

// Cancel order (user – only if status is pending or processing)
export const cancelOrder = async (orderId) => {
  const orders = getOrders();
  const index = orders.findIndex(o => o.id === orderId);
  if (index === -1) throw new Error("Order not found");
  const order = orders[index];
  if (order.status !== "pending" && order.status !== "processing") {
    throw new Error("Only pending or processing orders can be cancelled");
  }
  order.status = "cancelled";
  order.updatedAt = new Date().toISOString();
  saveOrders(orders);
  return order;
};

// Refund order (admin)
export const refundOrder = async (orderId) => {
  const orders = getOrders();
  const index = orders.findIndex(o => o.id === orderId);
  if (index === -1) throw new Error("Order not found");
  const order = orders[index];
  if (order.status !== "cancelled" && order.status !== "delivered") {
    throw new Error("Only cancelled or delivered orders can be refunded");
  }
  order.status = "refunded";
  order.updatedAt = new Date().toISOString();
  saveOrders(orders);
  return order;
};