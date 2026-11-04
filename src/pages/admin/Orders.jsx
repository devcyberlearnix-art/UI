import React, { useEffect, useState } from "react";
import {
  Search,
  Download,
  Trash2,
  Eye,
  Loader2,
  AlertCircle,
  RefreshCw,
  Copy,
  Check,
  Receipt,
  X,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { adminApi } from "../../api/adminApi";
import toast from "react-hot-toast";
import Portal from "../../components/ui/Portal";

const SPRING = { type: "spring", stiffness: 300, damping: 28 };

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage, setOrdersPerPage] = useState(15);

  // Fetch orders from real backend API
  const fetchOrders = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);
    setError("");

    try {
      console.log("[Orders] Fetching orders from API Gateway...");
      const response = await adminApi.getOrders();

      let orderData = response?.data || response;
      if (!Array.isArray(orderData)) {
        if (orderData?.orders) orderData = orderData.orders;
        else if (orderData?.items) orderData = orderData.items;
        else if (orderData?.content) orderData = orderData.content;
        else orderData = [orderData].filter(Boolean);
      }

      const transformedOrders = orderData.map((order) => {
        const amt = order.totalAmount ?? order.amount ?? order.total ?? order.price ?? 0;
        return {
          _id: order.orderId || order.id || order._id,
          student:
            order.userName ||
            order.studentName ||
            order.customerName ||
            (order.userId ? `Candidate ${order.userId.slice(0, 8)}` : "Verified Candidate"),
          course:
            order.courseName ||
            (order.courseIds && order.courseIds.length > 0
              ? `Course #${order.courseIds.join(", ")}`
              : "Curriculum Suite"),
          amount: typeof amt === "number" ? Math.round(amt) : parseFloat(amt) || 0,
          payment: (order.status || order.paymentStatus || "COMPLETED").toUpperCase(),
          date: order.createdAt
            ? new Date(order.createdAt).toISOString().split("T")[0]
            : order.orderDate || "2026-10-03",
        };
      });

      setOrders(transformedOrders);
      setFilteredOrders(transformedOrders);
      setCurrentPage(1);
      if (isManualRefresh) toast.success("Ledger refreshed from live services");
    } catch (err) {
      console.error("[Orders] Error fetching orders:", err);
      setError("Failed to load order ledger from microservices.");
      toast.error("Failed to load orders");
      setOrders([]);
      setFilteredOrders([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Filter effect
  useEffect(() => {
    let data = [...orders];

    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(
        (order) =>
          (order.student && order.student.toLowerCase().includes(q)) ||
          (order.course && order.course.toLowerCase().includes(q)) ||
          (order._id && order._id.toLowerCase().includes(q))
      );
    }

    if (statusFilter !== "All") {
      data = data.filter(
        (order) => order.payment.toUpperCase() === statusFilter.toUpperCase()
      );
    }

    setFilteredOrders(data);
    setCurrentPage(1);
  }, [search, statusFilter, orders]);

  // Escape key handler for modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setShowModal(false);
      }
    };
    if (showModal) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showModal]);

  const handleCopy = (text, id) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const deleteOrder = async (id) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;

    try {
      await adminApi.deleteOrder(id);
      const updated = orders.filter((order) => order._id !== id);
      setOrders(updated);
      setFilteredOrders(updated);
      toast.success("Order deleted successfully");
    } catch (err) {
      console.error("[Orders] Error deleting order:", err);
      toast.error("Failed to delete order");
    }
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const exportCSV = () => {
    const csv =
      "Order ID,Student,Course,Amount,Payment,Date\n" +
      filteredOrders
        .map(
          (order) =>
            `"${order._id}","${order.student}","${order.course}",${order.amount},"${order.payment}","${order.date}"`
        )
        .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `asivo_order_ledger_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Exported order ledger CSV");
  };

  // Pagination slicing
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage) || 1;
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ordersPerPage,
    currentPage * ordersPerPage
  );

  const totalRevenue = orders.reduce((sum, o) => sum + (o.amount || 0), 0);
  const paidCount = orders.filter(
    (o) => o.payment === "COMPLETED" || o.payment === "PAID"
  ).length;
  const pendingCount = orders.filter((o) => o.payment === "PENDING").length;

  if (loading) {
    return (
      <div className="bg-[#F5F2EC] dark:bg-[#151413] min-h-screen p-6 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-[#5B3E57] dark:text-[#D1A7CC] animate-spin" />
        <p className="text-sm font-medium text-[#635E56] dark:text-[#A8A196]">
          Loading order ledger & settlements from microservices...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#F5F2EC] dark:bg-[#151413] min-h-screen p-6 flex items-center justify-center">
        <div className="bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-red-500/20 rounded-3xl p-8 text-center max-w-md space-y-4 shadow-2xl">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
          <h3 className="text-lg font-bold text-[#282521] dark:text-[#EDE8E1]">Error Loading Order Ledger</h3>
          <p className="text-xs text-[#635E56] dark:text-[#A8A196]">{error}</p>
          <button
            onClick={() => fetchOrders(false)}
            className="px-5 py-2.5 bg-[#F5F2EC] dark:bg-[#151413] border border-[#D5C0D1] dark:border-white/10 hover:border-[#5B3E57] dark:hover:border-[#D1A7CC] text-xs font-semibold text-white rounded-xl transition"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F2EC] dark:bg-[#151413] text-[#282521] dark:text-[#EDE8E1] p-6 lg:p-10 space-y-8 font-sans selection:bg-[#5B3E57] dark:bg-[#D1A7CC]/30 selection:text-white">
      {/* Top Header Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F5F2EC] dark:bg-[#151413] border border-[#5B3E57]/40 dark:border-[#D1A7CC]/40 text-xs font-semibold text-[#5B3E57] dark:text-[#D1A7CC] mb-2">
            <span>Order Ledger & Settlements</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#282521] dark:text-[#EDE8E1] tracking-tight">
            Order Ledger & Settlements
          </h1>
          <p className="text-xs sm:text-sm text-[#635E56] dark:text-[#A8A196] mt-1">
            Platform transaction history, order fulfillment, and settlement verification
          </p>
        </div>

        <button
          onClick={() => fetchOrders(true)}
          disabled={refreshing}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#F5F2EC] dark:bg-[#151413] border border-[#D5C0D1] dark:border-white/10 hover:border-[#5B3E57] dark:hover:border-[#D1A7CC] text-[#282521] dark:text-[#EDE8E1] hover:text-[#5B3E57] dark:hover:text-[#D1A7CC] text-xs font-semibold rounded-xl transition-all shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-[#5B3E57] dark:text-[#D1A7CC]" : ""}`} />
          <span>{refreshing ? "Refreshing..." : "Refresh Ledger"}</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-2xl bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-[#E3DCD3] dark:border-white/[0.06] space-y-1">
          <p className="text-xs font-medium text-[#635E56] dark:text-[#A8A196]">Total Executed Orders</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-mono text-[#282521] dark:text-[#EDE8E1]">
            {orders.length}
          </h2>
          <span className="text-[10px] text-[#756E64] dark:text-[#7A7368]">Authoritative Order Service entries</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-[#E3DCD3] dark:border-white/[0.06] space-y-1">
          <p className="text-xs font-medium text-[#635E56] dark:text-[#A8A196]">Completed / Paid</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-400">
            {paidCount}
          </h2>
          <span className="text-[10px] text-emerald-500/80">
            {orders.length > 0 ? `${Math.round((paidCount / orders.length) * 100)}% fulfillment rate` : "0%"}
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-[#E3DCD3] dark:border-white/[0.06] space-y-1">
          <p className="text-xs font-medium text-[#635E56] dark:text-[#A8A196]">Pending Settlements</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-mono text-amber-400">
            {pendingCount}
          </h2>
          <span className="text-[10px] text-amber-500/80">Awaiting gateway callback</span>
        </div>

        <div className="p-5 rounded-2xl bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-[#E3DCD3] dark:border-white/[0.06] space-y-1">
          <p className="text-xs font-medium text-[#635E56] dark:text-[#A8A196]">Total Settlement Volume</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-mono text-[#5B3E57] dark:text-[#D1A7CC]">
            ₹{totalRevenue.toLocaleString()}
          </h2>
          <span className="text-[10px] text-[#A1A1AA]">Aggregated gross order sum</span>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="rounded-3xl bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-[#E3DCD3] dark:border-white/[0.06] p-6 shadow-sm space-y-6">
        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search size={16} className="absolute left-3.5 top-3 text-[#756E64] dark:text-[#7A7368]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search orders, candidate, UUID..."
                className="w-full pl-10 pr-4 py-2 bg-[#F5F2EC] dark:bg-[#151413] border border-[#E3DCD3] dark:border-white/[0.08] rounded-xl text-xs text-[#282521] dark:text-[#EDE8E1] placeholder-[#71717A] focus:outline-none focus:border-[#5B3E57] dark:border-[#D1A7CC] transition-colors"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3.5 py-2 bg-[#F5F2EC] dark:bg-[#151413] border border-[#E3DCD3] dark:border-white/[0.08] rounded-xl text-xs text-[#282521] dark:text-[#EDE8E1] focus:outline-none focus:border-[#5B3E57] dark:border-[#D1A7CC] cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="COMPLETED">Completed</option>
              <option value="PAID">Paid</option>
              <option value="PENDING">Pending</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <span className="text-xs text-[#635E56] dark:text-[#A8A196] hidden md:inline">
              Showing <strong className="text-white">{filteredOrders.length}</strong> records
            </span>
            <button
              onClick={exportCSV}
              className="px-4 py-2 bg-[#F5F2EC] dark:bg-[#151413] border border-[#E3DCD3] dark:border-white/[0.08] hover:border-[#5B3E57] dark:hover:border-[#D1A7CC] rounded-xl text-xs text-[#282521] dark:text-[#EDE8E1] hover:text-[#5B3E57] dark:hover:text-[#D1A7CC] transition-colors flex items-center gap-2"
              title="Export Ledger as CSV"
            >
              <Download size={14} />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto rounded-2xl border border-[#E3DCD3] dark:border-[#E3DCD3] dark:border-white/[0.06]">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#F5F2EC] dark:bg-[#151413] text-[#635E56] dark:text-[#A8A196] text-[10px] font-bold uppercase tracking-wider border-b border-[#E3DCD3] dark:border-[#E3DCD3] dark:border-white/[0.06]">
              <tr>
                <th className="px-5 py-3.5">Order Reference</th>
                <th className="px-5 py-3.5">Candidate</th>
                <th className="px-5 py-3.5">Curriculum Suite</th>
                <th className="px-5 py-3.5">Settlement</th>
                <th className="px-5 py-3.5">Fulfillment</th>
                <th className="px-5 py-3.5">Timestamp</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/[0.04]">
              {paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-xs text-[#635E56] dark:text-[#A8A196]">
                    No order ledger records found matching current query.
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((order) => (
                  <tr
                    key={order._id}
                    className="hover:bg-white/[0.02] transition-colors text-xs group"
                  >
                    {/* Order Reference */}
                    <td className="px-5 py-4">
                      <div className="inline-flex items-center gap-1.5 bg-[#F5F2EC] dark:bg-[#151413] px-2.5 py-1 rounded-lg border border-[#E3DCD3] dark:border-white/5 font-mono text-[11px] text-[#A1A1AA]">
                        <span>{order._id ? `${order._id.slice(0, 14)}...` : "—"}</span>
                        <button
                          onClick={() => handleCopy(order._id, order._id)}
                          className="hover:text-[#5B3E57] dark:hover:text-[#D1A7CC] transition-colors"
                          title="Copy Full Order ID"
                        >
                          {copiedId === order._id ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Candidate */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-[#F2ECF1] dark:bg-[#D1A7CC]/15 border border-[#5B3E57]/30 dark:border-[#D1A7CC]/30 flex items-center justify-center text-[#5B3E57] dark:text-[#D1A7CC] font-bold text-xs shrink-0">
                          {order.student ? order.student.charAt(0).toUpperCase() : "C"}
                        </div>
                        <span className="font-medium text-[#282521] dark:text-[#EDE8E1] truncate max-w-[150px]">
                          {order.student}
                        </span>
                      </div>
                    </td>

                    {/* Curriculum */}
                    <td className="px-5 py-4">
                      <span className="text-[#A1A1AA] truncate block max-w-[180px]">
                        {order.course}
                      </span>
                    </td>

                    {/* Amount */}
                    <td className="px-5 py-4 font-mono font-bold text-[#5B3E57] dark:text-[#D1A7CC] text-sm">
                      ₹{order.amount.toLocaleString()}
                    </td>

                    {/* Payment Status */}
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${order.payment === "COMPLETED" || order.payment === "PAID"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : order.payment === "PENDING"
                              ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                              : "bg-red-500/10 text-red-400 border-red-500/20"
                          }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${order.payment === "COMPLETED" || order.payment === "PAID"
                              ? "bg-emerald-400"
                              : order.payment === "PENDING"
                                ? "bg-amber-400"
                                : "bg-red-400"
                            }`}
                        />
                        {order.payment}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-5 py-4 font-mono text-[#756E64] dark:text-[#7A7368] text-[11px]">
                      {order.date}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewDetails(order)}
                          className="p-1.5 rounded-lg bg-[#F5F2EC] dark:bg-[#151413] border border-[#E3DCD3] dark:border-white/5 hover:border-[#5B3E57] dark:hover:border-[#D1A7CC] text-[#635E56] dark:text-[#A8A196] hover:text-[#5B3E57] dark:hover:text-[#D1A7CC] transition-colors"
                          title="View Order Details"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => deleteOrder(order._id)}
                          className="p-1.5 rounded-lg bg-[#F5F2EC] dark:bg-[#151413] border border-[#E3DCD3] dark:border-white/5 hover:border-red-500/40 text-[#635E56] dark:text-[#A8A196] hover:text-red-400 transition-colors"
                          title="Delete Order Record"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 text-xs">
          <div className="flex items-center gap-3 text-[#635E56] dark:text-[#A8A196]">
            <span>
              Showing{" "}
              <strong className="text-white">
                {filteredOrders.length > 0 ? (currentPage - 1) * ordersPerPage + 1 : 0}
              </strong>{" "}
              to{" "}
              <strong className="text-white">
                {Math.min(currentPage * ordersPerPage, filteredOrders.length)}
              </strong>{" "}
              of <strong className="text-white">{filteredOrders.length}</strong> orders
            </span>

            <select
              value={ordersPerPage}
              onChange={(e) => {
                setOrdersPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-[#F5F2EC] dark:bg-[#151413] border border-[#E3DCD3] dark:border-white/[0.08] rounded-lg px-2.5 py-1 text-xs text-[#282521] dark:text-[#EDE8E1] focus:outline-none focus:border-[#5B3E57] dark:border-[#D1A7CC]"
            >
              <option value={10}>10 / page</option>
              <option value={15}>15 / page</option>
              <option value={25}>25 / page</option>
              <option value={50}>50 / page</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-xl bg-[#F5F2EC] dark:bg-[#151413] border border-[#E3DCD3] dark:border-white/5 hover:border-white/20 text-[#635E56] dark:text-[#A8A196] hover:text-white disabled:opacity-30 disabled:pointer-events-none transition"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="font-mono text-[#282521] dark:text-[#EDE8E1] px-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-xl bg-[#F5F2EC] dark:bg-[#151413] border border-[#E3DCD3] dark:border-white/5 hover:border-white/20 text-[#635E56] dark:text-[#A8A196] hover:text-white disabled:opacity-30 disabled:pointer-events-none transition"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Order Details Modal (Asivo Ink & Onyx) */}
      <AnimatePresence>
        {showModal && selectedOrder && (
          <Portal>
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
              onClick={() => setShowModal(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={SPRING}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-lg bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#D5C0D1] dark:border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl text-left"
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between border-b border-[#E3DCD3] dark:border-white/5 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#F5F2EC] dark:bg-[#151413] border border-[#5B3E57]/40 dark:border-[#D1A7CC]/40 flex items-center justify-center text-[#5B3E57] dark:text-[#D1A7CC]">
                      <Receipt className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[#282521] dark:text-[#EDE8E1]">
                        Order Ledger & Settlement
                      </h3>
                      <p className="text-xs text-[#635E56] dark:text-[#A8A196]">
                        Authoritative microservice transaction audit record
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-2 rounded-xl bg-[#F5F2EC] dark:bg-[#151413] border border-[#D5C0D1] dark:border-white/10 text-[#635E56] dark:text-[#A8A196] hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Candidate Information Card */}
                <div className="p-4 rounded-2xl bg-[#F5F2EC] dark:bg-[#151413] border border-[#E3DCD3] dark:border-white/5 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#5B3E57]/40 dark:border-[#D1A7CC]/40 flex items-center justify-center text-[#5B3E57] dark:text-[#D1A7CC] font-bold text-xl">
                    {selectedOrder.student ? selectedOrder.student.charAt(0).toUpperCase() : "C"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-base text-white truncate">
                        {selectedOrder.student}
                      </p>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#F2ECF1] dark:bg-[#D1A7CC]/15 text-[#5B3E57] dark:text-[#D1A7CC] border border-[#5B3E57]/40 dark:border-[#D1A7CC]/40">
                        Student Account
                      </span>
                    </div>
                    <p className="text-xs text-[#635E56] dark:text-[#A8A196] mt-0.5">
                      Verified Identity in LMS User Registry
                    </p>
                  </div>
                </div>

                {/* Audit Fields Matrix */}
                <div className="space-y-3 text-xs">
                  {/* Order Reference */}
                  <div className="p-3.5 rounded-2xl bg-[#F5F2EC] dark:bg-[#151413] border border-[#E3DCD3] dark:border-white/5 flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <span className="text-[#635E56] dark:text-[#A8A196] block text-[11px] mb-0.5">
                        Order Reference UUID
                      </span>
                      <span className="font-mono text-white text-xs select-all block truncate">
                        {selectedOrder._id}
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopy(selectedOrder._id, `modal-${selectedOrder._id}`)}
                      className="p-2 rounded-lg bg-[#FFFEFA] dark:bg-[#1D1C1A] border border-[#E3DCD3] dark:border-white/5 hover:border-[#5B3E57] dark:hover:border-[#D1A7CC] text-[#635E56] dark:text-[#A8A196] hover:text-[#5B3E57] dark:hover:text-[#D1A7CC] transition-colors shrink-0"
                      title="Copy Order UUID"
                    >
                      {copiedId === `modal-${selectedOrder._id}` ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  {/* Course / Curriculum */}
                  <div className="p-3.5 rounded-2xl bg-[#F5F2EC] dark:bg-[#151413] border border-[#E3DCD3] dark:border-white/5 space-y-1">
                    <span className="text-[#635E56] dark:text-[#A8A196] block text-[11px]">Enrolled Curriculum</span>
                    <span className="font-semibold text-white text-sm block">
                      {selectedOrder.course}
                    </span>
                  </div>

                  {/* Amount & Status Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-2xl bg-[#F5F2EC] dark:bg-[#151413] border border-[#E3DCD3] dark:border-white/5 space-y-1">
                      <span className="text-[#635E56] dark:text-[#A8A196] block text-[11px]">Settlement Amount</span>
                      <span className="font-bold font-mono text-[#5B3E57] dark:text-[#D1A7CC] text-lg block">
                        ₹{selectedOrder.amount.toLocaleString()}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-[#F5F2EC] dark:bg-[#151413] border border-[#E3DCD3] dark:border-white/5 space-y-1">
                      <span className="text-[#635E56] dark:text-[#A8A196] block text-[11px]">Fulfillment Status</span>
                      <div>
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${selectedOrder.payment === "COMPLETED" || selectedOrder.payment === "PAID"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : selectedOrder.payment === "PENDING"
                                ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                : "bg-red-500/10 text-red-400 border-red-500/20"
                            }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${selectedOrder.payment === "COMPLETED" || selectedOrder.payment === "PAID"
                                ? "bg-emerald-400"
                                : selectedOrder.payment === "PENDING"
                                  ? "bg-amber-400"
                                  : "bg-red-400"
                              }`}
                          />
                          {selectedOrder.payment}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Order Date */}
                  <div className="p-3.5 rounded-2xl bg-[#F5F2EC] dark:bg-[#151413] border border-[#E3DCD3] dark:border-white/5 flex items-center justify-between">
                    <span className="text-[#635E56] dark:text-[#A8A196]">Ledger Entry Timestamp</span>
                    <span className="font-mono text-[#282521] dark:text-[#EDE8E1] font-medium">
                      {selectedOrder.date}
                    </span>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#E3DCD3] dark:border-white/5">
                  <button
                    onClick={() => handleCopy(JSON.stringify(selectedOrder, null, 2), "json")}
                    className="px-4 py-2.5 bg-[#F5F2EC] dark:bg-[#151413] border border-[#D5C0D1] dark:border-white/10 hover:border-white/20 rounded-xl text-xs font-semibold text-[#635E56] dark:text-[#A8A196] hover:text-white transition-all flex items-center gap-1.5"
                  >
                    {copiedId === "json" ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copied JSON</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Audit JSON</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-5 py-2.5 bg-[#5B3E57] dark:bg-[#D1A7CC] hover:bg-[#B3936A] text-[#FFFEFA] dark:text-[#151413] rounded-xl text-xs font-bold transition-all shadow-lg shadow-sm"
                  >
                    Close Inspection
                  </button>
                </div>
              </motion.div>
            </div>
          </Portal>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Orders;
