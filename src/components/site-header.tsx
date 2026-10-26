"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Menu, Search, ShoppingBag, UserRound, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/components/cart-provider";

const navItems = ["Women", "Men", "Shoes", "Kids", "Discover"];

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const { count } = useCart();

  const navLink = (label: string) => {
    const handle = label === "Discover" ? "about" : label.toLowerCase();
    return (
      <Link
        aria-haspopup={label === "Discover" ? undefined : "true"}
        aria-expanded={label === "Discover" ? undefined : activeMenu === label}
        className="nav-link"
        href={label === "Discover" ? "/about" : `/collections/${handle}`}
        onClick={() => {
          setMobileOpen(false);
          setActiveMenu(null);
        }}
        onFocus={() => setActiveMenu(label)}
        onMouseEnter={() => setActiveMenu(label)}
      >
        {label}
      </Link>
    );
  };

  return (
    <>
      <div className="announcement">
        <p>Design preview · Sample products · No checkout</p>
        <Link href="/collections/new-arrivals">Discover the new collection <ArrowRight size={12} /></Link>
      </div>
      <header className="site-header" onMouseLeave={() => setActiveMenu(null)}>
        <div className="header-inner">
          <button
            aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={mobileOpen}
            className="icon-button mobile-menu-toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <nav aria-label="Main navigation" className="desktop-nav">
            {navItems.map((label) => <span key={label}>{navLink(label)}</span>)}
          </nav>
          <Link aria-label="Avenoir home" className="wordmark" href="/">AVENOIR</Link>
          <div className="header-actions">
            <button
              aria-label="Search"
              aria-expanded={searchOpen}
              className="icon-button"
              onClick={() => setSearchOpen(!searchOpen)}
            >
              {searchOpen ? <X size={18} /> : <Search size={18} />}
            </button>
            <Link aria-label="Account" className="icon-button desktop-account" href="/account"><UserRound size={18} /></Link>
            <Link aria-label={`Shopping bag, ${count} items`} className="bag-link" href="/cart">
              <ShoppingBag size={18} />
              <span>Bag <span className="bag-count">({count})</span></span>
            </Link>
          </div>
        </div>
        <AnimatePresence>
          {activeMenu && !mobileOpen && activeMenu !== "Discover" && (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="mega-menu"
              id={`mega-${activeMenu.toLowerCase()}`}
              exit={{ opacity: 0, y: -8 }}
              initial={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <div>
                <span className="eyebrow">Explore {activeMenu}</span>
                <Link href={`/collections/${activeMenu.toLowerCase()}`}>View all {activeMenu.toLowerCase()} <ArrowRight size={14} /></Link>
              </div>
              <p>Thoughtful forms for wherever the day takes you.</p>
              <Link className="menu-feature" href="/collections/new-arrivals">New arrivals <ArrowRight size={14} /></Link>
            </motion.div>
          )}
          {searchOpen && (
            <motion.form
              action="/search"
              animate={{ opacity: 1, y: 0 }}
              className="search-panel"
              exit={{ opacity: 0, y: -8 }}
              initial={{ opacity: 0, y: -8 }}
              role="search"
            >
              <label className="sr-only" htmlFor="site-search">Search the collection</label>
              <Search size={18} />
              <input autoFocus id="site-search" name="q" placeholder="What are you looking for?" />
              <button type="submit">Search <ArrowRight size={14} /></button>
            </motion.form>
          )}
        </AnimatePresence>
      </header>
      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            animate={{ opacity: 1, height: "auto" }}
            aria-label="Mobile navigation"
            className="mobile-nav"
            exit={{ opacity: 0, height: 0 }}
            id="mobile-navigation"
            initial={{ opacity: 0, height: 0 }}
          >
            {navItems.map((label) => <span key={label}>{navLink(label)}</span>)}
            <Link className="mobile-account" href="/account">Account <ArrowRight size={14} /></Link>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
}
