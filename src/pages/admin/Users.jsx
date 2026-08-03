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
Eye
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
const fetchUsers = async () => {
  setLoading(true);
  setError("");
  try {
    console.log('[Users] Fetching users from new API endpoint...');
    const response = await adminApi.getUsers();
    console.log('[Users] API Response:', response);
    
    // Handle different response structures
    let userData = response.data || response;
    if (!Array.isArray(userData)) {
      if (userData.users) userData = userData.users;
      else if (userData.items) userData = userData.items;
      else if (userData.content) userData = userData.content;
      else userData = [userData];
    }
    
    // Transform API data to match component structure
    const transformedUsers = userData.map(user => ({
      _id: user.id || user._id || user.userId,
      name: user.name || user.firstName || user.displayName || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
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

);

}

if(selectedRole!=="All"){

data=data.filter(
user=>user.role===selectedRole
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
  const newStatus = user.status === "Active" ? "Blocked" : "Active";
  
  if (newStatus === "Blocked") {
    await adminApi.banUser(id);
  } else {
    await adminApi.unbanUser(id);
  }
  
  const updated = users.map(u =>
    u._id === id ? { ...u, status: newStatus } : u
  );
  setUsers(updated);
  toast.success(`User ${newStatus.toLowerCase()} successfully`);
} catch (err) {
  console.error('[Users] Error toggling status:', err);
  toast.error('Failed to update user status');
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

<div className="bg-gray-50 min-h-screen p-6">

<div className="flex justify-between mb-8">

<div>

<h1 className="text-3xl font-bold">

All Users

</h1>

<p className="text-gray-500">

Manage users

</p>

</div>

{hasPermission('users:edit') && (
<button

onClick={openAddModal}

className="bg-orange-500 text-white px-5 py-3 rounded-xl flex gap-2"

>

<Plus size={18}/>

Add User

</button>
)}

</div>



<div className="grid grid-cols-4 gap-5 mb-8">

<div className="bg-white p-5 rounded-xl">

<h2>Total Users</h2>

<p className="text-3xl font-bold">

{users.length}

</p>

</div>


<div className="bg-white p-5 rounded-xl">

<h2>Students</h2>

<p className="text-3xl text-blue-500">

{
users.filter(
u=>u.role==="Student"
).length
}

</p>

</div>


<div className="bg-white p-5 rounded-xl">

<h2>Instructors</h2>

<p className="text-3xl text-purple-500">

{
users.filter(
u=>u.role==="Instructor"
).length
}

</p>

</div>


<div className="bg-white p-5 rounded-xl">

<h2>Blocked</h2>

<p className="text-3xl text-red-500">

{
users.filter(
u=>u.status==="Blocked"
).length
}

</p>

</div>

</div>



<div className="bg-white p-6 rounded-xl">

<div className="flex gap-4 mb-6">

<input

value={search}

onChange={(e)=>
setSearch(e.target.value)
}

placeholder="Search users"

className="border px-4 py-2 rounded-xl"

/>


<select

value={selectedRole}

onChange={(e)=>

setSelectedRole(
e.target.value
)

}

className="border px-4 py-2 rounded-xl"

>

<option>All</option>

<option>Student</option>

<option>Instructor</option>

</select>


<button

onClick={handleExport}

className="border px-4 py-2 rounded-xl"

>

<Download/>

</button>

</div>



<table className="w-full">

<thead>

<tr>

<th>User</th>
<th>Email</th>
<th>Role</th>
<th>Courses</th>
<th>Status</th>
<th>Actions</th>

</tr>

</thead>

<tbody>

{

filteredUsers.map(user=>(

<tr key={user._id}>

<td>{user.name}</td>

<td>{user.email}</td>

<td>{user.role}</td>

<td>{user.courses}</td>

<td>

<button

onClick={()=>
toggleStatus(user._id)
}

className="px-3 py-1 rounded-full bg-gray-100"

>

{user.status}

</button>

</td>

<td>

<div className="flex gap-3">

<button
onClick={()=>
handleViewDetails(user)
}
className="text-blue-500 hover:text-blue-700"
title="View Details"
>

<Eye/>

</button>

{hasPermission('users:edit') && (
<button
onClick={()=>
openEditModal(user)
}
className="text-green-500 hover:text-green-700"
title="Edit User"
>

<Edit/>

</button>
)}

{hasPermission('users:edit') && (
<button
onClick={()=>
handleDelete(user._id)
}
className="text-red-500 hover:text-red-700"
title="Delete User"
>

<Trash2/>

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



{showModal && (

<div className="fixed inset-0 bg-black/40 flex justify-center items-center">

<div className="bg-white p-6 rounded-xl w-[400px]">

<h2 className="font-bold text-xl mb-5">

{editingUser ? "Edit User":"Add User"}

</h2>

<input
placeholder="Name"
value={formData.name}
onChange={(e)=>
setFormData({
...formData,
name:e.target.value
})
}
className="border p-2 w-full mb-3"
/>

<input
placeholder="Email"
value={formData.email}
onChange={(e)=>
setFormData({
...formData,
email:e.target.value
})
}
className="border p-2 w-full mb-3"
/>

<button

onClick={handleSave}

className="bg-orange-500 text-white w-full py-2 rounded"

>

Save

</button>

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