"use client";

import React, { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const MouseFollower = () => {
  const pathname = usePathname();
  const skip =
    pathname?.startsWith("/dashboard") || pathname?.startsWith("/signin");

  if (skip) return null;
  const followerRef = useRef<HTMLSpanElement>(null);
  const dotRef = useRef<HTMLSpanElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (followerRef.current && dotRef.current) {
        followerRef.current.animate(
          [{ left: `${e.clientX}px`, top: `${e.clientY}px` }],
          { duration: 800, fill: "forwards" }
        );
        dotRef.current.animate(
          [{ left: `${e.clientX}px`, top: `${e.clientY}px` }],
          { duration: 100, fill: "forwards" }
        );
      }
    };

    const handleMouseEnter = () => {
      containerRef.current?.classList.add("highlight-cursor-head");
    };
    const handleMouseLeave = () => {
      containerRef.current?.classList.remove("highlight-cursor-head");
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Toggle cursor visibility on links/buttons
    const interactiveElements = document.querySelectorAll("a, button");
    interactiveElements.forEach((el) => {
      el.addEventListener("mouseenter", () => containerRef.current?.classList.add("hide-cursor"));
      el.addEventListener("mouseleave", () => containerRef.current?.classList.remove("hide-cursor"));
    });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div ref={containerRef} className="mouse-follower">
      <span ref={followerRef} className="cursor-outline"></span>
      <span ref={dotRef} className="cursor-dot"></span>
    </div>
  );
};

export default MouseFollower;
