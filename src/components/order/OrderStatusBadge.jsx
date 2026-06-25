// src/components/order/OrderStatusBadge.jsx
const statusConfig = {
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-700" },
  processing: { label: "Processing", color: "bg-blue-100 text-blue-700" },
  shipped: { label: "Shipped", color: "bg-purple-100 text-purple-700" },
  delivered: { label: "Delivered", color: "bg-green-100 text-green-700" },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-700" },
  refunded: { label: "Refunded", color: "bg-gray-100 text-gray-700" },
};

const OrderStatusBadge = ({ status }) => {
  const config = statusConfig[status] || statusConfig.pending;
  return <span className={`px-2 py-1 text-xs rounded-full ${config.color}`}>{config.label}</span>;
};

export default OrderStatusBadge;