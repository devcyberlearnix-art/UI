// src/components/order/OrderCard.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOrders } from '../../context/OrderContext';
import OrderStatusBadge from './OrderStatusBadge';
import {
  ChevronDown,
  ChevronUp,
  XCircle,
  RefreshCw,
  ShoppingBag,
  ShieldCheck,
  CreditCard,
  Hash,
  Clock,
  Trash2,
} from 'lucide-react';

const SPRING = { type: 'spring', stiffness: 280, damping: 26 };

export const OrderCard = ({ order, onCancel }) => {
  const [expanded, setExpanded] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const { handleCancelOrder } = useOrders();

  const status = String(order.status || 'pending').toLowerCase();
  const items = Array.isArray(order.items) ? order.items : [];
  const orderIdentifier = String(order.orderId || order.id || 'ORDER').slice(-8).toUpperCase();
  const formattedDate = new Date(order.createdAt || Date.now()).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const handleCancel = async () => {
    if (window.confirm('Terminate this pending order license request?')) {
      setCancelling(true);
      try {
        const success = await handleCancelOrder(order.id);
        if (success && onCancel) onCancel();
      } finally {
        setCancelling(false);
      }
    }
  };

  const canCancel = status === 'pending' || status === 'processing';

  return (
    <motion.div
      layout
      transition={SPRING}
      className="bg-[#0F0F13] border border-white/[0.04] rounded-2xl hover:border-white/10 transition-colors duration-300 relative overflow-hidden group shadow-lg shadow-black/40"
    >
      {/* Primary Card Face */}
      <div className="p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          {/* Order Identity Meta */}
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#14141A] border border-white/5 flex items-center justify-center text-[#C5A880] shrink-0">
              <ShoppingBag className="w-5 h-5 opacity-80" />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-[#F5F5F7] tracking-wider">
                  Order #{orderIdentifier}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-mono text-[#8E8E93]">
                <Clock className="w-3 h-3 text-[#C5A880]" />
                <span>{formattedDate}</span>
                <span className="opacity-40">•</span>
                <span>{items.length} track item{items.length === 1 ? '' : 's'}</span>
              </div>
            </div>
          </div>

          {/* Status Badge & Actions Deck */}
          <div className="flex items-center gap-3 self-start sm:self-center">
            <OrderStatusBadge status={status} />

            {canCancel && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCancel}
                disabled={cancelling}
                title="Cancel pending order"
                className="p-1.5 rounded-lg border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 text-rose-300 hover:text-rose-200 transition-colors disabled:opacity-40 cursor-pointer"
              >
                {cancelling ? (
                  <RefreshCw size={14} className="animate-spin text-rose-400" />
                ) : (
                  <Trash2 size={14} />
                )}
              </motion.button>
            )}

            <button
              onClick={() => setExpanded(!expanded)}
              aria-label={expanded ? 'Collapse order blueprint' : 'Expand order blueprint'}
              className="p-1.5 rounded-lg border border-white/5 bg-[#14141A] hover:bg-[#1B1B24] text-[#8E8E93] hover:text-[#F5F5F7] transition-colors cursor-pointer"
            >
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
        </div>

        {/* Lower Value Summary Row */}
        <div className="flex items-center justify-between border-t border-white/[0.04] pt-3.5 text-xs">
          <div className="flex items-center gap-2 text-[11px] text-[#8E8E93]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-mono">Verified Node License</span>
          </div>

          <div className="flex items-baseline gap-1.5">
            <span className="text-[10px] font-mono text-[#8E8E93] uppercase font-bold">Total:</span>
            <span className="text-base font-black font-mono text-[#C5A880]">
              ₹{Number(order.totalAmount || order.total || 0).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Expandable Order Blueprint Drawer */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={SPRING}
            className="border-t border-white/[0.04] bg-[#14141A]/90 p-5 sm:p-6 space-y-4"
          >
            <div>
              <h4 className="text-[10px] font-mono tracking-widest text-[#8E8E93] uppercase font-bold mb-3 flex items-center gap-1.5">
                <Hash className="w-3 h-3 text-[#C5A880]" /> Track Breakdown
              </h4>

              <div className="space-y-2">
                {items.length === 0 ? (
                  <p className="text-xs text-[#8E8E93] font-mono">
                    Node seat package verified in master registry.
                  </p>
                ) : (
                  items.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-[#0F0F13] border border-white/[0.03] flex items-center justify-between text-xs"
                    >
                      <div className="space-y-0.5 min-w-0 pr-4">
                        <p className="font-semibold text-[#F5F5F7] truncate">
                          {item.title || item.name || 'Distributed Architecture Track'}
                        </p>
                        <p className="text-[10px] font-mono text-[#8E8E93]">
                          License Allocation: 1 Seat • Qty: {item.quantity || 1}
                        </p>
                      </div>
                      <span className="font-mono font-bold text-[#E5E5E7] shrink-0">
                        ₹{(Number(item.price || 0) * (item.quantity || 1)).toFixed(2)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Gateway & Settlement Metadata */}
            <div className="pt-3 border-t border-white/[0.04] grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#0F0F13] border border-white/[0.03] space-y-1">
                <span className="block text-[9px] font-mono tracking-wider text-[#8E8E93] uppercase font-bold">
                  Payment Gateway Protocol
                </span>
                <span className="block text-xs font-mono text-[#E5E5E7] flex items-center gap-1.5">
                  <CreditCard className="w-3 h-3 text-[#C5A880]" />
                  {order.paymentMethod || 'Razorpay Gateway Verified'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[#0F0F13] border border-white/[0.03] space-y-1">
                <span className="block text-[9px] font-mono tracking-wider text-[#8E8E93] uppercase font-bold">
                  Security Reference Id
                </span>
                <span className="block text-xs font-mono text-[#E5E5E7] truncate">
                  {order.transactionId || order.paymentId || `TXN-REF-${orderIdentifier}`}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default OrderCard;