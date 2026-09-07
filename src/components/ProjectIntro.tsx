"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useCMS } from "@/context/CMSContext";

export const ProjectIntro: React.FC = () => {
  const cms = useCMS();
  const intro = cms?.data?.introData || {
    eyebrow: "The Bolsover",
    titleLine1: "A quietly confident",
    titleLine2: "London address.",
    description: "A limited collection of 24 studio to four-bedroom apartments, combining Edwardian character with contemporary comfort in Fitzrovia, London W1.",
    stat1Value: "24",
    stat1Label: "Private apartments",
    stat2Value: "Studio – 4",
    stat2Label: "Bedrooms & duplex",
    stat3Value: "W1",
    stat3Label: "Fitzrovia, London",
    image: "https://jaiybxlzrdnofevtlwrg.supabase.co/storage/v1/object/public/bolsover-media/apartments-cgi/the-bolsover-concierge-lobby.png"
  };
  const sectionRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], [32, -32]);

  const displayImage = intro.image && !intro.image.includes("/assets/images/building.png")
    ? intro.image
    : "https://jaiybxlzrdnofevtlwrg.supabase.co/storage/v1/object/public/bolsover-media/apartments-cgi/the-bolsover-concierge-lobby.png";

  return (
    <section ref={sectionRef} id="building" className="relative min-h-[100svh] overflow-hidden bg-luxury-black text-white">
      <motion.div
        style={{ y: imageY }}
        className="absolute -inset-x-0 -top-8 -bottom-8 h-[calc(100%+64px)] w-full motion-reduce:transform-none"
      >
        <Image
          src={displayImage}
          alt="The Bolsover entrance on Bolsover Street"
          fill
          loading="lazy"
          sizes="100vw"
          quality={90}
          className="object-cover object-center"
        />
      </motion.div>
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,8,8,0.88)_0%,rgba(8,8,8,0.62)_42%,rgba(8,8,8,0.16)_78%,rgba(8,8,8,0.18)_100%)]" />

      <div className="relative z-10 flex min-h-[100svh] items-end px-6 py-12 sm:px-10 sm:py-14 lg:px-16 lg:py-16">
        <div className="max-w-3xl">
          <p className="mb-6 text-sm tracking-[0.12em] text-luxury-brass">{intro.eyebrow}</p>
          <h2 className="font-serif text-[clamp(3.2rem,6.3vw,7.5rem)] leading-[0.9] tracking-[-0.045em] text-white">
            {intro.titleLine1}
            <span className="block italic text-white/88">{intro.titleLine2}</span>
          </h2>
          <p className="mt-7 max-w-xl font-sans text-base leading-relaxed text-white/85 sm:text-lg">
            {intro.description}
          </p>
          <p className="mt-8 max-w-2xl font-sans text-sm leading-relaxed text-luxury-brass/90 sm:text-base">
            {intro.stat1Value} {intro.stat1Label} · {intro.stat2Value} {intro.stat2Label} · {intro.stat3Value} {intro.stat3Label}
          </p>
        </div>
      </div>
    </section>
  );
};
