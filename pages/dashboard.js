import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [darkMode, setDarkMode] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [user, setUser] = useState({ name: "Admin User", email: "admin@blog.com" });
  const [authLoading, setAuthLoading] = useState(true);
  const router = useRouter();

  const getCookie = (name) => {
    if (typeof window === "undefined") return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return decodeURIComponent(parts.pop().split(';').shift());
    return null;
  };

  const fetchBackendData = async () => {
    try {
      const [blogRes, catRes, tagRes, locRes, settingRes, qualRes] = await Promise.all([
        fetch("http://localhost:5000/api/blogs"),
        fetch("http://localhost:5000/api/categories"),
        fetch("http://localhost:5000/api/tags"),
        fetch("http://localhost:5000/api/locations"),
        fetch("http://localhost:5000/api/settings"),
        fetch("http://localhost:5000/api/qualifications")
      ]);
      
      if (blogRes.ok) {
        const blogData = await blogRes.json();
        const formattedBlogs = blogData.map((b) => ({
          id: b._id,
          title: b.title,
          slug: b.slug,
          content: b.content,
          author: b.author?.name || "Admin User",
          categories: b.categories?.map(c => c.name) || [],
          categoryIds: b.categories?.map(c => c._id) || [],
          tags: b.tags?.map(t => t.name) || [],
          tagIds: b.tags?.map(t => t._id) || [],
          locations: b.locations?.map(l => l.name) || [],
          locationIds: b.locations?.map(l => l._id) || [],
          qualifications: b.qualifications?.map(q => q.name) || [],
          qualificationIds: b.qualifications?.map(q => q._id) || [],
          status: b.status,
          createdAt: (() => {
            const d = new Date(b.createdAt);
            const day = d.getDate();
            const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            const month = months[d.getMonth()];
            const year = d.getFullYear();
            return `${day} ${month}, ${year}`;
          })(),
        }));
        setBlogs(formattedBlogs);
      }
      if (catRes.ok) {
        const catData = await catRes.json();
        setCategories(catData.map(c => ({ id: c._id, name: c.name, slug: c.slug, description: c.description })));
      }
      if (tagRes.ok) {
        const tagData = await tagRes.json();
        setTags(tagData.map(t => ({ id: t._id, name: t.name, slug: t.slug, description: t.description })));
      }
      if (locRes.ok) {
        const locData = await locRes.json();
        setLocations(locData.map(l => ({ id: l._id, name: l.name, slug: l.slug, description: l.description })));
      }
      if (qualRes.ok) {
        const qualData = await qualRes.json();
        setQualifications(qualData.map(q => ({ id: q._id, name: q.name, slug: q.slug, description: q.description })));
      }
      if (settingRes.ok) {
        const settingData = await settingRes.json();
        if (settingData) {
          setSettingForm({
            delhiTemp: settingData.delhiTemp || "",
            mumbaiTemp: settingData.mumbaiTemp || "",
            customDateText: settingData.customDateText || "",
          });
        }
      }
    } catch (err) {
      console.error("Failed to fetch backend data:", err);
    }
  };

  // Authentication check & Theme initialization
  useEffect(() => {
    const token = getCookie("token");
    const storedUser = getCookie("user");
    
    if (!token) {
      router.push("/admin");
      return;
    }

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse stored user details", e);
      }
    }

    setAuthLoading(false);
    fetchBackendData();

    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setDarkMode(true);
    } else {
      setDarkMode(false);
    }
  }, [router]);

  const toggleDarkMode = () => {
    const nextMode = !darkMode;
    setDarkMode(nextMode);
    localStorage.setItem("theme", nextMode ? "dark" : "light");
  };

  const handleLogout = () => {
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    document.cookie = "user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    router.push("/admin");
  };

  // Mock State representing our backend models
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [locations, setLocations] = useState([]);
  const [qualifications, setQualifications] = useState([]);

  // Form Modals states
  const [showBlogModal, setShowBlogModal] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [blogForm, setBlogForm] = useState({ title: "", slug: "", content: "", category: "", tags: [], location: "", status: "draft" });

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({ name: "", description: "" });

  const [showTagModal, setShowTagModal] = useState(false);
  const [editingTag, setEditingTag] = useState(null);
  const [tagForm, setTagForm] = useState({ name: "", description: "" });

  const [showLocationModal, setShowLocationModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [locationForm, setLocationForm] = useState({ name: "", description: "" });

  const [showQualificationModal, setShowQualificationModal] = useState(false);
  const [editingQualification, setEditingQualification] = useState(null);
  const [qualificationForm, setQualificationForm] = useState({ name: "", description: "" });

  const [settingForm, setSettingForm] = useState({ delhiTemp: "33.2 °C", mumbaiTemp: "28.2 °C", customDateText: "" });

  // Slug generator helper
  const slugify = (text) =>
    text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w\-]+/g, "")
      .replace(/\-\-+/g, "-");

  // Blog CRUD functions
  const handleSaveBlog = async (e) => {
    e.preventDefault();
    const token = getCookie("token");
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    try {
      let res;
      if (editingBlog) {
        res = await fetch(`http://localhost:5000/api/blogs/${editingBlog.id}`, {
          method: "PUT",
          headers,
          body: JSON.stringify({
            title: blogForm.title,
            slug: blogForm.slug,
            content: blogForm.content,
            category: blogForm.category,
            tags: blogForm.tags,
            location: blogForm.location || undefined,
            status: blogForm.status,
          }),
        });
      } else {
        res = await fetch("http://localhost:5000/api/blogs", {
          method: "POST",
          headers,
          body: JSON.stringify({
            title: blogForm.title,
            slug: blogForm.slug,
            content: blogForm.content,
            category: blogForm.category,
            tags: blogForm.tags,
            location: blogForm.location || undefined,
            status: blogForm.status,
          }),
        });
      }

      if (res.ok) {
        await fetchBackendData();
        setShowBlogModal(false);
        setEditingBlog(null);
        setBlogForm({ title: "", slug: "", content: "", category: "", tags: [], location: "", status: "draft" });
      } else {
        const data = await res.json();
        alert(data.message || "Failed to save blog post");
      }
    } catch (err) {
      console.error("Failed to save blog post:", err);
      alert("Error saving blog post");
    }
  };

  const handleEditBlog = (blog) => {
    setEditingBlog(blog);
    setBlogForm({
      title: blog.title,
      slug: blog.slug || "",
      content: blog.content,
      category: blog.categoryId || "",
      tags: blog.tagIds || [],
      location: blog.locationId || "",
      status: blog.status,
    });
    setShowBlogModal(true);
  };

  const handleDeleteBlog = async (id) => {
    if (!confirm("Are you sure you want to delete this blog post?")) return;
    const token = getCookie("token");
    try {
      const res = await fetch(`http://localhost:5000/api/blogs/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        await fetchBackendData();
      } else {
        const data = await res.json();
        alert(data.message || "Failed to delete blog post");
      }
    } catch (err) {
      console.error("Failed to delete blog post:", err);
    }
  };

  // Category CRUD
  const handleSaveCategory = async (e) => {
    e.preventDefault();
    const token = getCookie("token");
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    try {
      let res;
      if (editingCategory) {
        res = await fetch(`http://localhost:5000/api/categories/${editingCategory.id}`, {
          method: "PUT",
          headers,
          body: JSON.stringify(categoryForm),
        });
      } else {
        res = await fetch("http://localhost:5000/api/categories", {
          method: "POST",
          headers,
          body: JSON.stringify(categoryForm),
        });
      }

      if (res.ok) {
        await fetchBackendData();
        setShowCategoryModal(false);
        setEditingCategory(null);
        setCategoryForm({ name: "", description: "" });
      } else {
        const data = await res.json();
        alert(data.message || "Failed to save category");
      }
    } catch (err) {
      console.error("Failed to save category:", err);
      alert("Error saving category");
    }
  };

  const handleEditCategory = (cat) => {
    setEditingCategory(cat);
    setCategoryForm({ name: cat.name, description: cat.description });
    setShowCategoryModal(true);
  };

  const handleDeleteCategory = async (id) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    const token = getCookie("token");
    try {
      const res = await fetch(`http://localhost:5000/api/categories/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        await fetchBackendData();
      } else {
        const data = await res.json();
        alert(data.message || "Failed to delete category");
      }
    } catch (err) {
      console.error("Failed to delete category:", err);
    }
  };

  // Tag CRUD
  const handleSaveTag = async (e) => {
    e.preventDefault();
    const token = getCookie("token");
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    try {
      let res;
      if (editingTag) {
        res = await fetch(`http://localhost:5000/api/tags/${editingTag.id}`, {
          method: "PUT",
          headers,
          body: JSON.stringify(tagForm),
        });
      } else {
        res = await fetch("http://localhost:5000/api/tags", {
          method: "POST",
          headers,
          body: JSON.stringify(tagForm),
        });
      }

      if (res.ok) {
        await fetchBackendData();
        setShowTagModal(false);
        setEditingTag(null);
        setTagForm({ name: "", description: "" });
      } else {
        const data = await res.json();
        alert(data.message || "Failed to save tag");
      }
    } catch (err) {
      console.error("Failed to save tag:", err);
      alert("Error saving tag");
    }
  };

  const handleEditTag = (t) => {
    setEditingTag(t);
    setTagForm({ name: t.name, description: t.description });
    setShowTagModal(true);
  };

  const handleDeleteTag = async (id) => {
    if (!confirm("Are you sure you want to delete this tag?")) return;
    const token = getCookie("token");
    try {
      const res = await fetch(`http://localhost:5000/api/tags/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        await fetchBackendData();
      } else {
        const data = await res.json();
        alert(data.message || "Failed to delete tag");
      }
    } catch (err) {
      console.error("Failed to delete tag:", err);
    }
  };

  // Location CRUD
  const handleSaveLocation = async (e) => {
    e.preventDefault();
    const token = getCookie("token");
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    try {
      let res;
      if (editingLocation) {
        res = await fetch(`http://localhost:5000/api/locations/${editingLocation.id}`, {
          method: "PUT",
          headers,
          body: JSON.stringify(locationForm),
        });
      } else {
        res = await fetch("http://localhost:5000/api/locations", {
          method: "POST",
          headers,
          body: JSON.stringify(locationForm),
        });
      }

      if (res.ok) {
        await fetchBackendData();
        setShowLocationModal(false);
        setEditingLocation(null);
        setLocationForm({ name: "", description: "" });
      } else {
        const data = await res.json();
        alert(data.message || "Failed to save location");
      }
    } catch (err) {
      console.error("Failed to save location:", err);
      alert("Error saving location");
    }
  };

  const handleEditLocation = (loc) => {
    setEditingLocation(loc);
    setLocationForm({ name: loc.name, description: loc.description });
    setShowLocationModal(true);
  };

  const handleDeleteLocation = async (id) => {
    if (!confirm("Are you sure you want to delete this location?")) return;
    const token = getCookie("token");
    try {
      const res = await fetch(`http://localhost:5000/api/locations/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        await fetchBackendData();
      } else {
        const data = await res.json();
        alert(data.message || "Failed to delete location");
      }
    } catch (err) {
      console.error("Failed to delete location:", err);
    }
  };

  // Qualification CRUD
  const handleSaveQualification = async (e) => {
    e.preventDefault();
    const token = getCookie("token");
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    try {
      let res;
      if (editingQualification) {
        res = await fetch(`http://localhost:5000/api/qualifications/${editingQualification.id}`, {
          method: "PUT",
          headers,
          body: JSON.stringify(qualificationForm),
        });
      } else {
        res = await fetch("http://localhost:5000/api/qualifications", {
          method: "POST",
          headers,
          body: JSON.stringify(qualificationForm),
        });
      }

      if (res.ok) {
        await fetchBackendData();
        setShowQualificationModal(false);
        setEditingQualification(null);
        setQualificationForm({ name: "", description: "" });
      } else {
        const data = await res.json();
        alert(data.message || "Failed to save qualification");
      }
    } catch (err) {
      console.error("Failed to save qualification:", err);
      alert("Error saving qualification");
    }
  };

  const handleEditQualification = (qual) => {
    setEditingQualification(qual);
    setQualificationForm({ name: qual.name, description: qual.description });
    setShowQualificationModal(true);
  };

  const handleDeleteQualification = async (id) => {
    if (!confirm("Are you sure you want to delete this qualification?")) return;
    const token = getCookie("token");
    try {
      const res = await fetch(`http://localhost:5000/api/qualifications/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        await fetchBackendData();
      } else {
        const data = await res.json();
        alert(data.message || "Failed to delete qualification");
      }
    } catch (err) {
      console.error("Failed to delete qualification:", err);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    const token = getCookie("token");
    try {
      const res = await fetch("http://localhost:5000/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settingForm),
      });
      if (res.ok) {
        alert("Mini Navbar settings updated successfully!");
        await fetchBackendData();
      } else {
        const data = await res.json();
        alert(data.message || "Failed to save settings");
      }
    } catch (err) {
      console.error("Failed to save settings:", err);
      alert("Error saving settings");
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex font-sans transition-colors duration-300 ${
      darkMode ? "bg-slate-900 text-slate-100" : "bg-slate-50 text-slate-800"
    }`}>
      <Head>
        <title>Blog Engine Admin Dashboard</title>
        <meta name="description" content="Manage your premium blog platform posts, categories, and tags." />
      </Head>

      {/* Sidebar */}
      <aside className={`w-64 border-r flex flex-col justify-between shrink-0 transition-colors duration-300 ${
        darkMode ? "bg-slate-950 border-slate-800" : "bg-white border-slate-200"
      }`}>
        <div>
          {/* Logo */}
          <div className={`p-6 border-b flex items-center gap-3 transition-colors duration-300 ${
            darkMode ? "border-slate-800" : "border-slate-200"
          }`}>
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/30">
              B
            </div>
            <span className={`font-bold text-lg tracking-wide transition-colors duration-300 ${
              darkMode ? "text-white" : "text-slate-900"
            }`}>
              Antigravity Blog
            </span>
          </div>

          {/* Navigation Tabs */}
          <nav className="p-4 space-y-1">
            <button
              onClick={() => setActiveTab("overview")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === "overview"
                  ? darkMode
                    ? "bg-indigo-600/15 text-indigo-400 border-l-4 border-indigo-500"
                    : "bg-indigo-50 text-indigo-600 border-l-4 border-indigo-600"
                  : darkMode
                    ? "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
              </svg>
              Overview
            </button>

            <button
              onClick={() => setActiveTab("posts")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === "posts"
                  ? darkMode
                    ? "bg-indigo-600/15 text-indigo-400 border-l-4 border-indigo-500"
                    : "bg-indigo-50 text-indigo-600 border-l-4 border-indigo-600"
                  : darkMode
                    ? "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
              Posts
            </button>

            <button
              onClick={() => setActiveTab("categories")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === "categories"
                  ? darkMode
                    ? "bg-indigo-600/15 text-indigo-400 border-l-4 border-indigo-500"
                    : "bg-indigo-50 text-indigo-600 border-l-4 border-indigo-600"
                  : darkMode
                    ? "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              Categories
            </button>

            <button
              onClick={() => setActiveTab("tags")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === "tags"
                  ? darkMode
                    ? "bg-indigo-600/15 text-indigo-400 border-l-4 border-indigo-500"
                    : "bg-indigo-50 text-indigo-600 border-l-4 border-indigo-600"
                  : darkMode
                    ? "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Tags
            </button>

            <button
              onClick={() => setActiveTab("locations")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === "locations"
                  ? darkMode
                    ? "bg-indigo-600/15 text-indigo-400 border-l-4 border-indigo-500"
                    : "bg-indigo-50 text-indigo-600 border-l-4 border-indigo-600"
                  : darkMode
                    ? "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Locations
            </button>

            <button
              onClick={() => setActiveTab("qualifications")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === "qualifications"
                  ? darkMode
                    ? "bg-indigo-600/15 text-indigo-400 border-l-4 border-indigo-500"
                    : "bg-indigo-50 text-indigo-600 border-l-4 border-indigo-600"
                  : darkMode
                    ? "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              </svg>
              Qualifications
            </button>

            <button
              onClick={() => setActiveTab("settings")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === "settings"
                  ? darkMode
                    ? "bg-indigo-600/15 text-indigo-400 border-l-4 border-indigo-500"
                    : "bg-indigo-50 text-indigo-600 border-l-4 border-indigo-600"
                  : darkMode
                    ? "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Mini Navbar
            </button>
          </nav>
        </div>

        {/* Profile Footer with Logout */}
        <div className={`p-4 border-t relative transition-colors duration-300 ${
          darkMode ? "border-slate-800" : "border-slate-200"
        }`}>
          {showProfileMenu && (
            <div className={`absolute bottom-16 left-4 right-4 rounded-xl border p-2 shadow-xl z-25 animate-fadeIn ${
              darkMode ? "bg-slate-950 border-slate-800 text-slate-300" : "bg-white border-slate-200 text-slate-700"
            }`}>
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 text-xs font-semibold text-rose-500 hover:bg-rose-500/10 rounded-lg flex items-center gap-2 transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout Account
              </button>
            </div>
          )}

          <div
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition ${
              darkMode ? "hover:bg-slate-900" : "hover:bg-slate-100"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-slate-100 shadow-md">
                {user.name ? user.name.split(" ").map(n => n[0]).join("") : "AD"}
              </div>
              <div>
                <p className={`text-sm font-semibold transition-colors duration-300 ${
                  darkMode ? "text-white" : "text-slate-900"
                }`}>
                  {user.name}
                </p>
                <span className="text-xs text-indigo-650 dark:text-indigo-400 font-medium">{user.email}</span>
              </div>
            </div>
            <svg className={`w-4 h-4 text-slate-400 transition-transform ${showProfileMenu ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-8">
        
        {/* TOP BAR */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className={`text-2xl font-bold capitalize transition-colors duration-300 ${
              darkMode ? "text-white" : "text-slate-900"
            }`}>
              {activeTab} Panel
            </h2>
            <p className={`text-sm mt-1 transition-colors duration-300 ${
              darkMode ? "text-slate-400" : "text-slate-500"
            }`}>
              Manage, curate and organize your content assets.
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleDarkMode}
              className={`p-2.5 rounded-xl border transition ${
                darkMode
                  ? "bg-slate-950 border-slate-800 text-yellow-400 hover:bg-slate-900"
                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
              }`}
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {darkMode ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search..."
                className={`pl-10 pr-4 py-2 rounded-xl text-sm focus:outline-none focus:border-indigo-500 border transition duration-150 ${
                  darkMode ? "bg-slate-950 border-slate-800 text-slate-200" : "bg-white border-slate-200 text-slate-850"
                }`}
              />
            </div>
            
            {activeTab === "posts" && (
              <button
                onClick={() => window.open("/dashboard/posts/create", "_blank")}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-all duration-200 shadow-lg shadow-indigo-600/30 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                New Post
              </button>
            )}
            {activeTab === "categories" && (
              <button
                onClick={() => { setEditingCategory(null); setCategoryForm({ name: "", description: "" }); setShowCategoryModal(true); }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-all duration-200 shadow-lg shadow-indigo-600/30 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                New Category
              </button>
            )}
            {activeTab === "tags" && (
              <button
                onClick={() => { setEditingTag(null); setTagForm({ name: "", description: "" }); setShowTagModal(true); }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-all duration-200 shadow-lg shadow-indigo-600/30 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                New Tag
              </button>
            )}
            {activeTab === "locations" && (
              <button
                onClick={() => { setEditingLocation(null); setLocationForm({ name: "", description: "" }); setShowLocationModal(true); }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-all duration-200 shadow-lg shadow-indigo-600/30 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                New Location
              </button>
            )}
            {activeTab === "qualifications" && (
              <button
                onClick={() => { setEditingQualification(null); setQualificationForm({ name: "", description: "" }); setShowQualificationModal(true); }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-all duration-200 shadow-lg shadow-indigo-600/30 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                New Qualification
              </button>
            )}
          </div>
        </header>

        {/* OVERVIEW PANEL */}
        {activeTab === "overview" && (
          <div className="space-y-8 animate-fadeIn">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className={`border p-6 rounded-2xl flex items-center justify-between transition-colors duration-300 ${
                darkMode ? "bg-slate-950/40 border-slate-800" : "bg-white border-slate-200 shadow-sm"
              }`}>
                <div>
                  <p className={`text-sm font-semibold uppercase tracking-wider transition-colors duration-300 ${
                    darkMode ? "text-slate-400" : "text-slate-500"
                  }`}>
                    Total Posts
                  </p>
                  <h3 className={`text-3xl font-extrabold mt-2 transition-colors duration-300 ${
                    darkMode ? "text-white" : "text-slate-900"
                  }`}>
                    {blogs.length}
                  </h3>
                </div>
                <div className="p-4 bg-indigo-600/10 rounded-xl text-indigo-600 dark:text-indigo-400">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>

              <div className={`border p-6 rounded-2xl flex items-center justify-between transition-colors duration-300 ${
                darkMode ? "bg-slate-950/40 border-slate-800" : "bg-white border-slate-200 shadow-sm"
              }`}>
                <div>
                  <p className={`text-sm font-semibold uppercase tracking-wider transition-colors duration-300 ${
                    darkMode ? "text-slate-400" : "text-slate-500"
                  }`}>
                    Categories
                  </p>
                  <h3 className={`text-3xl font-extrabold mt-2 transition-colors duration-300 ${
                    darkMode ? "text-white" : "text-slate-900"
                  }`}>
                    {categories.length}
                  </h3>
                </div>
                <div className="p-4 bg-emerald-600/10 rounded-xl text-emerald-600 dark:text-emerald-400">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
              </div>

              <div className={`border p-6 rounded-2xl flex items-center justify-between transition-colors duration-300 ${
                darkMode ? "bg-slate-950/40 border-slate-800" : "bg-white border-slate-200 shadow-sm"
              }`}>
                <div>
                  <p className={`text-sm font-semibold uppercase tracking-wider transition-colors duration-300 ${
                    darkMode ? "text-slate-400" : "text-slate-500"
                  }`}>
                    Active Tags
                  </p>
                  <h3 className={`text-3xl font-extrabold mt-2 transition-colors duration-300 ${
                    darkMode ? "text-white" : "text-slate-900"
                  }`}>
                    {tags.length}
                  </h3>
                </div>
                <div className="p-4 bg-purple-600/10 rounded-xl text-purple-600 dark:text-purple-400">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Quick overview layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Activity */}
              <div className={`border rounded-2xl p-6 transition-colors duration-300 ${
                darkMode ? "bg-slate-950/20 border-slate-800" : "bg-white border-slate-200 shadow-sm"
              }`}>
                <h4 className={`font-bold mb-4 text-base transition-colors duration-300 ${
                  darkMode ? "text-white" : "text-slate-900"
                }`}>
                  Recent Posts
                </h4>
                <div className="space-y-4">
                  {blogs.slice(0, 5).map((blog) => (
                    <div key={blog.id} className={`flex justify-between items-center p-3 rounded-xl transition duration-150 ${
                      darkMode ? "hover:bg-slate-800/40" : "hover:bg-slate-50"
                    }`}>
                      <div>
                        <p className={`font-medium text-sm transition-colors duration-300 ${
                          darkMode ? "text-slate-200" : "text-slate-800"
                        }`}>{blog.title}</p>
                        <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">{blog.category}</span>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${blog.status === "published" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"}`}>
                        {blog.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Info & HTML Support details */}
              <div className={`border rounded-2xl p-6 flex flex-col justify-between transition-colors duration-300 ${
                darkMode ? "bg-slate-950/20 border-slate-800" : "bg-white border-slate-200 shadow-sm"
              }`}>
                <div>
                  <h4 className={`font-bold mb-4 text-base transition-colors duration-300 ${
                    darkMode ? "text-white" : "text-slate-900"
                  }`}>
                    SunEditor HTML Support
                  </h4>
                  <p className={`text-sm leading-relaxed mb-4 transition-colors duration-300 ${
                    darkMode ? "text-slate-400" : "text-slate-500"
                  }`}>
                    The backend models are optimized to support storing raw HTML. Both Categories, Tags, and Blog contents accommodate inline styling, custom layouts, and multimedia widgets generated by frontend editors like SunEditor.
                  </p>
                  <ul className={`space-y-2 text-sm transition-colors duration-300 ${
                    darkMode ? "text-slate-300" : "text-slate-650"
                  }`}>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                      Category descriptions support HTML tags.
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                      Tag descriptions support custom formatting.
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                      Blog body keeps clean layout templates.
                    </li>
                  </ul>
                </div>
                <div className={`mt-6 pt-4 border-t flex items-center justify-between ${
                  darkMode ? "border-slate-800/60" : "border-slate-200"
                }`}>
                  <span className="text-xs text-slate-500">Local Connection Active</span>
                  <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* POSTS PANEL */}
        {activeTab === "posts" && (
          <div className={`border rounded-2xl overflow-hidden animate-fadeIn transition-colors duration-300 ${
            darkMode ? "bg-slate-950/20 border-slate-800" : "bg-white border-slate-200 shadow-sm"
          }`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className={`border-b text-xs font-semibold uppercase tracking-wider transition-colors duration-300 ${
                    darkMode ? "bg-slate-950/50 border-slate-800 text-slate-400" : "bg-slate-50 border-slate-200 text-slate-500"
                  }`}>
                    <th className="p-4">Title</th>
                    <th className="p-4">Date</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y text-sm transition-colors duration-300 ${
                  darkMode ? "divide-slate-800 text-slate-300" : "divide-slate-200 text-slate-650"
                }`}>
                  {blogs.map((blog) => (
                    <tr key={blog.id} className={`transition duration-150 ${
                      darkMode ? "hover:bg-slate-800/30" : "hover:bg-slate-50"
                    }`}>
                      <td className={`p-4 font-semibold max-w-xs truncate ${
                        darkMode ? "text-white" : "text-slate-900"
                      }`}>{blog.title}</td>
                      <td className="p-4 text-xs text-slate-550">{blog.createdAt}</td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => window.open(`/dashboard/posts/edit?id=${blog.id}`, "_blank")}
                          className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold text-xs transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteBlog(blog.id)}
                          className="text-rose-500 hover:underline font-semibold text-xs transition"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {blogs.length === 0 && (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-slate-500">No blog posts found. Create one to get started!</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* CATEGORIES PANEL */}
        {activeTab === "categories" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
            {categories.map((cat) => (
              <div key={cat.id} className={`border rounded-2xl p-6 flex flex-col justify-between transition duration-150 ${
                darkMode ? "bg-slate-950/20 border-slate-800 hover:border-slate-700" : "bg-white border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300"
              }`}>
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <h3 className={`font-bold text-lg ${darkMode ? "text-white" : "text-slate-900"}`}>{cat.name}</h3>
                    <span className={`px-2 py-0.5 border rounded text-xs ${
                      darkMode ? "bg-slate-800 text-indigo-400 border-indigo-500/20" : "bg-indigo-50 text-indigo-600 border-indigo-100"
                    }`}>/{cat.slug}</span>
                  </div>
                  <div 
                    className={`text-sm leading-relaxed max-h-24 overflow-hidden mb-4 ${
                      darkMode ? "text-slate-400" : "text-slate-650"
                    }`}
                    dangerouslySetInnerHTML={{ __html: cat.description || "<p class='italic text-slate-450'>No description provided</p>" }}
                  />
                </div>
                <div className={`flex justify-end gap-3 pt-4 border-t ${
                  darkMode ? "border-slate-800/40" : "border-slate-100"
                }`}>
                  <button
                    onClick={() => handleEditCategory(cat)}
                    className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold text-xs transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(cat.id)}
                    className="text-rose-500 hover:underline font-semibold text-xs transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAGS PANEL */}
        {activeTab === "tags" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
            {tags.map((tag) => (
              <div key={tag.id} className={`border rounded-2xl p-6 flex flex-col justify-between transition duration-150 ${
                darkMode ? "bg-slate-950/20 border-slate-800 hover:border-slate-700" : "bg-white border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300"
              }`}>
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <h3 className={`font-bold text-lg ${darkMode ? "text-white" : "text-slate-900"}`}>{tag.name}</h3>
                    <span className={`px-2 py-0.5 border rounded text-xs ${
                      darkMode ? "bg-slate-800 text-indigo-400 border-indigo-500/20" : "bg-indigo-50 text-indigo-600 border-indigo-100"
                    }`}>#{tag.slug}</span>
                  </div>
                  <div 
                    className={`text-sm leading-relaxed max-h-24 overflow-hidden mb-4 ${
                      darkMode ? "text-slate-400" : "text-slate-655"
                    }`}
                    dangerouslySetInnerHTML={{ __html: tag.description || "<p class='italic text-slate-450'>No description provided</p>" }}
                  />
                </div>
                <div className={`flex justify-end gap-3 pt-4 border-t ${
                  darkMode ? "border-slate-800/40" : "border-slate-100"
                }`}>
                  <button
                    onClick={() => handleEditTag(tag)}
                    className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold text-xs transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteTag(tag.id)}
                    className="text-rose-500 hover:underline font-semibold text-xs transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        {activeTab === "locations" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
            {locations.map((loc) => (
              <div key={loc.id} className={`border rounded-2xl p-6 flex flex-col justify-between transition duration-150 ${
                darkMode ? "bg-slate-955/20 border-slate-800 hover:border-slate-700" : "bg-white border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300"
              }`}>
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <h3 className={`font-bold text-lg ${darkMode ? "text-white" : "text-slate-900"}`}>{loc.name}</h3>
                    <span className={`px-2 py-0.5 border rounded text-xs ${
                      darkMode ? "bg-slate-800 text-indigo-400 border-indigo-500/20" : "bg-indigo-50 text-indigo-600 border-indigo-100"
                    }`}>@{loc.slug}</span>
                  </div>
                  <div 
                    className={`text-sm leading-relaxed max-h-24 overflow-hidden mb-4 ${
                      darkMode ? "text-slate-400" : "text-slate-655"
                    }`}
                    dangerouslySetInnerHTML={{ __html: loc.description || "<p class='italic text-slate-450'>No description provided</p>" }}
                  />
                </div>
                <div className={`flex justify-end gap-3 pt-4 border-t ${
                  darkMode ? "border-slate-800/40" : "border-slate-100"
                }`}>
                  <button
                    onClick={() => handleEditLocation(loc)}
                    className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold text-xs transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteLocation(loc.id)}
                    className="text-rose-500 hover:underline font-semibold text-xs transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {locations.length === 0 && (
              <div className="lg:col-span-3 p-8 text-center text-slate-500">No locations found. Add a location to get started!</div>
            )}
          </div>
        )}

        {activeTab === "qualifications" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
            {qualifications.map((qual) => (
              <div key={qual.id} className={`border rounded-2xl p-6 flex flex-col justify-between transition duration-150 ${
                darkMode ? "bg-slate-955/20 border-slate-800 hover:border-slate-700" : "bg-white border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300"
              }`}>
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <h3 className={`font-bold text-lg ${darkMode ? "text-white" : "text-slate-900"}`}>{qual.name}</h3>
                    <span className={`px-2 py-0.5 border rounded text-xs ${
                      darkMode ? "bg-slate-800 text-indigo-400 border-indigo-500/20" : "bg-indigo-50 text-indigo-600 border-indigo-100"
                    }`}>@{qual.slug}</span>
                  </div>
                  <div 
                    className={`text-sm leading-relaxed max-h-24 overflow-hidden mb-4 ${
                      darkMode ? "text-slate-400" : "text-slate-655"
                    }`}
                    dangerouslySetInnerHTML={{ __html: qual.description || "<p class='italic text-slate-450'>No description provided</p>" }}
                  />
                </div>
                <div className={`flex justify-end gap-3 pt-4 border-t ${
                  darkMode ? "border-slate-800/40" : "border-slate-100"
                }`}>
                  <button
                    onClick={() => handleEditQualification(qual)}
                    className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold text-xs transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteQualification(qual.id)}
                    className="text-rose-500 hover:underline font-semibold text-xs transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {qualifications.length === 0 && (
              <div className="lg:col-span-3 p-8 text-center text-slate-500">No qualifications found. Add a qualification to get started!</div>
            )}
          </div>
        )}

        {activeTab === "settings" && (
          <div className="max-w-2xl mx-auto animate-fadeIn">
            <div className={`border rounded-2xl p-6 transition duration-150 ${
              darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm"
            }`}>
              <h3 className={`font-bold text-lg mb-6 ${darkMode ? "text-white" : "text-slate-900"}`}>
                Mini Navbar Settings
              </h3>
              <form onSubmit={handleSaveSettings} className="space-y-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">New Delhi Temperature</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 33.2 °C"
                    value={settingForm.delhiTemp}
                    onChange={(e) => setSettingForm({ ...settingForm, delhiTemp: e.target.value })}
                    className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 ${
                      darkMode ? "bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-600" : "bg-slate-50 border-slate-200 text-slate-950 placeholder-slate-400"
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Mumbai Temperature</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 28.2 °C"
                    value={settingForm.mumbaiTemp}
                    onChange={(e) => setSettingForm({ ...settingForm, mumbaiTemp: e.target.value })}
                    className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 ${
                      darkMode ? "bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-600" : "bg-slate-50 border-slate-200 text-slate-950 placeholder-slate-400"
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Custom Date Text</label>
                  <input
                    type="text"
                    placeholder="e.g. Thursday, July 30, 2026 (Leave empty to use active client date)"
                    value={settingForm.customDateText}
                    onChange={(e) => setSettingForm({ ...settingForm, customDateText: e.target.value })}
                    className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 ${
                      darkMode ? "bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-600" : "bg-slate-50 border-slate-200 text-slate-950 placeholder-slate-400"
                    }`}
                  />
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-800/40">
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-all duration-200 shadow-lg shadow-indigo-600/30"
                  >
                    Save Settings
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* BLOG FORM MODAL */}
      {showBlogModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className={`border rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-scaleIn ${
            darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 text-slate-800"
          }`}>
            <div className={`p-6 border-b flex justify-between items-center ${
              darkMode ? "border-slate-800" : "border-slate-250"
            }`}>
              <h3 className="font-bold text-lg">{editingBlog ? "Edit Blog Post" : "Create New Blog Post"}</h3>
              <button onClick={() => setShowBlogModal(false)} className="text-slate-400 hover:text-slate-650 transition">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSaveBlog} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Blog Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Next.js App Routing Patterns"
                  value={blogForm.title}
                  onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })}
                  className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 ${
                    darkMode ? "bg-slate-955 border-slate-800 text-slate-100" : "bg-slate-50 border-slate-200 text-slate-955"
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Slug (URL identifier)</label>
                <input
                  type="text"
                  placeholder="e.g. nextjs-app-routing-patterns"
                  value={blogForm.slug}
                  onChange={(e) => setBlogForm({ ...blogForm, slug: e.target.value })}
                  className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 ${
                    darkMode ? "bg-slate-955 border-slate-800 text-slate-100" : "bg-slate-50 border-slate-200 text-slate-955"
                  }`}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Category</label>
                  <select
                    value={blogForm.category}
                    onChange={(e) => setBlogForm({ ...blogForm, category: e.target.value })}
                    className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 ${
                      darkMode ? "bg-slate-950 border-slate-800 text-slate-100" : "bg-slate-50 border-slate-200 text-slate-950"
                    }`}
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Location</label>
                  <select
                    value={blogForm.location}
                    onChange={(e) => setBlogForm({ ...blogForm, location: e.target.value })}
                    className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 ${
                      darkMode ? "bg-slate-950 border-slate-800 text-slate-100" : "bg-slate-50 border-slate-200 text-slate-950"
                    }`}
                  >
                    <option value="">Select Location</option>
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.id}>{loc.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Publishing Status</label>
                  <select
                    value={blogForm.status}
                    onChange={(e) => setBlogForm({ ...blogForm, status: e.target.value })}
                    className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 ${
                      darkMode ? "bg-slate-950 border-slate-800 text-slate-100" : "bg-slate-50 border-slate-200 text-slate-950"
                    }`}
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Tags</label>
                <div className="flex flex-wrap gap-2">
                  {tags.map((t) => {
                    const isSelected = blogForm.tags.includes(t.id);
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          const newTags = isSelected
                            ? blogForm.tags.filter((id) => id !== t.id)
                            : [...blogForm.tags, t.id];
                          setBlogForm({ ...blogForm, tags: newTags });
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-150 ${
                          isSelected
                            ? "bg-indigo-600/20 border-indigo-500 text-indigo-600 dark:text-indigo-300"
                            : darkMode
                              ? "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                              : "bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-850"
                        }`}
                      >
                        #{t.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Content (SunEditor HTML Mode)</label>
                <div className={`border rounded-xl overflow-hidden ${
                  darkMode ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-250"
                }`}>
                  <div className={`border-b px-3 py-2 flex flex-wrap gap-2 text-slate-500 text-xs ${
                    darkMode ? "bg-slate-900 border-slate-800 text-slate-400" : "bg-slate-100 border-slate-200"
                  }`}>
                    <button type="button" className="hover:text-indigo-600 dark:hover:text-white p-1"><b>B</b></button>
                    <button type="button" className="hover:text-indigo-600 dark:hover:text-white p-1"><i>I</i></button>
                    <button type="button" className="hover:text-indigo-600 dark:hover:text-white p-1"><u>U</u></button>
                    <button type="button" className="hover:text-indigo-600 dark:hover:text-white p-1"><s>S</s></button>
                    <span className="w-px h-4 bg-slate-200 dark:bg-slate-800 my-auto"></span>
                    <button type="button" className="hover:text-indigo-600 dark:hover:text-white p-1">&lt;/&gt; Source</button>
                    <button type="button" className="hover:text-indigo-600 dark:hover:text-white p-1">Image</button>
                    <button type="button" className="hover:text-indigo-600 dark:hover:text-white p-1">Link</button>
                  </div>
                  <textarea
                    rows="6"
                    value={blogForm.content}
                    onChange={(e) => setBlogForm({ ...blogForm, content: e.target.value })}
                    placeholder="<p>Write your HTML formatted blog post content here...</p>"
                    className={`w-full bg-transparent p-4 text-sm font-mono focus:outline-none ${
                      darkMode ? "text-slate-100" : "text-slate-950"
                    }`}
                  />
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">Safe HTML contents will be rendered directly in frontend blog templates.</span>
              </div>

              <div className={`flex justify-end gap-3 pt-4 border-t ${
                darkMode ? "border-slate-800" : "border-slate-200"
              }`}>
                <button
                  type="button"
                  onClick={() => setShowBlogModal(false)}
                  className={`px-4 py-2 border font-semibold rounded-xl text-sm transition ${
                    darkMode ? "border-slate-800 hover:bg-slate-855 text-slate-300" : "border-slate-200 hover:bg-slate-50 text-slate-600"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-all duration-200"
                >
                  Save Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CATEGORY FORM MODAL */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className={`border rounded-2xl max-w-md w-full shadow-2xl animate-scaleIn ${
            darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 text-slate-800"
          }`}>
            <div className={`p-6 border-b flex justify-between items-center ${
              darkMode ? "border-slate-800" : "border-slate-250"
            }`}>
              <h3 className="font-bold text-lg">{editingCategory ? "Edit Category" : "Create New Category"}</h3>
              <button onClick={() => setShowCategoryModal(false)} className="text-slate-400 hover:text-slate-650 transition">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSaveCategory} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Category Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Science"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 ${
                    darkMode ? "bg-slate-950 border-slate-800 text-slate-100" : "bg-slate-50 border-slate-200 text-slate-950"
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Description (HTML Supported)</label>
                <textarea
                  rows="4"
                  placeholder="<p>Brief summary of this category...</p>"
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  className={`w-full border rounded-xl p-4 text-sm font-mono focus:outline-none focus:border-indigo-500 ${
                    darkMode ? "bg-slate-950 border-slate-800 text-slate-100" : "bg-slate-50 border-slate-200 text-slate-950"
                  }`}
                />
              </div>

              <div className={`flex justify-end gap-3 pt-4 border-t ${
                darkMode ? "border-slate-800" : "border-slate-200"
              }`}>
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className={`px-4 py-2 border font-semibold rounded-xl text-sm transition ${
                    darkMode ? "border-slate-800 hover:bg-slate-855 text-slate-300" : "border-slate-200 hover:bg-slate-50 text-slate-600"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-all duration-200"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAG FORM MODAL */}
      {showTagModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className={`border rounded-2xl max-w-md w-full shadow-2xl animate-scaleIn ${
            darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 text-slate-800"
          }`}>
            <div className={`p-6 border-b flex justify-between items-center ${
              darkMode ? "border-slate-800" : "border-slate-250"
            }`}>
              <h3 className="font-bold text-lg">{editingTag ? "Edit Tag" : "Create New Tag"}</h3>
              <button onClick={() => setShowTagModal(false)} className="text-slate-400 hover:text-slate-650 transition">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSaveTag} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Tag Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Javascript"
                  value={tagForm.name}
                  onChange={(e) => setTagForm({ ...tagForm, name: e.target.value })}
                  className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 ${
                    darkMode ? "bg-slate-950 border-slate-800 text-slate-100" : "bg-slate-50 border-slate-200 text-slate-950"
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Description (HTML Supported)</label>
                <textarea
                  rows="4"
                  placeholder="<p>Brief summary of this tag...</p>"
                  value={tagForm.description}
                  onChange={(e) => setTagForm({ ...tagForm, description: e.target.value })}
                  className={`w-full border rounded-xl p-4 text-sm font-mono focus:outline-none focus:border-indigo-500 ${
                    darkMode ? "bg-slate-950 border-slate-800 text-slate-100" : "bg-slate-50 border-slate-200 text-slate-950"
                  }`}
                />
              </div>

              <div className={`flex justify-end gap-3 pt-4 border-t ${
                darkMode ? "border-slate-800" : "border-slate-200"
              }`}>
                <button
                  type="button"
                  onClick={() => setShowTagModal(false)}
                  className={`px-4 py-2 border font-semibold rounded-xl text-sm transition ${
                    darkMode ? "border-slate-800 hover:bg-slate-855 text-slate-300" : "border-slate-200 hover:bg-slate-50 text-slate-600"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-all duration-200"
                >
                  Save Tag
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LOCATION FORM MODAL */}
      {showLocationModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className={`border rounded-2xl max-w-md w-full shadow-2xl animate-scaleIn ${
            darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 text-slate-800"
          }`}>
            <div className={`p-6 border-b flex justify-between items-center ${
              darkMode ? "border-slate-800" : "border-slate-250"
            }`}>
              <h3 className="font-bold text-lg">{editingLocation ? "Edit Location" : "Create New Location"}</h3>
              <button onClick={() => setShowLocationModal(false)} className="text-slate-400 hover:text-slate-655 transition">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSaveLocation} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Location Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. New Delhi"
                  value={locationForm.name}
                  onChange={(e) => setLocationForm({ ...locationForm, name: e.target.value })}
                  className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 ${
                    darkMode ? "bg-slate-950 border-slate-800 text-slate-100" : "bg-slate-50 border-slate-200 text-slate-950"
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Description (HTML Supported)</label>
                <textarea
                  rows="4"
                  placeholder="<p>Brief summary or notes about this location...</p>"
                  value={locationForm.description}
                  onChange={(e) => setLocationForm({ ...locationForm, description: e.target.value })}
                  className={`w-full border rounded-xl p-4 text-sm font-mono focus:outline-none focus:border-indigo-500 ${
                    darkMode ? "bg-slate-950 border-slate-800 text-slate-100" : "bg-slate-50 border-slate-200 text-slate-950"
                  }`}
                />
              </div>

              <div className={`flex justify-end gap-3 pt-4 border-t ${
                darkMode ? "border-slate-800" : "border-slate-200"
              }`}>
                <button
                  type="button"
                  onClick={() => setShowLocationModal(false)}
                  className={`px-4 py-2 border font-semibold rounded-xl text-sm transition ${
                    darkMode ? "border-slate-800 hover:bg-slate-855 text-slate-300" : "border-slate-200 hover:bg-slate-50 text-slate-600"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-all duration-200"
                >
                  Save Location
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUALIFICATION FORM MODAL */}
      {showQualificationModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className={`border rounded-2xl max-w-md w-full shadow-2xl animate-scaleIn ${
            darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 text-slate-800"
          }`}>
            <div className={`p-6 border-b flex justify-between items-center ${
              darkMode ? "border-slate-800" : "border-slate-250"
            }`}>
              <h3 className="font-bold text-lg">{editingQualification ? "Edit Qualification" : "Create New Qualification"}</h3>
              <button onClick={() => setShowQualificationModal(false)} className="text-slate-400 hover:text-slate-655 transition">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSaveQualification} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Qualification Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Graduate"
                  value={qualificationForm.name}
                  onChange={(e) => setQualificationForm({ ...qualificationForm, name: e.target.value })}
                  className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 ${
                    darkMode ? "bg-slate-950 border-slate-800 text-slate-100" : "bg-slate-50 border-slate-200 text-slate-950"
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Description (HTML Supported)</label>
                <textarea
                  rows="4"
                  placeholder="<p>e.g. 10th Pass, 12th Pass, Diploma, B.Tech, Graduate, PG...</p>"
                  value={qualificationForm.description}
                  onChange={(e) => setQualificationForm({ ...qualificationForm, description: e.target.value })}
                  className={`w-full border rounded-xl p-4 text-sm font-mono focus:outline-none focus:border-indigo-500 ${
                    darkMode ? "bg-slate-950 border-slate-800 text-slate-100" : "bg-slate-50 border-slate-200 text-slate-950"
                  }`}
                />
              </div>

              <div className={`flex justify-end gap-3 pt-4 border-t ${
                darkMode ? "border-slate-800" : "border-slate-200"
              }`}>
                <button
                  type="button"
                  onClick={() => setShowQualificationModal(false)}
                  className={`px-4 py-2 border font-semibold rounded-xl text-sm transition ${
                    darkMode ? "border-slate-800 hover:bg-slate-855 text-slate-300" : "border-slate-200 hover:bg-slate-50 text-slate-600"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-all duration-200"
                >
                  Save Qualification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
