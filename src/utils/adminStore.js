// Mock data for admin dashboard
const initialUsers = [
  { id: 1, name: "John Doe", email: "john@example.com", role: "student", status: "active", enrolled: 3, joined: "2024-01-15", lastActive: "2025-05-14", device: "Chrome on Windows" },
  { id: 2, name: "Jane Smith", email: "jane@example.com", role: "instructor", status: "active", courses: 2, joined: "2024-02-20", lastActive: "2025-05-14", device: "Safari on Mac" },
  { id: 3, name: "Admin User", email: "admin@example.com", role: "admin", status: "active", joined: "2024-01-01", lastActive: "2025-05-15", device: "Firefox on Linux" },
];

const initialCourses = [
  { id: 1, title: "React - The Complete Guide", instructor: "John Doe", category: "Development", price: 49, enrolled: 1250, status: "published", thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=300", rating: 4.8 },
  { id: 2, title: "UI/UX Design Masterclass", instructor: "Jane Smith", category: "Design", price: 39, enrolled: 890, status: "published", thumbnail: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=300", rating: 4.7 },
  { id: 3, title: "Data Science Bootcamp", instructor: "Mike Ross", category: "Data Science", price: 79, enrolled: 2100, status: "published", thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300", rating: 4.9 },
];

const initialOrders = [
  { id: 101, courseTitle: "React - The Complete Guide", userEmail: "alice@example.com", amount: 49, date: "2025-05-10", status: "completed" },
  { id: 102, courseTitle: "UI/UX Design Masterclass", userEmail: "bob@example.com", amount: 39, date: "2025-05-11", status: "completed" },
  { id: 103, courseTitle: "Data Science Bootcamp", userEmail: "charlie@example.com", amount: 79, date: "2025-05-12", status: "pending" },
];

// Helpers
export const getStorage = (key, defaultValue) => {
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : defaultValue;
};
export const setStorage = (key, value) => localStorage.setItem(key, JSON.stringify(value));

export const getUsers = () => getStorage("admin_users", initialUsers);
export const updateUser = (id, data) => {
  const users = getUsers();
  const index = users.findIndex(u => u.id === id);
  if (index !== -1) users[index] = { ...users[index], ...data };
  setStorage("admin_users", users);
};
export const deleteUser = (id) => {
  const users = getUsers().filter(u => u.id !== id);
  setStorage("admin_users", users);
};

export const getCourses = () => getStorage("admin_courses", initialCourses);
export const addCourse = (course) => {
  const courses = getCourses();
  courses.push({ ...course, id: Date.now() });
  setStorage("admin_courses", courses);
};
export const updateCourse = (id, data) => {
  const courses = getCourses();
  const index = courses.findIndex(c => c.id === id);
  if (index !== -1) courses[index] = { ...courses[index], ...data };
  setStorage("admin_courses", courses);
};
export const deleteCourse = (id) => {
  const courses = getCourses().filter(c => c.id !== id);
  setStorage("admin_courses", courses);
};

export const getOrders = () => getStorage("admin_orders", initialOrders);
export const updateOrderStatus = (id, status) => {
  const orders = getOrders();
  const index = orders.findIndex(o => o.id === id);
  if (index !== -1) orders[index].status = status;
  setStorage("admin_orders", orders);
};