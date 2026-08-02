import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, X, Loader2, AlertCircle, RefreshCw, DollarSign, CreditCard, CheckCircle, XCircle } from "lucide-react";
import { adminApi } from "../../api/adminApi";
import toast from "react-hot-toast";

const Modal = ({ title, children, onClose }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
    <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-white rounded-2xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
      <div className="flex justify-between items-center mb-4"><h2 className="text-xl font-bold">{title}</h2><button onClick={onClose}><X size={20} /></button></div>
      {children}
    </motion.div>
  </motion.div>
);

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");

  // ✅ Fetch payments from real API using new endpoint
  const fetchPayments = async () => {
    setLoading(true);
    setError("");
    try {
      console.log('[Payments] Fetching payments from new API endpoint...');
      const response = await adminApi.getPayments();
      console.log('[Payments] API Response:', response);
      
      // Handle different response structures
      let paymentData = response.data || response;
      if (!Array.isArray(paymentData)) {
        if (paymentData.payments) paymentData = paymentData.payments;
        else if (paymentData.items) paymentData = paymentData.items;
        else if (paymentData.content) paymentData = paymentData.content;
        else paymentData = [paymentData];
      }
      
      // Transform API data to match component structure
      const transformedPayments = paymentData.map(payment => ({
        id: payment.id || payment._id || payment.paymentId,
        orderId: payment.orderId || payment.orderId || `#ORD${payment.id}`,
        amount: payment.amount || payment.total || payment.price || 0,
        status: payment.status || payment.paymentStatus || 'pending',
        method: payment.method || payment.paymentMethod || payment.paymentType || 'Unknown',
        date: payment.date || payment.createdAt || payment.paymentDate || new Date().toISOString().split('T')[0]
      }));
      
      setPayments(transformedPayments);
      console.log('[Payments] Payments loaded successfully:', transformedPayments.length);
    } catch (err) {
      console.error('[Payments] Error fetching payments:', err);
      setError('Failed to load payments. Please try again.');
      toast.error('Failed to load payments');
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  // Filter payments by status
  const filteredPayments = statusFilter === "All" 
    ? payments 
    : payments.filter(p => p.status.toLowerCase() === statusFilter.toLowerCase());

  // Calculate stats
  const totalRevenue = payments.reduce((sum, p) => sum + (typeof p.amount === 'number' ? p.amount : parseFloat(p.amount) || 0), 0);
  const completedPayments = payments.filter(p => p.status.toLowerCase() === 'completed').length;
  const pendingPayments = payments.filter(p => p.status.toLowerCase() === 'pending').length;
  const failedPayments = payments.filter(p => p.status.toLowerCase() === 'failed').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading payments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-12">
        <div className="bg-white rounded-2xl shadow-sm border border-red-200 p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Payments</h3>
          <p className="text-gray-500 text-sm mb-4">{error}</p>
          <button
            onClick={fetchPayments}
            className="px-6 py-2.5 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Payment Management</h1>
          <p className="text-gray-500 text-sm">Monitor and manage all payments</p>
        </div>
        <button
          onClick={fetchPayments}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition"
        >
          <RefreshCw size={18} />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold">${totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Completed</p>
              <p className="text-2xl font-bold text-green-600">{completedPayments}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <CreditCard className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{pendingPayments}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Failed</p>
              <p className="text-2xl font-bold text-red-600">{failedPayments}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border px-4 py-2 rounded-xl"
        >
          <option value="All">All Status</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredPayments.map(p => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium">{p.id}</td>
                <td className="px-6 py-4 text-sm">{p.orderId}</td>
                <td className="px-6 py-4 text-sm font-semibold">${p.amount}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    p.status === "completed" ? "bg-green-100 text-green-700" : 
                    p.status === "failed" ? "bg-red-100 text-red-700" : 
                    "bg-yellow-100 text-yellow-700"
                  }`}>
                    {p.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">{p.method}</td>
                <td className="px-6 py-4 text-sm">{p.date}</td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => { setSelected(p); setShowModal(true); }} 
                    className="p-1 text-gray-400 hover:text-blue-600 transition"
                    title="View Details"
                  >
                    <Eye size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Payment Details Modal */}
      <AnimatePresence>
        {showModal && selected && (
          <Modal title="Payment Details" onClose={() => setShowModal(false)}>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">Payment ID</span>
                <span className="font-semibold">{selected.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Order ID</span>
                <span className="font-semibold">{selected.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Amount</span>
                <span className="font-semibold text-green-600">${selected.amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  selected.status === "completed" ? "bg-green-100 text-green-700" : 
                  selected.status === "failed" ? "bg-red-100 text-red-700" : 
                  "bg-yellow-100 text-yellow-700"
                }`}>
                  {selected.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Payment Method</span>
                <span className="font-semibold">{selected.method}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Payment Date</span>
                <span className="font-semibold">{selected.date}</span>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Payments;