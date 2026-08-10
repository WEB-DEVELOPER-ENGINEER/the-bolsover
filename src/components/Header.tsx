"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { bolsoverConfig as defaultBolsoverConfig } from "@/data/projectData";
import { useCMS } from "@/context/CMSContext";

interface HeaderProps {
  onOpenEnquire?: () => void;
  heroReady?: boolean;
}

const MenuMark = ({ close = false }: { close?: boolean }) => (
  <span aria-hidden="true" className={`menu-mark ${close ? "is-close" : ""}`}>
    <span />
    <span />
  </span>
);

const DownloadMark = () => (
  <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4" fill="none">
    <path d="M10 3v9m0 0 3-3m-3 3L7 9M4 15.5h12" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const Header: React.FC<HeaderProps> = ({ onOpenEnquire }) => {
  const cms = useCMS();
  const config = cms?.data?.bolsoverConfig || defaultBolsoverConfig;
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const navLinks = [
    { label: "Building", href: "/#architecture" },
    { label: "Apartments", href: "/apartments" },
    { label: "Floor plans", href: "/floor-plans" },
    { label: "Location", href: "/location" },
    { label: "Enquire", href: "/#contact" },
  ];

  const handleNavClick = (event: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    setMenuOpen(false);

    if (pathname === href) {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (href.startsWith("/#")) {
      event.preventDefault();
      const hash = href.replace("/#", "#");
      if (pathname === "/") {
        const target = document.querySelector(hash);
        if (target) {
          target.scrollIntoView({ behavior: "smooth" });
          window.history.pushState(null, "", hash);
        }
      } else {
        router.push(`/${hash}`);
      }
      return;
    }

    event.preventDefault();
    router.push(href);
  };

  const handleLogoClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    setMenuOpen(false);
    event.preventDefault();
    if (pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      router.push("/");
    }
  };

  return (
    <>
      <header className="site-header">
        <Link href="/" onClick={handleLogoClick} className="site-logo" aria-label="The Bolsover home">
          <img src="/assets/logos/bolsover-logo-new.svg" alt="The Bolsover" decoding="async" />
        </Link>

        <nav className="site-nav" aria-label="Primary navigation">
          {navLinks.map((link) => (
            <Link key={link.label} href={link.href} onClick={(event) => handleNavClick(event, link.href)}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="site-header-actions">
          <Link
            href="/#contact"
            onClick={(event) => {
              handleNavClick(event, "/#contact");
              onOpenEnquire?.();
            }}
            className="site-register-link"
          >
            Register interest
          </Link>
          <button
            type="button"
            className="site-menu-button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={menuOpen}
          >
            <MenuMark close={menuOpen} />
          </button>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ y: "-100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-100%" }}
            transition={{ duration: 0.45, ease: [0.2, 0.75, 0.25, 1] }}
            className="site-menu-panel"
          >
            <nav aria-label="Mobile navigation">
              {navLinks.map((link, index) => (
                <Link key={link.label} href={link.href} onClick={(event) => handleNavClick(event, link.href)}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="site-menu-footer">
              <p>3-8 Bolsover Street, Fitzrovia, London W1</p>
              <a href={config.brochurePath} target="_blank" rel="noreferrer">
                Download brochure <DownloadMark />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
