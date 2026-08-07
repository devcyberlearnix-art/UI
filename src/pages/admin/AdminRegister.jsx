// src/pages/admin/AdminRegister.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  UserPlus, Mail, Lock, Phone, Eye, EyeOff, Shield, Users,
  BookOpen, DollarSign, Settings, BarChart3, CheckCircle,
  AlertCircle, ArrowLeft, Crown, Server
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { adminApi } from "../../api/adminApi";
import toast from "react-hot-toast";

const AdminRegister = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const isSuperAdmin = user?.role === "super_admin" || user?.role === "admin" || user?.role === "ADMIN";
  
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    mobileNumber: "",
    alternateMobileNumber: "",
    role: "sub_admin",
    permissions: [],
    assignedService: "USER_SERVICE"
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");

  const serviceOptions = [
    { value: "ORDER_SERVICE", label: "Order Service" },
    { value: "CART_SERVICE", label: "Cart Service" },
    { value: "PAYMENT_SERVICE", label: "Payment Service" },
    { value: "USER_SERVICE", label: "User Service" },
    { value: "COURSE_SERVICE", label: "Course Service" },
    { value: "INSTRUCTOR_SERVICE", label: "Instructor Service" }
  ];

  const permissionCategories = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: BarChart3,
      permissions: [
        { id: "dashboard:view", label: "View Dashboard" },
        { id: "dashboard:stats", label: "View Statistics" }
      ]
    },
    {
      id: "users",
      label: "User Management",
      icon: Users,
      permissions: [
        { id: "users:view", label: "View Users" },
        { id: "users:create", label: "Create Users" },
        { id: "users:edit", label: "Edit Users" },
        { id: "users:delete", label: "Delete Users" },
        { id: "users:block", label: "Block/Unblock Users" }
      ]
    },
    {
      id: "courses",
      label: "Course Management",
      icon: BookOpen,
      permissions: [
        { id: "courses:view", label: "View Courses" },
        { id: "courses:create", label: "Create Courses" },
        { id: "courses:edit", label: "Edit Courses" },
        { id: "courses:delete", label: "Delete Courses" },
        { id: "courses:publish", label: "Publish/Unpublish Courses" }
      ]
    },
    {
      id: "orders",
      label: "Order Management",
      icon: DollarSign,
      permissions: [
        { id: "orders:view", label: "View Orders" },
        { id: "orders:update", label: "Update Orders" },
        { id: "orders:delete", label: "Delete Orders" },
        { id: "orders:export", label: "Export Orders" }
      ]
    },
    {
      id: "reports",
      label: "Reports & Analytics",
      icon: BarChart3,
      permissions: [
        { id: "reports:view", label: "View Reports" },
        { id: "reports:generate", label: "Generate Reports" },
        { id: "reports:export", label: "Export Reports" }
      ]
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      permissions: [
        { id: "settings:view", label: "View Settings" },
        { id: "settings:edit", label: "Edit Settings" },
        { id: "settings:payment", label: "Manage Payment Settings" }
      ]
    }
  ];

  useEffect(() => {
    if (!isSuperAdmin) {
      toast.error("You don't have permission to register admins");
      navigate("/admin/dashboard");
    }
  }, [isSuperAdmin, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const togglePermission = (permissionId) => {
    setForm(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(id => id !== permissionId)
        : [...prev.permissions, permissionId]
    }));
  };

  const toggleCategoryPermissions = (categoryPermissions) => {
    const allIds = categoryPermissions.map(p => p.id);
    const allSelected = allIds.every(id => form.permissions.includes(id));
    
    setForm(prev => ({
      ...prev,
      permissions: allSelected
        ? prev.permissions.filter(id => !allIds.includes(id))
        : [...new Set([...prev.permissions, ...allIds])]
    }));
  };

  const selectAllPermissions = () => {
    const allPermissions = permissionCategories.flatMap(cat => cat.permissions.map(p => p.id));
    const allSelected = allPermissions.every(id => form.permissions.includes(id));
    
    setForm(prev => ({
      ...prev,
      permissions: allSelected ? [] : allPermissions
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (!form.firstName || !form.lastName) {
      setError("First name and last name are required");
      toast.error("First name and last name are required");
      return;
    }

    if (!form.email) {
      setError("Email is required");
      toast.error("Email is required");
      return;
    }

    // Password validation with detailed feedback (do NOT log the raw password)
    const pwd = form.password || "";
    const hasLower = /[a-z]/.test(pwd);
    const hasUpper = /[A-Z]/.test(pwd);
    const hasDigit = /\d/.test(pwd);
    const hasSpecial = /[^A-Za-z0-9]/.test(pwd);
    const isLong = pwd.length >= 8;

    if (!pwd || !isLong || !hasLower || !hasUpper || !hasDigit || !hasSpecial) {
      const missing = [];
      if (!isLong) missing.push('at least 8 characters');
      if (!hasUpper) missing.push('an uppercase letter');
      if (!hasLower) missing.push('a lowercase letter');
      if (!hasDigit) missing.push('a number');
      if (!hasSpecial) missing.push('a special character');

      const message = `Password must include ${missing.join(', ')}.`;
      setError(message);
      toast.error(message);

      // Useful non-sensitive debug info for developer console
      console.log('[AdminRegister] Password validation failed', {
        length: pwd.length,
        hasUpper,
        hasLower,
        hasDigit,
        hasSpecial,
      });
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      toast.error("Passwords do not match");
      return;
    }

    if (!form.mobileNumber) {
      setError("Mobile number is required");
      toast.error("Mobile number is required");
      return;
    }

    if (form.role === "sub_admin" && form.permissions.length === 0) {
      setError("Please select at least one permission for sub-admin");
      toast.error("Please select at least one permission");
      return;
    }

    setLoading(true);
    try {
      console.log("[AdminRegister] Registering admin...");
      console.log("[AdminRegister] Data:", form);

      const payload = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
        confirmPassword: form.confirmPassword,
        mobileNumber: form.mobileNumber,
        alternateMobileNumber: form.alternateMobileNumber || "",
        role: form.role,
        permissions: form.permissions || [],
        assignedService: form.assignedService || "USER_SERVICE"
      };

      console.log("[AdminRegister] Payload being sent:", JSON.stringify(payload, null, 2));

      const response = await adminApi.registerSubAdmin(payload);
      
      console.log("[AdminRegister] Response:", response);

      const registeredEmail = form.email;
      const registeredRole = form.role;

      setSuccess(`${form.role === "super_admin" ? "Super Admin" : "Sub-Admin"} registered successfully!`);
      toast.success(`${form.role === "super_admin" ? "Super Admin" : "Sub-Admin"} registered!`);

      // ✅ Properly logout current user (clears in-memory auth state and storage)
      try {
        await logout();
      } catch (e) {
        // If logout helper fails for any reason, fallback to clearing storage
        console.warn('[AdminRegister] logout() failed, clearing storage manually', e);
        localStorage.removeItem('lms_token');
        localStorage.removeItem('access_token');
        localStorage.removeItem('lms_user');
        sessionStorage.removeItem('lms_token');
        sessionStorage.removeItem('lms_user');
      }

      // ✅ Redirect to registration success page
      setTimeout(() => {
        navigate("/admin/registration-success", { 
          state: { 
            email: registeredEmail,
            role: registeredRole
          } 
        });
      }, 1500);
      
    } catch (error) {
      console.error("[AdminRegister] Error:", error);
      console.error("[AdminRegister] Error response:", error.response?.data);
      
      if (error.code === "ERR_NETWORK" || error.message.includes("Network Error")) {
        setError("Cannot connect to server. Please check if the backend is running.");
        toast.error("Network Error. Please check your connection.");
      } else if (error.response?.status === 400) {
        const errorMsg = error.response?.data?.message || 
                         error.response?.data?.errors?.join(', ') || 
                         "Invalid data. Please check all fields.";
        setError(errorMsg);
        toast.error(errorMsg);
      } else if (error.response?.status === 401) {
        setError("Session expired. Please login again.");
        toast.error("Session expired. Please login again.");
        setTimeout(() => {
          navigate("/admin/login");
        }, 2000);
      } else if (error.response?.status === 403) {
        setError("You don't have permission to register admins.");
        toast.error("You don't have permission to register admins.");
      } else if (error.response?.status === 409) {
        setError("Email already exists. Please use a different email.");
        toast.error("Email already exists.");
      } else if (error.response?.status === 500) {
        setError("Server error. Please try again later.");
        toast.error("Server error. Please try again.");
      } else {
        setError(error.response?.data?.message || error.message || "Registration failed");
        toast.error(error.response?.data?.message || "Registration failed");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to register new admins.</p>
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

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition"
        >
          <ArrowLeft size={20} />
          Back
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-6 md:p-8"
        >
          <div className="text-center mb-8">
            <div className="inline-flex p-3 bg-orange-100 rounded-full mb-4">
              <UserPlus size={32} className="text-orange-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Register {form.role === "super_admin" ? "Super Admin" : "Sub-Admin"}</h1>
            <p className="text-gray-500 text-sm mt-1">
              {form.role === "super_admin" 
                ? "Create a new super admin with full access" 
                : "Create a new sub-admin with custom permissions"}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-green-700 font-medium">{success}</p>
                <p className="text-xs text-green-600 mt-1">Redirecting to login...</p>
              </div>
            </div>
          )}

          {/* Role Selection */}
          <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">Admin Type</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setForm({ ...form, role: "sub_admin" })}
                className={`p-3 rounded-xl border-2 transition flex items-center justify-center gap-2 ${
                  form.role === "sub_admin" 
                    ? "border-orange-500 bg-orange-50" 
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <Users size={18} className={form.role === "sub_admin" ? "text-orange-500" : "text-gray-400"} />
                <span className={form.role === "sub_admin" ? "text-orange-700 font-medium" : "text-gray-600"}>
                  Sub-Admin
                </span>
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, role: "super_admin" })}
                className={`p-3 rounded-xl border-2 transition flex items-center justify-center gap-2 ${
                  form.role === "super_admin" 
                    ? "border-yellow-500 bg-yellow-50" 
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <Crown size={18} className={form.role === "super_admin" ? "text-yellow-500" : "text-gray-400"} />
                <span className={form.role === "super_admin" ? "text-yellow-700 font-medium" : "text-gray-600"}>
                  Super Admin
                </span>
              </button>
            </div>
          </div>

          {/* Assigned Service */}
          <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Server size={16} className="inline mr-2" />
              Assigned Service *
            </label>
            <select
              name="assignedService"
              value={form.assignedService}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none bg-white"
            >
              {serviceOptions.map((service) => (
                <option key={service.value} value={service.value}>
                  {service.label}
                </option>
              ))}
            </select>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              type="button"
              onClick={() => setActiveTab("basic")}
              className={`px-4 py-2 font-medium text-sm transition ${
                activeTab === "basic" 
                  ? "text-orange-600 border-b-2 border-orange-600" 
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Basic Info
            </button>
            {form.role === "sub_admin" && (
              <button
                type="button"
                onClick={() => setActiveTab("permissions")}
                className={`px-4 py-2 font-medium text-sm transition ${
                  activeTab === "permissions" 
                    ? "text-orange-600 border-b-2 border-orange-600" 
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Permissions {form.permissions.length > 0 && `(${form.permissions.length})`}
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {activeTab === "basic" && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                    <input
                      type="text"
                      name="firstName"
                      value={form.firstName}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                      required
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                    <input
                      type="text"
                      name="lastName"
                      value={form.lastName}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                    <div className="relative">
                      <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                        required
                        disabled={loading}
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password *</label>
                    <div className="relative">
                      <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={form.confirmPassword}
                        onChange={handleChange}
                        className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                        required
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number *</label>
                  <div className="relative">
                    <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      name="mobileNumber"
                      value={form.mobileNumber}
                      onChange={handleChange}
                      placeholder="+919876543210"
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Alternate Mobile Number (Optional)</label>
                  <div className="relative">
                    <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      name="alternateMobileNumber"
                      value={form.alternateMobileNumber}
                      onChange={handleChange}
                      placeholder="+919876543210"
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                      disabled={loading}
                    />
                  </div>
                </div>
              </>
            )}

            {activeTab === "permissions" && form.role === "sub_admin" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-700">Select Permissions</h3>
                  <button
                    type="button"
                    onClick={selectAllPermissions}
                    className="text-sm text-orange-500 hover:text-orange-600 font-medium"
                  >
                    {permissionCategories.flatMap(cat => cat.permissions.map(p => p.id)).every(
                      id => form.permissions.includes(id)
                    ) ? "Deselect All" : "Select All"}
                  </button>
                </div>

                {permissionCategories.map((category) => {
                  const allSelected = category.permissions.every(p => form.permissions.includes(p.id));
                  const someSelected = category.permissions.some(p => form.permissions.includes(p.id));
                  
                  return (
                    <div key={category.id} className="border border-gray-200 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <category.icon size={18} className="text-gray-500" />
                          <h4 className="font-medium text-gray-700">{category.label}</h4>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleCategoryPermissions(category.permissions)}
                          className={`text-xs font-medium px-3 py-1 rounded-full transition ${
                            allSelected 
                              ? "bg-orange-100 text-orange-600" 
                              : someSelected 
                              ? "bg-gray-100 text-gray-600" 
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {allSelected ? "Deselect All" : someSelected ? "Select All" : "Select All"}
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {category.permissions.map((permission) => (
                          <label
                            key={permission.id}
                            className={`flex items-center gap-2 p-2 rounded-lg border transition cursor-pointer ${
                              form.permissions.includes(permission.id)
                                ? "border-orange-500 bg-orange-50"
                                : "border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={form.permissions.includes(permission.id)}
                              onChange={() => togglePermission(permission.id)}
                              className="w-4 h-4 text-orange-500 focus:ring-orange-500"
                            />
                            <span className="text-sm text-gray-700">{permission.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition font-medium"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition font-medium shadow-lg shadow-orange-500/25 disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    Registering...
                  </span>
                ) : (
                  `Register ${form.role === "super_admin" ? "Super Admin" : "Sub-Admin"}`
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminRegister;