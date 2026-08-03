// src/pages/admin/RegistrationSuccess.jsx
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, Mail, Sparkles } from "lucide-react";
import toast from "react-hot-toast";

const RegistrationSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { email, role } = location.state || {};

  useEffect(() => {
    // ✅ Logout current user to prevent auto-redirect
    localStorage.removeItem('lms_token');
    localStorage.removeItem('access_token');
    localStorage.removeItem('lms_user');
    sessionStorage.removeItem('lms_token');
    sessionStorage.removeItem('lms_user');
    
    toast.success("Registration successful! Please login.");
    
    // Redirect to login after 3 seconds
    const timer = setTimeout(() => {
      navigate("/admin/login", { 
        state: { 
          email: email,
          message: `Please login with your ${role || 'sub-admin'} credentials.`
        } 
      });
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [navigate, email, role]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-amber-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center border border-orange-100"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-green-500/10 rounded-full blur-2xl"></div>
          <div className="relative inline-flex p-4 bg-green-100 rounded-full mb-4">
            <CheckCircle size={56} className="text-green-600" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">🎉 Registration Successful!</h1>
        <p className="text-gray-600 mb-2">
          {role === "super_admin" ? "Super Admin" : "Sub-Admin"} has been created successfully.
        </p>
        <div className="bg-orange-50 rounded-xl p-4 mb-4 border border-orange-100">
          <p className="text-sm text-gray-600">
            An email has been sent to <strong className="text-orange-600">{email}</strong>
          </p>
          <p className="text-xs text-gray-400 mt-1">Please check your inbox for login credentials.</p>
        </div>
        
        <div className="flex items-center justify-center gap-3 text-orange-600 bg-orange-50 rounded-xl py-3 px-4 border border-orange-100">
          <Mail size={18} className="animate-pulse" />
          <span className="text-sm font-medium">Redirecting to login page...</span>
          <div className="flex gap-1">
            <div className="w-1.5 h-1.5 bg-orange-600 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="w-1.5 h-1.5 bg-orange-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-1.5 h-1.5 bg-orange-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
        
        <button
          onClick={() => {
            localStorage.removeItem('lms_token');
            localStorage.removeItem('access_token');
            localStorage.removeItem('lms_user');
            sessionStorage.removeItem('lms_token');
            sessionStorage.removeItem('lms_user');
            navigate("/admin/login", { 
              state: { 
                email: email,
                message: `Please login with your ${role || 'sub-admin'} credentials.`
              } 
            });
          }}
          className="mt-4 text-sm text-orange-600 hover:text-orange-700 font-medium transition"
        >
          Click here to login now →
        </button>
        
        <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-center gap-2 text-xs text-gray-400">
          <Sparkles size={12} />
          <span>Secure • 256-bit encrypted</span>
        </div>
      </motion.div>
    </div>
  );
};

export default RegistrationSuccess;