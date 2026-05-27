"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { BrandLogo } from "@/components/brand/BrandLogo";

const Preloader = () => {
  const pathname = usePathname();
  const skip =
    pathname?.startsWith("/dashboard") || pathname?.startsWith("/signin");
  const [isLoaded, setIsLoaded] = useState(false);
  const [showContent, setShowContent] = useState(true);

  useEffect(() => {
    if (skip) return;
    const timer = setTimeout(() => {
      setIsLoaded(true);
      // Wait for curtains to finish opening before removing from DOM
      setTimeout(() => setShowContent(false), 1500);
    }, 4500); // Increased slightly for premium feel

    return () => clearTimeout(timer);
  }, [skip]);

  if (skip || !showContent) return null;

  return (
    <AnimatePresence>
      {showContent && (
        <div className="preloader fix" style={{ position: 'fixed', inset: 0, zIndex: 9999, overflow: 'hidden' }}>
          {/* Left Curtain */}
          <motion.div
            initial={{ x: 0 }}
            animate={isLoaded ? { x: "-100%" } : { x: 0 }}
            transition={{ duration: 1.2, ease: [0.77, 0, 0.175, 1] }}
            className="position-absolute h-100 w-50"
            style={{ left: 0, background: '#000', zIndex: 10, borderRight: '1px solid rgba(255,255,255,0.05)' }}
          />
          
          {/* Right Curtain */}
          <motion.div
            initial={{ x: 0 }}
            animate={isLoaded ? { x: "100%" } : { x: 0 }}
            transition={{ duration: 1.2, ease: [0.77, 0, 0.175, 1] }}
            className="position-absolute h-100 w-50"
            style={{ right: 0, background: '#000', zIndex: 10, borderLeft: '1px solid rgba(255,255,255,0.05)' }}
          />

          {/* Centered Logo Animation */}
          <div className="d-center flex-column" style={{ position: 'relative', zIndex: 11, height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <motion.div
              animate={isLoaded ? { opacity: 0, scale: 0.85, y: -20 } : { opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
            >
              <BrandLogo variant="full" priority className="h-24 w-[min(85vw,18rem)] sm:h-28 sm:w-80" />
            </motion.div>
            
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: isLoaded ? 0 : 200 }}
              transition={{ duration: 2, ease: "easeInOut" }}
              className="mt-4"
              style={{ height: '2px', background: 'var(--p1-clr)', opacity: 0.5 }}
            />
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Preloader;
