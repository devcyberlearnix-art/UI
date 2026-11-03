import fs from 'fs';

const filePath = 'c:/Users/SHIVASAI/OneDrive/Desktop/FD_LMS/UI/src/pages/admin/Orders.jsx';
let content = fs.readFileSync(filePath, 'utf8').replace(/\r\n/g, '\n');

// 1. Fix order mapping to capture totalAmount and uppercase status
content = content.replace(
  `    const transformedOrders = orderData.map(order => ({
      _id: order.id || order._id || order.orderId,
      student: order.studentName || order.student || order.userName || order.customerName || 'Unknown',
      course: order.courseName || order.course || order.productName || 'Unknown Course',
      amount: order.amount || order.total || order.price || 0,
      payment: order.paymentStatus || order.status || order.payment || 'Pending',
      date: order.orderDate || order.createdAt || order.date || new Date().toLocaleDateString()
    }));`,
  `    const transformedOrders = orderData.map(order => {
      const amt = order.totalAmount ?? order.amount ?? order.total ?? order.price ?? 0;
      return {
        _id: order.orderId || order.id || order._id,
        student: order.userName || order.studentName || order.customerName || (order.userId ? \`Candidate \${order.userId.slice(0, 8)}\` : 'Verified Candidate'),
        course: order.courseName || (order.courseIds && order.courseIds.length > 0 ? \`Course #\${order.courseIds.join(', ')}\` : 'Curriculum Suite'),
        amount: typeof amt === 'number' ? Math.round(amt) : parseFloat(amt) || 0,
        payment: (order.status || order.paymentStatus || 'COMPLETED').toUpperCase(),
        date: order.createdAt ? new Date(order.createdAt).toISOString().split('T')[0] : (order.orderDate || '2026-10-03')
      };
    });`
);

// 2. Fix filter logic for uppercase
content = content.replace(
  'order=>order.payment===statusFilter',
  'order => order.payment.toUpperCase() === statusFilter.toUpperCase()'
);

// 3. Update styling
content = content.replace(
  'className="bg-gray-50 min-h-screen p-6"',
  'className="min-h-screen bg-[#070709] text-[#F5F5F7] p-6 lg:p-10 space-y-8 font-sans selection:bg-[#C5A880]/30 selection:text-white"'
);

content = content.replace(
  '<div className="mb-6 text-gray-500">\n\nDashboard {" > "} Orders\n\n</div>',
  '<div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#14141A] border border-[#C5A880]/30 text-xs font-semibold text-[#C5A880] mb-2">\n<span>Order Ledger & Settlements</span>\n</div>'
);

content = content.replace(
  '<h1 className="text-3xl font-bold">\n\nCourse Orders\n\n</h1>\n\n<p className="text-gray-500">\n\nManage student enrollments\n\n</p>',
  '<h1 className="text-2xl sm:text-3xl font-extrabold text-[#F5F5F7] tracking-tight">Order Ledger & Settlements</h1>\n<p className="text-xs sm:text-sm text-[#8E8E93]">Platform transaction history, order fulfillment, and settlement verification</p>'
);

// 4. Update cards
content = content.replace(/className="bg-white p-5 rounded-xl shadow"/g, 'className="p-5 rounded-2xl bg-[#0F0F13] border border-white/[0.04]"');

// 5. Update main container
content = content.replace(
  'className="bg-white rounded-xl shadow p-6"',
  'className="rounded-3xl bg-[#0F0F13] border border-white/[0.04] p-6 shadow-sm"'
);

// 6. Update search and filter inputs
content = content.replace(
  'className="border rounded-xl pl-10 px-4 py-2"',
  'className="w-full sm:w-80 pl-10 pr-4 py-2 bg-[#14141A] border border-white/[0.08] rounded-xl text-sm text-[#F5F5F7] placeholder-[#71717A] focus:outline-none focus:border-[#C5A880]"'
);

content = content.replace(
  'className="border rounded-xl px-4 py-2"',
  'className="px-4 py-2 bg-[#14141A] border border-white/[0.08] rounded-xl text-xs text-[#F5F5F7] focus:outline-none focus:border-[#C5A880]"'
);

content = content.replace(
  'className="border px-4 py-2 rounded-xl"',
  'className="px-4 py-2 bg-[#14141A] border border-white/[0.08] rounded-xl text-xs text-[#F5F5F7] hover:border-[#C5A880]/40 transition-colors flex items-center gap-1.5"'
);

// 7. Update table header and cells
content = content.replace(
  '<thead className="border-b">',
  '<thead className="bg-[#14141A] text-[#8E8E93] text-[10px] font-bold uppercase tracking-wider border-b border-white/[0.04]">'
);

content = content.replace(
  '<tr key={order._id} className="border-b">',
  '<tr key={order._id} className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors text-xs">'
);

// Options for statusFilter
content = content.replace(
  '<option>All</option>\n<option>Paid</option>\n<option>Pending</option>',
  '<option value="All">All Statuses</option>\n<option value="COMPLETED">Completed</option>\n<option value="PENDING">Pending</option>\n<option value="CANCELLED">Cancelled</option>'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully patched Orders.jsx');

