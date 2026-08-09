import { useState, useEffect } from "react";
import Head from "next/head";
import { SITE_NAME } from "../config";

export default function TermsAndConditions() {
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
        <title>Terms & Conditions — {SITE_NAME}</title>
        <meta name="description" content={`Terms & Conditions for using ${SITE_NAME}. Read our site usage rules and guidelines.`} />
      </Head>

      <main className="max-w-4xl mx-auto px-6 py-16 space-y-8">
        <div className="space-y-4 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-black dark:text-white">
            Terms & <span className="text-blue-600 dark:text-blue-400">Conditions</span>
          </h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium">
            Last Updated: 08 August 2026
          </p>
        </div>

        <section className={`p-8 rounded-2xl border ${
          darkMode ? "bg-slate-900/40 border-slate-800/80" : "bg-white border-slate-200"
        } shadow-xl space-y-6 text-sm leading-relaxed`}>
          <p>
            Welcome to <strong>{SITE_NAME}</strong>! These terms and conditions outline the rules and regulations for the use of {SITE_NAME}'s Website.
          </p>

          <h3 className="text-base font-extrabold text-black dark:text-white">Terms of Use</h3>
          <p>
            By accessing this website we assume you accept these terms and conditions. Do not continue to use {SITE_NAME} if you do not agree to take all of the terms and conditions stated on this page.
          </p>

          <h3 className="text-base font-extrabold text-black dark:text-white">License & Content</h3>
          <p>
            Unless otherwise stated, {SITE_NAME} and/or its licensors own the intellectual property rights for all material on {SITE_NAME}. All intellectual property rights are reserved. You may access this from {SITE_NAME} for your own personal use subjected to restrictions set in these terms and conditions.
          </p>
          <p>
            You must not republish material, sell, rent, sub-license, duplicate, copy, or redistribute content from {SITE_NAME} without explicit written permission.
          </p>

          <h3 className="text-base font-extrabold text-black dark:text-white">Liability</h3>
          <p>
            We shall not be hold responsible for any content that appears on our Website. The job information presented is on an "as-is" basis, and we assume no liability for changes in application deadlines, links, or eligibility requirements announced by public organizations.
          </p>

          <h3 className="text-base font-extrabold text-black dark:text-white">Contact</h3>
          <p>
            For any queries regarding our terms, feel free to email us at <strong>divrawat2001second@gmail.com</strong>.
          </p>
        </section>
      </main>
    </div>
  );
}
