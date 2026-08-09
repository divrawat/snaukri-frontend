import { useState, useEffect } from "react";
import Head from "next/head";
import { SITE_NAME } from "../config";

export default function AboutUs() {
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    const syncTheme = () => {
      setDarkMode(document.documentElement.classList.contains("dark"));
    };
    syncTheme();
    window.addEventListener("theme-change", syncTheme);
    return () => window.removeEventListener("theme-change", syncTheme);
  }, []);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode ? "bg-slate-955 text-slate-100" : "bg-slate-50 text-slate-800"
    }`}>
      <Head>
        <title>About Us — {SITE_NAME}</title>
        <meta name="description" content={`Learn more about ${SITE_NAME}, India's premier portal for verified government jobs, recruitment notifications, and exam alerts.`} />
      </Head>

      <main className="max-w-4xl mx-auto px-6 py-16 space-y-8">
        <div className="space-y-4 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-black dark:text-white">
            About <span className="text-blue-600 dark:text-blue-400">{SITE_NAME}</span>
          </h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium">
            India's Premier Portal for Verified Government Jobs Alerts & Notifications
          </p>
        </div>

        <section className={`p-8 rounded-2xl border ${
          darkMode ? "bg-slate-900/40 border-slate-800/80" : "bg-white border-slate-200"
        } shadow-xl space-y-6 text-sm leading-relaxed`}>
          <p>
            Welcome to <strong>{SITE_NAME}</strong>, your trusted and premier destination for real-time, verified government job notifications in India. We aim to bridge the gap between job seekers and public sector career opportunities by presenting verified, clean, and concise vacancy reports from all across the nation.
          </p>
          
          <h3 className="text-base font-extrabold text-black dark:text-white">Our Mission</h3>
          <p>
            Our core mission is to empower the youth of India by keeping them instantly updated with the latest state government and central government career openings. We remove the clutter and provide clear instructions, direct official notification links, online application portals, and key eligibility parameters.
          </p>

          <h3 className="text-base font-extrabold text-black dark:text-white">What We Cover</h3>
          <ul className="list-disc list-inside space-y-2 pl-4 text-slate-600 dark:text-slate-350">
            <li><strong>Central Government Recruitments:</strong> SSC, UPSC, Railways (RRB), Bank PO/Clerk, Defence Forces, and Major PSUs.</li>
            <li><strong>State Government Job Alerts:</strong> State Civil Services, State PSUs, Police recruitments, Teachers training boards, and Support Staff opportunities.</li>
            <li><strong>Detailed Eligibility & Qualifications:</strong> Filter jobs easily according to your qualification level (10th Pass, 12th Pass, Graduate, Post Graduate, ITI, Diploma, BE/BTech, etc.).</li>
          </ul>

          <h3 className="text-base font-extrabold text-black dark:text-white">Why Trust Us?</h3>
          <p>
            Every single job listing on our portal undergoes thorough manual verification against official gazette notifications and department updates before publishing. We do not use automatic scrapers or placeholders, ensuring that the details you read are 100% genuine, reliable, and up to date.
          </p>
        </section>
      </main>
    </div>
  );
}
