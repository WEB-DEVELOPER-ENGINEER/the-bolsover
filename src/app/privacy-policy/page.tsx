"use client";

import React from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { FooterSection } from "@/components/FooterSection";
import { CMSProvider, PrivacySection, useCMS } from "@/context/CMSContext";

const formatInline = (value: string) => value
  .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
  .replace(/\*(.*?)\*/g, "<em>$1</em>")
  .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');

function RichContent({ content }: { content: string }) {
  const lines = content.split("\n").filter((line) => line.trim());

  return (
    <div className="legal-copy">
      {lines.map((line, index) => {
        const trimmed = line.trim();
        if (trimmed.startsWith("### ")) return <h4 key={index}>{trimmed.slice(4)}</h4>;
        if (trimmed.startsWith("## ")) return <h3 key={index}>{trimmed.slice(3)}</h3>;
        if (/^[-*]\s+/.test(trimmed)) {
          return <p key={index} className="legal-list-item" dangerouslySetInnerHTML={{ __html: formatInline(trimmed.replace(/^[-*]\s+/, "")) }} />;
        }
        return <p key={index} dangerouslySetInnerHTML={{ __html: formatInline(trimmed) }} />;
      })}
    </div>
  );
}

function PrivacyPolicyPageContent() {
  const cms = useCMS();
  const policy = cms?.data?.privacyPolicy;
  const sections: PrivacySection[] = policy?.sections || [];

  return (
    <div className="legal-page">
      <main className="pt-[4.75rem] lg:pt-[4.9rem]">
        <header className="legal-hero">
          <Link href="/">Return home</Link>
          <p>Effective {policy?.effectiveDate || "29 July 2026"}</p>
          <h1>{policy?.title || "Privacy policy"}</h1>
        </header>

        <div className="legal-layout">
          <aside>
            <p>Contents</p>
            <nav>
              {sections.map((section, index) => (
                <a key={section.id} href={`#${section.id}`}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  {section.title}
                </a>
              ))}
            </nav>
          </aside>

          <div className="legal-sections">
            {sections.length === 0 ? (
              <p>No privacy policy sections have been published yet.</p>
            ) : (
              sections.map((section, index) => (
                <article key={section.id} id={section.id}>
                  <p>{String(index + 1).padStart(2, "0")}</p>
                  <h2>{section.title}</h2>
                  <RichContent content={section.content} />
                </article>
              ))
            )}
          </div>
        </div>
      </main>
      <FooterSection />
    </div>
  );
}

export default function PrivacyPolicyPage() {
  return <PrivacyPolicyPageContent />;
}
