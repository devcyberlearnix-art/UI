import { useState, useEffect } from "react";
import { LayoutDashboard, BookOpen, Star, Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { instructorApi } from "../../api/instructorApi";
import InstructorApplication from "./InstructorApplication";

const StudentDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [applicationStatus, setApplicationStatus] = useState(() => {
    // Optimistically load from localStorage while we fetch real status
    if (user?.email) {
      return localStorage.getItem(`instructor_app_status_${user.email}`) || null;
    }
    return localStorage.getItem("instructor_application_status") || null;
  });
  const [statusLoading, setStatusLoading] = useState(false);
  const [applicationData, setApplicationData] = useState(null);

  // Fetch real application status from backend on mount
  useEffect(() => {
    const fetchApplicationStatus = async () => {
      setStatusLoading(true);
      try {
        // Try fetching via /my-status endpoint first
        const res = await instructorApi.getMyApplicationStatus();
        console.log('[StudentDashboard] Application status response:', res);

        // Handle various response shapes
        const data = res?.data || res;
        let status = null;

        if (data?.status) {
          status = String(data.status).toLowerCase();
        } else if (data?.applicationStatus) {
          status = String(data.applicationStatus).toLowerCase();
        } else if (Array.isArray(data) && data.length > 0) {
          // If response is an array, pick the latest application
          const latest = data.sort((a, b) => new Date(b.submittedAt || b.createdAt) - new Date(a.submittedAt || a.createdAt))[0];
          status = String(latest?.status || latest?.applicationStatus || 'pending').toLowerCase();
          setApplicationData(latest);
        } else if (data?.applicationId || data?.id) {
          setApplicationData(data);
          status = 'pending';
        }

        if (status) {
          // Map backend status variations to our local keys
          if (status.includes('approv')) status = 'approved';
          else if (status.includes('reject')) status = 'rejected';
          else if (status.includes('pend') || status.includes('review') || status.includes('submit')) status = 'pending';

          setApplicationStatus(status);
          // Persist locally as cache
          if (user?.email) localStorage.setItem(`instructor_app_status_${user.email}`, status);
          localStorage.setItem("instructor_application_status", status);
        }
      } catch (err) {
        // 404 means no application yet — clear local status
        if (err?.response?.status === 404) {
          setApplicationStatus(null);
          if (user?.email) localStorage.removeItem(`instructor_app_status_${user.email}`);
          localStorage.removeItem("instructor_application_status");
        } else {
          console.warn('[StudentDashboard] Could not fetch application status (using cached):', err?.response?.data?.message || err.message);
          // Try /applications list as fallback
          try {
            const fallback = await instructorApi.getMyApplications();
            const apps = fallback?.data || fallback;
            if (Array.isArray(apps) && apps.length > 0) {
              const latest = apps.sort((a, b) => new Date(b.submittedAt || b.createdAt) - new Date(a.submittedAt || a.createdAt))[0];
              let status = String(latest?.status || latest?.applicationStatus || 'pending').toLowerCase();
              if (status.includes('approv')) status = 'approved';
              else if (status.includes('reject')) status = 'rejected';
              else status = 'pending';
              setApplicationStatus(status);
              setApplicationData(latest);
              if (user?.email) localStorage.setItem(`instructor_app_status_${user.email}`, status);
              localStorage.setItem("instructor_application_status", status);
            }
          } catch (fallbackErr) {
            console.warn('[StudentDashboard] Fallback also failed:', fallbackErr?.message);
          }
        }
      } finally {
        setStatusLoading(false);
      }
    };

    fetchApplicationStatus();
  }, [user?.email]);

  const handleStatusChange = (status) => {
    setApplicationStatus(status);
    if (status) {
      if (user?.email) localStorage.setItem(`instructor_app_status_${user.email}`, status);
      localStorage.setItem("instructor_application_status", status);
    } else {
      if (user?.email) localStorage.removeItem(`instructor_app_status_${user.email}`);
      localStorage.removeItem("instructor_application_status");
    }
  };


  const tabs = [
    { id: "dashboard",    label: "Dashboard",         icon: LayoutDashboard },
    { id: "learning",     label: "My Learning",        icon: BookOpen },
    { id: "become-instructor", label: "Become an Instructor", icon: Star, highlight: true },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Nav Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-1 overflow-x-auto hide-scrollbar">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-4 text-sm font-semibold whitespace-nowrap border-b-2 transition-all duration-200
                    ${isActive
                      ? tab.highlight
                        ? "border-purple-600 text-purple-700"
                        : "border-orange-500 text-orange-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                >
                  <Icon className={`w-4 h-4 ${tab.highlight && !isActive ? "text-purple-500" : ""}`} />
                  {tab.label}
                  {tab.id === "become-instructor" && statusLoading && (
                    <Loader2 className="ml-1 w-3 h-3 animate-spin text-gray-400" />
                  )}
                  {tab.id === "become-instructor" && applicationStatus === "pending" && !statusLoading && (
                    <span className="ml-1 w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  )}
                  {tab.id === "become-instructor" && applicationStatus === "approved" && !statusLoading && (
                    <span className="ml-1 w-2 h-2 rounded-full bg-green-500" />
                  )}
                  {tab.id === "become-instructor" && !applicationStatus && !statusLoading && (
                    <span className="ml-1 text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full font-bold">NEW</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Page Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* ── Dashboard Tab ────────────────────────────────────────────── */}
        {activeTab === "dashboard" && (
          <div>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}! 👋
              </h1>
              <p className="text-gray-500 mt-1">Here's what's happening with your learning journey.</p>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
              {[
                { label: "Enrolled Courses", value: "0", color: "from-purple-500 to-indigo-600", icon: "🎓" },
                { label: "Completed",        value: "0", color: "from-green-400 to-emerald-600",  icon: "✅" },
                { label: "Certificates",     value: "0", color: "from-orange-400 to-rose-500",    icon: "🏆" },
              ].map((s) => (
                <div key={s.label} className={`bg-gradient-to-br ${s.color} rounded-2xl p-5 text-white shadow-lg`}>
                  <div className="text-3xl mb-2">{s.icon}</div>
                  <div className="text-4xl font-bold">{s.value}</div>
                  <div className="text-sm opacity-80 mt-1">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center shadow-sm">
              <p className="text-gray-400 text-sm">No courses yet. Browse the catalog to get started!</p>
            </div>

            {/* Instructor Application Status Banner */}
            {statusLoading && (
              <div className="mt-6 bg-gray-50 border border-gray-200 rounded-2xl p-5 flex items-center gap-4">
                <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
                <p className="text-gray-500 text-sm">Checking your instructor application status…</p>
              </div>
            )}
            {!statusLoading && !applicationStatus && (
              <div
                onClick={() => setActiveTab("become-instructor")}
                className="mt-6 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white flex items-center justify-between cursor-pointer hover:shadow-xl hover:shadow-purple-200 hover:scale-[1.01] transition-all duration-200"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Star className="w-4 h-4 text-yellow-300" />
                    <span className="text-sm font-medium text-purple-200">New Feature</span>
                  </div>
                  <h3 className="text-xl font-bold">Ready to become an Instructor?</h3>
                  <p className="text-purple-200 text-sm mt-0.5">Share your expertise and earn. Apply now!</p>
                </div>
                <div className="bg-white/20 backdrop-blur rounded-xl p-3 flex-shrink-0">
                  <Star className="w-8 h-8 text-yellow-300" />
                </div>
              </div>
            )}
            {!statusLoading && applicationStatus === "pending" && (
              <div className="mt-6 bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-center gap-4">
                <div className="w-10 h-10 bg-amber-400 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">⏳</span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-amber-800">Instructor application under review</p>
                  <p className="text-amber-600 text-sm">We'll notify you once it's approved (3–5 business days)</p>
                </div>
                <button
                  onClick={() => setActiveTab("become-instructor")}
                  className="text-xs text-amber-700 border border-amber-300 px-3 py-1.5 rounded-lg hover:bg-amber-100 transition"
                >
                  View Status
                </button>
              </div>
            )}
            {!statusLoading && applicationStatus === "approved" && (
              <div className="mt-6 bg-green-50 border border-green-200 rounded-2xl p-5 flex items-center gap-4">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">✅</span>
                </div>
                <div>
                  <p className="font-semibold text-green-800">Instructor Application Approved! 🎉</p>
                  <p className="text-green-600 text-sm">Please log out and log back in to access your Instructor Dashboard.</p>
                </div>
              </div>
            )}
            {!statusLoading && applicationStatus === "rejected" && (
              <div className="mt-6 bg-red-50 border border-red-200 rounded-2xl p-5 flex items-center gap-4">
                <div className="w-10 h-10 bg-red-400 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">❌</span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-red-800">Application Not Approved</p>
                  <p className="text-red-600 text-sm">Your application was reviewed but not approved. You may re-apply with updated documents.</p>
                </div>
                <button
                  onClick={() => { handleStatusChange(null); setActiveTab("become-instructor"); }}
                  className="text-xs text-red-700 border border-red-300 px-3 py-1.5 rounded-lg hover:bg-red-100 transition whitespace-nowrap"
                >
                  Re-apply
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── My Learning Tab ───────────────────────────────────────────── */}
        {activeTab === "learning" && (
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">My Learning</h1>
            <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center shadow-sm">
              <div className="text-5xl mb-3">📚</div>
              <p className="text-gray-500">Your enrolled courses will appear here.</p>
            </div>
          </div>
        )}

        {/* ── Become Instructor Tab ─────────────────────────────────────── */}
        {activeTab === "become-instructor" && (
          <InstructorApplication
            onBack={() => setActiveTab("dashboard")}
            applicationStatus={applicationStatus}
            onStatusChange={handleStatusChange}
          />
        )}
      </div>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default StudentDashboard;