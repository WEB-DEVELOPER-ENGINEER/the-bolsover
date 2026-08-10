"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { FilmSection } from "@/components/FilmSection";
import {
  ApartmentsTeaserSection,
  ArchitectureSection,
} from "@/components/EditorialSections";
import { LocationSection } from "@/components/LocationSection";
import { FooterSection } from "@/components/FooterSection";
import { CMSProvider } from "@/context/CMSContext";

function MainSiteContent() {
  const [heroReady, setHeroReady] = useState(false);
  const handleHeroReady = useCallback(() => setHeroReady(true), []);

  useEffect(() => {
    const scrollToHash = () => {
      if (!window.location.hash) return;
      window.setTimeout(() => {
        document.querySelector(window.location.hash)?.scrollIntoView({ behavior: "smooth" });
      }, 220);
    };

    scrollToHash();
    window.addEventListener("hashchange", scrollToHash);
    return () => window.removeEventListener("hashchange", scrollToHash);
  }, [heroReady]);

  return (
    <div className="bolsover-light min-h-screen">
      <main>
        <HeroSection onHeroReady={handleHeroReady} />
        <FilmSection />
        <LocationSection />
      </main>
      <FooterSection />
    </div>
  );
}

export default function Home() {
  return <MainSiteContent />;
}
