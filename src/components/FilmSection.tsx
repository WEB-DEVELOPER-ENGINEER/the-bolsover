"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { useCMS } from "@/context/CMSContext";
import { bolsoverConfig as defaultBolsoverConfig } from "@/data/projectData";

const quoteLines = ["One address.", "Many ways to live London."];

const ArrowOut = () => (
  <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4" fill="none">
    <path d="M5 15 15 5M7 5h8v8" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const FilmSection: React.FC = () => {
  const cms = useCMS();
  const config = cms?.data?.bolsoverConfig || defaultBolsoverConfig;

  const quoteRef = useRef<HTMLDivElement | null>(null);
  const storyRef = useRef<HTMLDivElement | null>(null);
  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress: quoteProgress } = useScroll({
    target: quoteRef,
    offset: ["start end", "end start"],
  });

  const { scrollYProgress: rawStoryProgress } = useScroll({
    target: storyRef,
    offset: ["start start", "end end"],
  });

  // Smooth physics interpolation for natural, fluid scroll-driven animation
  const storyProgress = useSpring(rawStoryProgress, {
    stiffness: 90,
    damping: 28,
    restDelta: 0.0001,
  });

  const textRevealClip = useTransform(
    quoteProgress,
    [0.06, 0.68],
    ["inset(0 100% 0 0)", "inset(0 0% 0 0)"],
  );

  const architectureImg = (config as any).architectureImage || "/assets/images/building.png";
  const filmMainImg = config.filmMainImage || "/assets/images/lifestyle-stills/evening.png";
  const apartmentsTeaserImg = (config as any).apartmentsTeaserImage || "/apartments/apartment-living-kitchen.png";

  // --- TRANSFORMS FOR CARD 1 (LEFT / ARCHITECTURE) ---
  const leftClip = useTransform(
    storyProgress,
    [0.0, 0.32],
    ["inset(18% 70% 48% 8%)", "inset(0% 0% 0% 0%)"]
  );
  const leftRotate = useTransform(storyProgress, [0.0, 0.32], [-2, 0]);
  const leftScale = useTransform(storyProgress, [0.0, 0.32], [1.08, 1]);
  const leftShade = useTransform(storyProgress, [0.0, 0.32], [0.18, 0.45]);
  const leftTextOpacity = useTransform(storyProgress, [0.08, 0.22, 0.28, 0.34], [0, 1, 1, 0]);
  const leftTextY = useTransform(storyProgress, [0.08, 0.22], [20, 0]);
  // Card 1 slides UP smoothly with soft cubic curve while Card 2 expands underneath
  const leftY = useTransform(
    storyProgress,
    [0.30, 0.34, 0.40, 0.44],
    ["0%", "-15%", "-70%", "-100%"]
  );

  // --- TRANSFORMS FOR CARD 2 (CENTER / FILM MAIN) ---
  // Card 2 starts expanding EARLY (at 0.26) so as Card 1 slides up, Card 2 is already scaling up naturally underneath
  const buildingClip = useTransform(
    storyProgress,
    [0.0, 0.26, 0.62],
    ["inset(12% 24% 12% 24%)", "inset(12% 24% 12% 24%)", "inset(0% 0% 0% 0%)"]
  );
  const buildingScale = useTransform(storyProgress, [0.26, 0.62], [1.08, 1]);
  const imageShade = useTransform(storyProgress, [0.26, 0.62], [0.18, 0.45]);
  const centerTextOpacity = useTransform(storyProgress, [0.38, 0.50, 0.58, 0.64], [0, 1, 1, 0]);
  const centerTextY = useTransform(storyProgress, [0.38, 0.50], [20, 0]);
  // Card 2 slides UP smoothly with soft cubic curve while Card 3 expands underneath
  const buildingY = useTransform(
    storyProgress,
    [0.60, 0.64, 0.70, 0.74],
    ["0%", "-15%", "-70%", "-100%"]
  );

  // --- TRANSFORMS FOR CARD 3 (RIGHT / APARTMENTS TEASER) ---
  // Card 3 starts expanding EARLY (at 0.56) so as Card 2 slides up, Card 3 is already scaling up naturally underneath
  const rightClip = useTransform(
    storyProgress,
    [0.0, 0.56, 0.92],
    ["inset(56% 8% 14% 72%)", "inset(56% 8% 14% 72%)", "inset(0% 0% 0% 0%)"]
  );
  const rightRotate = useTransform(storyProgress, [0.0, 0.56, 0.92], [2, 2, 0]);
  const rightScale = useTransform(storyProgress, [0.56, 0.92], [1.08, 1]);
  const rightShade = useTransform(storyProgress, [0.56, 0.92], [0.18, 0.45]);
  const rightTextOpacity = useTransform(storyProgress, [0.68, 0.82], [0, 1]);
  const rightTextY = useTransform(storyProgress, [0.68, 0.82], [20, 0]);

  return (
    <section id="film" className="film-light">
      {/* Quote Section Header */}
      <div ref={quoteRef} className="film-light-quote">
        <div className="mx-auto w-full max-w-4xl text-center">
          <p className="film-light-label">
            Life at The Bolsover
          </p>

          <h2 className="film-light-title">
            {quoteLines.map((line, index) => (
              <span
                key={line}
                className={`relative block ${index === 1 ? "mt-2 italic" : ""}`}
              >
                <span>{line}</span>
                <motion.span
                  aria-hidden="true"
                  style={{ clipPath: prefersReducedMotion ? "inset(0)" : textRevealClip }}
                  className="film-light-title-fill absolute inset-0"
                >
                  {line}
                </motion.span>
              </span>
            ))}
          </h2>

          <p className="film-light-copy">
            From study and family time to the park, the West End and a quiet evening at home, the film follows everyday life around The Bolsover.
          </p>
        </div>
      </div>

      {/* Sticky Scroll Story Container */}
      <div ref={storyRef} className="relative h-[400svh] bg-[#FBF5F0] sm:h-[450svh]">
        <div className="sticky top-0 h-[100svh] overflow-hidden bg-[#FBF5F0]">

          {/* CARD 1: LEFT CARD (Architecture) */}
          <motion.figure
            style={{
              clipPath: prefersReducedMotion ? "inset(0%)" : leftClip,
              rotate: prefersReducedMotion ? 0 : leftRotate,
              y: prefersReducedMotion ? "0%" : leftY,
            }}
            className="absolute inset-0 z-30 overflow-hidden bg-[#15110d]"
          >
            <motion.div
              style={{ scale: prefersReducedMotion ? 1 : leftScale }}
              className="absolute inset-0"
            >
              <Image
                src={architectureImg}
                alt="The Bolsover Edwardian Architecture"
                fill
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 60vw"
                className="object-cover object-center"
              />
            </motion.div>
            <motion.div
              style={{ opacity: prefersReducedMotion ? 0.42 : leftShade }}
              className="absolute inset-0 bg-black"
            />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.1)_0%,rgba(0,0,0,0.72)_100%)]" />

            <motion.div
              style={{
                opacity: prefersReducedMotion ? 1 : leftTextOpacity,
                y: prefersReducedMotion ? 0 : leftTextY,
              }}
              className="absolute bottom-[12svh] left-[6vw] right-[6vw] sm:bottom-[14svh] sm:left-[8vw] z-40 max-w-[90vw] sm:max-w-[48vw] md:max-w-[44vw] text-white"
            >
              <p className="font-sans text-xs uppercase tracking-widest text-[#c5a059] mb-3">
                3–8 Bolsover Street
              </p>
              <h3 className="font-serif text-[clamp(2.2rem,4.2vw,4.8rem)] leading-[0.96] tracking-[-0.035em]">
                Edwardian character, considered for contemporary life.
              </h3>
              <p className="mt-4 font-sans text-sm sm:text-base leading-relaxed text-white/82 max-w-[32rem]">
                Edwardian character, composed for contemporary life in the heart of Fitzrovia, London W1.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-6 border-t border-white/20 pt-4 text-xs font-mono text-white/85">
                <div>
                  <span className="font-serif text-lg text-white font-normal mr-2">24</span>
                  <span>Private Apartments</span>
                </div>
                <span className="text-white/30">•</span>
                <div>
                  <span className="font-serif text-lg text-white font-normal mr-2">W1</span>
                  <span>Fitzrovia, London</span>
                </div>
              </div>
            </motion.div>
          </motion.figure>

          {/* CARD 2: CENTER CARD (Film Main) */}
          <motion.figure
            style={{
              clipPath: prefersReducedMotion ? "inset(0%)" : buildingClip,
              y: prefersReducedMotion ? "0%" : buildingY,
            }}
            className="absolute inset-0 z-20 overflow-hidden bg-[#15110d]"
          >
            <motion.div
              style={{ scale: prefersReducedMotion ? 1 : buildingScale }}
              className="absolute inset-0"
            >
              <Image
                src={filmMainImg}
                alt="The Bolsover exterior on Bolsover Street"
                fill
                loading="lazy"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 60vw"
                className="object-cover object-center"
              />
            </motion.div>
            <motion.div
              style={{ opacity: prefersReducedMotion ? 0.42 : imageShade }}
              className="absolute inset-0 bg-black"
            />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.1)_0%,rgba(0,0,0,0.72)_100%)]" />

            <motion.div
              style={{
                opacity: prefersReducedMotion ? 1 : centerTextOpacity,
                y: prefersReducedMotion ? 0 : centerTextY,
              }}
              className="absolute bottom-[12svh] left-[6vw] right-[6vw] sm:bottom-[14svh] sm:left-[8vw] z-40 max-w-[90vw] sm:max-w-[48vw] md:max-w-[44vw] text-white"
            >
              <p className="font-sans text-xs uppercase tracking-widest text-[#c5a059] mb-3">
                Life at The Bolsover
              </p>
              <h3 className="font-serif text-[clamp(2.2rem,4.2vw,4.8rem)] leading-[0.96] tracking-[-0.035em]">
                A quietly confident London address.
              </h3>
              <p className="mt-4 font-sans text-sm sm:text-base leading-relaxed text-white/82 max-w-[32rem]">
                From study and family time to the park, the West End and a quiet evening at home, the film follows everyday life around The Bolsover.
              </p>
              <p className="mt-5 font-sans text-xs uppercase tracking-wider text-white/70">
                3–8 Bolsover Street, Fitzrovia W1
              </p>
            </motion.div>
          </motion.figure>

          {/* CARD 3: RIGHT CARD (Apartments Teaser) */}
          <motion.figure
            style={{
              clipPath: prefersReducedMotion ? "inset(0%)" : rightClip,
              rotate: prefersReducedMotion ? 0 : rightRotate,
            }}
            className="absolute inset-0 z-10 overflow-hidden bg-[#15110d]"
          >
            <motion.div
              style={{ scale: prefersReducedMotion ? 1 : rightScale }}
              className="absolute inset-0"
            >
              <Image
                src={apartmentsTeaserImg}
                alt="Open-plan living room and kitchen at The Bolsover"
                fill
                loading="lazy"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 60vw"
                className="object-cover object-center"
              />
            </motion.div>
            <motion.div
              style={{ opacity: prefersReducedMotion ? 0.42 : rightShade }}
              className="absolute inset-0 bg-black"
            />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.1)_0%,rgba(0,0,0,0.72)_100%)]" />

            <motion.div
              style={{
                opacity: prefersReducedMotion ? 1 : rightTextOpacity,
                y: prefersReducedMotion ? 0 : rightTextY,
              }}
              className="absolute bottom-[12svh] left-[6vw] right-[6vw] sm:bottom-[14svh] sm:left-[8vw] z-40 max-w-[90vw] sm:max-w-[48vw] md:max-w-[44vw] text-white"
            >
              <p className="font-sans text-xs uppercase tracking-widest text-[#c5a059] mb-3">
                Inside The Bolsover
              </p>
              <h3 className="font-serif text-[clamp(2.2rem,4.2vw,4.8rem)] leading-[0.96] tracking-[-0.035em]">
                Homes for everyday London life.
              </h3>
              <p className="mt-4 font-sans text-sm sm:text-base leading-relaxed text-white/82 max-w-[32rem]">
                Explore the residence directory and move through the first interior at your own pace. Apartment details will be added as they are confirmed.
              </p>
              <div className="mt-6">
                <Link
                  href="/apartments"
                  className="inline-flex items-center gap-2 font-sans text-xs uppercase tracking-wider text-[#c5a059] hover:text-white transition-colors"
                >
                  <span>Explore the apartments</span>
                  <ArrowOut />
                </Link>
              </div>
            </motion.div>
          </motion.figure>

        </div>
      </div>
    </section>
  );
};
