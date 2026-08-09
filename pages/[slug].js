import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { BACKEND_URL, SITE_NAME, SEO_DEFAULTS, SOCIAL_LINKS, FRONTEND_URL } from "../config";

export async function getServerSideProps(context) {
  const { slug } = context.params;
  try {
    const [postRes, allRes] = await Promise.all([
      fetch(`${BACKEND_URL}/api/blogs/slug/${slug}`),
      fetch(`${BACKEND_URL}/api/blogs`)
    ]);

    if (!postRes.ok) {
      return {
        notFound: true
      };
    }
    const initialBlog = await postRes.json();
    const allBlogs = allRes.ok ? await allRes.json() : [];
    const initialRecentBlogs = allBlogs
      .filter((b) => b.status === "published" && b.slug !== slug)
      .slice(0, 5);

    return {
      props: {
        initialBlog,
        initialRecentBlogs
      }
    };
  } catch (err) {
    console.error("Failed to fetch initial data for slug page:", err);
    return {
      notFound: true
    };
  }
}

export const runtime = 'experimental-edge';

export default function PostDetails({ initialBlog, initialRecentBlogs }) {
  const router = useRouter();
  const [blog, setBlog] = useState(initialBlog);
  const [recentBlogs, setRecentBlogs] = useState(initialRecentBlogs || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [darkMode, setDarkMode] = useState(true);

  // Sync props state on client side navigation transitions
  useEffect(() => {
    setBlog(initialBlog);
    setRecentBlogs(initialRecentBlogs || []);
  }, [initialBlog, initialRecentBlogs]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-955 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const getExcerpt = (htmlContent, limit = 150) => {
    if (!htmlContent) return "";
    const cleanText = htmlContent.replace(/<[^>]*>/g, ' ');
    const trimmed = cleanText.trim().replace(/\s+/g, ' ');
    if (trimmed.length <= limit) return trimmed;
    return trimmed.slice(0, limit) + "...";
  };

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-3xl font-bold text-rose-500 mb-4">Error loading post</h1>
        <p className="text-slate-400 mb-6">{error || "The requested blog post could not be found."}</p>
        <Link href="/" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 font-semibold rounded-xl text-sm transition">
          Return Home
        </Link>
      </div>
    );
  }

  const isResult = blog.categories?.some((c) => c.name.toLowerCase().includes("result"));

  const schemaData = isResult
    ? {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": blog.title,
        "description": getExcerpt(blog.content),
        "image": blog.featuredImage || `${FRONTEND_URL}/logo.webp`,
        "datePublished": blog.createdAt,
        "dateModified": blog.updatedAt || blog.createdAt,
        "author": {
          "@type": "Person",
          "name": "Divyanshu Rawat"
        },
        "publisher": {
          "@type": "Organization",
          "name": SITE_NAME,
          "logo": {
            "@type": "ImageObject",
            "url": `${FRONTEND_URL}/logo.webp`
          }
        }
      }
    : {
        "@context": "https://schema.org",
        "@type": "JobPosting",
        "title": blog.title,
        "description": getExcerpt(blog.content),
        "datePosted": blog.createdAt,
        "validThrough": blog.endDate || new Date(new Date(blog.createdAt).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        "employmentType": "FULL_TIME",
        "hiringOrganization": {
          "@type": "Organization",
          "name": SITE_NAME,
          "sameAs": FRONTEND_URL,
          "logo": `${FRONTEND_URL}/logo.webp`
        },
        "jobLocation": {
          "@type": "Place",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": blog.locations && blog.locations.length > 0 ? blog.locations[0].name : "India",
            "addressCountry": "IN"
          }
        }
      };

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${
      darkMode ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-800"
    }`}>
      <Head>
        <title>{blog.title} — {SITE_NAME}</title>
        <meta name="description" content={getExcerpt(blog.content)} />
        <meta name="author" content={SEO_DEFAULTS.author} />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={`${blog.title} — ${SITE_NAME}`} />
        <meta property="og:description" content={getExcerpt(blog.content)} />
        <meta property="og:site_name" content={SITE_NAME} />
        {blog.featuredImage && <meta property="og:image" content={blog.featuredImage} />}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${blog.title} — ${SITE_NAME}`} />
        <meta name="twitter:description" content={getExcerpt(blog.content)} />
        {blog.featuredImage && <meta name="twitter:image" content={blog.featuredImage} />}
        
        {/* JSON-LD Structured Data Schema Markup */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
        />
      </Head>

      {/* Main content area */}
      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* LEFT SIDE: Post Content */}
          <div className="lg:col-span-3 space-y-8">
            <article className="space-y-8">
              {/* Metadata badges */}
              <div className="flex flex-wrap gap-2">
                {blog.categories?.map((cat) => (
                  <button 
                    key={cat._id} 
                    onClick={() => router.push(`/search?category=${encodeURIComponent(cat.name)}`)}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 active:scale-95 transition animate-soft-bounce"
                  >
                    {cat.name}
                  </button>
                ))}
                {blog.locations?.map((loc) => (
                  <button 
                    key={loc._id} 
                    onClick={() => router.push(`/search?location=${encodeURIComponent(loc.name)}`)}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 active:scale-95 transition"
                  >
                    @{loc.name}
                  </button>
                ))}
                {blog.qualifications?.map((qual) => (
                  <button 
                    key={qual._id} 
                    onClick={() => router.push(`/search?qualification=${encodeURIComponent(qual.name)}`)}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 active:scale-95 transition"
                  >
                    {qual.name}
                  </button>
                ))}
              </div>

              {/* Title */}
              <h1 className={`text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight ${
                darkMode ? "text-white" : "text-black"
              }`}>
                {blog.title}
              </h1>

              {/* Author and Date */}
              <div className={`flex items-center gap-3 text-sm border-b pb-6 ${
                darkMode ? "text-slate-400 border-slate-900" : "text-black/70 border-slate-200"
              }`}>
                <img 
                  src="/divyanshu.png" 
                  alt="Divyanshu Rawat" 
                  className="w-6 h-6 rounded-full object-cover border border-blue-500/20 shadow-sm shrink-0"
                />
                <span className={`font-semibold ${darkMode ? "text-slate-350" : "text-black"}`}>Divyanshu Rawat</span>
                <span className="text-slate-600">•</span>
                <span>{formatDate(blog.createdAt)}</span>
              </div>

              {/* Featured Image Below Title and Meta */}
              {blog.featuredImage && (
                <div className={`w-full h-[360px] overflow-hidden rounded-2xl border shadow-xl ${
                  darkMode ? "border-slate-900" : "border-slate-200"
                }`}>
                  <img src={blog.featuredImage} alt={blog.title} className="w-full h-full object-cover" />
                </div>
              )}

              {/* Rich Content Body */}
              <div 
                className={`prose max-w-none leading-relaxed text-lg ${
                  darkMode ? "prose-invert text-slate-350" : "text-black"
                }`}
                dangerouslySetInnerHTML={{ __html: blog.content }}
              />

              {/* Tags below the post and above author box */}
              {blog.tags && blog.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 py-4 border-t border-b border-slate-100 dark:border-slate-900">
                  <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider self-center mr-2">Tags:</span>
                  {blog.tags.map((tag) => (
                    <button 
                      key={tag._id} 
                      onClick={() => router.push(`/search?tag=${encodeURIComponent(tag.name)}`)}
                      className={`px-2.5 py-0.5 rounded text-xs border transition hover:bg-opacity-80 active:scale-95 ${
                        darkMode ? "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750" : "bg-slate-100 border-slate-200 text-black hover:bg-slate-200"
                      }`}
                    >
                      #{tag.name}
                    </button>
                  ))}
                </div>
              )}

              {/* Author Box */}
              <div className={`mt-12 p-6 rounded-2xl border flex flex-col sm:flex-row items-center sm:items-start gap-4 transition-all duration-300 ${
                darkMode ? "bg-slate-900/60 border-slate-800" : "bg-white border-slate-200 shadow-md"
              }`}>
                <img 
                  src="/divyanshu.png" 
                  alt="Divyanshu Rawat" 
                  className="w-20 h-20 rounded-full object-cover shrink-0 border-2 border-blue-500/40"
                />
                <div className="space-y-3 text-center sm:text-left">
                  <h4 className={`text-base font-bold ${darkMode ? "text-slate-100" : "text-black"}`}>
                    Divyanshu Rawat
                  </h4>
                  <p className={`text-xs md:text-sm leading-relaxed ${darkMode ? "text-slate-400" : "text-slate-650"}`}>
                    25 years old Developer & Blogger. Passionate about helping job seekers find verified central and state government job alerts, exams preparation updates, and career opportunities.
                  </p>
                  
                  {/* Social Links */}
                  <div className="flex justify-center sm:justify-start gap-3.5 pt-2">
                    {/* Facebook */}
                    <a
                      href={SOCIAL_LINKS.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-blue-600 transition"
                      title="Facebook Page"
                    >
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/>
                      </svg>
                    </a>

                    {/* Instagram */}
                    <a
                      href={SOCIAL_LINKS.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-pink-600 transition"
                      title="Instagram Profile"
                    >
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                      </svg>
                    </a>

                    {/* Twitter/X */}
                    <a
                      href={SOCIAL_LINKS.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-black dark:hover:text-white transition"
                      title="Twitter/X Profile"
                    >
                      <svg className="w-4 h-4 fill-current self-center" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                    </a>

                    {/* YouTube */}
                    <a
                      href={SOCIAL_LINKS.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-red-600 transition"
                      title="YouTube Channel"
                    >
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <path d="M23.498 6.163a3.003 3.003 0 00-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.508a3.003 3.003 0 00-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 002.11 2.11c1.871.508 9.388.508 9.388.508s7.517 0 9.388-.508a3.003 3.003 0 002.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </article>
          </div>

          {/* RIGHT SIDE: Recent Posts */}
          <div className={`space-y-6 lg:border-l lg:pl-8 ${
            darkMode ? "lg:border-slate-900" : "lg:border-slate-200"
          }`}>
            <h3 className={`text-lg font-bold uppercase tracking-wider border-b pb-3 ${
              darkMode ? "text-white border-slate-900" : "text-black border-slate-200"
            }`}>
              Recent Posts
            </h3>
            {recentBlogs.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No other recent posts found.</p>
            ) : (
              <div className="space-y-6">
                {recentBlogs.map((recent) => (
                  <div key={recent._id} className="group space-y-2">
                    {recent.featuredImage && (
                      <div className={`w-full h-24 overflow-hidden rounded-xl border ${darkMode ? "border-slate-800" : "border-slate-200"}`}>
                        <img src={recent.featuredImage} alt={recent.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      </div>
                    )}
                    <div className="space-y-1">
                      <span className="text-[10px] text-slate-500 font-medium">
                        {formatDate(recent.createdAt)}
                      </span>
                      <h4 className={`font-bold text-sm transition-colors duration-200 leading-snug ${
                        darkMode ? "text-slate-200 group-hover:text-indigo-400" : "text-black group-hover:text-indigo-600"
                      }`}>
                        <Link href={`/${recent.slug}`}>
                          {recent.title}
                        </Link>
                      </h4>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
