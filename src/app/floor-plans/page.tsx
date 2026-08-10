"use client";

import React from "react";
import { Header } from "@/components/Header";
import { FooterSection } from "@/components/FooterSection";
import { FloorPlansAscent } from "@/components/FloorPlansAscent";
import { CMSProvider } from "@/context/CMSContext";

function FloorPlansMainContent() {
  return (
    <div className="bolsover-light min-h-screen">
      <main className="pt-[4.75rem] lg:pt-[4.9rem]">
        <FloorPlansAscent />
      </main>
      <FooterSection />
    </div>
  );
}

export default function FloorPlansPage() {
  return <FloorPlansMainContent />;
}

