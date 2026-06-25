import React from 'react';
import { motion } from 'framer-motion';
import { IoPlayCircle } from 'react-icons/io5';

const ContinueLearning = ({ courses }) => {
  if (!courses || courses.length === 0) return null;

  return (
    <section className="py-12 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Continue Learning</h2>
        <button className="text-purple-600 font-bold text-sm hover:underline">View all</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course, index) => (
          <motion.div
            key={course.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group relative bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-4 flex gap-4"
          >
            <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 relative">
              <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <IoPlayCircle className="text-white" size={32} />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-gray-900 truncate mb-1 group-hover:text-purple-700">
                {course.title}
              </h3>
              <p className="text-xs text-gray-500 mb-3">{course.instructor}</p>
              
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-bold text-gray-400">
                  <span>{course.progress}% Complete</span>
                  <span>{course.durationLeft} left</span>
                </div>
                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${course.progress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-purple-600 rounded-full"
                  />
                </div>
              </div>
            </div>

            <button className="absolute inset-0 z-10" />
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default ContinueLearning;
