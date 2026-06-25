import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, X } from "lucide-react";

const mockPayments = [
  { id: "PAY001", orderId: "#ORD001", amount: 49, status: "completed", method: "Credit Card", date: "2025-05-18" },
  { id: "PAY002", orderId: "#ORD002", amount: 79, status: "pending", method: "PayPal", date: "2025-05-17" },
];

const Modal = ({ title, children, onClose }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
    <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-white rounded-2xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
      <div className="flex justify-between items-center mb-4"><h2 className="text-xl font-bold">{title}</h2><button onClick={onClose}><X size={20} /></button></div>
      {children}
    </motion.div>
  </motion.div>
);

const Payments = () => {
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <h1 className="text-2xl font-bold">Payments</h1>
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment ID</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th><th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase"></th></tr></thead>
          <tbody className="divide-y divide-gray-200">
            {mockPayments.map(p => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm">{p.id}</td>
                <td className="px-6 py-4 text-sm">{p.orderId}</td>
                <td className="px-6 py-4 text-sm">${p.amount}</td>
                <td className="px-6 py-4"><span className={`px-2 py-1 text-xs rounded-full ${p.status === "completed" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{p.status}</span></td>
                <td className="px-6 py-4 text-sm">{p.method}</td>
                <td className="px-6 py-4 text-sm">{p.date}</td>
                <td className="px-6 py-4 text-right"><button onClick={() => { setSelected(p); setShowModal(true); }} className="p-1 text-gray-400 hover:text-blue-600"><Eye size={16} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <AnimatePresence>
        {showModal && selected && (
          <Modal title="Payment Details" onClose={() => setShowModal(false)}>
            <div className="space-y-2">
              <p><strong>Payment ID:</strong> {selected.id}</p>
              <p><strong>Order ID:</strong> {selected.orderId}</p>
              <p><strong>Amount:</strong> ${selected.amount}</p>
              <p><strong>Status:</strong> {selected.status}</p>
              <p><strong>Method:</strong> {selected.method}</p>
              <p><strong>Date:</strong> {selected.date}</p>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Payments;