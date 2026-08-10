"use client";

import React from "react";
import { MessageSquare, Download, Phone, Mail } from "lucide-react";
import { bolsoverConfig as defaultBolsoverConfig } from "@/data/projectData";
import { useCMS } from "@/context/CMSContext";

export const FloatingActionRail: React.FC = () => {
  const cms = useCMS();
  const bolsoverConfig = cms?.data?.bolsoverConfig || defaultBolsoverConfig;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(bolsoverConfig.whatsappMessage)}`;

  return (
    <>
      {/* Desktop floating glass action rail */}
      <aside className="fixed right-4 top-1/2 z-40 hidden -translate-y-1/2 flex-col border border-[rgba(255,255,255,0.14)] bg-[rgba(0,0,0,0.28)] text-white backdrop-blur-xl backdrop-saturate-150 [box-shadow:inset_0_1px_0_rgba(255,255,255,0.12),0_6px_18px_rgba(0,0,0,0.16)] lg:flex">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noreferrer"
          className="group relative flex h-12 w-12 items-center justify-center border-b border-white/10 text-[rgba(255,255,255,0.82)] transition-colors duration-300 hover:bg-white/10 hover:text-luxury-brass focus-visible:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
          title="Chat with us on WhatsApp"
        >
          <MessageSquare className="w-5 h-5" />
          <span className="pointer-events-none absolute right-14 whitespace-nowrap bg-[rgba(0,0,0,0.68)] px-3 py-1.5 text-[10px] text-white opacity-0 backdrop-blur-lg transition-opacity group-hover:opacity-100">
            WhatsApp
          </span>
        </a>

        <a
          href={bolsoverConfig.brochurePath}
          target="_blank"
          rel="noreferrer"
          className="group relative flex h-12 w-12 items-center justify-center border-b border-white/10 text-[rgba(255,255,255,0.82)] transition-colors duration-300 hover:bg-white/10 hover:text-luxury-brass focus-visible:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
          title="Download the project brochure"
        >
          <Download className="w-5 h-5" />
          <span className="pointer-events-none absolute right-14 whitespace-nowrap bg-[rgba(0,0,0,0.68)] px-3 py-1.5 text-[10px] text-white opacity-0 backdrop-blur-lg transition-opacity group-hover:opacity-100">
            Brochure
          </span>
        </a>

        <a
          href="tel:+442079460000"
          className="group relative flex h-12 w-12 items-center justify-center border-b border-white/10 text-[rgba(255,255,255,0.82)] transition-colors duration-300 hover:bg-white/10 hover:text-luxury-brass focus-visible:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
          title="Call the sales team"
        >
          <Phone className="w-5 h-5" />
          <span className="pointer-events-none absolute right-14 whitespace-nowrap bg-[rgba(0,0,0,0.68)] px-3 py-1.5 text-[10px] text-white opacity-0 backdrop-blur-lg transition-opacity group-hover:opacity-100">
            Call Us
          </span>
        </a>

        <a
          href="/#contact"
          className="group relative flex h-12 w-12 items-center justify-center text-[rgba(255,255,255,0.82)] transition-colors duration-300 hover:bg-white/10 hover:text-luxury-brass focus-visible:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
          title="Send us a message"
        >
          <Mail className="w-5 h-5" />
          <span className="pointer-events-none absolute right-14 whitespace-nowrap bg-[rgba(0,0,0,0.68)] px-3 py-1.5 text-[10px] text-white opacity-0 backdrop-blur-lg transition-opacity group-hover:opacity-100">
            Get in Touch
          </span>
        </a>
      </aside>
    </>
  );
};
