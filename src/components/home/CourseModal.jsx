import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoClose, IoStar, IoTimeOutline, IoGlobeOutline, IoCheckmarkCircle } from 'react-icons/io5';

const CourseModal = ({ isOpen, onClose, course }) => {
  if (!course) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden z-[70] max-h-[90vh] overflow-y-auto"
          >
            {/* Close Button */}
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/40 text-gray-800 rounded-full transition-all z-10"
            >
              <IoClose size={24} />
            </button>

            {/* Course Image Header */}
            <div className="relative h-64 overflow-hidden">
              <img 
                src={course.image} 
                alt={course.title} 
                className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <div className="flex gap-2 mb-3">
                  {course.isBestseller && (
                    <span className="px-2 py-1 bg-yellow-400 text-yellow-900 text-[10px] font-bold rounded uppercase">Bestseller</span>
                  )}
                  {course.isPremium && (
                    <span className="px-2 py-1 bg-purple-600 text-white text-[10px] font-bold rounded uppercase tracking-wider">Premium</span>
                  )}
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight">
                  {course.title}
                </h2>
              </div>
            </div>

            {/* Content Details */}
            <div className="p-8">
              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 mb-6">
                <span className="flex items-center gap-1 font-semibold text-green-600">
                  Updated {course.updatedDate}
                </span>
                <span className="flex items-center gap-1">
                  <IoTimeOutline size={16} /> {course.duration} total hours
                </span>
                <span className="flex items-center gap-1">
                  <IoGlobeOutline size={16} /> English
                </span>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Course Highlights</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {course.highlights?.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                        <IoCheckmarkCircle className="text-purple-600 mt-0.5 flex-shrink-0" size={18} />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <p className="text-gray-600 text-sm leading-relaxed italic">
                  {course.subtitle}
                </p>

                <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                  <div className="flex flex-col">
                    <span className="text-3xl font-bold text-gray-900">${course.price}</span>
                    <span className="text-sm text-gray-400 line-through">${course.originalPrice}</span>
                  </div>
                  <button className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-lg shadow-purple-200 transition-all transform hover:-translate-y-1 active:translate-y-0">
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CourseModal;
