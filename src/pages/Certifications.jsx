// src/pages/Certifications.jsx
import React from "react";
import { motion } from "framer-motion";
import { Award, CheckCircle } from "lucide-react";

const Certifications = () => {
  const certifications = [
    { name: "Full Stack Web Development", provider: "LearnMaster", level: "Advanced" },
    { name: "Data Science & Machine Learning", provider: "LearnMaster", level: "Intermediate" },
    { name: "UI/UX Design Masterclass", provider: "LearnMaster", level: "Beginner" },
    { name: "Cloud Computing with AWS", provider: "LearnMaster", level: "Intermediate" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-gray-50 py-12 px-4"
    >
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <Award className="w-16 h-16 text-purple-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Get Certified</h1>
          <p className="text-gray-600">Earn industry‑recognized certificates and boost your career.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {certifications.map((cert, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-800">{cert.name}</h3>
                  <p className="text-sm text-gray-500">{cert.provider}</p>
                  <span className="inline-block mt-2 px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                    {cert.level}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center bg-white rounded-xl border p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Ready to start?</h2>
          <p className="text-gray-600 mb-4">Browse our courses and earn your certificate today.</p>
          <button className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
            Browse Courses
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default Certifications;