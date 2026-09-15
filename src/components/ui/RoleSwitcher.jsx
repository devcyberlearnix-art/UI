import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ArrowRightLeft } from "lucide-react";
import { useAuth, checkInstructorStatus } from "../../context/AuthContext";

const rolesConfig = {
  admin: { label: "Admin" },
  instructor: { label: "Instructor" },
  student: { label: "Student" },
};

const RoleSwitcher = ({ currentRole, onRoleChange }) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const rawRole = String(user?.role || user?.role1 || user?.userRole || "").toLowerCase();
  const instStatus = checkInstructorStatus(user?.email);
  const isApprovedInst = instStatus === 'active' || instStatus === 'approved' || localStorage.getItem('instructor_application_status') === 'approved';

  const isUserAdmin = useMemo(() => {
    const stored = localStorage.getItem("lms_user") || "";
    return rawRole.includes("admin") || stored.toLowerCase().includes("admin") || !!user?.isAdmin;
  }, [rawRole, user]);

  const isUserInstructor = useMemo(() => {
    return rawRole.includes("instructor") || isApprovedInst || !!user?.isInstructor;
  }, [rawRole, isApprovedInst, user]);

  const availableChildren = useMemo(() => {
    if (isUserAdmin) {
      return ["admin", "instructor", "student"].filter(r => r !== currentRole);
    }
    if (isUserInstructor) {
      return ["instructor", "student"].filter(r => r !== currentRole);
    }
    return [];
  }, [isUserAdmin, isUserInstructor, currentRole]);

  const handleSelect = (role) => {
    onRoleChange(role);
    setIsOpen(false);
  };

  if (availableChildren.length === 0) return null;

  const currentLabel = rolesConfig[currentRole]?.label || (currentRole ? currentRole.charAt(0).toUpperCase() + currentRole.slice(1) : "Role");

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3.5 py-1.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl shadow-sm hover:from-orange-600 hover:to-amber-600 transition-all duration-200 text-xs font-semibold cursor-pointer"
      >
        <ArrowRightLeft size={14} />
        <span>Switch: {currentLabel}</span>
        <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50"
          >
            <div className="py-2">
              <div className="px-4 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 mb-1">
                Switch Role / View
              </div>
              {availableChildren.map((childKey) => (
                <button
                  key={childKey}
                  onClick={() => handleSelect(childKey)}
                  className="w-full text-left px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors duration-150 flex items-center justify-between"
                >
                  <span>{rolesConfig[childKey]?.label || childKey}</span>
                  <span className="text-[10px] text-gray-400 font-normal">Switch →</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RoleSwitcher;