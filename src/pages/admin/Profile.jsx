import { useState } from "react";
import { motion } from "framer-motion";
import { User, Mail, Phone, Save, LogOut } from "lucide-react";

const AdminProfile = () => {
  const [editMode, setEditMode] = useState(false);
  const [profile, setProfile] = useState({ name: "Admin User", email: "admin@learnmaster.com", phone: "+1 234 567 890" });
  const [temp, setTemp] = useState(profile);

  const handleSave = () => { setProfile(temp); setEditMode(false); alert("Profile updated (mock)"); };
  const handleLogout = () => alert("Logged out (mock)");

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Admin Profile</h1>
      <div className="bg-white rounded-xl shadow-sm border p-6">
        {!editMode ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3"><User size={20} className="text-gray-400" /><span className="font-medium">Name:</span> {profile.name}</div>
            <div className="flex items-center gap-3"><Mail size={20} className="text-gray-400" /><span className="font-medium">Email:</span> {profile.email}</div>
            <div className="flex items-center gap-3"><Phone size={20} className="text-gray-400" /><span className="font-medium">Phone:</span> {profile.phone}</div>
            <div className="flex gap-3 pt-4">
              <button onClick={() => { setTemp(profile); setEditMode(true); }} className="bg-orange-600 text-white px-4 py-2 rounded-lg">Edit Profile</button>
              <button onClick={handleLogout} className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"><LogOut size={16} /> Logout</button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div><label>Name</label><input type="text" className="w-full border rounded-lg p-2" value={temp.name} onChange={e => setTemp({...temp, name: e.target.value})} /></div>
            <div><label>Email</label><input type="email" className="w-full border rounded-lg p-2" value={temp.email} onChange={e => setTemp({...temp, email: e.target.value})} /></div>
            <div><label>Phone</label><input type="tel" className="w-full border rounded-lg p-2" value={temp.phone} onChange={e => setTemp({...temp, phone: e.target.value})} /></div>
            <div className="flex gap-3">
              <button onClick={handleSave} className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"><Save size={16} /> Save</button>
              <button onClick={() => setEditMode(false)} className="bg-gray-600 text-white px-4 py-2 rounded-lg">Cancel</button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AdminProfile;