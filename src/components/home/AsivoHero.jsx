import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, BookOpen, FlaskConical, FolderKanban, Brain, TrendingUp, Users, Star, ArrowRight } from "lucide-react";

const AsivoHero = ({ stats = { courses: 0, learners: 0, projects: 0, rating: 0 } }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/courses?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const benefits = [
    { icon: BookOpen, label: "Industry-Relevant Courses" },
    { icon: FlaskConical, label: "Hands-on Practical Labs" },
    { icon: FolderKanban, label: "Real Projects & Portfolios" },
    { icon: Brain, label: "Career Guidance with AI" },
  ];

  return (
    <section className="relative pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column */}
          <div className="space-y-8">
            {/* Brand Badge */}
            <div className="inline-flex items-center gap-2 bg-asivo-bg-soft px-4 py-2 rounded-full border border-asivo-border">
              <span className="text-asivo-primary font-semibold text-sm">Learn Skills. Build Futures.</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-asivo-navy leading-tight">
              Your Skills.
              <br />
              <span className="text-asivo-primary">A Brighter Future.</span>
            </h1>

            {/* Description */}
            <p className="text-lg text-asivo-secondary max-w-xl leading-relaxed">
              Learn in-demand skills, practice with real projects, get personalized career guidance, and build the future you want with Asivo.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 max-w-2xl">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-asivo-secondary" size={20} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="What do you want to learn today?"
                  className="w-full pl-12 pr-4 py-4 rounded-xl border border-asivo-border focus:border-asivo-primary focus:ring-2 focus:ring-asivo-primary/20 outline-none transition-all text-asivo-dark"
                />
              </div>
              <button
                type="submit"
                className="px-8 py-4 bg-asivo-primary text-white rounded-xl font-semibold hover:bg-asivo-primary/90 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                Search Courses
                <ArrowRight size={18} />
              </button>
            </form>

            {/* Learning Benefits */}
            <div className="grid grid-cols-2 gap-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-3 p-4 bg-asivo-bg-soft rounded-xl border border-asivo-border hover:border-asivo-primary/30 transition-colors">
                  <div className="flex-shrink-0 w-10 h-10 bg-asivo-primary/10 rounded-lg flex items-center justify-center">
                    <benefit.icon className="text-asivo-primary" size={20} />
                  </div>
                  <span className="text-sm font-medium text-asivo-dark">{benefit.label}</span>
                </div>
              ))}
            </div>

            {/* Platform Statistics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-asivo-navy">{stats.courses || "500+"}</div>
                <div className="text-sm text-asivo-secondary mt-1">Courses</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-asivo-navy">{stats.learners || "50K+"}</div>
                <div className="text-sm text-asivo-secondary mt-1">Learners</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-asivo-navy">{stats.projects || "10K+"}</div>
                <div className="text-sm text-asivo-secondary mt-1">Projects Built</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-asivo-navy">{stats.rating || "4.8"}</div>
                <div className="text-sm text-asivo-secondary mt-1 flex items-center justify-center gap-1">
                  <Star size={14} className="fill-yellow-400 text-yellow-400" />
                  Rating
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Visual */}
          <div className="relative hidden lg:block">
            <div className="relative">
              {/* Main Image */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-asivo-bg-soft to-white border border-asivo-border">
                <img
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop"
                  alt="Student learning"
                  className="w-full h-[500px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-asivo-navy/20 to-transparent" />
              </div>

              {/* Floating Cards */}
              <div className="absolute -left-8 top-20 bg-white rounded-xl shadow-lg p-4 border border-asivo-border max-w-[200px] animate-fade-in">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-asivo-primary/10 rounded-lg flex items-center justify-center">
                    <Brain size={16} className="text-asivo-primary" />
                  </div>
                  <span className="font-semibold text-sm text-asivo-dark">AI Learning Path</span>
                </div>
                <p className="text-xs text-asivo-secondary">Personalized roadmap for your goals</p>
              </div>

              <div className="absolute -right-4 top-40 bg-white rounded-xl shadow-lg p-4 border border-asivo-border max-w-[200px] animate-fade-in" style={{ animationDelay: "0.2s" }}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <TrendingUp size={16} className="text-green-600" />
                  </div>
                  <span className="font-semibold text-sm text-asivo-dark">Your Progress</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: "75%" }}></div>
                </div>
                <p className="text-xs text-asivo-secondary mt-2">75% complete</p>
              </div>

              <div className="absolute -left-4 bottom-20 bg-white rounded-xl shadow-lg p-4 border border-asivo-border max-w-[200px] animate-fade-in" style={{ animationDelay: "0.4s" }}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-asivo-cyan/10 rounded-lg flex items-center justify-center">
                    <Users size={16} className="text-asivo-cyan" />
                  </div>
                  <span className="font-semibold text-sm text-asivo-dark">AI Mentor</span>
                </div>
                <p className="text-xs text-asivo-secondary">Get 24/7 personalized guidance</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AsivoHero;
