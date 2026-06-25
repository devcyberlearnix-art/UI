// src/pages/admin/Users.jsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Eye, Trash2, Ban, CheckCircle, X } from "lucide-react";
import toast from "react-hot-toast"; // Install: npm install react-hot-toast

const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("access_token")}`,
});

const Users = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch all users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch("https://iodine-pesticide-bulge.ngrok-free.dev/admin/users", {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error(await response.text());
      const data = await response.json();
      setUsers(data.users || data);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ✅ DELETE user
  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to permanently delete this user? This action cannot be undone.")) return;

    try {
      const response = await fetch(`https://iodine-pesticide-bulge.ngrok-free.dev/admin/users/${userId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error(await response.text());

      // Remove user from local state
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));
      toast.success("User deleted successfully");
    } catch (err) {
      toast.error(err.message || "Failed to delete user");
    }
  };

  // Toggle user status (active/blocked) – adjust endpoint as needed
  const handleStatusToggle = async (userId, currentStatus) => {
    const newStatus = currentStatus === "active" ? "blocked" : "active";
    try {
      const response = await fetch(`https://iodine-pesticide-bulge.ngrok-free.dev/admin/users/${userId}/status`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) throw new Error(await response.text());
      setUsers((prevUsers) =>
        prevUsers.map((user) => (user.id === userId ? { ...user, status: newStatus } : user))
      );
      toast.success(`User ${newStatus === "active" ? "activated" : "blocked"} successfully`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleView = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="p-6 text-center">Loading users...</div>;
  if (error) return <div className="p-6 text-center text-red-500">Error: {error}</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">User Management</h1>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            className="pl-9 pr-4 py-2 border rounded-lg w-64"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium">{user.name}</td>
                <td className="px-6 py-4 text-sm">{user.email}</td>
                <td className="px-6 py-4 text-sm capitalize">{user.role}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    user.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <button onClick={() => handleView(user)} className="p-1 text-gray-400 hover:text-blue-600">
                    <Eye size={16} />
                  </button>
                  <button onClick={() => handleStatusToggle(user.id, user.status)} className="p-1 text-gray-400 hover:text-orange-600">
                    {user.status === "active" ? <Ban size={16} /> : <CheckCircle size={16} />}
                  </button>
                  <button onClick={() => handleDelete(user.id)} className="p-1 text-gray-400 hover:text-red-600">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* User Details Modal */}
      <AnimatePresence>
        {showModal && selectedUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">User Details</h2>
                <button onClick={() => setShowModal(false)}><X size={20} /></button>
              </div>
              <div className="space-y-2">
                <p><strong>Name:</strong> {selectedUser.name}</p>
                <p><strong>Email:</strong> {selectedUser.email}</p>
                <p><strong>Role:</strong> {selectedUser.role}</p>
                <p><strong>Status:</strong> {selectedUser.status}</p>
                <p><strong>Joined:</strong> {selectedUser.createdAt || "N/A"}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Users;