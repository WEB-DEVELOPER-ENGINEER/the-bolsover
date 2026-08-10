"use client";

import React, { useEffect, useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { bolsoverConfig as defaultBolsoverConfig } from "@/data/projectData";
import { useCMS } from "@/context/CMSContext";

interface HeroSectionProps {
  onHeroReady?: () => void;
}

const DownloadIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4" fill="none">
    <path
      d="M10 3v9m0 0 3-3m-3 3L7 9M4 15.5h12"
      stroke="currentColor"
      strokeWidth="1.35"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const HeroSection: React.FC<HeroSectionProps> = ({ onHeroReady }) => {
  const cms = useCMS();
  const heroData = cms?.data?.heroData || {
    eyebrow: "Fitzrovia, London W1",
    titleLine1: "A Home That",
    titleLine2: "Brings London Closer",
    introCopy: "An exclusive collection of 24 apartments at 3-8 Bolsover Street, in the heart of Fitzrovia.",
  };
  const config = cms?.data?.bolsoverConfig || defaultBolsoverConfig;
  const heroVideoSrc = config.film?.teaserSrc || defaultBolsoverConfig.film?.teaserSrc || "/assets/videos/bolsover-teaser.mp4";
  const brochurePath = config.brochurePath || "/assets/the-bolsover-brochure.pdf";

  const containerRef = useRef<HTMLElement | null>(null);
  const teaserRef = useRef<HTMLVideoElement | null>(null);
  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });
  const videoScale = useTransform(scrollYProgress, [0, 1], [1, 1.025]);
  const videoY = useTransform(scrollYProgress, [0, 1], [0, 14]);

  useEffect(() => onHeroReady?.(), [onHeroReady]);

  return (
    <section ref={containerRef} id="hero" className="light-hero">
      <motion.div
        style={{ scale: prefersReducedMotion ? 1 : videoScale, y: prefersReducedMotion ? 0 : videoY }}
        className="light-hero-media"
      >
        <video
          ref={teaserRef}
          key={heroVideoSrc}
          poster={config.homeHeroPoster}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        >
          <source src={heroVideoSrc} type="video/mp4" />
        </video>
      </motion.div>

      <div className="light-hero-shade" />

      <div className="light-hero-panel">
        <p>{heroData.eyebrow}</p>
        <h1>
          <span>{heroData.titleLine1}</span>
          <span>{heroData.titleLine2}</span>
        </h1>
        <div className="light-hero-panel-footer">
          <p>{heroData.introCopy}</p>
          <div className="light-hero-ctas">
            <a
              href="#contact"
              onClick={(e) => {
                e.preventDefault();
                const target = document.querySelector("#contact");
                if (target) {
                  target.scrollIntoView({ behavior: "smooth" });
                  window.history.pushState(null, "", "#contact");
                }
              }}
              className="hero-cta-btn hero-cta-primary"
            >
              Register Interest
            </a>
            <a
              href={brochurePath}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="hero-cta-btn hero-cta-secondary"
            >
              Download Brochure <DownloadIcon />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

