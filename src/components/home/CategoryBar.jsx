import React, { useRef } from 'react';
import { motion } from 'framer-motion';

const categories = [
  'Development',
  'Business',
  'Finance',
  'IT & Software',
  'Office Productivity',
  'Personal Development',
  'Design',
  'Marketing',
  'Health & Fitness',
  'Music'
];

const CategoryBar = () => {
  const scrollRef = useRef(null);

  return (
    <div className="bg-white border-b border-gray-200 sticky top-16 z-40 shadow-sm overflow-hidden">
      <div className="max-w-screen-2xl mx-auto">
        <div 
          ref={scrollRef}
          className="flex items-center gap-8 px-4 md:px-8 py-3 overflow-x-auto no-scrollbar scroll-smooth"
        >
          {categories.map((category, index) => (
            <motion.button
              key={category}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="whitespace-nowrap text-sm font-medium text-gray-600 hover:text-purple-700 transition-colors cursor-pointer"
            >
              {category}
            </motion.button>
          ))}
        </div>
      </div>
      
      {/* Optional: Add custom scrollbar hiding styles if needed in index.css */}
      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  );
};

export default CategoryBar;
