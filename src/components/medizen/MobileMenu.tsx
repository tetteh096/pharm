"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X, ChevronRight, Phone } from "lucide-react";
import { BrandLogo } from "@/components/brand/BrandLogo";

const mobileNavItems = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/team", label: "Team" },
  { href: "/service", label: "Services" },
  { href: "/shop", label: "Shop" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
];

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();

  const isActiveLink = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="offcanvas-overlay"
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(5px)',
              zIndex: 1001
            }}
            onClick={onClose}
          ></motion.div>
          <motion.div 
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="mobile-offcanvas glass-card"
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              width: 'min(400px, 100%)',
              height: '100%',
              zIndex: 1002,
              padding: '30px',
              borderLeft: '1px solid rgba(255,255,255,0.1)'
            }}
          >
            <div className="offcanvas-content h-100 d-flex flex-column">
              <div className="d-flex justify-content-between align-items-center mb-5">
                <Link href="/" onClick={onClose}>
                  <div className="d-flex align-items-center gap-2">
                    <BrandLogo variant="full" className="h-9 w-[7rem]" />
                    <span className="fs-five fw_900 black">ENVIRO</span>
                  </div>
                </Link>
                <button 
                  onClick={onClose}
                  className="p-2 rounded-circle bg-light border-0 d-center"
                  style={{ width: '40px', height: '40px' }}
                >
                  <X size={20} className="black" />
                </button>
              </div>

              <nav className="mobile-nav mb-5">
                <ul className="list-unstyled d-flex flex-column gap-3">
                  {mobileNavItems.map((link, i) => {
                    const isActive = isActiveLink(link.href);

                    return (
                    <motion.li 
                      key={link.href}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * (i + 1) }}
                    >
                      <Link 
                        href={link.href} 
                        className="d-flex justify-content-between align-items-center py-2 fs-six fw_700 black transition-all hover-p1"
                        style={{
                          color: isActive ? "var(--p2-clr)" : undefined,
                          borderBottom: isActive ? "1px solid rgba(17, 87, 238, 0.18)" : "1px solid transparent",
                        }}
                        aria-current={isActive ? "page" : undefined}
                        onClick={onClose}
                      >
                        {link.label}
                        <ChevronRight size={16} className="opacity-50" style={{ color: isActive ? "var(--p2-clr)" : undefined }} />
                      </Link>
                    </motion.li>
                    );
                  })}
                </ul>
              </nav>

              <div className="mt-auto pt-5 border-top border-light">
                <h6 className="fw_800 black mb-4 text-uppercase letter-spacing-2">Quick Contact</h6>
                <div className="d-flex flex-column gap-3">
                  <div className="d-flex align-items-center gap-3">
                    <div className="icon p2-bg-light rounded-circle d-center" style={{ width: '40px', height: '40px', background: 'rgba(17, 87, 238, 0.12)' }}>
                      <Phone size={18} className="p2-clr" />
                    </div>
                    <div>
                      <p className="mb-0 fs-nine text-muted">Madina Branch</p>
                      <Link href="tel:+233554612072" className="black fw_700 fs-seven">055 461 2072</Link>
                    </div>
                  </div>
                  <div className="d-flex align-items-center gap-3">
                    <div className="icon p1-bg-light rounded-circle d-center" style={{ width: '40px', height: '40px', background: 'rgba(19, 236, 138, 0.12)' }}>
                      <Phone size={18} className="p1-clr" />
                    </div>
                    <div>
                      <p className="mb-0 fs-nine text-muted">Odorkor Branch</p>
                      <Link href="tel:+233599376675" className="black fw_700 fs-seven">059 937 6675</Link>
                    </div>
                  </div>
                </div>

                <div className="social-links d-flex gap-3 mt-5">
                  {[
                    "fa-brands fa-facebook-f", 
                    "fa-brands fa-twitter", 
                    "fa-brands fa-instagram", 
                    "fa-brands fa-linkedin-in"
                  ].map((iconClass, idx) => (
                    <motion.a 
                      key={idx}
                      whileHover={{ scale: 1.1, backgroundColor: 'var(--p1-clr)', color: '#fff' }}
                      href="#" 
                      className="d-center rounded-circle bg-light transition-all shadow-sm"
                      style={{ width: '40px', height: '40px', color: '#666' }}
                    >
                      <i className={iconClass}></i>
                    </motion.a>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}

      <style jsx>{`
        .hover-p1:hover {
          color: var(--p1-clr) !important;
          padding-left: 10px;
        }
        .letter-spacing-2 {
          letter-spacing: 2px;
        }
      `}</style>
    </AnimatePresence>
  );
};

export default MobileMenu;
