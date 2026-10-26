import { Menu, Search, X, ChevronDown, BookOpen, Code, Briefcase, Users } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getDashboardPath } from "../../context/AuthContext";

const Header = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [coursesDropdownOpen, setCoursesDropdownOpen] = useState(false);
  const coursesDropdownRef = useRef(null);
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const dashboard = getDashboardPath(user?.role);

  const links = [
    { label: "Courses", to: "/courses" },
    { label: "Learning Paths", to: "/courses" },
    { label: "Practical Labs", to: "/courses" },
    { label: "Projects", to: "/courses" },
  ];

  const close = () => setOpen(false);
  const handleLogout = async () => { await logout(); close(); navigate("/"); };

  const handleSearch = (event) => {
    if (event.key === "Enter") {
      const query = event.currentTarget.value.trim();
      if (query) {
        navigate(`/courses?search=${encodeURIComponent(query)}`);
        close();
      }
    }
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (coursesDropdownRef.current && !coursesDropdownRef.current.contains(event.target)) {
        setCoursesDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className={`asivo-header ${scrolled ? "scrolled" : ""}`}>
      <div className="asivo-header-inner">
        <Link to="/" className="asivo-logo-link" onClick={close}>
          <img src="/assets/asivo-logo-md.png" alt="Asivo" />
        </Link>

        <nav className="asivo-desktop-nav" aria-label="Primary navigation">
          <div className="relative" ref={coursesDropdownRef}>
            <button
              onClick={() => setCoursesDropdownOpen(!coursesDropdownOpen)}
              className="flex items-center gap-1 text-asivo-dark hover:text-asivo-primary font-medium transition-colors"
            >
              Explore <ChevronDown size={16} className={`transition-transform ${coursesDropdownOpen ? "rotate-180" : ""}`} />
            </button>
            {coursesDropdownOpen && (
              <div className="absolute left-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-asivo-border py-2 z-50">
                <Link to="/courses" onClick={() => setCoursesDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-asivo-dark hover:text-asivo-primary hover:bg-asivo-bg-soft">
                  <BookOpen size={16} /> All Courses
                </Link>
                <Link to="/courses?category=Development" onClick={() => setCoursesDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-asivo-dark hover:text-asivo-primary hover:bg-asivo-bg-soft">
                  <Code size={16} /> Development
                </Link>
                <Link to="/courses?category=Data Science" onClick={() => setCoursesDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-asivo-dark hover:text-asivo-primary hover:bg-asivo-bg-soft">
                  <Briefcase size={16} /> Data Science
                </Link>
                <Link to="/courses?category=Design" onClick={() => setCoursesDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-asivo-dark hover:text-asivo-primary hover:bg-asivo-bg-soft">
                  <Users size={16} /> Design
                </Link>
              </div>
            )}
          </div>
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} className={({ isActive }) => isActive ? "active" : ""}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="asivo-header-actions">
          <label className="asivo-search">
            <Search size={16} className="text-asivo-secondary" />
            <input
              aria-label="Search courses"
              placeholder="What do you want to learn?"
              onKeyDown={handleSearch}
            />
          </label>

          {isAuthenticated ? (
            <>
              <Link className="asivo-dashboard-link" to={dashboard}>Dashboard</Link>
              <button className="asivo-header-logout" onClick={handleLogout}>Log out</button>
            </>
          ) : (
            <>
              <Link className="asivo-signin" to="/login">Sign In</Link>
              <Link className="asivo-header-cta" to="/register">Get Started</Link>
            </>
          )}

          <button
            className="asivo-mobile-toggle"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="asivo-mobile-nav" aria-label="Mobile navigation">
          <Link to="/courses" onClick={close}>Courses</Link>
          <Link to="/courses" onClick={close}>Learning Paths</Link>
          <Link to="/courses" onClick={close}>Practical Labs</Link>
          <Link to="/courses" onClick={close}>Projects</Link>
          <div className="border-t border-asivo-border pt-4">
            <label className="asivo-search w-full">
              <Search size={16} className="text-asivo-secondary" />
              <input
                aria-label="Search courses"
                placeholder="What do you want to learn?"
                onKeyDown={handleSearch}
              />
            </label>
          </div>
          {isAuthenticated ? (
            <>
              <Link to={dashboard} onClick={close}>Dashboard</Link>
              <button className="asivo-header-logout text-left" onClick={handleLogout}>Log out</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={close}>Sign In</Link>
              <Link className="asivo-header-cta" to="/register" onClick={close}>Get Started</Link>
            </>
          )}
        </nav>
      )}
    </header>
  );
};

export default Header;
