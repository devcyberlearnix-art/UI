import { useState } from "react";
import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";

const mockReviews = [
  { id: 1, user: "John Doe", course: "React Masterclass", rating: 5, comment: "Excellent course!", date: "2025-05-10" },
  { id: 2, user: "Jane Smith", course: "UI/UX Design", rating: 4, comment: "Very good", date: "2025-05-12" },
];

const Reviews = () => {
  const [reviews, setReviews] = useState(mockReviews);
  const handleDelete = (id) => setReviews(reviews.filter(r => r.id !== id));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <h1 className="text-2xl font-bold">Reviews</h1>
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Comment</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th><th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase"></th></tr></thead>
          <tbody className="divide-y divide-gray-200">
            {reviews.map(r => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm">{r.user}</td>
                <td className="px-6 py-4 text-sm">{r.course}</td>
                <td className="px-6 py-4 text-sm">{r.rating} ★</td>
                <td className="px-6 py-4 text-sm">{r.comment}</td>
                <td className="px-6 py-4 text-sm">{r.date}</td>
                <td className="px-6 py-4 text-right"><button onClick={() => handleDelete(r.id)} className="p-1 text-gray-400 hover:text-red-600"><Trash2 size={16} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default Reviews;