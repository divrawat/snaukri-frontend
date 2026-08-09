import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

export default function Navbar() {
  const [darkMode, setDarkMode] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Initial theme setup
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light") {
      setDarkMode(false);
      document.documentElement.classList.remove("dark");
    } else {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    const nextMode = !darkMode;
    setDarkMode(nextMode);
    if (nextMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      // Trigger a storage event to sync with other pages if needed
      window.dispatchEvent(new Event("theme-change"));
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      window.dispatchEvent(new Event("theme-change"));
    }
  };

  return (
    <nav className="border-b transition-colors duration-300 bg-white border-slate-200 text-black dark:bg-slate-950 dark:border-slate-900 dark:text-white py-4 px-6 sticky top-0 z-40 backdrop-blur-md bg-opacity-80 dark:bg-opacity-80">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Left Side: Brand Logo & Title */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <img 
            src="/logo.webp" 
            alt="Sarkari Naukari Logo" 
            className="w-[30px] h-[30px] object-contain group-hover:scale-105 transition-transform duration-200"
          />
          <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-black to-indigo-700 dark:from-white dark:to-indigo-300 bg-clip-text text-transparent group-hover:opacity-90 transition">
            Sarkari Naukari
          </span>
        </Link>

        {/* Right Side: Nav Items & Dark Mode Toggle */}
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-6 text-sm font-semibold">
            <Link href="/" className="text-black dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Home
            </Link>
            <Link href="/search" className="text-black dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Sarkari Naukari
            </Link>
            <Link href="/search?category=Results" className="text-black dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Results
            </Link>
          </div>

          <span className="w-px h-5 bg-slate-200 dark:bg-slate-800 hidden md:block"></span>

          {/* Theme switcher */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all duration-150 text-slate-500 dark:text-slate-400 focus:outline-none"
            aria-label="Toggle theme mode"
          >
            {darkMode ? (
              <svg className="w-5 h-5 text-amber-400 animate-fadeIn" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 100 2h1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-indigo-600 animate-fadeIn" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}
