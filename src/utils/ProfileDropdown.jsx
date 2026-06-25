import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, BookOpen, GraduationCap, ShoppingBag, Heart, Bell, MessageCircle,
  Calendar, Settings, UserCircle, HelpCircle, CreditCard, Shield, LogOut,
  Moon, Sun, Star, Download, Award, Users, TrendingUp, DollarSign, PlusCircle,
  BarChart3, Share2, MessageSquare, Sparkles, Eye, AlertCircle, X, Camera
} from "lucide-react";

const ProfileDropdown = ({ user, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(localStorage.getItem("theme") === "dark");
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Mock data for notifications and messages
  const [notifications, setNotifications] = useState(() => {
    const stored = localStorage.getItem("lms_notifications");
    if (stored) return JSON.parse(stored);
    const defaultNotif = [
      { id: 1, title: "New course added", message: "Full Stack Web Development", read: false, date: "2025-05-16" },
      { id: 2, title: "Assignment reminder", message: "Submit React project by Friday", read: false, date: "2025-05-15" },
    ];
    localStorage.setItem("lms_notifications", JSON.stringify(defaultNotif));
    return defaultNotif;
  });

  const [messages, setMessages] = useState(() => {
    const stored = localStorage.getItem("lms_messages");
    if (stored) return JSON.parse(stored);
    const defaultMsgs = [
      { id: 1, from: "Prof. Smith", message: "Great job on the quiz!", read: false, time: "2h ago" },
    ];
    localStorage.setItem("lms_messages", JSON.stringify(defaultMsgs));
    return defaultMsgs;
  });

  const [editForm, setEditForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    bio: user?.bio || "Lifelong learner",
    skills: user?.skills || "React, Python",
    avatar: user?.avatar || "",
  });

  // Sync editForm when user changes
  useEffect(() => {
    if (user) {
      setEditForm({
        name: user.name || "",
        email: user.email || "",
        bio: user.bio || "Lifelong learner",
        skills: user.skills || "React, Python",
        avatar: user.avatar || "",
      });
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);
  const comingSoon = () => alert("This feature is coming soon!");

  const markNotifRead = (id) => {
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    setNotifications(updated);
    localStorage.setItem("lms_notifications", JSON.stringify(updated));
  };

  const markMsgRead = (id) => {
    const updated = messages.map(m => m.id === id ? { ...m, read: true } : m);
    setMessages(updated);
    localStorage.setItem("lms_messages", JSON.stringify(updated));
  };

  const saveProfile = () => {
    const storedUser = JSON.parse(localStorage.getItem("lms_user") || "{}");
    const updatedUser = { ...storedUser, ...editForm };
    localStorage.setItem("lms_user", JSON.stringify(updatedUser));
    // Reload the page to refresh user info (or you can trigger a re-render)
    window.dispatchEvent(new Event("storage"));
    setShowEditProfile(false);
    alert("Profile updated!");
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setEditForm({ ...editForm, avatar: reader.result });
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      onLogout();
      setIsOpen(false);
    }
  };

  const showTeaching = user?.role === "admin" || user?.role === "instructor";
  const unreadNotifCount = notifications.filter(n => !n.read).length;
  const unreadMsgCount = messages.filter(m => !m.read).length;

  return (
    <div className="relative" ref={dropdownRef}>
      <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-2 focus:outline-none">
        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
          {editForm.avatar ? (
            <img src={editForm.avatar} className="w-full h-full rounded-full object-cover" />
          ) : (
            <User size={16} className="text-orange-600" />
          )}
        </div>
        <span className="text-sm font-medium hidden md:inline">{editForm.name || "User"}</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border z-50"
          >
            <div className="max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="p-4 border-b dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                    {editForm.avatar ? (
                      <img src={editForm.avatar} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <User size={24} className="text-orange-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold">{editForm.name}</h3>
                    <p className="text-xs text-gray-500">{editForm.email}</p>
                    <span className="text-xs bg-orange-100 px-2 py-0.5 rounded-full mt-1 inline-block">
                      {user?.role === "admin" ? "Admin" : user?.role === "instructor" ? "Instructor" : "Student"}
                    </span>
                  </div>
                </div>
                <button onClick={() => setShowEditProfile(true)} className="mt-3 w-full text-sm bg-gray-100 py-1.5 rounded-lg">View / Edit Profile</button>
              </div>

              <div className="py-2">
                <MenuItemSection title="My Learning" icon={BookOpen}>
                  <MenuItem onClick={comingSoon} icon={BookOpen}>Enrolled Courses</MenuItem>
                  <MenuItem onClick={comingSoon} icon={TrendingUp}>Continue Learning</MenuItem>
                  <MenuItem onClick={comingSoon} icon={Award}>Completed Courses</MenuItem>
                  <MenuItem onClick={comingSoon} icon={GraduationCap}>Certificates</MenuItem>
                </MenuItemSection>

                {showTeaching && (
                  <MenuItemSection title="My Teaching" icon={Users}>
                    <MenuItem onClick={comingSoon} icon={BookOpen}>My Courses</MenuItem>
                    <MenuItem onClick={comingSoon} icon={PlusCircle}>Create Course</MenuItem>
                    <MenuItem onClick={comingSoon} icon={BarChart3}>Student Analytics</MenuItem>
                    <MenuItem onClick={comingSoon} icon={DollarSign}>Earnings</MenuItem>
                  </MenuItemSection>
                )}

                <MenuItemSection title="My Cart" icon={ShoppingBag}>
                  <MenuItem onClick={comingSoon} icon={Heart}>Saved Courses</MenuItem>
                  <MenuItem onClick={comingSoon} icon={Star}>Wishlist</MenuItem>
                </MenuItemSection>

                <MenuItem onClick={() => { setShowNotifications(true); setIsOpen(false); }} icon={Bell}>Notifications {unreadNotifCount > 0 && <span className="ml-auto text-xs bg-red-500 text-white px-1.5 rounded-full">{unreadNotifCount}</span>}</MenuItem>
                <MenuItem onClick={() => { setShowMessages(true); setIsOpen(false); }} icon={MessageCircle}>Messages {unreadMsgCount > 0 && <span className="ml-auto text-xs bg-red-500 text-white px-1.5 rounded-full">{unreadMsgCount}</span>}</MenuItem>
                <MenuItem onClick={comingSoon} icon={Calendar}>Calendar & Schedule</MenuItem>
                <MenuItem onClick={() => { setShowSettings(true); setIsOpen(false); }} icon={Settings}>Account Settings</MenuItem>
                <MenuItem onClick={() => setShowEditProfile(true)} icon={UserCircle}>Edit Profile</MenuItem>

                <MenuItemSection title="Help & Support" icon={HelpCircle}>
                  <MenuItem onClick={comingSoon} icon={HelpCircle}>FAQ</MenuItem>
                  <MenuItem onClick={comingSoon} icon={MessageSquare}>Contact Support</MenuItem>
                  <MenuItem onClick={comingSoon} icon={AlertCircle}>Report Issue</MenuItem>
                  <MenuItem onClick={comingSoon} icon={Users}>Community Forum</MenuItem>
                </MenuItemSection>

                <MenuItemSection title="Payments & Billing" icon={CreditCard}>
                  <MenuItem onClick={comingSoon} icon={CreditCard}>Purchase History</MenuItem>
                  <MenuItem onClick={comingSoon} icon={Calendar}>Subscription Plan</MenuItem>
                </MenuItemSection>

                <MenuItemSection title="Security" icon={Shield}>
                  <MenuItem onClick={comingSoon} icon={Shield}>Change Password</MenuItem>
                  <MenuItem onClick={comingSoon} icon={Shield}>Two-Factor Auth</MenuItem>
                </MenuItemSection>

                <MenuItemSection title="Premium Features" icon={Sparkles}>
                  <MenuItem onClick={comingSoon} icon={Eye}>Recently Viewed</MenuItem>
                  <MenuItem onClick={comingSoon} icon={Download}>Downloads</MenuItem>
                  <MenuItem onClick={comingSoon} icon={Award}>Badges</MenuItem>
                  <MenuItem onClick={comingSoon} icon={Share2}>Invite Friends</MenuItem>
                  <MenuItem onClick={comingSoon} icon={MessageSquare}>Send Feedback</MenuItem>
                </MenuItemSection>

                <div className="px-3 py-2 border-t">
                  <button onClick={toggleDarkMode} className="w-full flex justify-between items-center px-3 py-2 rounded-lg hover:bg-gray-100">
                    <div className="flex gap-3"><span>{darkMode ? "Light Mode" : "Dark Mode"}</span></div>
                    <span>{darkMode ? <Sun size={16} /> : <Moon size={16} />}</span>
                  </button>
                </div>

                <div className="p-3 border-t">
                  <button onClick={handleLogout} className="w-full text-red-600 flex gap-3 px-3 py-2 rounded-lg hover:bg-red-50">
                    <LogOut size={18} /> Logout
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      {showEditProfile && (
        <Modal onClose={() => setShowEditProfile(false)} title="Edit Profile">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center overflow-hidden">
                  {editForm.avatar ? <img src={editForm.avatar} className="w-full h-full object-cover" /> : <User size={32} className="text-orange-600" />}
                </div>
                <label className="absolute bottom-0 right-0 bg-orange-600 rounded-full p-1 cursor-pointer">
                  <Camera size={14} className="text-white" />
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                </label>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium">Full Name</label>
                <input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="w-full border rounded-lg p-2" />
              </div>
            </div>
            <div><label className="block text-sm font-medium">Email</label><input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} className="w-full border rounded-lg p-2" /></div>
            <div><label className="block text-sm font-medium">Bio</label><textarea rows="2" value={editForm.bio} onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })} className="w-full border rounded-lg p-2" /></div>
            <div><label className="block text-sm font-medium">Skills</label><input type="text" value={editForm.skills} onChange={(e) => setEditForm({ ...editForm, skills: e.target.value })} className="w-full border rounded-lg p-2" /></div>
            <div className="flex gap-2"><button onClick={saveProfile} className="flex-1 bg-orange-600 text-white py-2 rounded-lg">Save</button><button onClick={() => setShowEditProfile(false)} className="flex-1 border rounded-lg py-2">Cancel</button></div>
          </div>
        </Modal>
      )}

      {showNotifications && (
        <Modal onClose={() => setShowNotifications(false)} title="Notifications">
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {notifications.map(n => (
              <div key={n.id} className={`p-3 rounded-lg border cursor-pointer ${n.read ? "bg-white" : "bg-orange-50"}`} onClick={() => markNotifRead(n.id)}>
                <p className="font-medium">{n.title}</p>
                <p className="text-sm text-gray-500">{n.message}</p>
                <p className="text-xs text-gray-400">{n.date}</p>
              </div>
            ))}
          </div>
        </Modal>
      )}

      {showMessages && (
        <Modal onClose={() => setShowMessages(false)} title="Messages">
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {messages.map(m => (
              <div key={m.id} className={`p-3 rounded-lg border cursor-pointer ${m.read ? "bg-white" : "bg-blue-50"}`} onClick={() => markMsgRead(m.id)}>
                <p className="font-medium">{m.from}</p>
                <p className="text-sm text-gray-500">{m.message}</p>
                <p className="text-xs text-gray-400">{m.time}</p>
              </div>
            ))}
          </div>
        </Modal>
      )}

      {showSettings && (
        <Modal onClose={() => setShowSettings(false)} title="Settings">
          <div className="space-y-3">
            <div className="flex justify-between"><span>Email Notifications</span><input type="checkbox" /></div>
            <div className="flex justify-between"><span>Push Notifications</span><input type="checkbox" /></div>
            <div className="flex justify-between"><span>Language</span><select className="border rounded p-1"><option>English</option></select></div>
            <button onClick={toggleDarkMode} className="w-full bg-gray-100 py-2 rounded-lg">Toggle Dark Mode</button>
          </div>
        </Modal>
      )}
    </div>
  );
};

// Helper Components
const MenuItemSection = ({ title, icon: Icon, children }) => (
  <div className="px-3 py-1">
    <div className="flex items-center gap-2 mb-1 text-xs font-semibold text-gray-400 uppercase">
      <Icon size={12} /> {title}
    </div>
    <div>{children}</div>
  </div>
);

const MenuItem = ({ onClick, icon: Icon, children }) => (
  <button onClick={onClick} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 text-sm">
    <Icon size={16} /> {children}
  </button>
);

const Modal = ({ children, title, onClose }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
    <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
      <div className="flex justify-between items-center p-4 border-b"><h2 className="text-xl font-semibold">{title}</h2><button onClick={onClose}><X size={20} /></button></div>
      <div className="p-4">{children}</div>
    </div>
  </div>
);

export default ProfileDropdown;