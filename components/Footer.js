import { useState, useEffect } from "react";
import Link from "next/link";
import { SOCIAL_LINKS } from "../config";

export default function Footer() {
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [qualifications, setQualifications] = useState([]);

  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const [catRes, locRes, qualRes] = await Promise.all([
          fetch("http://localhost:5000/api/categories"),
          fetch("http://localhost:5000/api/locations"),
          fetch("http://localhost:5000/api/qualifications")
        ]);
        if (catRes.ok) {
          const catData = await catRes.json();
          setCategories(catData.slice(0, 8));
        }
        if (locRes.ok) {
          const locData = await locRes.json();
          setLocations(locData.slice(0, 8));
        }
        if (qualRes.ok) {
          const qualData = await qualRes.json();
          setQualifications(qualData.slice(0, 8));
        }
      } catch (err) {
        console.error("Failed to fetch footer metadata:", err);
      }
    };
    fetchMeta();
  }, []);

  return (
    <footer className="!bg-slate-900 !text-slate-350 border-t !border-slate-800/80 pt-12 pb-6 px-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-12">
        {/* Column 1: Brand Logo & Description */}
        <div className="space-y-4">
          <div className="flex items-center gap-2.5 !text-white font-extrabold text-lg tracking-tight">
            <img 
              src="/logo.webp" 
              alt="Sarkari Naukri Logo" 
              className="w-[30px] h-[30px] object-contain"
            />
            <span>Sarkari Naukri</span>
          </div>
          <p className="text-xs leading-relaxed !text-slate-400">
            India's premier portal for verified govt jobs alerts, exam results, and notifications across central & state sectors. Verified daily.
          </p>

          {/* Social Icons */}
          <div className="flex items-center gap-3.5 pt-2">
            {/* Facebook */}
            <a href={SOCIAL_LINKS.facebook} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-blue-600 transition" aria-label="Facebook">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/>
              </svg>
            </a>

            {/* Instagram */}
            <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-pink-600 transition" aria-label="Instagram">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
              </svg>
            </a>

            {/* X */}
            <a href={SOCIAL_LINKS.twitter} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-white transition" aria-label="X (formerly Twitter)">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>

            {/* YouTube */}
            <a href={SOCIAL_LINKS.youtube} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-red-600 transition" aria-label="YouTube">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M23.498 6.163a3.003 3.003 0 00-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.508a3.003 3.003 0 00-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 002.11 2.11c1.871.508 9.388.508 9.388.508s7.517 0 9.388-.508a3.003 3.003 0 002.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Column 2: Quick Links */}
        <div>
          <h4 className="!text-white font-semibold text-sm mb-4 uppercase tracking-wider">Quick Links</h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link href="/about-us" className="!text-slate-400 hover:!text-white transition">About Us</Link>
            </li>
            <li>
              <Link href="/contact-us" className="!text-slate-400 hover:!text-white transition">Contact Us</Link>
            </li>
            <li>
              <Link href="/privacy-policy" className="!text-slate-400 hover:!text-white transition">Privacy Policy</Link>
            </li>
            <li>
              <Link href="/disclaimer" className="!text-slate-400 hover:!text-white transition">Disclaimer</Link>
            </li>
            <li>
              <Link href="/terms-and-conditions" className="!text-slate-400 hover:!text-white transition">Terms & Conditions</Link>
            </li>
          </ul>
        </div>

        {/* Column 3: Categories */}
        <div>
          <h4 className="!text-white font-semibold text-sm mb-4 uppercase tracking-wider">Categories</h4>
          <ul className="space-y-2 text-xs">
            {categories.length > 0 ? (
              categories.map((cat) => (
                <li key={cat._id}>
                  <Link href={`/search?category=${encodeURIComponent(cat.name)}`} className="!text-slate-400 hover:!text-white transition">
                    {cat.name}
                  </Link>
                </li>
              ))
            ) : (
              <>
                <li><Link href="/search?category=Central%20Jobs" className="!text-slate-400 hover:!text-white transition">Central Jobs</Link></li>
                <li><Link href="/search?category=State%20Jobs" className="!text-slate-400 hover:!text-white transition">State Jobs</Link></li>
                <li><Link href="/search?category=Bank%20Jobs" className="!text-slate-400 hover:!text-white transition">Bank Jobs</Link></li>
                <li><Link href="/search?category=Railway%20Jobs" className="!text-slate-400 hover:!text-white transition">Railway Jobs</Link></li>
              </>
            )}
          </ul>
        </div>

        {/* Column 4: Locations */}
        <div>
          <h4 className="!text-white font-semibold text-sm mb-4 uppercase tracking-wider">Locations</h4>
          <ul className="space-y-2 text-xs">
            {locations.length > 0 ? (
              locations.map((loc) => (
                <li key={loc._id}>
                  <Link href={`/search?location=${encodeURIComponent(loc.name)}`} className="!text-slate-400 hover:!text-white transition">
                    {loc.name}
                  </Link>
                </li>
              ))
            ) : (
              <>
                <li><Link href="/search?location=New%20Delhi" className="!text-slate-400 hover:!text-white transition">New Delhi</Link></li>
                <li><Link href="/search?location=Mumbai" className="!text-slate-400 hover:!text-white transition">Mumbai</Link></li>
                <li><Link href="/search?location=Karnataka" className="!text-slate-400 hover:!text-white transition">Karnataka</Link></li>
                <li><Link href="/search?location=Hyderabad" className="!text-slate-400 hover:!text-white transition">Hyderabad</Link></li>
              </>
            )}
          </ul>
        </div>

        {/* Column 5: Qualifications */}
        <div>
          <h4 className="!text-white font-semibold text-sm mb-4 uppercase tracking-wider">Qualifications</h4>
          <ul className="space-y-2 text-xs">
            {qualifications.length > 0 ? (
              qualifications.map((qual) => (
                <li key={qual._id}>
                  <Link href={`/search?qualification=${encodeURIComponent(qual.name)}`} className="!text-slate-400 hover:!text-white transition">
                    {qual.name}
                  </Link>
                </li>
              ))
            ) : (
              <>
                <li><Link href="/search?qualification=10th%20Pass" className="!text-slate-400 hover:!text-white transition">10th Pass</Link></li>
                <li><Link href="/search?qualification=12th%20Pass" className="!text-slate-400 hover:!text-white transition">12th Pass</Link></li>
                <li><Link href="/search?qualification=Graduate" className="!text-slate-400 hover:!text-white transition">Graduate</Link></li>
                <li><Link href="/search?qualification=Post%20Graduate" className="!text-slate-400 hover:!text-white transition">Post Graduate</Link></li>
              </>
            )}
          </ul>
        </div>
      </div>

      {/* Footer Bottom copyright */}
      <div className="max-w-7xl mx-auto border-t !border-slate-800/60 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between text-xs !text-slate-500">
        <span>&copy; {new Date().getFullYear()} Sarkari Naukri. All rights reserved.</span>
        <span>Trusted Job Alert System</span>
      </div>
    </footer>
  );
}
