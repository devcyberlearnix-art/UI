// src/pages/admin/Courses.jsx (updated version)
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Eye, CheckCircle, XCircle, Trash2, FileText } from "lucide-react";

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Helper to get the auth token from localStorage
  const getAuthHeaders = () => {
    const token = localStorage.getItem("access_token");
    return {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    };
  };

  // Fetch courses from API when component mounts
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch("https://iodine-pesticide-bulge.ngrok-free.dev/admin/courses", {
          headers: getAuthHeaders(),
        });
        if (!response.ok) {
          throw new Error(await response.text());
        }
        const data = await response.json();
        // Assuming the API returns an array of courses directly,
        // or maybe nested under a "courses" key. Adjust as needed.
        setCourses(data.courses || data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Placeholder handlers for actions (approve/reject/delete)
  const handleApprove = (id) => {
    console.log("Approve course", id);
    // You will later replace this with an API call
  };

  const handleReject = (id) => {
    console.log("Reject course", id);
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this course permanently?")) {
      console.log("Delete course", id);
    }
  };

  const handleViewContent = (course) => {
    console.log("View content for", course.title);
  };

  if (loading) {
    return <div className="p-6 text-center">Loading courses...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">Error: {error}</div>;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <h1 className="text-2xl font-bold">Course Management</h1>
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Instructor</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {courses.map((course) => (
              <tr key={course.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium">{course.title}</td>
                <td className="px-6 py-4 text-sm">{course.instructorName || course.instructor}</td>
                <td className="px-6 py-4 text-sm">${course.price}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    course.status === "approved" ? "bg-green-100 text-green-700" :
                    course.status === "rejected" ? "bg-red-100 text-red-700" :
                    "bg-yellow-100 text-yellow-700"
                  }`}>
                    {course.status || "pending"}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  {course.status !== "approved" && (
                    <button onClick={() => handleApprove(course.id)} className="p-1 text-green-600 hover:bg-green-50 rounded">
                      <CheckCircle size={16} />
                    </button>
                  )}
                  {course.status !== "rejected" && (
                    <button onClick={() => handleReject(course.id)} className="p-1 text-red-600 hover:bg-red-50 rounded">
                      <XCircle size={16} />
                    </button>
                  )}
                  <button onClick={() => handleDelete(course.id)} className="p-1 text-gray-400 hover:text-red-600">
                    <Trash2 size={16} />
                  </button>
                  <button onClick={() => handleViewContent(course)} className="p-1 text-gray-400 hover:text-blue-600">
                    <FileText size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default Courses;