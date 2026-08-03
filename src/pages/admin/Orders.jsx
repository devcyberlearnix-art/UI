import React, { useEffect, useState } from "react";
import {
Search,
Download,
Trash2,
Eye,
Loader2,
AlertCircle,
DollarSign,
RefreshCw
} from "lucide-react";
import { adminApi } from "../../api/adminApi";
import toast from "react-hot-toast";

const Orders=()=>{
const [orders,setOrders]=useState([]);
const [filteredOrders,setFilteredOrders]=useState([]);
const [loading,setLoading]=useState(true);
const [error,setError]=useState("");
const [selectedOrder, setSelectedOrder] = useState(null);
const [showModal, setShowModal] = useState(false);

const [search,setSearch]=useState("");
const [statusFilter,setStatusFilter]=useState("All");

// ✅ Fetch orders from real API using new endpoint
const fetchOrders = async () => {
  setLoading(true);
  setError("");
  try {
    console.log('[Orders] Fetching orders from new API endpoint...');
    const response = await adminApi.getOrders();
    console.log('[Orders] API Response:', response);
    
    // Handle different response structures
    let orderData = response.data || response;
    if (!Array.isArray(orderData)) {
      if (orderData.orders) orderData = orderData.orders;
      else if (orderData.items) orderData = orderData.items;
      else if (orderData.content) orderData = orderData.content;
      else orderData = [orderData];
    }
    
    // Transform API data to match component structure
    const transformedOrders = orderData.map(order => ({
      _id: order.id || order._id || order.orderId,
      student: order.studentName || order.student || order.userName || order.customerName || 'Unknown',
      course: order.courseName || order.course || order.productName || 'Unknown Course',
      amount: order.amount || order.total || order.price || 0,
      payment: order.paymentStatus || order.status || order.payment || 'Pending',
      date: order.orderDate || order.createdAt || order.date || new Date().toLocaleDateString()
    }));
    
    setOrders(transformedOrders);
    setFilteredOrders(transformedOrders);
    console.log('[Orders] Orders loaded successfully:', transformedOrders.length);
  } catch (err) {
    console.error('[Orders] Error fetching orders:', err);
    setError('Failed to load orders. Please try again.');
    toast.error('Failed to load orders');
    setOrders([]);
    setFilteredOrders([]);
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  fetchOrders();
}, []);



useEffect(()=>{

let data=[...orders];

if(search){

data=data.filter(order=>

order.student
.toLowerCase()
.includes(search.toLowerCase())

||

order.course
.toLowerCase()
.includes(search.toLowerCase())

);

}

if(statusFilter!=="All"){

data=data.filter(
order=>order.payment===statusFilter
);

}

setFilteredOrders(data);

},[
search,
statusFilter,
orders
]);



const deleteOrder=async (id)=>{
if (!window.confirm('Are you sure you want to delete this order?')) return;

try {
  await adminApi.deleteOrder(id);
  const updated = orders.filter(order => order._id !== id);
  setOrders(updated);
  setFilteredOrders(updated);
  toast.success('Order deleted successfully');
} catch (err) {
  console.error('[Orders] Error deleting order:', err);
  toast.error('Failed to delete order');
}
};

const handleViewDetails = (order) => {
  setSelectedOrder(order);
  setShowModal(true);
};



const exportCSV=()=>{

const csv=

"Order ID,Student,Course,Amount,Payment,Date\n"+

filteredOrders.map(order=>

`${order._id},
${order.student},
${order.course},
${order.amount},
${order.payment},
${order.date}`

).join("\n");

const blob=
new Blob(
[csv],
{type:"text/csv"}
);

const url=
window.URL.createObjectURL(blob);

const a=
document.createElement("a");

a.href=url;

a.download="orders.csv";

a.click();

};



if (loading) {
  return (
    <div className="bg-gray-50 min-h-screen p-6 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Loading orders...</p>
      </div>
    </div>
  );
}

if (error) {
  return (
    <div className="bg-gray-50 min-h-screen p-6 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-sm border border-red-200 p-8 text-center max-w-md">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Orders</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <button
          onClick={fetchOrders}
          className="px-6 py-2.5 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}

return(

<div className="bg-gray-50 min-h-screen p-6">

<div className="mb-6 text-gray-500">

Dashboard {" > "} Orders

</div>



<div className="flex justify-between items-center mb-8">

<div>

<h1 className="text-3xl font-bold">

Course Orders

</h1>

<p className="text-gray-500">

Manage student enrollments

</p>

</div>

<button
onClick={fetchOrders}
className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition"
>
<RefreshCw size={18} />
Refresh
</button>

</div>



<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">

<div className="bg-white p-5 rounded-xl shadow">

<p>Total Orders</p>

<h2 className="text-3xl font-bold">

{orders.length}

</h2>

</div>


<div className="bg-white p-5 rounded-xl shadow">

<p>Paid</p>

<h2 className="text-3xl text-green-500">

{
orders.filter(
o=>o.payment==="Paid"
).length
}

</h2>

</div>


<div className="bg-white p-5 rounded-xl shadow">

<p>Pending</p>

<h2 className="text-3xl text-orange-500">

{
orders.filter(
o=>o.payment==="Pending"
).length
}

</h2>

</div>


<div className="bg-white p-5 rounded-xl shadow">

<p>Revenue</p>

<h2 className="text-3xl text-purple-500">

₹{

orders.reduce(
(sum,o)=>sum+o.amount,
0
)

}

</h2>

</div>

</div>



<div className="bg-white rounded-xl shadow p-6">

<div className="flex flex-wrap gap-3 mb-6">

<div className="relative">

<Search
size={18}
className="absolute left-3 top-3 text-gray-400"
/>

<input
value={search}
onChange={(e)=>
setSearch(e.target.value)
}
placeholder="Search Orders"
className="border rounded-xl pl-10 px-4 py-2"
/>

</div>


<select
value={statusFilter}
onChange={(e)=>
setStatusFilter(e.target.value)
}
className="border rounded-xl px-4 py-2"
>

<option>All</option>
<option>Paid</option>
<option>Pending</option>

</select>


<button
onClick={exportCSV}
className="border px-4 py-2 rounded-xl"
>

<Download/>

</button>

</div>



<div className="overflow-x-auto">

<table className="w-full">

<thead className="border-b">

<tr>

<th>Order ID</th>
<th>Student</th>
<th>Course</th>
<th>Amount</th>
<th>Payment</th>
<th>Date</th>
<th>Actions</th>

</tr>

</thead>


<tbody>

{

filteredOrders.map(order=>(

<tr
key={order._id}
className="border-b"
>

<td className="py-5">

{order._id}

</td>

<td>

<div className="flex items-center gap-3">

<div
className="w-10 h-10 rounded-full bg-orange-100 flex justify-center items-center text-orange-500 font-bold"
>

{order.student.charAt(0)}

</div>

{order.student}

</div>

</td>

<td>
{order.course}
</td>

<td>
₹{order.amount}
</td>


<td>

<span
className={`px-3 py-1 rounded-full

${
order.payment==="Paid"

?

"bg-green-100 text-green-600"

:

"bg-orange-100 text-orange-600"

}
`}
>

{order.payment}

</span>

</td>


<td>
{order.date}
</td>


<td>

<div className="flex gap-3">

<button
onClick={() => handleViewDetails(order)}
className="text-blue-500 hover:text-blue-700 transition"
title="View Details"
>

<Eye size={18}/>

</button>

<button
onClick={()=>
deleteOrder(order._id)
}
className="text-red-500 hover:text-red-700 transition"
title="Delete Order"
>

<Trash2 size={18}/>

</button>

</div>

</td>

</tr>

))

}

</tbody>

</table>

</div>

</div>

{/* Order Details Modal */}
{showModal && selectedOrder && (
<div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
<div className="bg-white rounded-xl p-6 w-[500px] max-h-[80vh] overflow-y-auto">
<div className="flex justify-between items-center mb-4">
<h2 className="text-xl font-bold">Order Details</h2>
<button 
onClick={() => setShowModal(false)}
className="text-gray-400 hover:text-gray-600"
>
✕
</button>
</div>
<div className="space-y-4">
<div className="flex items-center gap-4">
<div className="w-16 h-16 rounded-full bg-orange-100 flex justify-center items-center text-orange-500 font-bold text-xl">
{selectedOrder.student.charAt(0)}
</div>
<div>
<p className="font-semibold text-lg">{selectedOrder.student}</p>
<p className="text-sm text-gray-500">Student</p>
</div>
</div>
<div className="border-t pt-4">
<div className="flex justify-between mb-2">
<p className="text-sm text-gray-500">Order ID</p>
<p className="font-semibold">{selectedOrder._id}</p>
</div>
<div className="flex justify-between mb-2">
<p className="text-sm text-gray-500">Course</p>
<p className="font-semibold">{selectedOrder.course}</p>
</div>
<div className="flex justify-between mb-2">
<p className="text-sm text-gray-500">Amount</p>
<p className="font-semibold text-green-600">₹{selectedOrder.amount}</p>
</div>
<div className="flex justify-between mb-2">
<p className="text-sm text-gray-500">Payment Status</p>
<span className={`px-2 py-1 text-xs rounded-full ${
selectedOrder.payment === "Paid" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
}`}>
{selectedOrder.payment}
</span>
</div>
<div className="flex justify-between mb-2">
<p className="text-sm text-gray-500">Order Date</p>
<p className="font-semibold">{selectedOrder.date}</p>
</div>
</div>
</div>
</div>
</div>
)}

</div>

);

};

export default Orders;