"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

const easeOut = [0.22, 1, 0.36, 1] as const;
const easeOutFast = [0.16, 1, 0.3, 1] as const;

export type StickyFeatureItem = {
  id: string | number;
  title: string;
  description: string;
  image: string;
  imageAlt?: string;
  iconClass?: string;
  ctaLabel: string;
  ctaHref: string;
  /** If provided, clicking the CTA calls this instead of navigating to ctaHref */
  onCtaClick?: () => void;
};

export type ScrollStickyFeatureShowcaseProps = {
  features: StickyFeatureItem[];
  eyebrow?: string;
  /** Viewport heights of scroll per step (default 110) */
  scrollVhPerStep?: number;
  className?: string;
  panelClassName?: string;
};

type PinMode = "before" | "fixed" | "after";

function isExternalHref(href: string) {
  return /^https?:\/\//i.test(href) || href.startsWith("tel:") || href.startsWith("mailto:");
}

function CtaButton({ href, label, className }: { href: string; label: string; className?: string }) {
  const inner = (
    <>
      <span>{label}</span>
      <span className="ssfs-cta-icon">
        <ArrowUpRight className="size-4.5" aria-hidden />
      </span>
    </>
  );
  if (isExternalHref(href)) {
    return <a href={href} className={className}>{inner}</a>;
  }
  return <Link href={href} className={className}>{inner}</Link>;
}

/**
 * Scroll-driven pinned feature showcase — premium dark split layout.
 * Left: full-bleed image with clip-path reveal.
 * Right: staggered step counter → title → description → CTA.
 */
