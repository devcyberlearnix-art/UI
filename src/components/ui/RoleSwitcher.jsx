import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const rolesConfig = {
  admin: {
    label: "Admin",
    allowedChildren: ["instructor", "student"],
    childrenLabels: { instructor: "Instructor", student: "Student" },
  },
  instructor: {
    label: "Instructor",
    allowedChildren: ["student"],
    childrenLabels: { student: "Student" },
  },
  student: {
    label: "Student",
    allowedChildren: [],
    childrenLabels: {},
  },
};

const RoleSwitcher = ({ currentRole, onRoleChange }) => {
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

  const currentConfig = rolesConfig[currentRole] || rolesConfig.student;
  const availableChildren = currentConfig.allowedChildren;

  const handleSelect = (role) => {
    onRoleChange(role);
    setIsOpen(false);
  };

  if (availableChildren.length === 0) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-all duration-200 text-gray-700 text-sm font-medium"
      >
        {currentConfig.label}
        <ChevronDown size={16} className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50"
          >
            <div className="py-2">
              <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {currentConfig.label}
              </div>
              <div className="relative pl-6">
                <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-200"></div>
                {availableChildren.map((childKey) => (
                  <div key={childKey} className="relative">
                    <div className="absolute left-4 top-1/2 w-4 h-px bg-gray-200"></div>
                    <button
                      onClick={() => handleSelect(childKey)}
                      className="w-full text-left px-8 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-orange-600 transition-colors duration-150"
                    >
                      {rolesConfig[childKey].label}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RoleSwitcher;