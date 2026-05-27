"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SearchPopup from "./SearchPopup";
import MobileMenu from "./MobileMenu";
import { useTheme } from "@/context/ThemeContext";
import { useCart } from "@/context/CartContext";
import { Moon, Sun, Search, User, Menu, ShoppingCart } from "lucide-react";
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
  { label: "About Us", href: "/about", icon: "fas fa-info-circle", desc: "Our story, mission & values" },
  { label: "Team", href: "/team", icon: "fas fa-user-md", desc: "Meet the pharmacists" },
];

const Header = () => {
  const [isSticky, setIsSticky] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAboutDropdownOpen, setIsAboutDropdownOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { count: cartCount, isHydrated: cartReady } = useCart();
  const pathname = usePathname();

  const isActiveLink = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const navInk = "#090a0b";
  const iconInk = theme === "dark" ? "#f3efe8" : navInk;

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header suppressHydrationWarning
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
              {/* Logo */}
              <div className="col-auto">
                <Link href="/" className="d-flex align-items-center gap-2" aria-label="Enviro Pharmacy home">
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

              {/* Navigation */}
              <div className="col d-none d-xl-block">
                <nav className="main-menu d-flex justify-content-center">
                  <ul className="d-flex align-items-center gap-4 list-unstyled mb-0">
                    {/* Home */}
                    <li key={homeNav.href}>
                      {(() => {
                        const isActive = isActiveLink(homeNav.href);

                        return (
                          <Link
                            href={homeNav.href}
                            className="nav-link-modern fs-seven fw_700 transition-all position-relative"
                            style={{
                              color: isActive ? "var(--p1-clr)" : navInk,
                              paddingBottom: "6px",
                            }}
                            aria-current={isActive ? "page" : undefined}
                          >
                            {homeNav.label}
                            <span
                              className="dot p1-bg"
                              style={{
                                opacity: isActive ? 1 : undefined,
                                transform: isActive ? "scale(1)" : undefined,
                              }}
                            ></span>
                          </Link>
                        );
                      })()}
                    </li>
                    {/* About Dropdown */}
                    <li
                      className="position-relative dropdown-nav"
                      onMouseEnter={() => setIsAboutDropdownOpen(true)}
                      onMouseLeave={() => setIsAboutDropdownOpen(false)}
                    >
                      <button
                        className="nav-link-modern fs-seven fw_700 transition-all position-relative bg-transparent border-0 cursor-pointer d-flex align-items-center gap-1"
                        style={{
                          color:
                            isActiveLink("/about") || isActiveLink("/team")
                              ? "var(--p1-clr)"
                              : navInk,
                          paddingBottom: "6px",
                        }}
                      >
                        About
                        <i className="fas fa-chevron-down" style={{ fontSize: "0.65rem" }} />
                      </button>
                      <motion.div
                        className="position-absolute"
                        initial={{ opacity: 0, y: -8 }}
                        animate={isAboutDropdownOpen ? { opacity: 1, y: 0 } : { opacity: 0, y: -8 }}
                        transition={{ duration: 0.18 }}
                        style={{
                          top: "calc(100% + 8px)",
                          left: 0,
                          background: "rgba(255,255,255,0.98)",
                          border: "1px solid rgba(19,236,138,0.18)",
                          borderRadius: "0.85rem",
                          padding: "0.5rem",
                          minWidth: "210px",
                          boxShadow: "0 12px 32px rgba(0,0,0,0.13)",
                          zIndex: 1050,
                          backdropFilter: "blur(10px)",
                          pointerEvents: isAboutDropdownOpen ? "auto" : "none",
                        }}
                      >
                        {aboutDropdown.map((item, i) => (
                          <Link
                            key={i}
                            href={item.href}
                            className="d-flex align-items-start gap-3 px-3 py-3 rounded-3"
                            style={{
                              textDecoration: "none",
                              transition: "background 0.18s",
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(19,236,138,0.07)"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                          >
                            <div
                              className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                              style={{
                                width: 34, height: 34,
                                background: "rgba(19,236,138,0.12)",
                                color: "var(--p1-clr)",
                                fontSize: "0.82rem",
                              }}
                            >
                              <i className={item.icon} />
                            </div>
                            <div>
                              <div className="fw_800" style={{ color: "#090a0b", fontSize: "0.88rem" }}>{item.label}</div>
                              <div style={{ color: "rgba(0,0,0,0.45)", fontSize: "0.73rem", marginTop: "1px" }}>{item.desc}</div>
                            </div>
                          </Link>
                        ))}
                      </motion.div>
                    </li>
                    {navItemsAfterAbout.map((item) => (
                      <li key={item.href}>
                        {(() => {
                          const isActive = isActiveLink(item.href);

                          return (
                            <Link
                              href={item.href}
                              className="nav-link-modern fs-seven fw_700 transition-all position-relative"
                              style={{
                                color: isActive ? "var(--p1-clr)" : navInk,
                                paddingBottom: "6px",
                              }}
                              aria-current={isActive ? "page" : undefined}
                            >
                              {item.label}
                              <span
                                className="dot p1-bg"
                                style={{
                                  opacity: isActive ? 1 : undefined,
                                  transform: isActive ? "scale(1)" : undefined,
                                }}
                              ></span>
                            </Link>
                          );
                        })()}
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>

              {/* Actions */}
              <div className="col-auto d-flex align-items-center gap-3">
                <div className="d-flex align-items-center gap-2">
                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsSearchOpen(true)}
                    className="action-btn"
                  >
                    <Search size={20} color={iconInk} />
                  </motion.button>
                  
                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={toggleTheme}
                    className="action-btn"
                  >
                    {theme === "light" ? (
                      <Moon size={20} color={iconInk} />
                    ) : (
                      <Sun size={20} color={iconInk} />
                    )}
                  </motion.button>

                  <Link href="/cart" className="action-btn position-relative" aria-label="Cart">
                    <ShoppingCart size={20} color={iconInk} />
                    {cartReady && cartCount > 0 && (
                      <span className="cart-badge p2-bg text-white">{cartCount}</span>
                    )}
                  </Link>

                  <Link href="/signin" className="action-btn d-none d-sm-flex">
                    <User size={20} color={iconInk} />
                  </Link>
                </div>

                <div className="d-none d-xxl-block ms-2">
                  <CommonButton href="/shop" className="first-box px-4 py-2 fs-eight fw_800 rounded-5 border-0 shadow-sm">
                    Get Meds
                  </CommonButton>
                </div>

                <button 
                  className="hamburger-btn d-xl-none"
                  onClick={() => setIsMobileMenuOpen(true)}
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
