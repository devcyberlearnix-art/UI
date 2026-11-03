const fs = require('fs');
const path = require('path');

const uiSrc = path.join(__dirname, '..', 'src');

// 1. Patch courseApi.js
const courseApiPath = path.join(uiSrc, 'api', 'courseApi.js');
let courseApiContent = fs.readFileSync(courseApiPath, 'utf8');

if (!courseApiContent.includes('searchCourses:')) {
  const insertBefore = `  /**
   * GET /api/v1/courses/featured`;
  const newMethod = `  /**
   * Search courses using backend catalog endpoint
   * GET /api/v1/courses/list?search=...
   */
  searchCourses: async (query, filters = {}) => {
    try {
      const response = await axiosInstance.get('/api/v1/courses/list', {
        params: { search: query, ...filters }
      });
      return response.data;
    } catch (err) {
      console.warn('[courseApi] Search courses failed:', err);
      throw err;
    }
  },

`;
  if (courseApiContent.includes(insertBefore)) {
    courseApiContent = courseApiContent.replace(insertBefore, newMethod + insertBefore);
    fs.writeFileSync(courseApiPath, courseApiContent, 'utf8');
    console.log('✅ Patched courseApi.js with searchCourses');
  } else {
    const insertBeforeCRLF = insertBefore.replace(/\n/g, '\r\n');
    const newMethodCRLF = newMethod.replace(/\n/g, '\r\n');
    if (courseApiContent.includes(insertBeforeCRLF)) {
      courseApiContent = courseApiContent.replace(insertBeforeCRLF, newMethodCRLF + insertBeforeCRLF);
      fs.writeFileSync(courseApiPath, courseApiContent, 'utf8');
      console.log('✅ Patched courseApi.js with searchCourses (CRLF)');
    }
  }
}

// 2. Patch useCourses.js
const useCoursesPath = path.join(uiSrc, 'hooks', 'useCourses.js');
let useCoursesContent = fs.readFileSync(useCoursesPath, 'utf8');

if (!useCoursesContent.includes('export function useCourseSearch')) {
  const searchHook = `

/**
 * Hook: Query courses with live backend full search and filtering
 */
export function useCourseSearch({ search = '', category = '', level = '', sort = 'POPULAR', page = 0, size = 20 } = {}) {
  return useQuery({
    queryKey: ['courses-search', { search, category, level, sort, page, size }],
    queryFn: async () => {
      const params = {
        search: search.trim() || undefined,
        category: category && category !== 'All' && category !== 'ALL' ? category : undefined,
        level: level && level !== 'All Levels' && level !== 'ALL' ? level : undefined,
        sort: sort || 'POPULAR',
        page,
        size,
      };
      const response = await courseApi.getCourseList(params);
      const data = response?.data || response;
      const list = data?.courses || (Array.isArray(data) ? data : []);
      const pagination = data?.pagination || {};

      return {
        courses: list.map(normalizeCoursePayload),
        totalElements: pagination.totalElements ?? list.length,
        totalPages: pagination.totalPages ?? 1,
        hasNext: Boolean(pagination.hasNext),
        hasPrevious: Boolean(pagination.hasPrevious),
      };
    },
    staleTime: 1000 * 60 * 3,
  });
}
`;
  useCoursesContent += searchHook;
  fs.writeFileSync(useCoursesPath, useCoursesContent, 'utf8');
  console.log('✅ Patched useCourses.js with useCourseSearch');
}

// 3. Patch HeaderNav.jsx
const headerNavPath = path.join(uiSrc, 'design-system', 'layout', 'HeaderNav.jsx');
let headerNavContent = fs.readFileSync(headerNavPath, 'utf8');

const oldHeaderSearch = `        {/* Right Action Icons & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {onSearchClick && (
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onSearchClick}
              className="p-2 rounded-xl text-[#A1A1AA] hover:text-white hover:bg-white/[0.04] border border-transparent hover:border-white/[0.04] transition-all"
              aria-label="Search Catalog"
            >
              <Search className="w-4 h-4" />
            </motion.button>
          )}`;

