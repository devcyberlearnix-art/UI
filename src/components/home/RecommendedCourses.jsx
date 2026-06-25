import React from 'react';
import CourseCard from './CourseCard';

const RecommendedCourses = ({ title, subtitle, courses, onOpenModal }) => {
  return (
    <section className="py-12 px-4 md:px-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h3 className="text-gray-500 text-sm font-bold uppercase tracking-widest mb-1">{subtitle}</h3>
        <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {courses.map((course) => (
          <CourseCard 
            key={course.id} 
            course={course} 
            onOpenModal={onOpenModal}
          />
        ))}
      </div>
    </section>
  );
};

export default RecommendedCourses;
