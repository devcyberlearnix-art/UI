// src/pages/admin/Roles.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Users,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  UserCog,
  Key,
  Lock,
  Unlock,
  Settings,
  Crown,
  UserCheck,
  UserX,
  AlertCircle,
  Save,
  X
} from "lucide-react";
import { adminApi } from "../../api/adminApi";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

const Roles = () => {
  const { user } = useAuth();
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    permissions: [],
    isActive: true
  });
  const [selectedPermissions, setSelectedPermissions] = useState([]);

  // Permission categories
  const permissionCategories = {
    users: {
      label: "User Management",
      permissions: [
        { id: "users:view", label: "View Users" },
        { id: "users:create", label: "Create Users" },
        { id: "users:edit", label: "Edit Users" },
        { id: "users:delete", label: "Delete Users" },
        { id: "users:block", label: "Block/Unblock Users" }
      ]
    },
    courses: {
      label: "Course Management",
      permissions: [
        { id: "courses:view", label: "View Courses" },
        { id: "courses:create", label: "Create Courses" },
        { id: "courses:edit", label: "Edit Courses" },
        { id: "courses:delete", label: "Delete Courses" },
        { id: "courses:publish", label: "Publish/Unpublish Courses" }
      ]
    },
    instructors: {
      label: "Instructor Management",
      permissions: [
        { id: "instructors:view", label: "View Instructors" },
        { id: "instructors:approve", label: "Approve Instructors" },
        { id: "instructors:edit", label: "Edit Instructors" },
        { id: "instructors:delete", label: "Delete Instructors" }
      ]
    },
    orders: {
      label: "Order Management",
      permissions: [
        { id: "orders:view", label: "View Orders" },
        { id: "orders:update", label: "Update Orders" },
        { id: "orders:delete", label: "Delete Orders" },
        { id: "orders:export", label: "Export Orders" }
      ]
    },
    settings: {
      label: "Settings & Configuration",
      permissions: [
        { id: "settings:view", label: "View Settings" },
        { id: "settings:edit", label: "Edit Settings" },
        { id: "settings:payment", label: "Manage Payment Settings" },
        { id: "settings:notifications", label: "Manage Notifications" }
      ]
    },
    reports: {
      label: "Reports & Analytics",
      permissions: [
        { id: "reports:view", label: "View Reports" },
        { id: "reports:generate", label: "Generate Reports" },
        { id: "reports:export", label: "Export Reports" }
      ]
    },
    roles: {
      label: "Role Management",
      permissions: [
        { id: "roles:view", label: "View Roles" },
        { id: "roles:create", label: "Create Roles" },
        { id: "roles:edit", label: "Edit Roles" },
        { id: "roles:delete", label: "Delete Roles" }
      ]
    }
  };

  // Mock data - In production, this would come from API
  const mockRoles = [
    {
      id: "1",
      name: "Super Admin",
      description: "Full system access with all permissions",
      permissions: Object.values(permissionCategories).flatMap(cat => 
        cat.permissions.map(p => p.id)
      ),
      users: 2,
      isActive: true,
      createdAt: "2025-01-01"
    },
    {
      id: "2",
      name: "Admin",
      description: "Administrative access with limited user management",
      permissions: [
        "users:view", "users:create", "users:edit",
        "courses:view", "courses:create", "courses:edit",
        "orders:view", "orders:update",
        "settings:view",
        "reports:view", "reports:generate"
      ],
      users: 5,
      isActive: true,
      createdAt: "2025-01-15"
    },
    {
      id: "3",
      name: "Course Manager",
      description: "Manage courses and content",
      permissions: [
        "courses:view", "courses:create", "courses:edit", "courses:publish",
        "instructors:view",
        "reports:view"
      ],
      users: 8,
      isActive: true,
      createdAt: "2025-02-01"
    },
    {
      id: "4",
      name: "Support Staff",
      description: "User support and basic operations",
      permissions: [
        "users:view",
        "orders:view",
        "courses:view"
      ],
      users: 12,
      isActive: true,
      createdAt: "2025-02-15"
    }
  ];

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    setLoading(true);
    try {
      // In production: const data = await adminApi.getRoles();
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setRoles(mockRoles);
    } catch (error) {
      toast.error("Failed to load roles");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (role = null) => {
    if (role) {
      setEditingRole(role);
      setFormData({
        name: role.name,
        description: role.description,
        permissions: role.permissions,
        isActive: role.isActive
      });
      setSelectedPermissions(role.permissions);
    } else {
      setEditingRole(null);
      setFormData({
        name: "",
        description: "",
        permissions: [],
        isActive: true
      });
      setSelectedPermissions([]);
    }
    setShowModal(true);
  };

  const handlePermissionToggle = (permissionId) => {
    setSelectedPermissions(prev => 
      prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleSelectAll = (categoryPermissions) => {
    const allIds = categoryPermissions.map(p => p.id);
    const allSelected = allIds.every(id => selectedPermissions.includes(id));
    
    if (allSelected) {
      setSelectedPermissions(prev => 
        prev.filter(id => !allIds.includes(id))
      );
    } else {
      setSelectedPermissions(prev => 
        [...new Set([...prev, ...allIds])]
      );
    }
  };

  const handleSaveRole = async () => {
    if (!formData.name.trim()) {
      toast.error("Role name is required");
      return;
    }

    try {
      // In production: const data = editingRole 
      //   ? await adminApi.updateRole(editingRole.id, { ...formData, permissions: selectedPermissions })
      //   : await adminApi.createRole({ ...formData, permissions: selectedPermissions });
      
      // Simulate save
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newRole = {
        id: editingRole ? editingRole.id : String(Date.now()),
        name: formData.name,
        description: formData.description,
        permissions: selectedPermissions,
        users: editingRole ? editingRole.users : 0,
        isActive: formData.isActive,
        createdAt: editingRole ? editingRole.createdAt : new Date().toISOString().split('T')[0]
      };

      if (editingRole) {
        setRoles(prev => prev.map(r => r.id === editingRole.id ? newRole : r));
        toast.success("Role updated successfully");
      } else {
        setRoles(prev => [...prev, newRole]);
        toast.success("Role created successfully");
      }

      setShowModal(false);
      setEditingRole(null);
      setSelectedPermissions([]);
    } catch (error) {
      toast.error("Failed to save role");
      console.error(error);
    }
  };

  const handleDeleteRole = async (roleId) => {
    if (!confirm("Are you sure you want to delete this role? This action cannot be undone.")) {
      return;
    }

    try {
      // In production: await adminApi.deleteRole(roleId);
      // Simulate delete
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setRoles(prev => prev.filter(r => r.id !== roleId));
      toast.success("Role deleted successfully");
    } catch (error) {
      toast.error("Failed to delete role");
      console.error(error);
    }
  };

  const getRoleIcon = (roleName) => {
    if (roleName.includes("Super Admin")) return Crown;
    if (roleName.includes("Admin")) return Shield;
    if (roleName.includes("Course")) return BookOpen;
    if (roleName.includes("Support")) return Users;
    return UserCog;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading roles...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Roles & Permissions</h1>
          <p className="text-gray-500 mt-1">Manage user roles and access permissions</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-5 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition"
        >
          <Plus size={20} />
          Create Role
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Roles</p>
              <p className="text-2xl font-bold">{roles.length}</p>
            </div>
            <Shield className="text-orange-500" size={24} />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Roles</p>
              <p className="text-2xl font-bold text-green-600">{roles.filter(r => r.isActive).length}</p>
            </div>
            <CheckCircle className="text-green-500" size={24} />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Inactive Roles</p>
              <p className="text-2xl font-bold text-red-600">{roles.filter(r => !r.isActive).length}</p>
            </div>
            <XCircle className="text-red-500" size={24} />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Users</p>
              <p className="text-2xl font-bold">{roles.reduce((sum, r) => sum + r.users, 0)}</p>
            </div>
            <Users className="text-blue-500" size={24} />
          </div>
        </div>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {roles.map((role) => {
          const Icon = getRoleIcon(role.name);
          return (
            <motion.div
              key={role.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-white rounded-xl shadow-sm border ${
                role.isActive ? "border-gray-200" : "border-red-200 bg-red-50/30"
              } p-6 hover:shadow-md transition`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${
                    role.isActive ? "bg-orange-100" : "bg-gray-200"
                  }`}>
                    <Icon className={`${role.isActive ? "text-orange-600" : "text-gray-500"}`} size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{role.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{role.description}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-xs text-gray-500">
                        {role.users} users assigned
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        role.isActive 
                          ? "bg-green-100 text-green-700" 
                          : "bg-red-100 text-red-700"
                      }`}>
                        {role.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenModal(role)}
                    className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDeleteRole(role.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {/* Permissions Preview */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex flex-wrap gap-1.5">
                  {role.permissions.slice(0, 6).map((perm, idx) => {
                    // Find the permission label
                    let label = perm;
                    for (const cat of Object.values(permissionCategories)) {
                      const found = cat.permissions.find(p => p.id === perm);
                      if (found) {
                        label = found.label;
                        break;
                      }
                    }
                    return (
                      <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        {label}
                      </span>
                    );
                  })}
                  {role.permissions.length > 6 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      +{role.permissions.length - 6} more
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
                <h2 className="text-2xl font-bold">
                  {editingRole ? "Edit Role" : "Create New Role"}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter role name"
                      className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <div className="flex items-center gap-4 pt-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          checked={formData.isActive}
                          onChange={() => setFormData({ ...formData, isActive: true })}
                          className="w-4 h-4 text-orange-500 focus:ring-orange-500"
                        />
                        Active
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          checked={!formData.isActive}
                          onChange={() => setFormData({ ...formData, isActive: false })}
                          className="w-4 h-4 text-orange-500 focus:ring-orange-500"
                        />
                        Inactive
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the role's purpose"
                    rows="2"
                    className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none resize-none"
                  />
                </div>

                {/* Permissions */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Permissions</h3>
                    <button
                      onClick={() => {
                        const allPermissions = Object.values(permissionCategories).flatMap(
                          cat => cat.permissions.map(p => p.id)
                        );
                        const allSelected = allPermissions.every(id => selectedPermissions.includes(id));
                        setSelectedPermissions(allSelected ? [] : allPermissions);
                      }}
                      className="text-sm text-orange-500 hover:text-orange-600 font-medium"
                    >
                      {Object.values(permissionCategories).flatMap(cat => cat.permissions).every(
                        p => selectedPermissions.includes(p.id)
                      ) ? "Deselect All" : "Select All"}
                    </button>
                  </div>

                  {Object.entries(permissionCategories).map(([key, category]) => (
                    <div key={key} className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-700">{category.label}</h4>
                        <button
                          onClick={() => handleSelectAll(category.permissions)}
                          className="text-xs text-blue-500 hover:text-blue-600"
                        >
                          {category.permissions.every(p => selectedPermissions.includes(p.id))
                            ? "Deselect All"
                            : "Select All"}
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {category.permissions.map((permission) => (
                          <label
                            key={permission.id}
                            className={`flex items-center gap-2 p-2 rounded-lg border transition cursor-pointer ${
                              selectedPermissions.includes(permission.id)
                                ? "border-orange-500 bg-orange-50"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={selectedPermissions.includes(permission.id)}
                              onChange={() => handlePermissionToggle(permission.id)}
                              className="w-4 h-4 text-orange-500 focus:ring-orange-500"
                            />
                            <span className="text-sm text-gray-700">{permission.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveRole}
                    className="flex items-center gap-2 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
                  >
                    <Save size={18} />
                    {editingRole ? "Update Role" : "Create Role"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Roles;