const newHeaderSearch = `        {/* Right Action Icons & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          <motion.button
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onSearchClick || (() => navigate('/courses'))}
            className="p-2 rounded-xl text-[#A1A1AA] hover:text-white hover:bg-white/[0.04] border border-transparent hover:border-white/[0.04] transition-all cursor-pointer"
            aria-label="Search Catalog"
            title="Search Catalog"
          >
            <Search className="w-4 h-4" />
          </motion.button>`;

if (headerNavContent.includes(oldHeaderSearch)) {
  headerNavContent = headerNavContent.replace(oldHeaderSearch, newHeaderSearch);
} else {
  const oldHeaderSearchCRLF = oldHeaderSearch.replace(/\n/g, '\r\n');
  const newHeaderSearchCRLF = newHeaderSearch.replace(/\n/g, '\r\n');
  if (headerNavContent.includes(oldHeaderSearchCRLF)) {
    headerNavContent = headerNavContent.replace(oldHeaderSearchCRLF, newHeaderSearchCRLF);
  }
}
fs.writeFileSync(headerNavPath, headerNavContent, 'utf8');
console.log('✅ Patched HeaderNav.jsx');

// 4. Patch AppShell.jsx
const appShellPath = path.join(uiSrc, 'design-system', 'layout', 'AppShell.jsx');
let appShellContent = fs.readFileSync(appShellPath, 'utf8');

appShellContent = appShellContent.replace(
  `className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.04] text-xs font-semibold text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"`,
  `className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.04] text-xs font-semibold text-[#A1A1AA] hover:text-white transition-colors cursor-pointer"`
);
fs.writeFileSync(appShellPath, appShellContent, 'utf8');
console.log('✅ Patched AppShell.jsx');

// 5. Patch LandingDashboard.jsx
const landingPath = path.join(uiSrc, 'pages', 'LandingDashboard.jsx');
let landingContent = fs.readFileSync(landingPath, 'utf8');

// Add handleSearchSubmit if not present
if (!landingContent.includes('const handleSearchSubmit')) {
  landingContent = landingContent.replace(
    '  const clearFilters = () => {',
    `  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    if (searchQuery.trim()) {
      navigate(\`/courses?search=\${encodeURIComponent(searchQuery.trim())}\`);
    } else {
      navigate('/courses');
    }
  };

  const clearFilters = () => {`
  );
}

// Replace the search bar markup with a proper form and active Search button
const oldLandingSearch = `          {/* Search & Filter Command Bar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: LUXURY_EASING }}
            className="mt-10 max-w-2xl mx-auto"
          >
            <div className="relative flex items-center p-2 rounded-2xl bg-[#0F0F13] border border-white/[0.08] backdrop-blur-2xl focus-within:border-[#C5A880]/60 transition-all">
              <div className="pl-3.5 text-[#71717A]">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tracks by topic, distributed architecture, or lead..."
                className="w-full px-3 py-2 text-sm text-[#F5F5F7] bg-transparent outline-none placeholder:text-[#71717A]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="px-2.5 py-1 text-xs text-[#71717A] hover:text-[#F5F5F7] mr-1 transition-colors"
                >
                  Clear
                </button>
              )}
              <Button
                variant="primary"
                size="sm"
                className="shrink-0"
                rightIcon={ArrowRight}
                onClick={() => {}}
              >
                Search
              </Button>
            </div>
          </motion.div>`;

const newLandingSearch = `          {/* Search & Filter Command Bar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: LUXURY_EASING }}
            className="mt-10 max-w-2xl mx-auto"
          >
            <form
              onSubmit={handleSearchSubmit}
              className="relative flex items-center p-2 rounded-2xl bg-[#0F0F13] border border-white/[0.08] backdrop-blur-2xl focus-within:border-[#C5A880]/60 transition-all"
            >
              <div className="pl-3.5 text-[#71717A]">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tracks by topic, distributed architecture, or lead..."
                className="w-full px-3 py-2 text-sm text-[#F5F5F7] bg-transparent outline-none placeholder:text-[#71717A]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="px-2.5 py-1 text-xs text-[#71717A] hover:text-[#F5F5F7] mr-1 transition-colors cursor-pointer"
                  aria-label="Clear Search"
                >
                  Clear
                </button>
              )}
              <Button
                type="submit"
                variant="primary"
                size="sm"
                className="shrink-0 cursor-pointer"
                rightIcon={ArrowRight}
                onClick={handleSearchSubmit}
              >
                Search
              </Button>
            </form>
          </motion.div>`;

