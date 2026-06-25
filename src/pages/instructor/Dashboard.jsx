import { useAuth } from "../../context/AuthContext";
const InstructorDashboard = () => {
  const { user } = useAuth();
  return <div><h1 className="text-2xl font-bold">Instructor Dashboard</h1><p>Welcome, {user?.name}</p></div>;
};
export default InstructorDashboard;