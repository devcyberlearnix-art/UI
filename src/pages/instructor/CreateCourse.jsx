import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { addCourse } from "../../utils/store";

const CreateCourse = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Development",
    price: 0,
    thumbnail: "",
    duration: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const newCourse = {
      id: Date.now().toString(),
      ...form,
      instructor: user.name,
      enrolled: 0,
      rating: 0,
      progress: 0,
      lessons: 0,
    };
    addCourse(newCourse);
    navigate("/instructor/my-courses");
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Create New Course</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm space-y-4">
        <input type="text" placeholder="Course Title" required className="w-full p-3 border rounded-lg" onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <textarea placeholder="Description" rows="4" required className="w-full p-3 border rounded-lg" onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <select className="w-full p-3 border rounded-lg" onChange={(e) => setForm({ ...form, category: e.target.value })}>
          <option>Development</option>
          <option>Design</option>
          <option>Business</option>
        </select>
        <input type="number" placeholder="Price ($)" required className="w-full p-3 border rounded-lg" onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
        <input type="text" placeholder="Duration (e.g., 20 hours)" required className="w-full p-3 border rounded-lg" onChange={(e) => setForm({ ...form, duration: e.target.value })} />
        <input type="text" placeholder="Thumbnail URL (optional)" className="w-full p-3 border rounded-lg" onChange={(e) => setForm({ ...form, thumbnail: e.target.value })} />
        <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-lg">Publish Course</button>
      </form>
    </div>
  );
};

export default CreateCourse;