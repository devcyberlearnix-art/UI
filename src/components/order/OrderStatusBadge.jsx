// src/components/order/OrderStatusBadge.jsx
import React from 'react';

const statusConfig = {
  pending: {
    label: 'Pending Approval',
    className: 'bg-amber-500/10 text-amber-300 border border-amber-500/20 shadow-[0_0_12px_rgba(245,158,11,0.08)]',
    dot: 'bg-amber-400 animate-pulse',
  },
  processing: {
    label: 'Processing Ingest',
    className: 'bg-[#C5A880]/10 text-[#C5A880] border border-[#C5A880]/30 shadow-[0_0_12px_rgba(197,168,128,0.08)]',
    dot: 'bg-[#C5A880] animate-pulse',
  },
  paid: {
    label: 'Settled & Verified',
    className: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_12px_rgba(16,185,129,0.08)]',
    dot: 'bg-emerald-400',
  },
  delivered: {
    label: 'License Hydrated',
    className: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    dot: 'bg-emerald-400',
  },
  completed: {
    label: 'Completed',
    className: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    dot: 'bg-emerald-400',
  },
  cancelled: {
    label: 'Terminated',
    className: 'bg-rose-500/10 text-rose-300 border border-rose-500/20',
    dot: 'bg-rose-400',
  },
  refunded: {
    label: 'Refund Disbursed',
    className: 'bg-[#14141A] text-[#8E8E93] border border-white/10',
    dot: 'bg-[#8E8E93]',
  },
};

const OrderStatusBadge = ({ status = 'pending' }) => {
  const normalized = String(status).toLowerCase();
  const config = statusConfig[normalized] || statusConfig.pending;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono tracking-wider uppercase font-semibold backdrop-blur-md transition-all select-none ${config.className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <span>{config.label}</span>
    </span>
  );
};

export default OrderStatusBadge;