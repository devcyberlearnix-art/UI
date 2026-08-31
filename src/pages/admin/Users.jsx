import React, { useEffect, useState } from "react";
import {
Search,
Filter,
Download,
Edit,
Trash2,
Plus,
Loader2,
AlertCircle,
Eye,
Users as UsersIcon,
GraduationCap,
BookOpen,
Shield
} from "lucide-react";
import { adminApi } from "../../api/adminApi";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

const Users = () => {
const { user } = useAuth();
const userRole = user?.role || 'admin';
const isSuperAdmin = userRole === 'super_admin' || userRole === 'admin';
const permissions = user?.permissions || [];

const [users,setUsers]=useState([]);
const [filteredUsers,setFilteredUsers]=useState([]);
const [search,setSearch]=useState("");
const [selectedRole,setSelectedRole]=useState("All");
const [loading,setLoading]=useState(true);
const [error,setError]=useState("");

const [showModal,setShowModal]=useState(false);
const [selectedUser, setSelectedUser] = useState(null);
const [showViewModal, setShowViewModal] = useState(false);

const [editingUser,setEditingUser]=useState(null);

const [formData,setFormData]=useState({
name:"",
email:"",
role:"Student",
courses:0,
status:"Active"
});

// Check if user has specific permission
const hasPermission = (permission) => {
  return isSuperAdmin || permissions.includes(permission);
};

// ✅ Fetch users from real API using new endpoint
const fetchUsers = async (page = 0, size = 10) => {
  setLoading(true);
  setError("");
  try {
    console.log('[Users] Fetching users from API endpoint with pagination:', { page, size });
    const response = await adminApi.getUsers(page, size);
    console.log('[Users] API Response:', response);
    
    // Handle different response structures
    let userData = response.data?.users || response.users || response.data || response;
    if (!Array.isArray(userData)) {
      if (userData.users) userData = userData.users;
      else if (userData.items) userData = userData.items;
      else if (userData.content) userData = userData.content;
      else userData = [userData];
    }
    
    // Transform API data to match component structure
    const transformedUsers = userData.map(user => ({
      _id: user.id || user._id || user.userId,
      name: user.name || user.firstName || user.displayName || user.email?.split('@')[0] || 'Unknown',
      email: user.email || '',
      role: user.role || user.role1 || user.userRole || 'User',
      courses: user.courses || user.enrolledCourses || 0,
      status: user.status || user.accountStatus || 'Active',
      createdAt: user.createdAt || user.joinedDate || new Date().toLocaleDateString()
    }));
    
    setUsers(transformedUsers);
    setFilteredUsers(transformedUsers);
    console.log('[Users] Users loaded successfully:', transformedUsers.length);
  } catch (err) {
    console.error('[Users] Error fetching users:', err);
    setError('Failed to load users. Please try again.');
    toast.error('Failed to load users');
    // Set empty array on error
    setUsers([]);
    setFilteredUsers([]);
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  fetchUsers();
}, []);



useEffect(()=>{

let data=[...users];

if(search){

data=data.filter(user=>

user.name.toLowerCase()
.includes(search.toLowerCase())

||

user.email.toLowerCase()
.includes(search.toLowerCase())

||

user._id.toLowerCase()
.includes(search.toLowerCase())

);

}

if(selectedRole!=="All"){

data=data.filter(
user=>user.role?.toUpperCase()===selectedRole.toUpperCase()
);

}

setFilteredUsers(data);

},[search,selectedRole,users]);



const handleDelete=async (id)=>{
if (!hasPermission('users:edit')) {
  toast.error('You do not have permission to delete users');
  return;
}

if (!window.confirm('Are you sure you want to delete this user?')) return;

try {
  await adminApi.deleteUser(id);
  const updated = users.filter(user => user._id !== id);
  setUsers(updated);
  setFilteredUsers(updated);
  toast.success('User deleted successfully');
} catch (err) {
  console.error('[Users] Error deleting user:', err);
  toast.error('Failed to delete user');
}
};



const handleExport=()=>{

const csv=

"Name,Email,Role,Courses,Status\n"+

filteredUsers.map(user=>

`${user.name},
${user.email},
${user.role},
${user.courses},
${user.status}`

).join("\n");

const blob=
new Blob([csv],{
type:"text/csv"
});

const url=
window.URL.createObjectURL(blob);

const a=
document.createElement("a");

a.href=url;
a.download="users.csv";
a.click();

};



const openAddModal=()=>{

if (!hasPermission('users:edit')) {
  toast.error('You do not have permission to add users');
  return;
}

setEditingUser(null);

setFormData({

name:"",
email:"",
role:"Student",
courses:0,
status:"Active"

});

setShowModal(true);

};



const openEditModal=(user)=>{

if (!hasPermission('users:edit')) {
  toast.error('You do not have permission to edit users');
  return;
}

setEditingUser(user);

setFormData(user);

setShowModal(true);

};

const handleViewDetails = (user) => {
  setSelectedUser(user);
  setShowViewModal(true);
};



const handleSave=async ()=>{
try {
  if(editingUser){
    await adminApi.updateUser(editingUser._id, formData);
    const updated = users.map(user =>
      user._id === editingUser._id ? { ...user, ...formData } : user
    );
    setUsers(updated);
    setFilteredUsers(updated);
    toast.success('User updated successfully');
  }else{
    // Create new user with proper API call
    const newUserPayload = {
      firstName: formData.name.split(' ')[0] || formData.name,
      lastName: formData.name.split(' ').slice(1).join(' ') || '',
      email: formData.email,
      role: formData.role.toLowerCase(),
      password: 'defaultPassword123', // Default password, should be changed
      status: formData.status
    };
    
    await adminApi.createUser(newUserPayload);
    toast.success('User created successfully');
    // Refresh users after creation
    await fetchUsers();
  }
  setShowModal(false);
} catch (err) {
  console.error('[Users] Error saving user:', err);
  toast.error(err.response?.data?.message || 'Failed to save user');
}
};



const toggleStatus=async (id)=>{
try {
  const user = users.find(u => u._id === id);
  // Toggle between ACTIVE and SUSPENDED based on current status
  const currentStatus = user.status?.toUpperCase();
  const newStatus = currentStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
  
  console.log('[Users] Updating user status:', { id, currentStatus, newStatus });
  await adminApi.updateUserStatus(id, newStatus);
  
  const updated = users.map(u =>
    u._id === id ? { ...u, status: newStatus } : u
  );
  setUsers(updated);
  toast.success(`User status updated to ${newStatus}`);
} catch (err) {
  console.error('[Users] Error toggling status:', err);
  toast.error(err.response?.data?.message || 'Failed to update user status');
}
};



if (loading) {
  return (
    <div className="bg-gray-50 min-h-screen p-6 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Loading users...</p>
      </div>
    </div>
  );
}

if (error) {
  return (
    <div className="bg-gray-50 min-h-screen p-6 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-sm border border-red-200 p-8 text-center max-w-md">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Users</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <button
          onClick={fetchUsers}
          className="px-6 py-2.5 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}

return(
<div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen p-8">

<div className="flex justify-between items-center mb-8">

<div>

<h1 className="text-4xl font-bold text-gray-900 mb-2">

User Management

</h1>

<p className="text-gray-600 text-lg">

Manage and monitor all platform users

</p>

</div>

{hasPermission('users:edit') && (

<button

onClick={openAddModal}

className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl"

>

<Plus size={18}/>

<span className="font-medium">Add User</span>

</button>

)}

</div>



<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

<div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">

<div className="flex items-center justify-between mb-4">

<div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">

<UsersIcon className="w-6 h-6 text-blue-600"/>

</div>

<span className="text-sm text-gray-500 font-medium">Total Users</span>

</div>

<p className="text-3xl font-bold text-gray-900">

{users.length}

</p>

<p className="text-sm text-gray-500 mt-1">All registered users</p>

</div>


<div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">

<div className="flex items-center justify-between mb-4">

<div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">

<GraduationCap className="w-6 h-6 text-blue-600"/>

</div>

<span className="text-sm text-gray-500 font-medium">Students</span>

</div>

<p className="text-3xl font-bold text-blue-600">

{
users.filter(
u=>u.role?.toUpperCase()==="STUDENT"
).length
}

</p>

<p className="text-sm text-gray-500 mt-1">Active learners</p>

</div>


<div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">

<div className="flex items-center justify-between mb-4">

<div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">

<BookOpen className="w-6 h-6 text-purple-600"/>

</div>

<span className="text-sm text-gray-500 font-medium">Instructors</span>

</div>

<p className="text-3xl font-bold text-purple-600">

{
users.filter(
u=>u.role?.toUpperCase()==="INSTRUCTOR"
).length
}

</p>

<p className="text-sm text-gray-500 mt-1">Course creators</p>

</div>


<div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">

<div className="flex items-center justify-between mb-4">

<div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">

<Shield className="w-6 h-6 text-orange-600"/>

</div>

<span className="text-sm text-gray-500 font-medium">Admins</span>

</div>

<p className="text-3xl font-bold text-orange-600">

{
users.filter(
u=>u.role?.toUpperCase().includes("ADMIN")
).length
}

</p>

<p className="text-sm text-gray-500 mt-1">Platform administrators</p>

</div>

</div>


<div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

<div className="p-6 border-b border-gray-200">

<div className="flex flex-col md:flex-row gap-4 items-center justify-between">

<div className="flex-1 w-full md:w-auto">

<div className="relative">

<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"/>

<input

value={search}

onChange={(e)=>
setSearch(e.target.value)
}

placeholder="Search by name, email, or ID..."

className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"

/>

</div>

</div>


<div className="flex gap-3 items-center">

<select

value={selectedRole}

onChange={(e)=>

setSelectedRole(
e.target.value
)

}

className="px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"

>

<option value="All">All Roles</option>

<option value="Student">Students</option>

<option value="Instructor">Instructors</option>

<option value="MAIN_ADMIN">Main Admins</option>

<option value="SUB_ADMIN">Sub Admins</option>

</select>


<button

onClick={handleExport}

className="px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2"

>

<Download size={18}/>

<span className="text-sm font-medium">Export</span>

</button>

</div>

</div>

</div>


<div className="overflow-x-auto">

<table className="w-full">

<thead>

<tr className="bg-gray-50">

<th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">User</th>

<th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>

<th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</th>

<th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Courses</th>

<th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>

<th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>

</tr>

</thead>

<tbody className="divide-y divide-gray-200">

{

filteredUsers.map(user=>(

<tr key={user._id} className="hover:bg-gray-50 transition-colors">

<td className="px-6 py-4">

<div className="flex items-center gap-3">

<div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-semibold text-sm">

{user.name.charAt(0).toUpperCase()}

</div>

<div>

<p className="font-medium text-gray-900">{user.name}</p>

<p className="text-xs text-gray-500">ID: {user._id.slice(0, 8)}...</p>

</div>

</div>

</td>

<td className="px-6 py-4">

<p className="text-gray-600">{user.email}</p>

</td>

<td className="px-6 py-4">

<span className={`px-3 py-1 text-xs font-medium rounded-full ${
user.role?.toUpperCase().includes('ADMIN') ? 'bg-orange-100 text-orange-700' :
user.role?.toUpperCase() === 'INSTRUCTOR' ? 'bg-purple-100 text-purple-700' :
user.role?.toUpperCase() === 'STUDENT' ? 'bg-blue-100 text-blue-700' :
'bg-gray-100 text-gray-700'
}`}>

{user.role}

</span>

</td>

<td className="px-6 py-4">

<p className="text-gray-600 font-medium">{user.courses}</p>

</td>

<td className="px-6 py-4">

<span className={`px-3 py-1 text-xs font-medium rounded-full cursor-pointer hover:opacity-80 transition-opacity ${
user.status?.toUpperCase() === 'ACTIVE' ? 'bg-green-100 text-green-700' :
user.status?.toUpperCase() === 'SUSPENDED' ? 'bg-red-100 text-red-700' :
user.status?.toUpperCase() === 'PENDING_VERIFICATION' ? 'bg-yellow-100 text-yellow-700' :
user.status?.toUpperCase() === 'LOCKED' ? 'bg-gray-100 text-gray-700' :
'bg-gray-100 text-gray-700'
}`} onClick={()=>toggleStatus(user._id)} title="Click to toggle status">

{user.status}

</span>

</td>

<td className="px-6 py-4">

<div className="flex gap-2 justify-end">

<button

onClick={()=>
handleViewDetails(user)
}
className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
title="View Details"
>

<Eye size={18}/>

</button>

{hasPermission('users:edit') && (
<button

onClick={()=>
openEditModal(user)
}
className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
title="Edit User"
>

<Edit size={18}/>

</button>
)}

{hasPermission('users:edit') && (
<button

onClick={()=>
handleDelete(user._id)
}
className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
title="Delete User"
>

<Trash2 size={18}/>

</button>
)}

</div>

</td>

</tr>

))

}

</tbody>

</table>

</div>

</div>


{showModal && (

<div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">

<div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">

<div className="p-6 border-b border-gray-200">

<h2 className="font-bold text-xl text-gray-900">

{editingUser ? "Edit User" : "Add New User"}

</h2>

</div>

<div className="p-6 space-y-4">

<div>

<label className="block text-sm font-medium text-gray-700 mb-2">Name</label>

<input

placeholder="Enter user name"

value={formData.name}

onChange={(e)=>
setFormData({
...formData,
name:e.target.value
})
}
className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"

/>

</div>

<div>

<label className="block text-sm font-medium text-gray-700 mb-2">Email</label>

<input

placeholder="Enter email address"

value={formData.email}

onChange={(e)=>
setFormData({
...formData,
email:e.target.value
})
}
className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"

/>

</div>

<div>

<label className="block text-sm font-medium text-gray-700 mb-2">Role</label>

<select

value={formData.role}

onChange={(e)=>
setFormData({
...formData,
role:e.target.value
})
}
className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
>

<option value="Student">Student</option>

<option value="Instructor">Instructor</option>

<option value="MAIN_ADMIN">Main Admin</option>

<option value="SUB_ADMIN">Sub Admin</option>

</select>

</div>

</div>

<div className="p-6 border-t border-gray-200 flex gap-3 justify-end">

<button

onClick={()=>setShowModal(false)}

className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"

>

Cancel

</button>

<button

onClick={handleSave}

className="px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all"

>

{editingUser ? "Update User" : "Create User"}

</button>

</div>

</div>

</div>

)}


{/* View Details Modal */}
{showViewModal && selectedUser && (
<div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
<div className="bg-white rounded-xl p-6 w-[500px] max-h-[80vh] overflow-y-auto">
<div className="flex justify-between items-center mb-4">
<h2 className="text-xl font-bold">User Details</h2>
<button 
onClick={() => setShowViewModal(false)}
className="text-gray-400 hover:text-gray-600"
>
✕
</button>
</div>
<div className="space-y-4">
<div className="flex items-center gap-4">
<div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 font-bold text-xl">
{selectedUser.name.charAt(0)}
</div>
<div>
<p className="font-semibold text-lg">{selectedUser.name}</p>
<p className="text-sm text-gray-500">{selectedUser.email}</p>
</div>
</div>
<div className="grid grid-cols-2 gap-4">
<div>
<p className="text-sm text-gray-500">Role</p>
<p className="font-semibold">{selectedUser.role}</p>
</div>
<div>
<p className="text-sm text-gray-500">Courses</p>
<p className="font-semibold">{selectedUser.courses}</p>
</div>
<div>
<p className="text-sm text-gray-500">Status</p>
<span className={`px-2 py-1 text-xs rounded-full ${
selectedUser.status === "Active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
}`}>
{selectedUser.status}
</span>
</div>
<div>
<p className="text-sm text-gray-500">Joined Date</p>
<p className="font-semibold">{selectedUser.createdAt}</p>
</div>
</div>
</div>
</div>
</div>
)}

</div>

);

};

export default Users;