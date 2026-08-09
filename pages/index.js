import { useState, useEffect } from "react";
import Link from "next/link";
import Head from "next/head";
import { useRouter } from "next/router";
import { BACKEND_URL, SITE_NAME, SEO_DEFAULTS, SOCIAL_LINKS, FRONTEND_URL } from "../config";

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
    const [blogsRes, locationsRes, qualificationsRes] = await Promise.all([
      fetch(`${BACKEND_URL}/api/blogs`),
      fetch(`${BACKEND_URL}/api/locations`),
      fetch(`${BACKEND_URL}/api/qualifications`)
    ]);

    const initialBlogs = blogsRes.ok ? await blogsRes.json() : [];
    const initialLocations = locationsRes.ok ? await locationsRes.json() : [];
    const initialQualifications = qualificationsRes.ok ? await qualificationsRes.json() : [];

    // Filter only published blogs
    const publishedBlogs = initialBlogs.filter(b => b.status === "published");

    return {
      props: {
        initialBlogs: publishedBlogs,
        initialLocations,
        initialQualifications
      }
    };
  } catch (err) {
    console.error("Failed to fetch initial data for index page:", err);
    return {
      props: {
        initialBlogs: [],
        initialLocations: [],
        initialQualifications: []
      }
    };
  }
}

export const runtime = 'experimental-edge';

