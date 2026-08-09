import { useState, useEffect } from "react";
import Head from "next/head";
import { SITE_NAME } from "../config";

export default function Disclaimer() {
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
        <title>Disclaimer — {SITE_NAME}</title>
        <meta name="description" content={`Disclaimer policy for ${SITE_NAME}. Read our terms regarding the accuracy and validity of job postings.`} />
      </Head>

      <main className="max-w-4xl mx-auto px-6 py-16 space-y-8">
        <div className="space-y-4 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-black dark:text-white">
            Dis<span className="text-blue-600 dark:text-blue-400">claimer</span>
          </h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium">
            Last Updated: 08 August 2026
          </p>
        </div>

        <section className={`p-8 rounded-2xl border ${
          darkMode ? "bg-slate-900/40 border-slate-800/80" : "bg-white border-slate-200"
        } shadow-xl space-y-6 text-sm leading-relaxed`}>
          <p>
            If you require any more information or have any questions about our site's disclaimer, please feel free to contact us by email at <strong>divrawat2001second@gmail.com</strong>.
          </p>

          <h3 className="text-base font-extrabold text-black dark:text-white">Disclaimers for {SITE_NAME}</h3>
          <p>
            All the information on this website — {SITE_NAME} — is published in good faith and for general information purpose only. {SITE_NAME} does not make any warranties about the completeness, reliability, and accuracy of this information. Any action you take upon the information you find on this website is strictly at your own risk. {SITE_NAME} will not be liable for any losses and/or damages in connection with the use of our website.
          </p>

          <h3 className="text-base font-extrabold text-black dark:text-white">No Government Association</h3>
          <p>
            <strong>{SITE_NAME} is a private news and career resources web portal. We are NOT associated, affiliated, or sponsored by any government department, public enterprise, or government ministry.</strong> We collect, verify, and summarize job notifications directly from public portals, newspapers, and departmental announcements solely for educational/informational purposes. All users are strongly advised to verify the job eligibility details on the official portals before completing any online applications.
          </p>

          <h3 className="text-base font-extrabold text-black dark:text-white">Consent</h3>
          <p>
            By using our website, you hereby consent to our disclaimer and agree to its terms.
          </p>
        </section>
      </main>
    </div>
  );
}
