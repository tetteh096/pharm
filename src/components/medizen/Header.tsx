"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SearchPopup from "./SearchPopup";
import MobileMenu from "./MobileMenu";
import { useTheme } from "@/context/ThemeContext";
import { useCart } from "@/context/CartContext";
import { Moon, Sun, Search, Menu, ShoppingCart } from "lucide-react";
import CommonButton from "./CommonButton";
import { motion } from "framer-motion";
import { BrandLogo } from "@/components/brand/BrandLogo";

const homeNav = { label: "Home", href: "/" };

const navItemsAfterAbout = [
  { label: "Services", href: "/service" },
  { label: "Shop", href: "/shop" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

const aboutDropdown = [
  {
    label: "About Us",
    href: "/about",
    icon: "fas fa-info-circle",
    desc: "Our story, mission & values",
  },
  {
    label: "Team",
    href: "/team",
    icon: "fas fa-user-md",
    desc: "Meet the pharmacists",
  },
];

function NavLink({
  href,
  label,
  isActive,
}: {
  href: string;
  label: string;
  isActive: boolean;
}) {
  return (
    <Link
      href={href}
      className={`nav-link-modern fs-seven fw_700 transition-all position-relative${isActive ? " is-active" : ""}`}
      style={{ paddingBottom: "6px" }}
      aria-current={isActive ? "page" : undefined}
    >
      {label}
      <span className="dot p1-bg" />
    </Link>
  );
}

const Header = () => {
  const [isSticky, setIsSticky] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { count: cartCount, isHydrated: cartReady } = useCart();
  const pathname = usePathname();

  const isActiveLink = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const isAboutSectionActive =
    isActiveLink("/about") || isActiveLink("/team");

  const iconInk = theme === "dark" ? "#f3efe8" : "#090a0b";

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const header = document.querySelector(".header-main-wrapper");
    const setHeaderOffset = () => {
      const height = header?.getBoundingClientRect().height ?? 88;
      document.documentElement.style.setProperty(
        "--site-header-offset",
        `${Math.ceil(height)}px`
      );
    };
    setHeaderOffset();
    window.addEventListener("resize", setHeaderOffset);
    return () => window.removeEventListener("resize", setHeaderOffset);
  }, [isSticky]);

  return (
    <>
      <header
        suppressHydrationWarning
        className={`header-main-wrapper transition-all duration-300 ${isSticky ? "sticky-active" : ""}`}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          padding: isSticky ? "10px 0" : "20px 0",
          background: "transparent",
        }}
      >
        <div className="container">
          <div className="header-inner header-inner-clay rounded-5 px-4 py-2 transition-all duration-300">
            <div className="row align-items-center">
              <div className="col-auto">
                <Link
                  href="/"
                  className="d-flex align-items-center gap-2"
                  aria-label="Enviro Pharmacy home"
                >
                  <BrandLogo
                    variant="icon"
                    priority
                    className="h-12 w-12 rounded-xl bg-white p-1.5 shadow-sm d-sm-none"
                  />
                  <BrandLogo
                    variant="full"
                    priority
                    className="h-11 w-[7.5rem] sm:h-12 sm:w-[8.5rem] d-none d-sm-flex"
                  />
                </Link>
              </div>

              <div className="col d-none d-xl-block">
                <nav className="main-menu d-flex justify-content-center" aria-label="Main">
                  <ul className="d-flex align-items-center gap-4 list-unstyled mb-0">
                    <li>
                      <NavLink
                        href={homeNav.href}
                        label={homeNav.label}
                        isActive={isActiveLink(homeNav.href)}
                      />
                    </li>

                    <li className="position-relative dropdown-nav">
                      <button
                        type="button"
                        className={`nav-link-modern fs-seven fw_700 transition-all position-relative bg-transparent border-0 cursor-pointer d-inline-flex align-items-center gap-1${isAboutSectionActive ? " is-active" : ""}`}
                        style={{ paddingBottom: "6px" }}
                        aria-haspopup="true"
                        aria-current={isAboutSectionActive ? "page" : undefined}
                      >
                        About
                        <i
                          className="fas fa-chevron-down nav-dropdown-chevron"
                          style={{ fontSize: "0.65rem" }}
                        />
                        <span className="dot p1-bg" />
                      </button>

                      <div
                        className="nav-dropdown-panel position-absolute"
                        role="menu"
                        aria-label="About pages"
                      >
                        {aboutDropdown.map((item) => {
                          const itemActive = isActiveLink(item.href);
                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              className={`nav-dropdown-item${itemActive ? " is-active" : ""}`}
                              aria-current={itemActive ? "page" : undefined}
                              role="menuitem"
                            >
                                <div
                                  className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                                  style={{
                                    width: 34,
                                    height: 34,
                                    background: itemActive
                                      ? "rgba(19,236,138,0.22)"
                                      : "rgba(19,236,138,0.12)",
                                    color: "var(--p1-clr)",
                                    fontSize: "0.82rem",
                                  }}
                                >
                                  <i className={item.icon} />
                                </div>
                                <div>
                                  <div className="nav-dropdown-item-label">
                                    {item.label}
                                    {itemActive ? (
                                      <span
                                        className="ms-2"
                                        style={{
                                          fontSize: "0.68rem",
                                          fontWeight: 700,
                                          color: "var(--p1-clr)",
                                        }}
                                      >
                                        · Current
                                      </span>
                                    ) : null}
                                  </div>
                                  <div className="nav-dropdown-item-desc">{item.desc}</div>
                                </div>
                              </Link>
                            );
                          })}
                      </div>
                    </li>

                    {navItemsAfterAbout.map((item) => (
                      <li key={item.href}>
                        <NavLink
                          href={item.href}
                          label={item.label}
                          isActive={isActiveLink(item.href)}
                        />
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>

              <div className="col-auto d-flex align-items-center gap-3">
                <div className="d-flex align-items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsSearchOpen(true)}
                    className="action-btn"
                    aria-label="Search"
                  >
                    <Search size={20} color={iconInk} />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={toggleTheme}
                    className="action-btn"
                    aria-label="Toggle theme"
                  >
                    {theme === "light" ? (
                      <Moon size={20} color={iconInk} />
                    ) : (
                      <Sun size={20} color={iconInk} />
                    )}
                  </motion.button>

                  <Link
                    href="/cart"
                    className="action-btn position-relative"
                    aria-label="Cart"
                  >
                    <ShoppingCart size={20} color={iconInk} />
                    {cartReady && cartCount > 0 && (
                      <span className="cart-badge p2-bg text-white">{cartCount}</span>
                    )}
                  </Link>
                </div>

                <div className="d-none d-xxl-block ms-2">
                  <CommonButton
                    href="/shop"
                    className="first-box px-4 py-2 fs-eight fw_800 rounded-5 border-0 shadow-sm"
                  >
                    Get Meds
                  </CommonButton>
                </div>

                <button
                  className="hamburger-btn d-xl-none"
                  onClick={() => setIsMobileMenuOpen(true)}
                  aria-label="Open menu"
                >
                  <Menu size={24} color={iconInk} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <SearchPopup isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
    </>
  );
};

export default Header;
