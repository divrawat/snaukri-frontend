import { useState, useEffect } from "react";
import { SOCIAL_LINKS } from "../config";

export default function MiniNavbar() {
  const [formattedDate, setFormattedDate] = useState("");
  const [setting, setSetting] = useState({
    delhiTemp: "33.2 °C",
    mumbaiTemp: "28.2 °C",
    customDateText: ""
  });

  useEffect(() => {
    // Format date on client-side to avoid hydration mismatches
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    setFormattedDate(new Date().toLocaleDateString('en-US', options));

    // Fetch settings from database
    const fetchSetting = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/settings");
        if (res.ok) {
          const data = await res.json();
          setSetting(data);
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
      }
    };
    fetchSetting();
  }, []);

  return (
    <div className="w-full bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-10 flex items-center justify-between text-xs text-black dark:text-slate-400">
        
        {/* Left Side: Weather and Date */}
        <div className="flex items-center gap-6 overflow-x-auto whitespace-nowrap scrollbar-none">
          {/* New Delhi Weather */}
          <div className="flex items-center gap-1.5 font-medium">
            <svg className="w-4 h-4 text-amber-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464-5.636a1 1 0 010 1.414l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.46 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zm1.41 8.49a1 1 0 11-1.41 1.41l-.71-.71a1 1 0 111.42-1.42l.7.71zm10.61 0a1 1 0 010 1.41l-.7.71a1 1 0 11-1.42-1.42l.71-.71a1 1 0 011.41 0z" clipRule="evenodd" />
            </svg>
            <span>{setting.delhiTemp || "33.2 °C"} New Delhi</span>
          </div>

          {/* Mumbai Weather */}
          <div className="flex items-center gap-1.5 font-medium">
            <svg className="w-4 h-4 text-slate-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5.5 16a3.5 3.5 0 00.34-6.977A4.5 4.5 0 0113.5 6.5h.01a5.5 5.5 0 014.99 8.243A3.49 3.49 0 0015.5 14H15a1 1 0 000 2h.5a1.5 1.5 0 010 3h-10a1.5 1.5 0 010-3H5.5z" />
            </svg>
            <span>{setting.mumbaiTemp || "28.2 °C"} Mumbai</span>
          </div>

          {/* Date */}
          <div className="text-black/60 dark:text-slate-500 border-l border-slate-200 dark:border-slate-800 pl-6 hidden md:block">
            {setting.customDateText || formattedDate}
          </div>
        </div>

        {/* Right Side: Links and Socials */}
        <div className="flex items-center gap-6 font-semibold">
          <div className="hidden lg:flex items-center gap-4 text-black dark:text-slate-300">
            <a href="/search?qualification=10th%20Pass" className="hover:text-indigo-600 cursor-pointer transition">10th Pass</a>
            <a href="/search?qualification=12th%20Pass" className="hover:text-indigo-600 cursor-pointer transition">12th Pass</a>
            <a href="/search?qualification=LLB" className="hover:text-indigo-600 cursor-pointer transition">LLB</a>
          </div>

          {/* Social Icons */}
          <div className="flex items-center gap-3 border-l border-slate-200 dark:border-slate-800 pl-6">
            {/* Facebook */}
            <a href={SOCIAL_LINKS.facebook} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-blue-600 cursor-pointer transition" aria-label="Facebook">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/>
              </svg>
            </a>

            {/* Instagram */}
            <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-pink-600 cursor-pointer transition" aria-label="Instagram">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
              </svg>
            </a>

            {/* X */}
            <a href={SOCIAL_LINKS.twitter} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-black dark:hover:text-white cursor-pointer transition" aria-label="X (formerly Twitter)">
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>

            {/* YouTube */}
            <a href={SOCIAL_LINKS.youtube} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-red-600 cursor-pointer transition" aria-label="YouTube">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M23.498 6.163a3.003 3.003 0 00-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.508a3.003 3.003 0 00-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 002.11 2.11c1.871.508 9.388.508 9.388.508s7.517 0 9.388-.508a3.003 3.003 0 002.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
