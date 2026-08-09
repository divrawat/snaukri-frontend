import { useState, useEffect } from "react";
import Head from "next/head";
import { SITE_NAME } from "../config";

export default function PrivacyPolicy() {
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
        <title>Privacy Policy — {SITE_NAME}</title>
        <meta name="description" content={`Privacy Policy for ${SITE_NAME}. Read how we collect, process, and protect your user data.`} />
      </Head>

      <main className="max-w-4xl mx-auto px-6 py-16 space-y-8">
        <div className="space-y-4 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-black dark:text-white">
            Privacy <span className="text-blue-600 dark:text-blue-400">Policy</span>
          </h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium">
            Last Updated: 08 August 2026
          </p>
        </div>

        <section className={`p-8 rounded-2xl border ${
          darkMode ? "bg-slate-900/40 border-slate-800/80" : "bg-white border-slate-200"
        } shadow-xl space-y-6 text-sm leading-relaxed`}>
          <p>
            At <strong>{SITE_NAME}</strong>, accessible from our website, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by {SITE_NAME} and how we use it.
          </p>

          <h3 className="text-base font-extrabold text-black dark:text-white">Information We Collect</h3>
          <p>
            We do not require user registrations to browse our listings. The only personal information we collect is when you contact us directly via email (such as <strong>divrawat2001second@gmail.com</strong>), in which case we receive your name, email address, and any message text you provide.
          </p>

          <h3 className="text-base font-extrabold text-black dark:text-white">Log Files</h3>
          <p>
            {SITE_NAME} follows a standard procedure of using log files. These files log visitors when they visit websites. The information collected by log files includes internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date and time stamp, referring/exit pages, and possibly the number of clicks. These are not linked to any information that is personally identifiable.
          </p>

          <h3 className="text-base font-extrabold text-black dark:text-white">Cookies and Web Beacons</h3>
          <p>
            Like any other website, {SITE_NAME} uses 'cookies'. These cookies are used to store information including visitors' preferences, and the pages on the website that the visitor accessed or visited. The information is used to optimize the users' experience by customizing our web page content based on visitors' browser type and/or other information.
          </p>

          <h3 className="text-base font-extrabold text-black dark:text-white">Third Party Privacy Policies</h3>
          <p>
            {SITE_NAME}'s Privacy Policy does not apply to other advertisers or websites. Thus, we are advising you to consult the respective Privacy Policies of these third-party ad servers for more detailed information.
          </p>

          <h3 className="text-base font-extrabold text-black dark:text-white">Contact Information</h3>
          <p>
            If you have additional questions or require more information about our Privacy Policy, do not hesitate to contact us at <strong>divrawat2001second@gmail.com</strong>.
          </p>
        </section>
      </main>
    </div>
  );
}
