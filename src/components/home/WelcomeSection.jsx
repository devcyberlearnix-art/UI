import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';

const WelcomeSection = () => {
  const { user } = useAuth();
  
  const initials = user?.name 
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() 
    : 'U';

  const firstName = user?.name ? user.name.split(' ')[0] : 'Student';

  return (
    <motion.section 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white py-12 px-4 md:px-8 border-b border-gray-100"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-6">
        {/* Profile Circle */}
        <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 text-2xl md:text-3xl font-bold shadow-inner border-4 border-purple-50">
          {initials}
        </div>

        {/* Welcome Text */}
        <div className="text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
            Welcome, {firstName}
          </h1>
          <p className="mt-2 text-gray-500 font-medium">
            Ready to learn something new today?
          </p>
          <button className="mt-4 text-purple-600 font-semibold hover:text-purple-800 underline underline-offset-4 decoration-2 transition-all">
            Add occupation and interests
          </button>
        </div>
      </div>
    </motion.section>
  );
};

export default WelcomeSection;
