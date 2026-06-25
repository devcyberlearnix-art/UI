// Simple in-memory store for courses (persisted to localStorage)
const STORAGE_KEY = "lms_courses";

export const getCourses = () => {
  const courses = localStorage.getItem(STORAGE_KEY);
  return courses ? JSON.parse(courses) : [
    {
      id: "1",
      title: "Complete Web Development Bootcamp",
      instructor: "Dr. Angela Yu",
      price: 99.99,
      rating: 4.8,
      enrolled: 15420,
      thumbnail: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80",
      category: "Development",
      duration: "45 hours",
      lessons: 24
    },
    {
      id: "2",
      title: "Advanced React Patterns",
      instructor: "Kent C. Dodds",
      price: 129.99,
      rating: 4.9,
      enrolled: 8200,
      thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=800&q=80",
      category: "Development",
      duration: "12 hours",
      lessons: 15
    }
  ];
};

export const addCourse = (course) => {
  const courses = getCourses();
  const updatedCourses = [...courses, course];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCourses));
  return updatedCourses;
};

export const deleteCourse = (id) => {
  const courses = getCourses();
  const updatedCourses = courses.filter(c => c.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCourses));
  return updatedCourses;
};
