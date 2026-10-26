import { Code, Shield, Database, Cloud, Brain, Server, Palette, Briefcase, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const categoryIconMap = {
  "Development": Code,
  "Cyber Security": Shield,
  "Data Science": Database,
  "Cloud Computing": Cloud,
  "AI & Machine Learning": Brain,
  "DevOps": Server,
  "UI/UX Design": Palette,
  "Career Development": Briefcase,
};

const PopularCategories = ({ categories = [], loading = false }) => {
  const defaultCategories = [
    { name: "Development", courseCount: 120 },
    { name: "Cyber Security", courseCount: 45 },
    { name: "Data Science", courseCount: 78 },
    { name: "Cloud Computing", courseCount: 56 },
    { name: "AI & Machine Learning", courseCount: 34 },
    { name: "DevOps", courseCount: 42 },
    { name: "UI/UX Design", courseCount: 28 },
    { name: "Career Development", courseCount: 15 },
  ];

  const displayCategories = categories.length > 0 ? categories : defaultCategories;

  if (loading) {
    return (
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-asivo-bg-soft">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-asivo-navy">Popular Categories</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-6 border border-asivo-border animate-pulse">
                <div className="w-12 h-12 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 bg-asivo-bg-soft">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-asivo-navy">Popular Categories</h2>
          <Link
            to="/courses"
            className="flex items-center gap-2 text-asivo-primary font-semibold hover:text-asivo-primary/80 transition-colors"
          >
            View All
            <ArrowRight size={18} />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {displayCategories.map((category, index) => {
            const Icon = categoryIconMap[category.name] || Code;
            return (
              <Link
                key={index}
                to={`/courses?category=${encodeURIComponent(category.name)}`}
                className="group bg-white rounded-xl p-6 border border-asivo-border hover:border-asivo-primary hover:shadow-lg transition-all duration-300 cursor-pointer"
              >
                <div className="w-12 h-12 bg-asivo-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-asivo-primary/20 transition-colors">
                  <Icon className="text-asivo-primary" size={24} />
                </div>
                <h3 className="font-semibold text-asivo-dark mb-2 group-hover:text-asivo-primary transition-colors">
                  {category.name}
                </h3>
                {category.courseCount !== undefined && (
                  <p className="text-sm text-asivo-secondary">
                    {category.courseCount} courses
                  </p>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PopularCategories;
