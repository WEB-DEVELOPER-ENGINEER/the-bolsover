"use client";

import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export const LocationSection = () => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const mapScale = useTransform(scrollYProgress, [0, 0.5, 1], [1.045, 1, 1.02]);
  const mapY = useTransform(scrollYProgress, [0, 1], [16, -12]);

  return (
    <section ref={sectionRef} id="location" className="location-teaser-light" aria-labelledby="location-teaser-title">
      <motion.img
        src="/maps/bolsover-atlist-base.svg"
        alt="Vector map of Fitzrovia and central London around The Bolsover"
        style={{ scale: prefersReducedMotion ? 1 : mapScale, y: prefersReducedMotion ? 0 : mapY }}
      />
      <div className="location-teaser-light-shade" />

      <div className="location-teaser-light-copy">
        <p>Fitzrovia, London W1</p>
        <h2 id="location-teaser-title">London, within easy reach.</h2>
        <div>
          <p>Regent&apos;s Park, Marylebone and the West End sit around a quieter address in the heart of Fitzrovia.</p>
          <Link href="/location" className="editorial-link">
            Explore the neighbourhood <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>
    </section>
  );
};