if (landingContent.includes(oldLandingSearch)) {
  landingContent = landingContent.replace(oldLandingSearch, newLandingSearch);
} else {
  const oldLandingSearchCRLF = oldLandingSearch.replace(/\n/g, '\r\n');
  const newLandingSearchCRLF = newLandingSearch.replace(/\n/g, '\r\n');
  if (landingContent.includes(oldLandingSearchCRLF)) {
    landingContent = landingContent.replace(oldLandingSearchCRLF, newLandingSearchCRLF);
  }
}
fs.writeFileSync(landingPath, landingContent, 'utf8');
console.log('✅ Patched LandingDashboard.jsx');

// 6. Patch Navbar.jsx
const navbarPath = path.join(uiSrc, 'layouts', 'Navbar.jsx');
let navbarContent = fs.readFileSync(navbarPath, 'utf8');

// Ensure search icon is a clickable submit button
navbarContent = navbarContent.replace(
  '<Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#71717A] group-focus-within:text-[#C5A880] transition-colors" />',
  '<button type="submit" className="absolute left-3 top-2.5 text-[#71717A] group-focus-within:text-[#C5A880] transition-colors cursor-pointer" aria-label="Submit search"><Search className="h-3.5 w-3.5" /></button>'
);

navbarContent = navbarContent.replace(
  '<Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#71717A]" />',
  '<button type="submit" className="absolute left-3 top-2.5 text-[#71717A] cursor-pointer" aria-label="Submit search"><Search className="h-3.5 w-3.5" /></button>'
);

fs.writeFileSync(navbarPath, navbarContent, 'utf8');
console.log('✅ Patched Navbar.jsx');

// 7. Patch Courses.jsx
const coursesPath = path.join(uiSrc, 'pages', 'Courses.jsx');
let coursesContent = fs.readFileSync(coursesPath, 'utf8');

// Update CATEGORY_OPTIONS to match real database categories
const oldCategories = `const CATEGORY_OPTIONS = [
  "All",
  "Programming",
  "Web Development",
  "Data Science",
  "Cloud & DevOps",
  "Artificial Intelligence",
  "Design",
  "Business",
];`;

const newCategories = `const CATEGORY_OPTIONS = [
  "All",
  "AI/ML",
  "Cyber Security",
  "Python",
  "React/JavaScript",
  "AWS/Cloud",
  "Java/JVM",
  "Docker/Kubernetes",
  "System Design",
  "DevOps/CI-CD",
  "Microservices",
  "Spring Boot",
  "Software Engineering",
  "Data Engineering",
  "SQL/PostgreSQL",
  "Backend Development",
];`;

if (coursesContent.includes(oldCategories)) {
  coursesContent = coursesContent.replace(oldCategories, newCategories);
} else {
  const oldCategoriesCRLF = oldCategories.replace(/\n/g, '\r\n');
  const newCategoriesCRLF = newCategories.replace(/\n/g, '\r\n');
  if (coursesContent.includes(oldCategoriesCRLF)) {
    coursesContent = coursesContent.replace(oldCategoriesCRLF, newCategoriesCRLF);
  }
}

// Add handleSearchSubmit helper in Courses.jsx
if (!coursesContent.includes('const handleSearchSubmit')) {
  coursesContent = coursesContent.replace(
    '  const updateSearchQuery = (query) => {',
    `  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    setCurrentPage(1);
    fetchCourses(searchQuery);
  };

  const updateSearchQuery = (query) => {`
  );
}

