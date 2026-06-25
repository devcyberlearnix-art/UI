import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Edit, Trash2, BookOpen, Users, Star } from "lucide-react";
import { getCourses, deleteCourse } from "../../utils/store";

const MyCourses = () => {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    setCourses(getCourses());
  }, []);

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this course?")) {
      const updated = deleteCourse(id);
      setCourses(updated);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
          <p className="text-gray-500 mt-1">Manage and track your published courses</p>
        </div>
        <Link 
          to="/instructor/create-course" 
          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
        >
          <Plus size={20} />
          Create New Course
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div key={course.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all group">
            <div className="relative h-48">
              <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold text-indigo-600">
                ${course.price}
              </div>
            </div>
            
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">{course.title}</h3>
              
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                <div className="flex items-center gap-1">
                  <Users size={16} className="text-gray-400" />
                  {course.enrolled}
                </div>
                <div className="flex items-center gap-1">
                  <Star size={16} className="text-yellow-400 fill-yellow-400" />
                  {course.rating}
                </div>
                <div className="flex items-center gap-1">
                  <BookOpen size={16} className="text-gray-400" />
                  {course.lessons} lessons
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                <div className="flex gap-2">
                  <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                    <Edit size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(course.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                <Link to={`/course/${course.id}`} className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">
                  View Details
                </Link>
              </div>
            </div>
          </div>
        ))}

        {courses.length === 0 && (
          <div className="col-span-full text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
            <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No courses yet</h3>
            <p className="text-gray-500 mb-8">Start your journey as an instructor by creating your first course.</p>
            <Link 
              to="/instructor/create-course" 
              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-8 py-3 rounded-xl hover:bg-indigo-700 transition-all"
            >
              <Plus size={20} />
              Create Course
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyCourses;
