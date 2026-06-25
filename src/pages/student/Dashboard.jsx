import { getUser } from "../../utils/auth";

const StudentDashboard = () => {
  const user = getUser();
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800">Student Dashboard</h1>
      <p className="mt-2 text-gray-600">Welcome back, {user?.name}!</p>
    </div>
  );
};
export default StudentDashboard;