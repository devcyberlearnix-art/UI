// src/context/authHelpers.js
// Utility helpers extracted from AuthContext to keep React Fast Refresh happy
// (Fast Refresh requires .jsx files to export only components)

/**
 * Checks the local instructor application / instructor status for a given email.
 * Returns the status string ('pending', 'active', 'approved', etc.) or null.
 */
export const checkInstructorStatus = (email) => {
  if (!email) return null;
  const cleanEmail = String(email).toLowerCase().trim();

  try {
    const localApps = JSON.parse(localStorage.getItem("lms_instructor_applications") || "[]");
    const localInstructors = JSON.parse(localStorage.getItem("lms_instructors") || "[]");

    const appMatch = localApps.find((a) =>
      String(a.email || a.user?.email || a.application?.email).toLowerCase().trim() === cleanEmail
    );
    if (appMatch) {
      return String(appMatch.status || appMatch.application?.status || "pending").toLowerCase();
    }

    const instMatch = localInstructors.find((i) =>
      String(i.email || i.instructorEmail).toLowerCase().trim() === cleanEmail
    );
    if (instMatch) {
      return String(instMatch.status || "active").toLowerCase();
    }
  } catch (e) {
    console.warn("[checkInstructorStatus] Local storage parse error:", e);
  }

  return null;
};