export function ScrollStickyFeatureShowcase({
  features,
  eyebrow = "How we help",
  scrollVhPerStep = 110,
  className,
  panelClassName,
}: ScrollStickyFeatureShowcaseProps) {
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const [pinMode, setPinMode] = useState<PinMode>("before");
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const baseId = useId();
  const n = features.length;

  const scrollTrackVh = useMemo(() => {
    if (n <= 0) return 100;
    return n * scrollVhPerStep + 40;
  }, [n, scrollVhPerStep]);

  const updateFromScroll = useCallback(() => {
    const section = sectionRef.current;
    if (!section || n === 0) return;

    const rect = section.getBoundingClientRect();
    const sectionTop = rect.top + window.scrollY;
    const sectionHeight = section.offsetHeight;
    const vh = window.innerHeight;
    const maxScroll = Math.max(1, sectionHeight - vh);
    const scrolled = window.scrollY - sectionTop;

    let mode: PinMode = "before";
    let p = 0;

    if (scrolled < 0) {
      mode = "before";
      p = 0;
    } else if (scrolled >= maxScroll) {
      mode = "after";
      p = 1;
    } else {
      mode = "fixed";
      p = scrolled / maxScroll;
    }

    const nextIndex = Math.min(n - 1, Math.max(0, Math.floor(p * n)));

    setPinMode((prev) => (prev === mode ? prev : mode));
    setProgress((prev) => (Math.abs(prev - p) < 0.002 ? prev : p));
    setActiveIndex((prev) => (prev === nextIndex ? prev : nextIndex));
  }, [n]);

  useEffect(() => {
    updateFromScroll();
    window.addEventListener("scroll", updateFromScroll, { passive: true });
    window.addEventListener("resize", updateFromScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", updateFromScroll);
      window.removeEventListener("resize", updateFromScroll);
    };
  }, [updateFromScroll]);

  const scrollToIndex = useCallback(
    (index: number) => {
      const section = sectionRef.current;
      if (!section || n === 0) return;
      const sectionTop = section.getBoundingClientRect().top + window.scrollY;
      const maxScroll = Math.max(0, section.offsetHeight - window.innerHeight);
      const clamped = Math.max(0, Math.min(n - 1, index));
      const p = n <= 1 ? 0 : (clamped + 0.5) / n;
      const top = sectionTop + p * maxScroll;
      window.scrollTo({ top, behavior: reduceMotion ? "auto" : "smooth" });
    },
    [n, reduceMotion],
  );

  useEffect(() => {
    features.forEach((f) => {
      const img = new window.Image();
      img.src = f.image;
    });
  }, [features]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        scrollToIndex(Math.min(n - 1, activeIndex + 1));
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        scrollToIndex(Math.max(0, activeIndex - 1));
      } else if (e.key === "Home") {
        e.preventDefault();
        scrollToIndex(0);
      } else if (e.key === "End") {
        e.preventDefault();
        scrollToIndex(n - 1);
      }
    },
    [activeIndex, n, scrollToIndex],
  );

  if (n === 0) return null;

  const active = features[activeIndex]!;
  const dur = reduceMotion ? 0.01 : 0.6;
  const stepLabel = String(activeIndex + 1).padStart(2, "0");
  const totalLabel = String(n).padStart(2, "0");

  return (
    <section
      ref={sectionRef}
      className={cn("ssfs-section", className)}
      style={{ height: `${scrollTrackVh}vh` }}
      aria-label="Feature highlights"
    >
      {/* ── Pinned viewport ── */}
      <div
        className={cn(
          "ssfs-pin",
          pinMode === "fixed" && "ssfs-pin--fixed",
          pinMode === "after" && "ssfs-pin--after",
          pinMode === "before" && "ssfs-pin--before",
          panelClassName,
        )}
      >
        <div className="ssfs-layout">

          {/* ══════════ LEFT — full-bleed image ══════════ */}
          <div className="ssfs-img-col" aria-hidden>
            <AnimatePresence initial={false} mode="wait">
              <motion.div
                key={active.id}
                className="ssfs-img-frame"
                initial={reduceMotion ? false : { clipPath: "inset(0 100% 0 0 round 0px)" }}
                animate={{ clipPath: "inset(0 0% 0 0 round 0px)" }}
                exit={reduceMotion ? undefined : { clipPath: "inset(0 0 0 100% round 0px)", opacity: 0.6 }}
                transition={{ duration: dur * 1.05, ease: easeOutFast }}
              >
                <img
                  src={active.image}
                  alt={active.imageAlt ?? active.title}
                  className="ssfs-img"
                  decoding="async"
                />
                {/* Gradient wash — bottom darkens for badge readability */}
                <div className="ssfs-img-wash" />

                {/* Service badge — bottom left */}
                <AnimatePresence initial={false} mode="wait">
                  <motion.div
                    key={`badge-${active.id}`}
                    className="ssfs-badge"
                    initial={reduceMotion ? false : { opacity: 0, y: 16, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={reduceMotion ? undefined : { opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.4, delay: 0.18, ease: easeOut }}
                  >
                    {active.iconClass && (
                      <span className="ssfs-badge-icon">
                        <i className={active.iconClass} aria-hidden />
                      </span>
                    )}
                    <span className="ssfs-badge-text">{active.title}</span>
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            </AnimatePresence>

            {/* Ghost step number — bottom-right watermark */}
            <AnimatePresence initial={false} mode="wait">
              <motion.span
                key={`ghost-${activeIndex}`}
                className="ssfs-ghost"
                aria-hidden
                initial={reduceMotion ? false : { opacity: 0, y: 40, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: -30, scale: 1.05 }}
                transition={{ duration: 0.5, ease: easeOut }}
              >
                {stepLabel}
              </motion.span>
            </AnimatePresence>

            {/* Eyebrow — top-left overlay */}
            <p className="ssfs-img-eyebrow">{eyebrow}</p>
          </div>

          {/* ══════════ RIGHT — content ══════════ */}
          <div className="ssfs-content-col">

            {/* Step counter */}
            <div className="ssfs-counter" aria-label={`Step ${activeIndex + 1} of ${n}`}>
              <AnimatePresence initial={false} mode="wait">
                <motion.span
                  key={`num-${activeIndex}`}
                  className="ssfs-counter-current"
                  initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
                  transition={{ duration: 0.35, ease: easeOut }}
                >
                  {stepLabel}
                </motion.span>
              </AnimatePresence>
              <span className="ssfs-counter-sep" aria-hidden>/</span>
              <span className="ssfs-counter-total">{totalLabel}</span>
            </div>

            {/* Dot navigator */}
            <div
              role="tablist"
              aria-label="Service steps"
              tabIndex={0}
              onKeyDown={onKeyDown}
              className="ssfs-dots"
            >
              {features.map((f, i) => (
                <button
                  key={f.id}
                  type="button"
                  role="tab"
                  aria-selected={i === activeIndex}
                  aria-label={f.title}
                  tabIndex={i === activeIndex ? 0 : -1}
                  onClick={() => scrollToIndex(i)}
                  className={cn("ssfs-dot", i === activeIndex && "ssfs-dot--on")}
                />
              ))}
            </div>

            {/* Animated text content */}
            <div
              id={`${baseId}-panel`}
              role="tabpanel"
              aria-labelledby={`${baseId}-tab-${activeIndex}`}
              className="ssfs-text-wrap"
            >
              <AnimatePresence initial={false} mode="wait">
                <motion.div
                  key={active.id}
                  className="ssfs-text"
                  initial={reduceMotion ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={reduceMotion ? undefined : { opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  {/* Title */}
                  <motion.h2
                    className="ssfs-title"
                    initial={reduceMotion ? false : { opacity: 0, y: 32, skewY: 1.5 }}
                    animate={{ opacity: 1, y: 0, skewY: 0 }}
                    transition={{ duration: dur * 0.9, delay: 0.04, ease: easeOut }}
                  >
                    {active.title}
                  </motion.h2>

                  {/* Divider line */}
                  <motion.div
                    className="ssfs-divider"
                    initial={reduceMotion ? false : { scaleX: 0, originX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: dur * 0.7, delay: 0.16, ease: easeOut }}
                  />

                  {/* Description */}
                  <motion.p
                    className="ssfs-desc"
                    initial={reduceMotion ? false : { opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: dur * 0.8, delay: 0.22, ease: easeOut }}
                  >
                    {active.description}
                  </motion.p>

                  {/* CTA */}
                  <motion.div
                    initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: dur * 0.7, delay: 0.32, ease: easeOut }}
                  >
                    {active.onCtaClick ? (
                      <button type="button" onClick={active.onCtaClick} className="ssfs-cta">
                        <span>{active.ctaLabel}</span>
                        <span className="ssfs-cta-icon">
                          <ArrowUpRight className="size-4.5" aria-hidden />
                        </span>
                      </button>
                    ) : (
                      <CtaButton href={active.ctaHref} label={active.ctaLabel} className="ssfs-cta" />
                    )}
                  </motion.div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Vertical progress rail — right edge */}
            <div className="ssfs-rail" aria-hidden>
              <div
                className="ssfs-rail-fill"
                style={{ height: `${Math.round(progress * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ScrollStickyFeatureShowcase;
