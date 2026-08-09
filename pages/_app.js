import "@/styles/globals.css";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import MiniNavbar from "@/components/MiniNavbar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function App({ Component, pageProps }) {
  const router = useRouter();
  const showMiniNavbar = !router.pathname.startsWith("/dashboard");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let timer;
    const handleStart = () => {
      setLoading(true);
      setProgress(10);
      timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(timer);
            return 90;
          }
          return prev + 10;
        });
      }, 100);
    };

    const handleComplete = () => {
      clearInterval(timer);
      setProgress(100);
      setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 200);
    };

    router.events.on("routeChangeStart", handleStart);
    router.events.on("routeChangeComplete", handleComplete);
    router.events.on("routeChangeError", handleComplete);

    return () => {
      router.events.off("routeChangeStart", handleStart);
      router.events.off("routeChangeComplete", handleComplete);
      router.events.off("routeChangeError", handleComplete);
      clearInterval(timer);
    };
  }, [router]);

  return (
    <>
      {loading && (
        <div 
          className="fixed top-0 left-0 h-1 bg-red-600 z-50 transition-all duration-200 ease-out" 
          style={{ width: `${progress}%` }}
        />
      )}
      {showMiniNavbar && (
        <>
          <MiniNavbar />
          <Navbar />
        </>
      )}
      <Component {...pageProps} />
      {showMiniNavbar && <Footer />}
    </>
  );
}
