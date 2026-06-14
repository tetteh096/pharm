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
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const easeOut = [0.22, 1, 0.36, 1] as const;

export type StickyFeatureItem = {
  id: string | number;
  title: string;
  description: string;
  image: string;
  imageAlt?: string;
  iconClass?: string;
  /** Short label for the top step bar (defaults to title) */
  stepLabel?: string;
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
  /** Shorter scroll track on narrow screens */
  mobileScrollVhPerStep?: number;
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
      <span className="ssfs-cta-icon" aria-hidden>
        <ArrowRight className="size-4" />
      </span>
    </>
  );
  if (isExternalHref(href)) {
    return <a href={href} className={className}>{inner}</a>;
  }
  return <Link href={href} className={className}>{inner}</Link>;
}

/**
 * Scroll-driven pinned feature showcase — image left, text right.
 * Top numbered step bar advances as the user scrolls (Lodgify-style).
 */
export function ScrollStickyFeatureShowcase({
  features,
  eyebrow = "How we help",
  scrollVhPerStep = 110,
  mobileScrollVhPerStep = 90,
  className,
  panelClassName,
}: ScrollStickyFeatureShowcaseProps) {
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const [pinMode, setPinMode] = useState<PinMode>("before");
  const [activeIndex, setActiveIndex] = useState(0);
  const [stepScrollVh, setStepScrollVh] = useState(scrollVhPerStep);
  const baseId = useId();
  const n = features.length;

  useEffect(() => {
    const syncStepVh = () => {
      setStepScrollVh(window.innerWidth <= 860 ? mobileScrollVhPerStep : scrollVhPerStep);
    };
    syncStepVh();
    window.addEventListener("resize", syncStepVh, { passive: true });
    return () => window.removeEventListener("resize", syncStepVh);
  }, [scrollVhPerStep, mobileScrollVhPerStep]);

  const scrollTrackVh = useMemo(() => {
    if (n <= 0) return 100;
    return n * stepScrollVh + 40;
  }, [n, stepScrollVh]);

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
  const dur = reduceMotion ? 0.01 : 0.45;

  return (
    <section
      ref={sectionRef}
      className={cn("ssfs-section", className)}
      style={{ height: `${scrollTrackVh}vh` }}
      aria-label="Feature highlights"
    >
      <div
        className={cn(
          "ssfs-pin",
          pinMode === "fixed" && "ssfs-pin--fixed",
          pinMode === "after" && "ssfs-pin--after",
          pinMode === "before" && "ssfs-pin--before",
          panelClassName,
        )}
      >
        <div className="ssfs-shell">
          {eyebrow && <p className="ssfs-eyebrow">{eyebrow}</p>}

          <nav
            className="ssfs-steps"
            role="tablist"
            aria-label="Service steps"
            tabIndex={0}
            onKeyDown={onKeyDown}
          >
            {features.map((f, i) => {
              const isActive = i === activeIndex;
              const isDone = i < activeIndex;
              const label = f.stepLabel ?? f.title;

              return (
                <div key={f.id} className="ssfs-step-group">
                  {i > 0 && (
                    <span
                      className={cn("ssfs-step-line", isDone && "ssfs-step-line--done")}
                      aria-hidden
                    />
                  )}
                  <button
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-label={`${i + 1}. ${label}`}
                    tabIndex={isActive ? 0 : -1}
                    onClick={() => scrollToIndex(i)}
                    className={cn(
                      "ssfs-step",
                      isActive && "ssfs-step--active",
                      isDone && "ssfs-step--done",
                    )}
                  >
                    <span className="ssfs-step-circle">{i + 1}</span>
                    {isActive && (
                      <span className="ssfs-step-label">
                        {i + 1}. {label}
                      </span>
                    )}
                  </button>
                </div>
              );
            })}
          </nav>

          <p className="ssfs-active-step-mobile" aria-live="polite">
            <span className="ssfs-active-step-mobile-num">{activeIndex + 1}</span>
            {active.stepLabel ?? active.title}
          </p>

          <div className="ssfs-layout">
            <div className="ssfs-img-col">
              <div className="ssfs-img-stage">
                <AnimatePresence initial={false} mode="wait">
                  <motion.div
                    key={active.id}
                    className="ssfs-img-card"
                    initial={reduceMotion ? false : { opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduceMotion ? undefined : { opacity: 0, y: -16 }}
                    transition={{ duration: dur, ease: easeOut }}
                  >
                    <img
                      src={active.image}
                      alt={active.imageAlt ?? active.title}
                      className="ssfs-img"
                      decoding="async"
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            <div
              id={`${baseId}-panel`}
              role="tabpanel"
              className="ssfs-content-col"
            >
              <AnimatePresence initial={false} mode="wait">
                <motion.div
                  key={active.id}
                  className="ssfs-text"
                  initial={reduceMotion ? false : { opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduceMotion ? undefined : { opacity: 0, y: -12 }}
                  transition={{ duration: dur, ease: easeOut }}
                >
                  <h2 className="ssfs-title">{active.title}</h2>
                  <p className="ssfs-desc">{active.description}</p>
                  {active.onCtaClick ? (
                    <button type="button" onClick={active.onCtaClick} className="ssfs-cta">
                      <span>{active.ctaLabel}</span>
                      <span className="ssfs-cta-icon" aria-hidden>
                        <ArrowRight className="size-4" />
                      </span>
                    </button>
                  ) : (
                    <CtaButton href={active.ctaHref} label={active.ctaLabel} className="ssfs-cta" />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ScrollStickyFeatureShowcase;