export default function Home({ initialBlogs, initialLocations, initialQualifications }) {
  const router = useRouter();
  const [blogs, setBlogs] = useState(initialBlogs || []);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(true); // default premium dark theme
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [locations, setLocations] = useState(initialLocations || []);
  const [qualifications, setQualifications] = useState(initialQualifications || []);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(searchQuery)}&state=${encodeURIComponent(selectedLocation)}`);
  };

  useEffect(() => {
    // Theme sync listener
    const syncTheme = () => {
      setDarkMode(document.documentElement.classList.contains("dark"));
    };
    syncTheme();
    window.addEventListener("theme-change", syncTheme);
    return () => window.removeEventListener("theme-change", syncTheme);
  }, []);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    const day = d.getDate();
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    return `${day} ${month}, ${year}`;
  };

  const stripHtml = (html) => {
    if (typeof window === "undefined") return "";
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
  };

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

  const nonResultBlogs = blogs.filter((blog) => 
    !blog.categories?.some((c) => c.name.toLowerCase().includes("result"))
  );

  const filteredBlogs = nonResultBlogs.filter((blog) => {
    const matchesSearch = searchQuery
      ? blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.tags?.some((t) => t.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      blog.categories?.some((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
      : true;

    const matchesLocation = selectedLocation === "All"
      ? true
      : blog.locations?.some((loc) => loc._id === selectedLocation || loc.name === selectedLocation);

    return matchesSearch && matchesLocation;
  });

  const centralJobs = nonResultBlogs.filter((blog) =>
    blog.categories?.some((c) =>
      c.name.toLowerCase().includes("center") || c.name.toLowerCase().includes("central")
    )
  );

  const stateJobs = nonResultBlogs.filter((blog) =>
    blog.categories?.some((c) => c.name.toLowerCase().includes("state"))
  );

  const resultBlogs = blogs.filter((blog) =>
    blog.categories?.some((c) => c.name.toLowerCase().includes("result"))
  );

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${darkMode ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-800"
      }`}>
      <Head>
        <title>{SEO_DEFAULTS.title}</title>
        <meta name="description" content={SEO_DEFAULTS.description} />
        <meta name="author" content={SEO_DEFAULTS.author} />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={SEO_DEFAULTS.title} />
        <meta property="og:description" content={SEO_DEFAULTS.description} />
        <meta property="og:site_name" content={SITE_NAME} />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={SEO_DEFAULTS.title} />
        <meta name="twitter:description" content={SEO_DEFAULTS.description} />
        
        {/* JSON-LD Structured Data Schema Markup */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": SITE_NAME,
              "url": FRONTEND_URL,
              "description": SEO_DEFAULTS.description,
              "potentialAction": {
                "@type": "SearchAction",
                "target": `${FRONTEND_URL}/search?q={search_term_string}`,
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": SITE_NAME,
              "url": FRONTEND_URL,
              "logo": `${FRONTEND_URL}/logo.webp`,
              "sameAs": [
                SOCIAL_LINKS.facebook,
                SOCIAL_LINKS.instagram,
                SOCIAL_LINKS.youtube,
                SOCIAL_LINKS.twitter
              ]
            })
          }}
        />
      </Head>

      {/* Hero section */}
      <section className="relative overflow-hidden py-8 px-6 bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-905 border-b border-blue-900/40 text-white rounded-b-[24px] shadow-xl">
        <div className="max-w-5xl mx-auto text-center space-y-5 relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-semibold bg-white/10 text-white/90 border border-white/10 backdrop-blur-md">
            <span>🇮🇳</span>
            <span>India's Trusted Sarkari Naukri Portal</span>
          </div>

          {/* Heading */}
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight max-w-4xl mx-auto">
            Sarkari Naukri — <span className="text-yellow-400">India's Premier</span> Govt Jobs
          </h1>

          {/* Description & subtext */}
          <div className="space-y-1">
            <p className="max-w-2xl mx-auto text-white/90 text-xs md:text-sm font-medium leading-relaxed">
              Direct Access to Verified Central & State Government Recruitments Across 36 States & UTs
            </p>
            <p className="text-white/60 text-[11px] font-medium tracking-wide">
              Real-Time Updates from SSC • UPSC • Railways • Banking • Defence • State PSUs
            </p>
          </div>

          {/* Stats Boxes Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto pt-1">
            <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 backdrop-blur-sm">
              <span className="block text-lg md:text-xl font-extrabold text-yellow-400">79+</span>
              <span className="text-[9px] text-white/60 font-semibold uppercase tracking-wider">Active Jobs</span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 backdrop-blur-sm">
              <span className="block text-lg md:text-xl font-extrabold text-yellow-400">36</span>
              <span className="text-[9px] text-white/60 font-semibold uppercase tracking-wider">States Covered</span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 backdrop-blur-sm">
              <span className="block text-lg md:text-xl font-extrabold text-yellow-400">Free</span>
              <span className="text-[9px] text-white/60 font-semibold uppercase tracking-wider">Always Free</span>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 backdrop-blur-sm">
              <span className="block text-lg md:text-xl font-extrabold text-yellow-400">Daily</span>
              <span className="text-[9px] text-white/60 font-semibold uppercase tracking-wider">Fresh Updates</span>
            </div>
          </div>

          {/* Bottom Checkmarks */}
          <div className="flex flex-wrap justify-center items-center gap-4 text-[10px] text-white/80 font-medium">
            <span className="flex items-center gap-1">✓ Verified notifications</span>
            <span className="flex items-center gap-1">✓ No registration required</span>
            <span className="flex items-center gap-1">✓ Updated 02 Aug 2026</span>
          </div>

          {/* Search Bar Container */}
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
                  placeholder="Try: Railway Group D 2026..."
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

          {/* Tags buttons list below the search bar */}
          <div className="flex flex-wrap justify-center items-center gap-1.5 pt-1 text-[10px]">
            <span className="text-white/60 uppercase font-semibold tracking-wider mr-1">Try:</span>
            {[
              "SSC CGL",
              "Bank PO",
              "UPSC IAS",
              "Railway Group D",
              "Police Constable",
              "Teacher Recruitment",
              "IBPS Clerk"
            ].map((tagText) => (
              <button
                key={tagText}
                type="button"
                onClick={() => router.push(`/search?q=${encodeURIComponent(tagText)}`)}
                className="px-2.5 py-1 bg-white/10 hover:bg-white/20 active:bg-white/30 text-white border border-white/5 rounded-full transition-all duration-150 font-semibold"
              >
                {tagText}
              </button>
            ))}
          </div>

          {/* Qualifications buttons list */}
          {qualifications.length > 0 && (
            <div className="flex flex-wrap justify-center items-center gap-1.5 pt-3 text-[10px]">
              <span className="text-white/60 uppercase font-semibold tracking-wider mr-1">Qualifications:</span>
              {qualifications.map((qual) => (
                <button
                  key={qual._id}
                  type="button"
                  onClick={() => router.push(`/search?qualification=${encodeURIComponent(qual.name)}`)}
                  className="px-2.5 py-1 bg-yellow-500/10 hover:bg-yellow-500/20 active:bg-yellow-500/30 text-yellow-400 border border-yellow-500/20 rounded-full transition-all duration-150 font-semibold"
                >
                  {qual.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Social Alerts Banner */}
      <div className="max-w-7xl mx-auto px-6 pt-8">
        <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl border border-blue-800/40">
          {/* Left Text */}
          <div className="flex items-center gap-2 text-white font-semibold text-sm">
            <span className="text-base">🔔</span>
            <span>Get daily govt job alerts — follow us</span>
          </div>

          {/* Social Buttons Right (No X, No LinkedIn) */}
          <div className="flex flex-wrap items-center gap-3">
            {/* WhatsApp */}
            <a
              href="https://whatsapp.com/channel/0029Vb7DSwZ6LwHhuTnsn30g"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4.5 py-2 rounded-xl text-xs font-bold transition shadow-md shadow-emerald-950/20"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.5-5.739-1.446L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.864-9.864.002-2.637-1.03-5.118-2.905-6.993-1.876-1.875-4.37-2.907-7.01-2.909-5.439 0-9.86 4.417-9.865 9.861-.002 1.748.496 3.454 1.442 4.981L1.936 21.09l4.71-1.236zm11.365-7.72c-.282-.143-1.67-.822-1.928-.917-.258-.094-.446-.143-.634.143-.188.285-.727.917-.89 1.106-.163.19-.327.21-.609.07-.282-.143-1.194-.44-2.274-1.402-.84-.75-1.408-1.675-1.573-1.958-.164-.285-.018-.44.123-.58.127-.127.282-.329.424-.494.141-.165.188-.282.282-.47.094-.19.047-.356-.023-.498-.071-.142-.634-1.528-.868-2.09-.228-.549-.457-.475-.628-.484-.162-.008-.349-.01-.536-.01-.187 0-.491.07-.749.356-.257.285-.983.96-1.02 2.378-.037 1.417.986 2.78 1.127 2.97.141.19 1.95 2.977 4.717 4.17 1.636.705 2.91.961 3.9.77.307-.06.942-.385 1.074-.757.132-.371.132-.69.094-.757-.038-.066-.143-.105-.424-.246z" />
              </svg>
              <span>WhatsApp</span>
            </a>

            {/* Telegram */}
            <a
              href="https://t.me/+UPP9M4WgAKAzNzQ1"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#0088cc] hover:bg-[#0077b3] text-white px-4.5 py-2 rounded-xl text-xs font-bold transition shadow-md shadow-[#0088cc]/20"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.11.02-1.93 1.23-5.46 3.62-.51.35-.98.53-1.39.51-.46-.01-1.33-.26-1.99-.47-.8-.27-1.44-.41-1.39-.87.03-.24.36-.49.99-.75 3.88-1.69 6.46-2.8 7.74-3.32 3.69-1.5 4.45-1.76 4.95-1.77.11 0 .36.03.52.16.14.12.18.28.19.39.01.07.02.23.01.29z" />
              </svg>
              <span>Telegram</span>
            </a>

            {/* Facebook */}
            <a
              href="https://www.facebook.com/Govt.Jobs"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#1877F2] hover:bg-[#166fe5] text-white px-4.5 py-2 rounded-xl text-xs font-bold transition shadow-md shadow-[#1877F2]/20"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span>Facebook</span>
            </a>

            {/* Instagram */}
            <a
              href="https://www.instagram.com/sarkarinaukri.co.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#E1306C] hover:bg-[#d62460] text-white px-4.5 py-2 rounded-xl text-xs font-bold transition shadow-md shadow-[#E1306C]/20"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
              </svg>
              <span>Instagram</span>
            </a>
          </div>
        </div>
      </div>

      {/* Posts Section */}
      <main className="max-w-7xl mx-auto px-6 py-16">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <div>
            {filteredBlogs.length === 0 ? (
              <div className="text-center py-20 text-slate-500">
                No matching articles found. Try another search query!
              </div>
            ) : (
              <div className="space-y-6">
                {/* Trending Header */}
                <div className="flex justify-between items-center border-b pb-4 border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-1 h-5 bg-blue-600 rounded-full"></span>
                    <h2 className="text-lg md:text-xl font-extrabold flex items-center gap-2 text-black dark:text-white">
                      <span>🔥</span> Trending Govt Jobs 2026
                    </h2>
                  </div>
                  <button
                    onClick={() => { setSearchQuery(""); setSelectedLocation("All"); }}
                    className="text-xs font-semibold text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition"
                  >
                    View All →
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-2">
                  {filteredBlogs.map((blog) => {
                    return (
                      <div
                        key={blog._id}
                        className={`border rounded-2xl flex flex-col justify-between overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group ${darkMode
                            ? "bg-slate-900/40 hover:bg-slate-900/60 border-slate-800/80 hover:border-blue-500/50 hover:shadow-blue-500/5"
                            : "bg-white hover:bg-slate-50/50 border-slate-200 hover:border-blue-400/40 hover:shadow-indigo-500/5"
                          }`}
                      >
                        <div>
                          <div className="p-5 space-y-4">
                            {/* Title */}
                            <h3 className={`text-sm font-bold line-clamp-2 leading-snug min-h-[40px] transition-colors duration-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 ${darkMode ? "text-slate-100" : "text-slate-900"
                              }`}>
                              <Link href={`/${blog.slug}`}>
                                {blog.title}
                              </Link>
                            </h3>

                            {/* Row 1: Hot badge, category badge & Date */}
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

                            {/* Row 2: Location badge (if available) & tags */}
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

                        {/* Card Footer: Ends Date, Apply Button */}
                        <div className={`p-5 pt-3 flex items-center justify-between border-t ${darkMode ? "border-slate-800/60" : "border-slate-150"
                          }`}>
                          {/* Ends date */}
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-450 dark:border-emerald-500/30">
                            Ends {formatEndsDate(blog)}
                          </span>

                          {/* Apply button */}
                          <Link href={`/${blog.slug}`} className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-3 py-1.5 font-bold text-[11px] flex items-center transition animate-soft-bounce">
                            Apply <span className="ml-1 text-[9px] font-normal">›</span>
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Qualifications Section */}
                {qualifications.length > 0 && (
                  <div className="space-y-6 pt-10">
                    <div className="flex items-center gap-2 border-b pb-4 border-slate-200 dark:border-slate-800">
                      <span className="w-1 h-5 bg-purple-600 rounded-full"></span>
                      <h2 className="text-lg md:text-xl font-extrabold text-black dark:text-white">
                        🎓 Browse Jobs by Qualification
                      </h2>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 pt-2">
                      {qualifications.map((qual) => (
                        <button
                          key={qual._id}
                          type="button"
                          onClick={() => router.push(`/search?qualification=${encodeURIComponent(qual.name)}`)}
                          className={`p-4 rounded-xl border text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg active:scale-95 group font-bold text-xs ${
                            darkMode
                              ? "bg-slate-900/40 border-slate-800/80 hover:border-purple-500/50 text-slate-200 hover:text-white"
                              : "bg-white border-slate-200 hover:border-purple-400/40 text-slate-700 hover:text-slate-900"
                          }`}
                        >
                          <div className="text-xl mb-1.5 group-hover:scale-110 transition-transform">🎓</div>
                          <div>{qual.name}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2 Columns: Center & State Government Jobs list structure */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-10">
                  {/* Central Government column */}
                  <div className={`p-6 rounded-2xl border transition-colors duration-300 ${
                    darkMode ? "bg-slate-900/40 border-slate-800/80" : "bg-white border-slate-200"
                  }`}>
                    <div className="flex items-center gap-2 border-b pb-4 mb-4 border-slate-200 dark:border-slate-800">
                      <span className="w-1 h-5 bg-indigo-600 rounded-full"></span>
                      <h3 className="text-base font-extrabold text-black dark:text-white">
                        🇮🇳 Central Government Jobs
                      </h3>
                    </div>
                    {centralJobs.length === 0 ? (
                      <p className="text-xs text-slate-500 py-4">No central government jobs available at the moment.</p>
                    ) : (
                      <ul className="divide-y divide-slate-100 dark:divide-slate-800/60">
                        {centralJobs.slice(0, 6).map((job) => (
                          <li key={job._id} className="py-3.5 flex justify-between items-center gap-4 group">
                            <div className="space-y-1">
                              <Link href={`/${job.slug}`} className={`text-xs font-semibold hover:text-blue-600 dark:hover:text-blue-400 line-clamp-1 transition ${
                                darkMode ? "text-slate-200" : "text-slate-850"
                              }`}>
                                {job.title}
                              </Link>
                              <div className="flex items-center gap-2 text-[10px] text-slate-400 dark:text-slate-500">
                                <span>{formatMiniDate(job.createdAt)}</span>
                                <span>•</span>
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30">
                                  Ends {formatEndsDate(job)}
                                </span>
                              </div>
                            </div>
                            <Link href={`/${job.slug}`} className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-2.5 py-1 font-bold text-[10px] flex items-center transition shadow-md shadow-blue-500/10 animate-soft-bounce">
                              Apply
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* State Government column */}
                  <div className={`p-6 rounded-2xl border transition-colors duration-300 ${
                    darkMode ? "bg-slate-900/40 border-slate-800/80" : "bg-white border-slate-200"
                  }`}>
                    <div className="flex items-center gap-2 border-b pb-4 mb-4 border-slate-200 dark:border-slate-800">
                      <span className="w-1 h-5 bg-amber-500 rounded-full"></span>
                      <h3 className="text-base font-extrabold text-black dark:text-white">
                        🏛️ State Government Jobs
                      </h3>
                    </div>
                    {stateJobs.length === 0 ? (
                      <p className="text-xs text-slate-500 py-4">No state government jobs available at the moment.</p>
                    ) : (
                      <ul className="divide-y divide-slate-100 dark:divide-slate-800/60">
                        {stateJobs.slice(0, 6).map((job) => (
                          <li key={job._id} className="py-3.5 flex justify-between items-center gap-4 group">
                            <div className="space-y-1">
                              <Link href={`/${job.slug}`} className={`text-xs font-semibold hover:text-blue-600 dark:hover:text-blue-400 line-clamp-1 transition ${
                                darkMode ? "text-slate-200" : "text-slate-855"
                              }`}>
                                {job.title}
                              </Link>
                              <div className="flex items-center gap-2 text-[10px] text-slate-400 dark:text-slate-500">
                                <span>{formatMiniDate(job.createdAt)}</span>
                                <span>•</span>
                                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30">
                                  Ends {formatEndsDate(job)}
                                </span>
                              </div>
                            </div>
                            <Link href={`/${job.slug}`} className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-2.5 py-1 font-bold text-[10px] flex items-center transition shadow-md shadow-blue-500/10 animate-soft-bounce">
                              Apply
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                {/* Results Section */}
                <div className="space-y-6 pt-12">
                  <div className="flex justify-between items-end border-b pb-4 border-slate-200 dark:border-slate-800">
                    <div className="space-y-1">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
                        📢 Announcements
                      </div>
                      <h2 className="text-xl md:text-2xl font-extrabold text-black dark:text-white flex items-center gap-2">
                        <span>📝</span> Latest Exam Results
                      </h2>
                    </div>
                    <Link
                      href="/search?category=Results"
                      className="text-xs font-semibold text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition"
                    >
                      View All →
                    </Link>
                  </div>

                  {resultBlogs.length === 0 ? (
                    <div className={`p-8 rounded-2xl border text-center ${
                      darkMode ? "bg-slate-900/20 border-slate-800/60" : "bg-white border-slate-200"
                    }`}>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        No exam results posted yet. Stay tuned!
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-2">
                      {resultBlogs.map((blog) => {
                        return (
                          <div
                            key={blog._id}
                            className={`border rounded-2xl flex flex-col justify-between overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group ${darkMode
                                ? "bg-slate-900/40 hover:bg-slate-900/60 border-slate-800/80 hover:border-blue-500/50 hover:shadow-blue-500/5"
                                : "bg-white hover:bg-slate-50/50 border-slate-200 hover:border-blue-400/40 hover:shadow-indigo-500/5"
                              }`}
                          >
                            <div>
                              <div className="p-5 space-y-4">
                                {/* Title */}
                                <h3 className={`text-sm font-bold line-clamp-2 leading-snug min-h-[40px] transition-colors duration-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 ${darkMode ? "text-slate-100" : "text-slate-900"
                                  }`}>
                                  <Link href={`/${blog.slug}`}>
                                    {blog.title}
                                  </Link>
                                </h3>

                                {/* Row 1: Hot badge, category badge & Date */}
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30">
                                    📢 Announcement
                                  </span>

                                  {blog.categories && blog.categories.length > 0 && (
                                    <button
                                      type="button"
                                      onClick={() => router.push(`/search?category=${encodeURIComponent(blog.categories[0].name)}`)}
                                      className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-600 border border-blue-500/20 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30 text-left"
                                    >
                                      {blog.categories[0].name}
                                    </button>
                                  )}

                                  <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 ml-auto">
                                    {formatMiniDate(blog.createdAt)}
                                  </span>
                                </div>

                                {/* Row 2: Location badge (if available) & tags */}
                                <div className="flex flex-wrap items-center gap-2">
                                  {blog.locations && blog.locations.length > 0 && (
                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30">
                                      📍 {blog.locations[0].name}
                                    </span>
                                  )}
                                  {blog.tags && blog.tags.slice(0, 2).map((t) => (
                                    <span key={t._id} className="text-[10px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded-md">
                                      #{t.name}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Card Footer: View Results Button */}
                            <div className={`p-5 pt-3 flex items-center justify-end border-t ${darkMode ? "border-slate-800/60" : "border-slate-150"
                              }`}>
                              {/* Action button */}
                              <Link href={`/${blog.slug}`} className="bg-amber-600 hover:bg-amber-700 text-white rounded-lg px-3 py-1.5 font-bold text-[11px] flex items-center transition animate-soft-bounce">
                                View Results <span className="ml-1 text-[9px] font-normal">›</span>
                              </Link>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
