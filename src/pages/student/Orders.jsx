// src/pages/student/Orders.jsx
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useOrders } from '../../context/OrderContext';
import OrderCard from '../../components/order/OrderCard';
import GlobalLayoutWrapper from '../../design-system/layout/GlobalLayoutWrapper';
import Button from '../../design-system/primitives/Button';
import Badge from '../../design-system/primitives/Badge';
import Skeleton from '../../design-system/primitives/Skeleton';
import EmptyState from '../../design-system/feedback/EmptyState';
import {
  Package,
  RefreshCw,
  ShoppingBag,
  CreditCard,
  ShieldCheck,
  Loader2,
  Filter,
} from 'lucide-react';

const SPRING = { type: 'spring', stiffness: 280, damping: 26 };

const Orders = () => {
  const navigate = useNavigate();
  const { orders = [], loading, loadUserOrders } = useOrders();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('ALL');

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadUserOrders();
    } finally {
      setTimeout(() => setRefreshing(false), 500);
    }
  };

  const filteredOrders = useMemo(() => {
    if (selectedFilter === 'ALL') return orders;
    return orders.filter((order) => {
      const st = String(order.status || 'pending').toLowerCase();
      if (selectedFilter === 'PENDING') return st === 'pending' || st === 'processing';
      if (selectedFilter === 'SETTLED') return st === 'paid' || st === 'delivered' || st === 'completed';
      if (selectedFilter === 'CANCELLED') return st === 'cancelled' || st === 'refunded';
      return true;
    });
  }, [orders, selectedFilter]);

  if (loading && !orders.length) {
    return (
      <GlobalLayoutWrapper showFooter={false}>
        <div className="space-y-6 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-8 w-1/4 rounded bg-[#0F0F13]" />
          <div className="space-y-4">
            <Skeleton className="h-28 w-full rounded-2xl bg-[#0F0F13]" />
            <Skeleton className="h-28 w-full rounded-2xl bg-[#0F0F13]" />
          </div>
        </div>
      </GlobalLayoutWrapper>
    );
  }

  return (
    <GlobalLayoutWrapper showFooter={false}>
      <div className="space-y-6 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 font-sans">
        
        {/* Title Meta Frame */}
        <div className="border-b border-white/[0.04] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold tracking-tight text-[#F5F5F7]">
                Billing Records & Order Pipeline
              </h1>
              <Badge
                variant="pewter"
                className="bg-[#14141A] text-[#C5A880] border-white/5 font-mono text-[10px] px-2 py-0.5"
              >
                {orders.length} Total
              </Badge>
            </div>
            <p className="text-xs text-[#8E8E93] font-light mt-0.5">
              Cryptographically verified transaction telemetry and seat license records.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="gap-1.5 text-xs bg-[#14141A] border-white/5 hover:border-white/10 cursor-pointer"
            >
              <RefreshCw
                size={14}
                className={`text-[#C5A880] ${refreshing ? 'animate-spin' : ''}`}
              />
              <span>{refreshing ? 'Syncing...' : 'Refresh Records'}</span>
            </Button>
          </div>
        </div>

        {/* Status Filter Tab Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'ALL', label: 'All Records', count: orders.length },
            {
              id: 'PENDING',
              label: 'Pending Ingest',
              count: orders.filter((o) => ['pending', 'processing'].includes(String(o.status || '').toLowerCase())).length,
            },
            {
              id: 'SETTLED',
              label: 'Settled & Verified',
              count: orders.filter((o) => ['paid', 'delivered', 'completed'].includes(String(o.status || '').toLowerCase())).length,
            },
            {
              id: 'CANCELLED',
              label: 'Terminated',
              count: orders.filter((o) => ['cancelled', 'refunded'].includes(String(o.status || '').toLowerCase())).length,
            },
          ].map((tab) => {
            const active = selectedFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedFilter(tab.id)}
                className={`relative px-3.5 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-colors duration-200 select-none cursor-pointer shrink-0 flex items-center gap-1.5 border ${
                  active
                    ? 'border-[#C5A880]/40 text-[#C5A880] bg-[#14141A]'
                    : 'border-white/[0.04] text-[#8E8E93] hover:text-[#F5F5F7] bg-[#0F0F13] hover:border-white/10'
                }`}
              >
                <span>{tab.label}</span>
                <span className="text-[10px] font-mono opacity-60">({tab.count})</span>
              </button>
            );
          })}
        </div>

        {/* Orders List / Empty State */}
        {filteredOrders.length === 0 ? (
          <EmptyState
            title="No Transaction Telemetry Found"
            description={
              selectedFilter === 'ALL'
                ? "You haven't initiated any curriculum orders or node licenses yet."
                : `No orders matching filter '${selectedFilter.toLowerCase()}'.`
            }
            actionLabel="Explore Catalog Matrix"
            onAction={() => navigate('/courses')}
          />
        ) : (
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {filteredOrders.map((order, idx) => (
                <motion.div
                  key={order.id || `order-${idx}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ delay: idx * 0.04, ...SPRING }}
                >
                  <OrderCard order={order} onCancel={() => loadUserOrders()} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

      </div>
    </GlobalLayoutWrapper>
  );
};

export default Orders;