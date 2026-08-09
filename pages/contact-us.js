import { useState, useEffect } from "react";
import Head from "next/head";
import { SITE_NAME } from "../config";

export default function ContactUs() {
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
        <title>Contact Us — {SITE_NAME}</title>
        <meta name="description" content={`Get in touch with the team at ${SITE_NAME}. Contact us at divrawat2001second@gmail.com for job queries, corrections, or support.`} />
      </Head>

      <main className="max-w-4xl mx-auto px-6 py-16 space-y-8">
        <div className="space-y-4 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-black dark:text-white">
            Contact <span className="text-blue-600 dark:text-blue-400">Us</span>
          </h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium">
            We'd Love to Hear From You. Get in Touch!
          </p>
        </div>

        <section className={`p-8 rounded-2xl border ${
          darkMode ? "bg-slate-900/40 border-slate-800/80" : "bg-white border-slate-200"
        } shadow-xl space-y-6 text-sm leading-relaxed max-w-2xl mx-auto`}>
          <p className="text-center text-slate-650 dark:text-slate-350">
            For inquiries, job recruitment updates, corrections, advertisements, or technical assistance with the website, please drop us an email directly:
          </p>

          <div className="flex flex-col items-center justify-center p-6 rounded-xl bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/20 text-center gap-2">
            <span className="text-2xl">✉️</span>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Email Address</span>
            <a 
              href="mailto:divrawat2001second@gmail.com" 
              className="text-base font-extrabold text-blue-600 dark:text-blue-400 hover:underline"
            >
              divrawat2001second@gmail.com
            </a>
          </div>

          <p className="text-xs text-center text-slate-500 dark:text-slate-400">
            Our support team typically responds to all verified inquiries within 24 to 48 business hours.
          </p>
        </section>
      </main>
    </div>
  );
}