// Replace fetchCourses with full backend-connected implementation
const oldFetchCourses = `  // Fetch courses from API - uses trending, featured, or list based on context
  const fetchCourses = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      // Try multiple API endpoints for best results
      let list = [];

      // 1. Try trending courses first
      try {
        const trendingData = await courseApi.getTrendingCourses({
          page: 0,
          size: 20,
          category: selectedCategory !== "All" ? selectedCategory : "",
          level: selectedLevel !== "All Levels" ? selectedLevel : ""
        });

        if (Array.isArray(trendingData?.data?.courses)) {
          list = trendingData.data.courses;
        } else if (Array.isArray(trendingData?.data)) {
          list = trendingData.data;
        } else if (Array.isArray(trendingData)) {
          list = trendingData;
        }
      } catch (trendingErr) {
        console.warn("[Courses] Trending API failed, trying featured...", trendingErr);
      }

      // 2. If trending failed, try featured courses
      if (list.length === 0) {
        try {
          const featuredData = await courseApi.getFeaturedCourses(12);
          if (Array.isArray(featuredData)) {
            list = featuredData;
          } else if (Array.isArray(featuredData?.data)) {
            list = featuredData.data;
          }
        } catch (featuredErr) {
          console.warn("[Courses] Featured API failed, trying course list...", featuredErr);
        }
      }

      // 3. If featured failed, try course list with filters
      if (list.length === 0) {
        try {
          const listData = await courseApi.getCourseList({
            category: selectedCategory !== "All" ? selectedCategory : undefined,
            level: selectedLevel !== "All Levels" ? selectedLevel : undefined,
            page: 0,
            size: 20
          });

          if (Array.isArray(listData?.data?.courses)) {
            list = listData.data.courses;
          } else if (Array.isArray(listData?.data)) {
            list = listData.data;
          } else if (Array.isArray(listData)) {
            list = listData;
          }
        } catch (listErr) {
          console.warn("[Courses] Course list API failed, trying all courses...", listErr);
        }
      }

      // 4. Final fallback to all courses
      if (list.length === 0) {
        const allData = await courseApi.getAllCourses({ page: 0, size: 20 });

        if (Array.isArray(allData?.content)) {
          list = allData.content;
        } else if (Array.isArray(allData?.data)) {
          list = allData.data;
        } else if (Array.isArray(allData)) {
          list = allData;
        }
      }

      if (list.length > 0) {
        setCourses(list.map((c, idx) => normalizeCourseItem(c, idx)));
      } else {
        // Fallback to high quality standard courses
        setCourses(DEFAULT_COURSES);
      }
    } catch (err) {
      console.warn("[BrowseCourses] All APIs failed, falling back to curated curriculum", err);
      setError("Connected with offline course cache.");
      setCourses(DEFAULT_COURSES);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, selectedLevel]);`;

const newFetchCourses = `  // Fetch courses from backend API - connects search, category, level & sort directly
  const fetchCourses = useCallback(async (searchOverride) => {
    setLoading(true);
    setError("");

    const term = typeof searchOverride === 'string' ? searchOverride : searchQuery;

    try {
      let list = [];

      // 1. Primary: Use backend catalog search API with live search parameter
      try {
        const sortMap = {
          popular: 'POPULAR',
          newest: 'NEWEST',
          rating: 'RATING',
          'price-asc': 'PRICE_ASC',
          'price-desc': 'PRICE_DESC',
        };

        const listData = await courseApi.getCourseList({
          search: term.trim() || undefined,
          category: selectedCategory !== "All" ? selectedCategory : undefined,
          level: selectedLevel !== "All Levels" ? selectedLevel : undefined,
          sort: sortMap[sortBy] || 'POPULAR',
          page: 0,
          size: 50,
        });

        if (Array.isArray(listData?.data?.courses)) {
          list = listData.data.courses;
        } else if (Array.isArray(listData?.data)) {
          list = listData.data;
        } else if (Array.isArray(listData?.courses)) {
          list = listData.courses;
        }
      } catch (listErr) {
        console.warn("[Courses] Course list search API failed, trying trending...", listErr);
      }

      // 2. If list empty and no active filters, fallback to trending
      if (list.length === 0 && !term.trim() && selectedCategory === "All" && selectedLevel === "All Levels") {
        try {
          const trendingData = await courseApi.getTrendingCourses({
            page: 0,
            size: 20,
          });

          if (Array.isArray(trendingData?.data?.courses)) {
            list = trendingData.data.courses;
          } else if (Array.isArray(trendingData?.data)) {
            list = trendingData.data;
          }
        } catch (_) {}
      }

      // 3. Fallback to getAllCourses if list still empty and no active search
      if (list.length === 0 && !term.trim()) {
        try {
          const allData = await courseApi.getAllCourses({ page: 0, size: 20 });
          if (Array.isArray(allData?.content)) {
            list = allData.content;
          } else if (Array.isArray(allData?.data)) {
            list = allData.data;
          }
        } catch (_) {}
      }

      if (list.length > 0) {
        setCourses(list.map((c, idx) => normalizeCourseItem(c, idx)));
      } else {
        if (term.trim() || selectedCategory !== "All" || selectedLevel !== "All Levels") {
          setCourses([]);
        } else {
          setCourses(DEFAULT_COURSES);
        }
      }
    } catch (err) {
      console.warn("[BrowseCourses] APIs failed", err);
      if (!term.trim()) {
        setCourses(DEFAULT_COURSES);
      } else {
        setCourses([]);
      }
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory, selectedLevel, sortBy]);`;

