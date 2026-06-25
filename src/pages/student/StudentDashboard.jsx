import { useState } from "react";

const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold mb-4">Student Dashboard</h1>
      <div className="flex gap-4 mb-6">
        <button onClick={() => setActiveTab("dashboard")} className={`px-4 py-2 rounded ${activeTab === "dashboard" ? "bg-orange-600 text-white" : "bg-gray-200"}`}>Dashboard</button>
        <button onClick={() => setActiveTab("learning")} className={`px-4 py-2 rounded ${activeTab === "learning" ? "bg-orange-600 text-white" : "bg-gray-200"}`}>My Learning</button>
      </div>
      {activeTab === "dashboard" && (
        <div>
          <p>Welcome to your personalized dashboard.</p>
          <p>Continue Learning, Progress, Certificates will appear here.</p>
        </div>
      )}
      {activeTab === "learning" && (
        <div>
          <p>Your enrolled courses will be listed here.</p>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;