import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import "suneditor/dist/css/suneditor.min.css";

export default function EditPost() {
  const [SunEditor, setSunEditor] = useState(null);
  const [postId, setPostId] = useState("");
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [body, setBody] = useState(""); // Stores editor content
  const [selectedCategories, setSelectedCategories] = useState([]); // Multiple Categories array
  const [selectedTags, setSelectedTags] = useState([]); // Multiple Tags array
  const [selectedLocations, setSelectedLocations] = useState([]); // Multiple Locations array
  const [selectedQualifications, setSelectedQualifications] = useState([]); // Multiple Qualifications array
  const [status, setStatus] = useState("draft");
  const [featuredImage, setFeaturedImage] = useState("");
  const [endDate, setEndDate] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  const [categorySearch, setCategorySearch] = useState("");
  const [tagSearch, setTagSearch] = useState("");
  const [locationSearch, setLocationSearch] = useState("");
  const [qualificationSearch, setQualificationSearch] = useState("");

  const [debouncedCategorySearch, setDebouncedCategorySearch] = useState("");
  const [debouncedTagSearch, setDebouncedTagSearch] = useState("");
  const [debouncedLocationSearch, setDebouncedLocationSearch] = useState("");
  const [debouncedQualificationSearch, setDebouncedQualificationSearch] = useState("");

  useEffect(() => {
    import("suneditor-react").then((mod) => {
      setSunEditor(() => mod.default);
    });
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedCategorySearch(categorySearch);
    }, 700);
    return () => clearTimeout(handler);
  }, [categorySearch]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedTagSearch(tagSearch);
    }, 700);
    return () => clearTimeout(handler);
  }, [tagSearch]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedLocationSearch(locationSearch);
    }, 700);
    return () => clearTimeout(handler);
  }, [locationSearch]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQualificationSearch(qualificationSearch);
    }, 700);
    return () => clearTimeout(handler);
  }, [qualificationSearch]);
  
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [locations, setLocations] = useState([]);
  const [qualifications, setQualifications] = useState([]);
  const [token, setToken] = useState("");
  
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const router = useRouter();

  // Load auth details, fetch lists & fetch existing blog post details
  useEffect(() => {
    const getCookie = (name) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return decodeURIComponent(parts.pop().split(';').shift());
      return null;
    };

    const jwtToken = getCookie("token");
    if (!jwtToken) {
      router.push("/admin");
      return;
    }
    setToken(jwtToken);

    // Get theme
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setDarkMode(true);
    }

    const { id } = router.query;
    if (!id) return; // Wait for router to load query
    setPostId(id);

    // Fetch lists & post details
    const fetchData = async () => {
      try {
        const [catRes, tagRes, locRes, qualRes, postRes] = await Promise.all([
          fetch("http://localhost:5000/api/categories"),
          fetch("http://localhost:5000/api/tags"),
          fetch("http://localhost:5000/api/locations"),
          fetch("http://localhost:5000/api/qualifications"),
          fetch(`http://localhost:5000/api/blogs`), // We will filter locally or query by ID
        ]);
        
        if (catRes.ok && tagRes.ok && locRes.ok && qualRes.ok && postRes.ok) {
          const cats = await catRes.json();
          const tgs = await tagRes.json();
          const locs = await locRes.json();
          const quals = await qualRes.json();
          const posts = await postRes.json();
          
          setCategories(cats);
          setTags(tgs);
          setLocations(locs);
          setQualifications(quals);

          const post = posts.find(p => p._id === id);
          if (post) {
            setTitle(post.title || "");
            setSlug(post.slug || "");
            setBody(post.content || "");
            setSelectedCategories(post.categories?.map(c => c._id) || []);
            setSelectedTags(post.tags?.map(t => t._id) || []);
            setSelectedLocations(post.locations?.map(l => l._id) || []);
            setSelectedQualifications(post.qualifications?.map(q => q._id) || []);
            setStatus(post.status || "draft");
            setFeaturedImage(post.featuredImage || "");
            if (post.endDate) {
              const d = new Date(post.endDate);
              const formatted = d.toISOString().split("T")[0];
              setEndDate(formatted);
            } else {
              setEndDate("");
            }
          } else {
            setError("Post not found");
          }
        } else {
          setError("Failed to fetch page data");
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError("Error loading post data");
      } finally {
        setFetchLoading(false);
      }
    };

    fetchData();
  }, [router, router.query]);

  const handleBody = (content) => {
    setBody(content);
  };

  const handleTagToggle = (tagId) => {
    if (selectedTags.includes(tagId)) {
      setSelectedTags(selectedTags.filter((t) => t !== tagId));
    } else {
      setSelectedTags([...selectedTags, tagId]);
    }
  };

  const handleCategoryToggle = (catId) => {
    if (selectedCategories.includes(catId)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== catId));
    } else {
      setSelectedCategories([...selectedCategories, catId]);
    }
  };

  const handleLocationToggle = (locId) => {
    if (selectedLocations.includes(locId)) {
      setSelectedLocations(selectedLocations.filter((l) => l !== locId));
    } else {
      setSelectedLocations([...selectedLocations, locId]);
    }
  };

  const handleQualificationToggle = (qualId) => {
    if (selectedQualifications.includes(qualId)) {
      setSelectedQualifications(selectedQualifications.filter((q) => q !== qualId));
    } else {
      setSelectedQualifications([...selectedQualifications, qualId]);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    setError("");
    
    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch("http://localhost:5000/api/blogs/upload-image", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to upload image");
      }

      setFeaturedImage(data.imageUrl);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to upload featured image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Blog title is required");
      return;
    }
    if (!body.trim() || body === "<p><br></p>") {
      setError("Blog content is required");
      return;
    }
    if (selectedCategories.length === 0) {
      setError("Please select at least one category");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`http://localhost:5000/api/blogs/${postId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          slug,
          content: body,
          categories: selectedCategories,
          tags: selectedTags,
          locations: selectedLocations,
          qualifications: selectedQualifications,
          status,
          featuredImage,
          endDate: endDate || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update blog post");
      }

      setSuccess("Post updated successfully!");
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${
      darkMode ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-800"
    }`}>
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Top Header */}
        <header className="flex justify-end items-center mb-8">
          <button
            type="submit"
            form="edit-post-form"
            disabled={loading}
            className={`bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-all duration-200 shadow-lg shadow-indigo-600/30 flex items-center gap-2 ${
              loading ? "opacity-75 cursor-not-allowed" : ""
            }`}
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              "Save Changes"
            )}
          </button>
        </header>

        {/* Message banners */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-sm font-medium flex items-center gap-2">
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-sm font-medium flex items-center gap-2">
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {success}
          </div>
        )}

        {/* Filter lists for search */}
        {(() => {
          const filteredCategories = categories.filter((c) => {
            const isSelected = selectedCategories.includes(c._id);
            if (!debouncedCategorySearch.trim()) {
              return isSelected;
            }
            return c.name.toLowerCase().includes(debouncedCategorySearch.toLowerCase());
          });
          const filteredLocations = locations.filter((l) => {
            const isSelected = selectedLocations.includes(l._id);
            if (!debouncedLocationSearch.trim()) {
              return isSelected;
            }
            return l.name.toLowerCase().includes(debouncedLocationSearch.toLowerCase());
          });
          const filteredTags = tags.filter((t) => {
            const isSelected = selectedTags.includes(t._id);
            if (!debouncedTagSearch.trim()) {
              return isSelected;
            }
            return t.name.toLowerCase().includes(debouncedTagSearch.toLowerCase());
          });
          const filteredQualifications = qualifications.filter((q) => {
            const isSelected = selectedQualifications.includes(q._id);
            if (!debouncedQualificationSearch.trim()) {
              return isSelected;
            }
            return q.name.toLowerCase().includes(debouncedQualificationSearch.toLowerCase());
          });

          return (
            <form id="edit-post-form" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              {/* LEFT SIDE: Post Title & Editor */}
              <div className="lg:col-span-4 space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Post Title</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your post title..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 ${
                      darkMode ? "bg-slate-955 border-slate-800 text-slate-100 placeholder-slate-600" : "bg-white border-slate-200 text-slate-950 placeholder-slate-400"
                    }`}
                  />
                </div>

                {/* Slug */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Slug (URL identifier)</label>
                  <input
                    type="text"
                    placeholder="e.g. my-awesome-post (Optional: auto-generated if left blank)"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 ${
                      darkMode ? "bg-slate-955 border-slate-800 text-slate-100 placeholder-slate-600" : "bg-white border-slate-200 text-slate-950 placeholder-slate-400"
                    }`}
                  />
                </div>

                {/* Rich Text Editor */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Content Body</label>
                  <div className={`rounded-xl overflow-hidden border ${
                    darkMode ? "bg-slate-950 border-slate-800 text-black" : "bg-white border-slate-200"
                  }`}>
                    {SunEditor ? (
                      <SunEditor
                        setContents={body}
                        placeholder="Start typing paragraph here .............."
                        onChange={handleBody}
                        height="auto"
                        setDefaultStyle="font-family:trebuchet ms; color:black;font-size:17px;padding:15px"
                        setOptions={{
                          buttonList: [
                            ["fontSize"],
                            [
                              "bold",
                              "underline",
                              "italic",
                              "blockquote",
                              "subscript",
                              "superscript",
                            ],
                            ["formatBlock"],
                            ["align", "horizontalRule", "list", "table"],
                            ["fontColor", "hiliteColor"],
                            ["removeFormat"],
                            ["link", "image", "video"],
                            ["preview"],
                            ["showBlocks", "codeView", "fullScreen"],
                          ],
                        }}
                      />
                    ) : (
                      <div className="p-8 text-center text-slate-500 text-sm">
                        Loading editor...
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* RIGHT SIDE: Categories, Locations, Tags & Status panels */}
              <div className="lg:col-span-1 space-y-6">
                {/* End Date Input */}
                <div className={`p-5 rounded-2xl border ${darkMode ? "bg-slate-950/20 border-slate-800" : "bg-white border-slate-200"}`}>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Application End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    style={{ colorScheme: darkMode ? "dark" : "light" }}
                    className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 ${
                      darkMode ? "bg-slate-950 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-955"
                    }`}
                  />
                </div>

                {/* Status Dropdown */}
                <div className={`p-5 rounded-2xl border ${darkMode ? "bg-slate-955/20 border-slate-800" : "bg-white border-slate-200"}`}>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Publishing Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 ${
                      darkMode ? "bg-slate-950 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-955"
                    }`}
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>

                {/* Featured Image */}
                <div className={`p-5 rounded-2xl border ${darkMode ? "bg-slate-950/20 border-slate-800" : "bg-white border-slate-200"}`}>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Featured Image</label>
                  
                  {featuredImage && (
                    <div className="mb-3 relative rounded-lg overflow-hidden border border-slate-800">
                      <img src={featuredImage} alt="Featured Preview" className="w-full h-32 object-cover" />
                      <button
                        type="button"
                        onClick={() => setFeaturedImage("")}
                        className="absolute top-2 right-2 bg-rose-600 hover:bg-rose-700 text-white rounded-full p-1 transition"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  )}

                  <div className="flex items-center justify-center w-full">
                    <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer hover:bg-slate-800/20 transition ${
                      darkMode ? "border-slate-800 hover:border-slate-700" : "border-slate-350 hover:border-slate-450"
                    }`}>
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        {uploadingImage ? (
                          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                        ) : (
                          <>
                            <svg className="w-8 h-8 text-slate-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="text-xs text-slate-400">
                              <span className="font-semibold text-indigo-455">Click to upload</span> image
                            </p>
                          </>
                        )}
                      </div>
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploadingImage} />
                    </label>
                  </div>
                </div>

                {/* Categories */}
                <div className={`p-5 rounded-2xl border ${darkMode ? "bg-slate-950/20 border-slate-800" : "bg-white border-slate-200"}`}>
                  <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Categories</span>
                  <input
                    type="text"
                    placeholder="Search categories..."
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                    className={`w-full mb-3 border rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-indigo-500 ${
                      darkMode ? "bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-600" : "bg-slate-50 border-slate-200 text-slate-950 placeholder-slate-400"
                    }`}
                  />
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {filteredCategories.map((c) => {
                      const isChecked = selectedCategories.includes(c._id);
                      return (
                        <label key={c._id} className="flex items-center gap-3 cursor-pointer py-1">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleCategoryToggle(c._id)}
                            className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
                          />
                          <span className="text-sm font-medium">{c.name}</span>
                        </label>
                      );
                    })}
                    {filteredCategories.length === 0 && (
                      <span className="text-xs text-slate-500 italic">No matching categories</span>
                    )}
                  </div>
                </div>

                {/* Locations */}
                <div className={`p-5 rounded-2xl border ${darkMode ? "bg-slate-950/20 border-slate-800" : "bg-white border-slate-200"}`}>
                  <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Locations</span>
                  <input
                    type="text"
                    placeholder="Search locations..."
                    value={locationSearch}
                    onChange={(e) => setLocationSearch(e.target.value)}
                    className={`w-full mb-3 border rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-indigo-500 ${
                      darkMode ? "bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-600" : "bg-slate-50 border-slate-200 text-slate-955 placeholder-slate-400"
                    }`}
                  />
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {filteredLocations.map((loc) => {
                      const isChecked = selectedLocations.includes(loc._id);
                      return (
                        <label key={loc._id} className="flex items-center gap-3 cursor-pointer py-1">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleLocationToggle(loc._id)}
                            className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
                          />
                          <span className="text-sm font-medium">{loc.name}</span>
                        </label>
                      );
                    })}
                    {filteredLocations.length === 0 && (
                      <span className="text-xs text-slate-500 italic">No matching locations</span>
                    )}
                  </div>
                </div>

                {/* Qualifications */}
                <div className={`p-5 rounded-2xl border ${darkMode ? "bg-slate-950/20 border-slate-800" : "bg-white border-slate-200"}`}>
                  <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Qualifications</span>
                  <input
                    type="text"
                    placeholder="Search qualifications..."
                    value={qualificationSearch}
                    onChange={(e) => setQualificationSearch(e.target.value)}
                    className={`w-full mb-3 border rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-indigo-500 ${
                      darkMode ? "bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-600" : "bg-slate-50 border-slate-200 text-slate-950 placeholder-slate-400"
                    }`}
                  />
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {filteredQualifications.map((qual) => {
                      const isChecked = selectedQualifications.includes(qual._id);
                      return (
                        <label key={qual._id} className="flex items-center gap-3 cursor-pointer py-1">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleQualificationToggle(qual._id)}
                            className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
                          />
                          <span className="text-sm font-medium">{qual.name}</span>
                        </label>
                      );
                    })}
                    {filteredQualifications.length === 0 && (
                      <span className="text-xs text-slate-500 italic">No matching qualifications</span>
                    )}
                  </div>
                </div>

                {/* Tags */}
                <div className={`p-5 rounded-2xl border ${darkMode ? "bg-slate-950/20 border-slate-800" : "bg-white border-slate-200"}`}>
                  <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Tags</span>
                  <input
                    type="text"
                    placeholder="Search tags..."
                    value={tagSearch}
                    onChange={(e) => setTagSearch(e.target.value)}
                    className={`w-full mb-3 border rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-indigo-500 ${
                      darkMode ? "bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-600" : "bg-slate-50 border-slate-200 text-slate-950 placeholder-slate-400"
                    }`}
                  />
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {filteredTags.map((t) => {
                      const isChecked = selectedTags.includes(t._id);
                      return (
                        <label key={t._id} className="flex items-center gap-3 cursor-pointer py-1">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleTagToggle(t._id)}
                            className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
                          />
                          <span className="text-sm font-medium">{t.name}</span>
                        </label>
                      );
                    })}
                    {filteredTags.length === 0 && (
                      <span className="text-xs text-slate-500 italic">No matching tags</span>
                    )}
                  </div>
                </div>
              </div>

            </form>
          );
        })()}
      </div>
    </div>
  );
}