if (coursesContent.includes(oldFetchCourses)) {
  coursesContent = coursesContent.replace(oldFetchCourses, newFetchCourses);
} else {
  const oldFetchCoursesCRLF = oldFetchCourses.replace(/\n/g, '\r\n');
  const newFetchCoursesCRLF = newFetchCourses.replace(/\n/g, '\r\n');
  if (coursesContent.includes(oldFetchCoursesCRLF)) {
    coursesContent = coursesContent.replace(oldFetchCoursesCRLF, newFetchCoursesCRLF);
  }
}

// Add debounce effect in Courses.jsx
if (!coursesContent.includes('// Live debounced search effect')) {
  coursesContent = coursesContent.replace(
    '  useEffect(() => {\n    fetchCourses();\n    fetchFeaturedCourses();',
    `  // Live debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCourses(searchQuery);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory, selectedLevel, sortBy]);

  useEffect(() => {
    fetchFeaturedCourses();`
  );
  // Also CRLF
  coursesContent = coursesContent.replace(
    '  useEffect(() => {\r\n    fetchCourses();\r\n    fetchFeaturedCourses();',
    `  // Live debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCourses(searchQuery);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory, selectedLevel, sortBy]);

  useEffect(() => {
    fetchFeaturedCourses();`
  );
}

// Replace search input with form and Search button in Courses.jsx
const oldCoursesSearchBar = `              {/* Physics-Based Muted Gold Search Input */}
              <div className="relative flex-1 max-w-md">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71717A]" />
                <input
                  type="text"
                  placeholder="Search tracks by topic, distributed architecture, or lead..."
                  value={searchQuery}
                  onChange={(e) => updateSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-9 py-2 rounded-xl border border-white/[0.06] bg-[#14141A] text-xs sm:text-sm text-[#F5F5F7] placeholder-[#71717A] outline-none focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880]/30 transition-all duration-300"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => updateSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71717A] hover:text-[#F5F5F7] transition-colors"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>`;

const newCoursesSearchBar = `              {/* Physics-Based Muted Gold Search Input & Action Button */}
              <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md flex items-center gap-2">
                <div className="relative flex-1">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#71717A]" />
                  <input
                    type="text"
                    placeholder="Search tracks by topic, distributed architecture, or lead..."
                    value={searchQuery}
                    onChange={(e) => updateSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-9 py-2 rounded-xl border border-white/[0.06] bg-[#14141A] text-xs sm:text-sm text-[#F5F5F7] placeholder-[#71717A] outline-none focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880]/30 transition-all duration-300"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => updateSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71717A] hover:text-[#F5F5F7] transition-colors cursor-pointer"
                      aria-label="Clear Search"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
                <button
                  type="submit"
                  className="px-3.5 py-2 rounded-xl bg-[#C5A880] hover:bg-[#D4B991] text-[#070709] font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shrink-0 cursor-pointer"
                  aria-label="Search"
                >
                  <Search size={13} className="text-[#070709]" />
                  <span className="hidden sm:inline">Search</span>
                </button>
              </form>`;

if (coursesContent.includes(oldCoursesSearchBar)) {
  coursesContent = coursesContent.replace(oldCoursesSearchBar, newCoursesSearchBar);
} else {
  const oldCoursesSearchBarCRLF = oldCoursesSearchBar.replace(/\n/g, '\r\n');
  const newCoursesSearchBarCRLF = newCoursesSearchBar.replace(/\n/g, '\r\n');
  if (coursesContent.includes(oldCoursesSearchBarCRLF)) {
    coursesContent = coursesContent.replace(oldCoursesSearchBarCRLF, newCoursesSearchBarCRLF);
  }
}

fs.writeFileSync(coursesPath, coursesContent, 'utf8');
console.log('✅ Patched Courses.jsx');

