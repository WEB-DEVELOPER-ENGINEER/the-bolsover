"use client";

import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useCMS } from "@/context/CMSContext";
import { bolsoverConfig as defaultBolsoverConfig } from "@/data/projectData";

interface FilmModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CloseMark = () => (
  <svg aria-hidden="true" viewBox="0 0 20 20" className="h-5 w-5" fill="none">
    <path d="m5 5 10 10M15 5 5 15" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

export const FilmModal: React.FC<FilmModalProps> = ({ isOpen, onClose }) => {
  const cms = useCMS();
  const config = cms?.data?.bolsoverConfig || defaultBolsoverConfig;
  const fullVideoSrc = config.film?.fullSrc || defaultBolsoverConfig.film?.fullSrc || "/assets/videos/bolsover-film.mp4";

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    previouslyFocusedRef.current = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key !== "Tab") return;

      const modal = closeButtonRef.current?.closest("[role='dialog']");
      const focusable = modal?.querySelectorAll<HTMLElement>(
        "button, video[controls], a[href], [tabindex]:not([tabindex='-1'])",
      );
      if (!focusable?.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      videoRef.current?.pause();
      previouslyFocusedRef.current?.focus();
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) videoRef.current?.play().catch(() => {});
  }, [isOpen]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="The Bolsover full film"
          initial={false}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose();
          }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#FBF5F0] p-3 sm:p-8 lg:p-12"
        >
          <div className="absolute left-5 top-5 font-sans text-xs text-[#765F4C] sm:left-8 sm:top-8">
            The Bolsover · Full film
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            className="absolute right-5 top-5 z-10 flex h-11 w-11 items-center justify-center bg-white text-[#1C1916] transition-colors hover:bg-[#BA9D81] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1C1916] sm:right-8 sm:top-8"
            aria-label="Close the full film"
          >
            <CloseMark />
          </button>

          <div className="relative aspect-video w-full max-w-[92rem] overflow-hidden bg-black">
            <video
              ref={videoRef}
              key={fullVideoSrc}
              src={fullVideoSrc}
              controls
              playsInline
              preload="metadata"
              className="h-full w-full object-contain"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
};
