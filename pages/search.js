import { useState, useEffect } from "react";
import Link from "next/link";
import Head from "next/head";
import { useRouter } from "next/router";
import { BACKEND_URL, SITE_NAME, SEO_DEFAULTS } from "../config";

const INDIAN_STATES_AND_UTS = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry"
];

export async function getServerSideProps() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/blogs`);
    const initialBlogs = res.ok ? await res.json() : [];
    const publishedBlogs = initialBlogs.filter((blog) => blog.status === "published");

    return {
      props: {
        initialBlogs: publishedBlogs
      }
    };
  } catch (err) {
    console.error("Failed to fetch initial data for search page:", err);
    return {
      props: {
        initialBlogs: []
      }
    };
  }
}

export const runtime = 'experimental-edge';

export default function SearchPage({ initialBlogs }) {
  const router = useRouter();
  const [blogs, setBlogs] = useState(initialBlogs || []);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  // Sync blogs state when server props update
  useEffect(() => {
    setBlogs(initialBlogs || []);
  }, [initialBlogs]);

  // Search form state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("All");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Sync inputs with router queries on load or route update
  useEffect(() => {
    if (router.isReady) {
      setSearchQuery(router.query.q || "");
      setSelectedLocation(router.query.state || "All");
      setCurrentPage(1); // Reset page on query shift
    }
  }, [router.isReady, router.query]);

  // Theme sync listener
  useEffect(() => {
    const syncTheme = () => {
      setDarkMode(document.documentElement.classList.contains("dark"));
    };
    syncTheme();
    window.addEventListener("theme-change", syncTheme);
    return () => window.removeEventListener("theme-change", syncTheme);
  }, []);

  const formatMiniDate = (dateStr) => {
    const d = new Date(dateStr);
    const day = d.getDate();
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = months[d.getMonth()];
    return `${day} ${month}`;
  };

  const formatEndsDate = (blog) => {
    const d = blog.endDate ? new Date(blog.endDate) : new Date(blog.createdAt);
    if (!blog.endDate) {
      d.setDate(d.getDate() + 30);
    }
    const day = d.getDate();
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = months[d.getMonth()];
    return `${day} ${month}`;
  };

  const getMockViews = (blogId) => {
    let sum = 0;
    const str = String(blogId);
    for (let i = 0; i < str.length; i++) {
      sum += str.charCodeAt(i);
    }
    const val = (sum % 10000) + 2000;
    return val.toLocaleString();
  };

  // Perform search / filter logic
  const filteredBlogs = blogs.filter((blog) => {
    const { q, state, category, tag, location, qualification } = router.query;

    // 1. Direct Category filter
    if (category) {
      const match = blog.categories?.some(
        (cat) => cat.name.toLowerCase() === category.toLowerCase()
      );
      if (!match) return false;
    }

    // 2. Direct Tag filter
    if (tag) {
      const match = blog.tags?.some(
        (t) => t.name.toLowerCase() === tag.toLowerCase()
      );
      if (!match) return false;
    }

    // 3. Direct Location filter
    if (location) {
      const match = blog.locations?.some(
        (loc) => loc.name.toLowerCase() === location.toLowerCase()
      );
      if (!match) return false;
    }

    // 3.5 Direct Qualification filter
    if (qualification) {
      const match = blog.qualifications?.some(
        (qual) => qual.name.toLowerCase() === qualification.toLowerCase()
      );
      if (!match) return false;
    }

    // 4. State dropdown filter
    if (state && state !== "All") {
      const match = blog.locations?.some(
        (loc) => loc.name.toLowerCase() === state.toLowerCase()
      );
      if (!match) return false;
    }

    // 5. Query Text Search filter
    if (q) {
      const query = q.toLowerCase();
      const matchTitle = blog.title?.toLowerCase().includes(query);
      const matchContent = blog.content?.toLowerCase().includes(query);
      const matchCategories = blog.categories?.some((cat) => cat.name.toLowerCase().includes(query));
      const matchLocations = blog.locations?.some((loc) => loc.name.toLowerCase().includes(query));
      const matchTags = blog.tags?.some((t) => t.name.toLowerCase().includes(query));
      const matchQualifications = blog.qualifications?.some((qual) => qual.name.toLowerCase().includes(query));

      if (!matchTitle && !matchContent && !matchCategories && !matchLocations && !matchTags && !matchQualifications) {
        return false;
      }
    }

    return true;
  });

  // Pagination bounds
  const totalPages = Math.ceil(filteredBlogs.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBlogs = filteredBlogs.slice(indexOfFirstItem, indexOfLastItem);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    router.push({
      pathname: "/search",
      query: { q: searchQuery, state: selectedLocation }
    });
  };

  const getPageTitle = () => {
    const { q, state, category, tag, location, qualification } = router.query;
    if (category) return `Jobs under Category: ${category}`;
    if (tag) return `Jobs tagged with: #${tag}`;
    if (location) return `Jobs in Location: ${location}`;
    if (qualification) return `Jobs requiring Qualification: ${qualification}`;
    if (state && state !== "All" && q) return `Jobs matching "${q}" in State: ${state}`;
    if (state && state !== "All") return `Jobs in State: ${state}`;
    if (q) return `Search Results for "${q}"`;
    return "All Available Govt Jobs";
  };

  const getCounterSuffix = () => {
    const { q, state, category, tag, location, qualification } = router.query;
    if (category) return ` under Category: ${category}`;
    if (tag) return ` tagged with: #${tag}`;
    if (location) return ` in Location: ${location}`;
    if (qualification) return ` requiring Qualification: ${qualification}`;
    if (state && state !== "All" && q) return ` matching "${q}" in State: ${state}`;
    if (state && state !== "All") return ` in State: ${state}`;
    if (q) return ` for "${q}"`;
    return "";
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode ? "bg-slate-950 text-white" : "bg-slate-50 text-black"
    }`}>
      <Head>
        <title>{getPageTitle()} — {SITE_NAME}</title>
        <meta name="description" content={`Explore and search verified government job alerts, exams preparation updates, and notifications for: ${getPageTitle()}.`} />
        <meta name="author" content={SEO_DEFAULTS.author} />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={`${getPageTitle()} — ${SITE_NAME}`} />
        <meta property="og:description" content={`Find latest job recruitments, notifications, and results under ${getPageTitle()} at ${SITE_NAME}.`} />
        <meta property="og:site_name" content={SITE_NAME} />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={`${getPageTitle()} — ${SITE_NAME}`} />
        <meta name="twitter:description" content={`Find latest job recruitments, notifications, and results under ${getPageTitle()} at ${SITE_NAME}.`} />
      </Head>

      {/* Hero / Header Filter Bar Section */}
      <section className="bg-gradient-to-b from-blue-950 via-slate-900 to-slate-950 text-white py-10 border-b border-slate-900 px-6">
        <div className="max-w-4xl mx-auto space-y-6 text-center">
          <h1 className="text-xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
            {getPageTitle()}
          </h1>
          
          {/* Inner Search Box */}
          <div className="max-w-3xl mx-auto pt-2">
            <form onSubmit={handleSearchSubmit} className="bg-white p-1 rounded-xl md:rounded-2xl shadow-lg flex flex-col md:flex-row gap-1.5 border border-slate-200">
              <div className="flex-1 flex items-center gap-1.5 px-3 py-1">
                <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Refine search: Railway, SSC, Police..."
                  className="w-full text-xs text-slate-805 bg-transparent focus:outline-none placeholder-slate-400 text-slate-800"
                />
              </div>

              <div className="hidden md:block w-px h-6 bg-slate-200 self-center"></div>

              <div className="w-full md:w-48 px-3 flex items-center py-1">
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full text-xs text-slate-700 bg-transparent focus:outline-none cursor-pointer"
                >
                  <option value="All">All States</option>
                  {INDIAN_STATES_AND_UTS.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white font-bold px-6 py-2.5 rounded-lg md:rounded-xl text-xs transition-all shadow-md shadow-orange-500/20"
              >
                Search
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Main Results Grid Container */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-semibold text-slate-400">Loading government alerts...</span>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Results Counter and Filter Info */}
            <div className="flex justify-between items-center border-b pb-4 border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-1 h-5 bg-blue-600 rounded-full"></span>
                <h2 className="text-base md:text-lg font-bold text-black dark:text-white">
                  Found {filteredBlogs.length} Job Alerts{getCounterSuffix()}
                </h2>
              </div>
              
              {/* Reset link if filters are active */}
              {(router.query.q || router.query.state !== "All" || router.query.category || router.query.tag || router.query.location) && (
                <button
                  onClick={() => router.push("/search")}
                  className="text-xs font-semibold text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition"
                >
                  Reset Filters
                </button>
              )}
            </div>

            {/* Grid of job cards */}
            {currentBlogs.length === 0 ? (
              <div className="text-center py-20 text-slate-500 dark:text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800/80 rounded-2xl">
                No matching notifications found. Try modifying your search criteria or checking another state!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {currentBlogs.map((blog) => (
                  <div
                    key={blog._id}
                    className={`border rounded-2xl flex flex-col justify-between overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group ${
                      darkMode
                        ? "bg-slate-900/40 hover:bg-slate-900/60 border-slate-800/80 hover:border-blue-500/50 hover:shadow-blue-500/5"
                        : "bg-white hover:bg-slate-50/50 border-slate-200 hover:border-blue-400/40 hover:shadow-indigo-500/5"
                    }`}
                  >
                    <div>
                      <div className="p-5 space-y-4">
                        {/* Title */}
                        <h3 className={`text-sm font-bold line-clamp-2 leading-snug min-h-[40px] transition-colors duration-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 ${
                          darkMode ? "text-slate-100" : "text-slate-900"
                        }`}>
                          <Link href={`/${blog.slug}`}>
                            {blog.title}
                          </Link>
                        </h3>

                        {/* Row 1: Hot badge, Category & Date */}
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-orange-500/10 text-orange-600 border border-orange-500/20 dark:bg-orange-500/20 dark:text-orange-400 dark:border-orange-500/30">
                            🔥 Hot
                          </span>

                          {blog.categories && blog.categories.length > 0 ? (
                            <button
                              type="button"
                              onClick={() => router.push(`/search?category=${encodeURIComponent(blog.categories[0].name)}`)}
                              className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-600 border border-blue-500/20 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30 text-left"
                            >
                              {blog.categories[0].name}
                            </button>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-600 border border-blue-500/20 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30">
                              Any Graduate
                            </span>
                          )}

                          <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 ml-auto">
                            {formatMiniDate(blog.createdAt)}
                          </span>
                        </div>

                        {/* Row 2: Location badge & tags */}
                        <div className="flex flex-wrap items-center gap-2">
                          {blog.locations && blog.locations.length > 0 && (
                            <button
                              type="button"
                              onClick={() => router.push(`/search?location=${encodeURIComponent(blog.locations[0].name)}`)}
                              className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30 text-left"
                            >
                              @{blog.locations[0].name}
                            </button>
                          )}
                          
                          {blog.tags && blog.tags.length > 0 && (
                            <button
                              type="button"
                              onClick={() => router.push(`/search?tag=${encodeURIComponent(blog.tags[0].name)}`)}
                              className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-350 dark:border-slate-700 text-left"
                            >
                              {blog.tags[0].name}
                            </button>
                          )}
                        </div>

                        {/* Row 3: Qualifications */}
                        {blog.qualifications && blog.qualifications.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1.5 pt-1">
                            {blog.qualifications.map((qual) => (
                              <button
                                key={qual._id}
                                type="button"
                                onClick={() => router.push(`/search?qualification=${encodeURIComponent(qual.name)}`)}
                                className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-purple-500/10 text-purple-600 border border-purple-500/20 dark:bg-purple-500/20 dark:text-purple-400 dark:border-purple-500/30 hover:bg-purple-500/20 active:scale-95 transition"
                              >
                                🎓 {qual.name}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card Action footer */}
                    <div className={`p-5 pt-3 flex items-center justify-between border-t ${
                      darkMode ? "border-slate-800/60" : "border-slate-150"
                    }`}>
                      {/* Views */}
                      <div className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                        <svg className="w-3.5 h-3.5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span>{getMockViews(blog._id)}</span>
                      </div>

                      {/* Deadline label */}
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-450 dark:border-emerald-500/30">
                        Ends {formatEndsDate(blog)}
                      </span>

                      {/* Link to post */}
                      <Link href={`/${blog.slug}`} className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-3 py-1.5 font-bold text-[11px] flex items-center transition">
                        Apply <span className="ml-1 text-[9px] font-normal">›</span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-8">
                {/* Prev Button */}
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className={`px-3 py-2 rounded-lg border font-semibold text-xs transition duration-200 ${
                    currentPage === 1
                      ? "opacity-50 cursor-not-allowed border-slate-200 dark:border-slate-800 text-slate-400"
                      : "border-slate-200 hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-350"
                  }`}
                >
                  Previous
                </button>

                {/* Page Numbers */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    className={`px-3 py-2 rounded-lg font-bold text-xs transition duration-200 border ${
                      currentPage === p
                        ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20"
                        : "border-slate-200 hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-900 text-slate-605 dark:text-slate-300"
                    }`}
                  >
                    {p}
                  </button>
                ))}

                {/* Next Button */}
                <button
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-2 rounded-lg border font-semibold text-xs transition duration-200 ${
                    currentPage === totalPages
                      ? "opacity-50 cursor-not-allowed border-slate-200 dark:border-slate-800 text-slate-400"
                      : "border-slate-200 hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-900 text-slate-650 dark:text-slate-350"
                  }`}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
