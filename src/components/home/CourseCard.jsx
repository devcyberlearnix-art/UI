import React from 'react';
import { motion } from 'framer-motion';
import { IoStar, IoPeopleOutline } from 'react-icons/io5';

const CourseCard = ({ course, onOpenModal }) => {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer h-full flex flex-col"
      onClick={() => onOpenModal(course)}
    >
      {/* Thumbnail */}
      <div className="relative h-44 overflow-hidden">
        <img 
          src={course.image} 
          alt={course.title} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {course.isBestseller && (
            <span className="bg-yellow-400 text-yellow-900 text-[10px] font-extrabold px-2 py-0.5 rounded shadow-sm">
              BESTSELLER
            </span>
          )}
          {course.isPremium && (
            <span className="bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
              PREMIUM
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-base font-bold text-gray-900 line-clamp-2 leading-tight mb-2 group-hover:text-purple-700 transition-colors">
          {course.title}
        </h3>
        
        <p className="text-xs text-gray-500 mb-2">{course.instructor}</p>

        <div className="flex items-center gap-1.5 mb-2">
          <span className="text-sm font-bold text-amber-600">{course.rating}</span>
          <div className="flex text-amber-400">
            {[...Array(5)].map((_, i) => (
              <IoStar key={i} size={14} className={i < Math.floor(course.rating) ? 'fill-current' : 'text-gray-200'} />
            ))}
          </div>
          <span className="text-xs text-gray-400">({course.reviewsCount.toLocaleString()})</span>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <IoPeopleOutline size={14} className="text-gray-400" />
          <span className="text-xs text-gray-500">{course.studentsCount.toLocaleString()} students</span>
        </div>

        <div className="mt-auto pt-3 border-t border-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-gray-900">${course.price}</span>
            <span className="text-xs text-gray-400 line-through">${course.originalPrice}</span>
          </div>
          <motion.button 
            whileTap={{ scale: 0.95 }}
            className="text-xs font-bold text-purple-600 hover:text-purple-800 transition-colors"
          >
            Preview
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default CourseCard;
