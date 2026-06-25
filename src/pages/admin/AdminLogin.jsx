import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      localStorage.setItem("access_token", "mock_token");
      localStorage.setItem("user", JSON.stringify({ role: "admin", name: "Admin" }));
      navigate("/admin/dashboard");
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8"><div className="inline-flex p-3 bg-orange-100 rounded-full"><LogIn size={32} className="text-orange-600" /></div><h1 className="text-2xl font-bold mt-2">Admin Login</h1></div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative"><Mail className="absolute left-3 top-3 text-gray-400" size={18} /><input type="email" placeholder="Email" className="w-full pl-10 pr-4 py-2 border rounded-lg" value={email} onChange={e => setEmail(e.target.value)} required /></div>
          <div className="relative"><Lock className="absolute left-3 top-3 text-gray-400" size={18} /><input type="password" placeholder="Password" className="w-full pl-10 pr-4 py-2 border rounded-lg" value={password} onChange={e => setPassword(e.target.value)} required /></div>
          <button type="submit" disabled={loading} className="w-full bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700">{loading ? "Logging in..." : "Login"}</button>
        </form>
        <div className="mt-4 text-center"><a href="/forgot-password" className="text-sm text-orange-600">Forgot Password?</a></div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;