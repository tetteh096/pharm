"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SearchPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const SearchPopup: React.FC<SearchPopupProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="search-wrap"
          style={{ display: "block" }}
        >
          <div className="search-inner">
            <button
              type="button"
              className="fas fa-times search-close border-0 bg-transparent"
              id="search-close"
              aria-label="Close search"
              onClick={onClose}
            />
            <div className="search-cell">
              <form method="get" action="/shop">
                <div className="search-field-holder">
                  <input
                    type="search"
                    name="q"
                    className="main-search-input"
                    placeholder="Search products…"
                    autoFocus
                    autoComplete="off"
                    aria-label="Search products"
                  />
                </div>
              </form>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SearchPopup;
