import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ShieldCheck, AlertOctagon, Loader2, CreditCard, LayoutGrid, ArrowLeft } from 'lucide-react';
import { useOrder } from '../../context/OrderContext';
import { orderApi } from '../../api/orderApi';

export default function ResilientCheckout() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderContext = useOrder();
  const formatCurrency = orderContext?.formatCurrency || ((val) => `₹${Number(val || 0).toLocaleString('en-IN')}`);
  const orderId = searchParams.get('id');

  // Query Ingestion Phase: Fetches records directly from database tables using the order validation key
  const { data: orderDetails, isLoading, error } = useQuery({
    queryKey: ['stagedCheckoutOrder', orderId],
    queryFn: async () => {
      if (!orderId) throw new Error('Missing parameter validation identity.');
      const res = await orderApi.getStagedOrder(orderId);
      return res?.data || res;
    },
    enabled: !!orderId,
    retry: 0,
    refetchOnWindowFocus: false
  });

  // Phase 1 & 3: Instant Skeleton Placeholder to block Cumulative Layout Shift (CLS)
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 p-8 flex items-center justify-center text-white">
        <div className="space-y-4 text-center">
          <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mx-auto" />
          <p className="text-sm text-gray-400 font-mono tracking-widest uppercase">Reconciling Ledger State...</p>
        </div>
      </div>
    );
  }

  // Phase 3.5: Security Boundary Exception Handling
  if (!orderId || error || !orderDetails) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4 text-white">
        <div className="max-w-md w-full bg-gray-900 border border-red-500/20 rounded-2xl p-6 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 bg-red-500/10 text-red-400 rounded-full flex items-center justify-center mx-auto border border-red-500/20">
            <AlertOctagon className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-black">Ledger Desync Detected</h3>
            <p className="text-sm text-gray-400">
              The checkout token could not clear validation checks against active system records.
            </p>
          </div>
          <button 
            onClick={() => navigate('/cart')}
            className="w-full py-3 bg-red-600 hover:bg-red-500 font-bold rounded-xl transition-all text-sm tracking-wide flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> RETURN TO CART MATRIX
          </button>
        </div>
      </div>
    );
  }

  const items = orderDetails.items || orderDetails.courses || [];
  const subtotal = orderDetails.subtotal || orderDetails.subtotal_amount || 0;
  const discount = orderDetails.discount || orderDetails.discount_amount || 0;
  const total = orderDetails.total || orderDetails.total_amount || subtotal - discount;

  // Phase 4: Data Resolution Matrix View
  return (
    <div className="min-h-screen bg-gray-950 text-white pt-16 px-4 md:px-8 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl">
          <h2 className="text-lg font-bold flex items-center gap-2 border-b border-gray-800 pb-4 mb-4 uppercase tracking-wider text-gray-300">
            <LayoutGrid className="w-5 h-5 text-indigo-500" /> Staged Line Items
          </h2>
          <div className="divide-y divide-gray-800">
            {items.map((item) => (
              <div key={item.id || item.courseId} className="py-4 flex justify-between items-center">
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-gray-200">{item.title || item.name}</h4>
                  <p className="text-xs text-gray-500 font-mono">System Guid: {item.id || item.courseId}</p>
                </div>
                <span className="font-black text-indigo-400 text-sm">{formatCurrency(item.price || item.purchasePrice || 0)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="lg:col-span-1">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sticky top-24 shadow-xl space-y-6">
          <h3 className="text-sm font-black uppercase tracking-widest text-gray-400">Summary Breakdown</h3>
          <div className="space-y-3 text-sm border-b border-gray-800 pb-4">
            <div className="flex justify-between text-gray-400"><span>Catalog Base Total</span><span>{formatCurrency(subtotal)}</span></div>
            <div className="flex justify-between text-emerald-400"><span>System Discount</span><span>-{formatCurrency(discount)}</span></div>
          </div>
          <div className="flex justify-between items-baseline">
            <span className="text-sm text-gray-300 font-bold">Net Total Due</span>
            <span className="text-2xl font-black text-indigo-400">{formatCurrency(total)}</span>
          </div>
          <div className="text-xs text-gray-500 flex items-center gap-2 bg-gray-950 p-3 rounded-xl border border-gray-800 font-mono">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" /> Signed: {orderId.substring(0, 16)}...
          </div>
          <button className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 font-black text-sm rounded-xl transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 uppercase tracking-widest cursor-pointer">
            <CreditCard className="w-4 h-4" /> Finalize Payment Matrix
          </button>
        </div>
      </div>
    </div>
  );
}
