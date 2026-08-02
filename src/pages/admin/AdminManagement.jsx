// src/pages/admin/AdminManagement.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  UserPlus,
  Edit,
  Trash2,
  Shield,
  UserCog,
  Mail,
  Search,
  CheckCircle,
  Crown,
  RefreshCw,
  Eye,
  AlertCircle
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { adminApi } from "../../api/adminApi";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const AdminManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [admins, setAdmins] = useState([]);
  const [filteredAdmins, setFilteredAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [error, setError] = useState("");

  const isSuperAdmin = user?.role === "super_admin" || user?.role === "admin";

  const fetchAdmins = async () => {
    setLoading(true);
    setError("");
    try {
      console.log("[AdminManagement] Fetching admins...");
      const data = await adminApi.getAdmins();
      console.log("[AdminManagement] Admins data:", data);
      
      if (data && data.length > 0) {
        setAdmins(data);
        setFilteredAdmins(data);
      } else {
        setError("No admins found");
        setAdmins([]);
        setFilteredAdmins([]);
      }
    } catch (error) {
      console.error("[AdminManagement] Error fetching admins:", error);
      setError("Failed to load admins. Please try again.");
      toast.error("Failed to load admins");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSuperAdmin) {
      fetchAdmins();
    }
  }, [isSuperAdmin]);

  useEffect(() => {
    let filtered = admins;

    if (searchTerm) {
      filtered = filtered.filter(admin =>
        `${admin.firstName} ${admin.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedStatus !== "All") {
      filtered = filtered.filter(admin => admin.status === selectedStatus);
    }

    setFilteredAdmins(filtered);
  }, [searchTerm, selectedStatus, admins]);

  const handleDeleteAdmin = async (adminId) => {
    if (!window.confirm("Are you sure you want to delete this admin?")) return;
    try {
      await adminApi.deleteSubAdmin(adminId);
      toast.success("Admin deleted successfully!");
      fetchAdmins();
    } catch (error) {
      console.error("[AdminManagement] Delete error:", error);
      toast.error("Failed to delete admin");
    }
  };

  const handleToggleStatus = async (adminId) => {
    try {
      await adminApi.toggleAdminStatus(adminId);
      toast.success("Admin status updated!");
      fetchAdmins();
    } catch (error) {
      console.error("[AdminManagement] Toggle status error:", error);
      toast.error("Failed to update status");
    }
  };

  const stats = [
    {
      label: "Total Admins",
      value: admins.length,
      icon: Users,
      color: "bg-blue-50",
      textColor: "text-blue-600"
    },
    {
      label: "Super Admin",
      value: admins.filter(a => a.role === "super_admin" || a.role === "admin").length,
      icon: Crown,
      color: "bg-yellow-50",
      textColor: "text-yellow-600"
    },
    {
      label: "Sub Admins",
      value: admins.filter(a => a.role === "sub_admin").length,
      icon: UserCog,
      color: "bg-purple-50",
      textColor: "text-purple-600"
    },
    {
      label: "Active",
      value: admins.filter(a => a.status === "Active").length,
      icon: CheckCircle,
      color: "bg-green-50",
      textColor: "text-green-600"
    }
  ];

  if (!isSuperAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to manage admins.</p>
          <button
            onClick={() => navigate("/admin/dashboard")}
            className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admins...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Management</h1>
          <p className="text-gray-500 text-sm">Manage super admins and sub-admins</p>
        </div>
        <button
          onClick={() => navigate("/admin/register")}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition shadow-lg shadow-orange-500/25"
        >
          <UserPlus size={18} />
          Add Sub-Admin
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-yellow-700">{error}</p>
            <button 
              onClick={fetchAdmins}
              className="text-sm text-yellow-600 hover:text-yellow-800 font-medium mt-1"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-xl ${stat.color}`}>
                <stat.icon className={`w-5 h-5 ${stat.textColor}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search admins by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition bg-gray-50"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none bg-gray-50 text-sm"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            <button
              onClick={fetchAdmins}
              className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition text-sm flex items-center gap-2"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Admins Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Admin</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredAdmins.map((admin) => (
                <tr key={admin.id} className="hover:bg-gray-50/50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={admin.avatar || `https://ui-avatars.com/api/?name=${admin.firstName}+${admin.lastName}&background=random`}
                        alt={`${admin.firstName} ${admin.lastName}`}
                        className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                      />
                      <div>
                        <p className="font-medium text-gray-900">
                          {admin.firstName} {admin.lastName}
                        </p>
                        <p className="text-xs text-gray-400">
                          {admin.role === "super_admin" || admin.role === "admin" ? "Super Admin" : "Sub-Admin"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-sm text-gray-600">{admin.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                      admin.role === "super_admin" || admin.role === "admin"
                        ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                        : "bg-purple-100 text-purple-700 border-purple-200"
                    }`}>
                      {admin.role === "super_admin" || admin.role === "admin" ? "Super Admin" : "Sub-Admin"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleStatus(admin.id)}
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition ${
                        admin.status === "Active"
                          ? "bg-green-100 text-green-700 border-green-200 hover:bg-green-200"
                          : "bg-red-100 text-red-700 border-red-200 hover:bg-red-200"
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${admin.status === "Active" ? "bg-green-500" : "bg-red-500"}`} />
                        {admin.status}
                      </div>
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <button
                        className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      {admin.role !== "super_admin" && admin.role !== "admin" && (
                        <>
                          <button
                            className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteAdmin(admin.id)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                      {(admin.role === "super_admin" || admin.role === "admin") && (
                        <span className="text-xs text-yellow-500 ml-1 flex items-center gap-1">
                          <Crown size={14} />
                          Main
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAdmins.length === 0 && (
          <div className="text-center py-12">
            <div className="flex flex-col items-center">
              <Users className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-700">No admins found</h3>
              <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filters</p>
              <button
                onClick={fetchAdmins}
                className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
              >
                Refresh
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminManagement;