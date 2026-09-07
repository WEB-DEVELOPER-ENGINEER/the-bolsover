"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Header } from "@/components/Header";
import Image from "next/image";
import { FooterSection } from "@/components/FooterSection";
import { CMSProvider, useCMS, ApartmentRecord, ApartmentSlide } from "@/context/CMSContext";

const SCRUB_EDGE_BUFFER = 0.12;
const SCRUB_STEP_SECONDS = 0.1;

const NextArrow = () => (
  <svg aria-hidden="true" viewBox="0 0 32 18" className="h-[18px] w-8" fill="none">
    <path
      d="M1 9h28M22 2l7 7-7 7"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

function AccordionMark({ open }: { open: boolean }) {
  return (
    <span
      className={`apartment-accordion-icon inline-flex h-4 w-4 items-center justify-center text-xs transition-transform duration-300 ${
        open ? "rotate-45" : ""
      }`}
      aria-hidden="true"
    >
      +
    </span>
  );
}

function ApartmentsPageContent() {
  const prefersReducedMotion = useReducedMotion();
  const { apartments: liveApartments } = useCMS();
  const [selectedApartmentNumber, setSelectedApartmentNumber] = useState(9);
  const [expandedApartmentNumber, setExpandedApartmentNumber] = useState<number | null>(9);
  const [activeSlide, setActiveSlide] = useState(0);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [cursorVisible, setCursorVisible] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const directoryRef = useRef<HTMLElement | null>(null);
  const scrubFrameRef = useRef<number | null>(null);
  const pendingProgressRef = useRef(0);

  const apartmentsList = useMemo(() => {
    return liveApartments || [];
  }, [liveApartments]);

  const selectedApartment = useMemo(() => {
    if (!apartmentsList || apartmentsList.length === 0) return null;
    const found = apartmentsList.find((apartment) => apartment.number === selectedApartmentNumber);
    return found ?? apartmentsList[0] ?? null;
  }, [apartmentsList, selectedApartmentNumber]);

  // Extract specs & slides (supporting both direct schema & legacy details property)
  const residenceType = selectedApartment?.residenceType || selectedApartment?.details?.residenceType || "—";
  const area = selectedApartment?.area || selectedApartment?.details?.area || "—";
  const floor = selectedApartment?.floor || selectedApartment?.details?.floor || "—";
  const description = selectedApartment?.description || selectedApartment?.details?.description || "";
  const slides: ApartmentSlide[] = selectedApartment?.slides || selectedApartment?.details?.slides || [];

  const slide = slides[activeSlide] ?? null;
  const isInteractiveVideo = slide?.kind === "video";

  useEffect(() => {
    if (!isInteractiveVideo) {
      videoRef.current?.pause();
      setIsScrubbing(false);
      setCursorVisible(false);
    }
  }, [isInteractiveVideo]);

  useEffect(() => {
    return () => {
      if (scrubFrameRef.current !== null) cancelAnimationFrame(scrubFrameRef.current);
    };
  }, []);

  useEffect(() => {
    const directory = directoryRef.current;
    if (!directory || window.matchMedia("(max-width: 1023px)").matches) return;

    const trigger = directory.querySelector<HTMLElement>(
      `[data-apartment-number="${selectedApartmentNumber}"]`,
    );
    if (!trigger) return;

    const directoryBounds = directory.getBoundingClientRect();
    const triggerBounds = trigger.getBoundingClientRect();
    const triggerTop = triggerBounds.top - directoryBounds.top + directory.scrollTop;
    const nextScrollTop = triggerTop - directory.clientHeight / 2 + triggerBounds.height / 2;

    directory.scrollTo({
      top: Math.max(0, nextScrollTop),
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  }, [prefersReducedMotion, selectedApartmentNumber]);

  const selectApartment = useCallback((number: number) => {
    setSelectedApartmentNumber(number);
    setExpandedApartmentNumber((current) => (current === number ? null : number));
    setActiveSlide(0);
    setVideoProgress(0);
  }, []);

  const selectSlide = useCallback((index: number) => {
    setActiveSlide(index);
    setVideoProgress(0);
  }, []);

  const showNextSlide = useCallback(() => {
    if (slides.length < 2) return;
    setActiveSlide((current) => (current + 1) % slides.length);
    setVideoProgress(0);
  }, [slides.length]);

  const applyPendingScrub = useCallback(() => {
    scrubFrameRef.current = null;
    const video = videoRef.current;
    if (!video || !Number.isFinite(video.duration) || video.duration <= 0) return;

    const targetTime = pendingProgressRef.current * video.duration;
    const quantizedTime = Math.min(
      video.duration,
      Math.max(0, Math.round(targetTime / SCRUB_STEP_SECONDS) * SCRUB_STEP_SECONDS),
    );
    const seekableVideo = video as HTMLVideoElement & { fastSeek?: (time: number) => void };

    if (typeof seekableVideo.fastSeek === "function") {
      seekableVideo.fastSeek(quantizedTime);
    } else if (Math.abs(video.currentTime - quantizedTime) > 0.02) {
      video.currentTime = quantizedTime;
    }

    setVideoProgress(quantizedTime / video.duration);
  }, []);

  const queueScrub = useCallback(
    (clientX: number, surface: HTMLElement) => {
      const video = videoRef.current;
      if (!video || !Number.isFinite(video.duration) || video.duration <= 0) return;

      const bounds = surface.getBoundingClientRect();
      const rawProgress = (clientX - bounds.left) / bounds.width;
      const acceleratedProgress =
        (rawProgress - SCRUB_EDGE_BUFFER) / (1 - SCRUB_EDGE_BUFFER * 2);
      pendingProgressRef.current = Math.min(1, Math.max(0, acceleratedProgress));

      if (scrubFrameRef.current === null) {
        scrubFrameRef.current = requestAnimationFrame(applyPendingScrub);
      }
    },
    [applyPendingScrub],
  );

  const moveCursor = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse" || !cursorRef.current) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    cursorRef.current.style.transform = `translate3d(${event.clientX - bounds.left}px, ${
      event.clientY - bounds.top
    }px, 0) translate(-50%, -50%)`;
  }, []);

  const handlePointerEnter = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!isInteractiveVideo || event.pointerType !== "mouse") return;
      moveCursor(event);
      setCursorVisible(true);
    },
    [isInteractiveVideo, moveCursor],
  );

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!isInteractiveVideo) return;
      event.currentTarget.setPointerCapture(event.pointerId);
      moveCursor(event);
      setIsScrubbing(true);
      queueScrub(event.clientX, event.currentTarget);
    },
    [isInteractiveVideo, moveCursor, queueScrub],
  );

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!isInteractiveVideo) return;
      moveCursor(event);
      if (event.pointerType === "mouse") setCursorVisible(true);
      if (isScrubbing) queueScrub(event.clientX, event.currentTarget);
    },
    [isInteractiveVideo, isScrubbing, moveCursor, queueScrub],
  );

  const handlePointerUp = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setIsScrubbing(false);
    setCursorVisible(event.pointerType === "mouse");
  }, []);

  const handlePointerLeave = useCallback(() => {
    if (!isScrubbing) setCursorVisible(false);
  }, [isScrubbing]);

  const handleMediaKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (!isInteractiveVideo) return;
      const video = videoRef.current;
      if (!video || !Number.isFinite(video.duration)) return;

      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
        const direction = event.key === "ArrowRight" ? 1 : -1;
        const nextTime = Math.min(video.duration, Math.max(0, video.currentTime + direction * 0.5));
        video.currentTime = nextTime;
        setVideoProgress(nextTime / video.duration);
      }
    },
    [isInteractiveVideo],
  );

  return (
    <div className="apartments-light-page min-h-screen">
      <main className="pt-[4.75rem]">
        <section
          className="apartments-shell grid min-h-[calc(100svh-4.75rem)] lg:h-[calc(100svh-4.75rem)] lg:grid-cols-[minmax(22rem,30vw)_minmax(0,1fr)] lg:overflow-hidden"
          aria-labelledby="apartments-title"
        >
          <aside className="apartments-directory flex min-h-[42rem] flex-col lg:min-h-0">
            <header className="apartments-directory-header px-6 py-8 sm:px-10 lg:px-10 lg:py-9 xl:px-12">
              <div className="mb-4 flex items-baseline justify-between gap-5 font-sans text-xs">
                <p className="apartments-kicker">The Bolsover</p>
                <p className="apartments-count">
                  <span className="mr-1.5">{apartmentsList.length}</span>
                  apartments
                </p>
              </div>
              <h1
                id="apartments-title"
                className="font-serif text-[clamp(2.8rem,4.2vw,5rem)] leading-[0.9] tracking-[-0.035em]"
              >
                Apartments
              </h1>
            </header>

            <nav
              ref={directoryRef}
              className="apartments-directory-list min-h-0 flex-1 overscroll-contain px-6 sm:px-10 lg:overflow-y-auto lg:px-10 xl:px-12"
              aria-label="Apartment directory"
            >
              {apartmentsList.map((apartment) => {
                const isExpanded = expandedApartmentNumber === apartment.number;
                const isSelected = selectedApartmentNumber === apartment.number;
                const panelId = `apartment-${apartment.number}-details`;
                const triggerId = `apartment-${apartment.number}-trigger`;

                const aptResidenceType = apartment.residenceType || apartment.details?.residenceType || "—";
                const aptArea = apartment.area || apartment.details?.area || "—";
                const aptFloor = apartment.floor || apartment.details?.floor || "—";
                const aptDescription = apartment.description || apartment.details?.description || "";
                const aptSlides = apartment.slides || apartment.details?.slides || [];

                return (
                  <div key={apartment.number} className="apartment-row">
                    <button
                      id={triggerId}
                      type="button"
                      aria-expanded={isExpanded}
                      aria-controls={panelId}
                      data-apartment-number={apartment.number}
                      onClick={() => selectApartment(apartment.number)}
                      className={`apartment-row-button group grid min-h-16 w-full grid-cols-[2rem_1fr_auto] items-center gap-3 text-left font-sans ${isSelected ? "is-selected" : ""}`}
                    >
                      <span className="apartment-number text-xs tabular-nums">
                        {String(apartment.number).padStart(2, "0")}
                      </span>
                      <span className="text-sm">{apartment.label}</span>
                      <span className="apartment-mark">
                        <AccordionMark open={isExpanded} />
                      </span>
                    </button>

                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          id={panelId}
                          role="region"
                          aria-labelledby={triggerId}
                          initial={{ height: 0 }}
                          animate={{ height: "auto" }}
                          exit={{ height: 0 }}
                          transition={{
                            duration: prefersReducedMotion ? 0 : 0.34,
                            ease: [0.22, 1, 0.36, 1],
                          }}
                          className="overflow-hidden"
                        >
                          <div className="apartment-row-details pb-7 pl-11 pr-1">
                            <dl className="grid grid-cols-2 gap-x-6 gap-y-4 pt-5 font-sans">
                              <div>
                                <dt className="text-[0.68rem]">Residence type</dt>
                                <dd className="mt-1 text-sm">
                                  {aptResidenceType}
                                </dd>
                              </div>
                              <div>
                                <dt className="text-[0.68rem]">Internal area</dt>
                                <dd className="mt-1 text-sm">{aptArea}</dd>
                              </div>
                              <div className="col-span-2">
                                <dt className="text-[0.68rem]">Floor</dt>
                                <dd className="mt-1 text-sm">{aptFloor}</dd>
                              </div>
                            </dl>

                            {(aptDescription || aptSlides.length > 0) && (
                              <>
                                {aptDescription && (
                                  <p className="apartment-description mt-5 font-sans text-sm leading-relaxed">
                                    {aptDescription}
                                  </p>
                                )}
                                <a
                                  href="#apartment-gallery-media"
                                  className="apartment-mobile-media-link mt-5 inline-flex items-center gap-2 font-sans text-xs lg:hidden"
                                >
                                  View residence imagery <span aria-hidden="true">↓</span>
                                </a>

                                {aptSlides.length > 0 && (
                                  <div className="mt-7" role="tablist" aria-label={`Views within ${apartment.label}`}>
                                    {aptSlides.map((item, index) => (
                                      <button
                                        key={item.id || index}
                                        type="button"
                                        role="tab"
                                        aria-selected={activeSlide === index}
                                        aria-controls="apartment-gallery-media"
                                        onClick={() => selectSlide(index)}
                                        className={`apartment-view-tab flex min-h-11 w-full items-center justify-between text-left font-sans text-xs ${activeSlide === index ? "is-active" : ""}`}
                                      >
                                        <span>{item.label}</span>
                                        <span className="tabular-nums">0{index + 1}</span>
                                      </button>
                                    ))}
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </nav>
          </aside>

          <div
            id="apartment-gallery-media"
            className={`apartments-media relative min-h-[64svh] overflow-hidden outline-none lg:min-h-0 ${
              isInteractiveVideo ? "apartment-scrub-surface touch-none" : ""
            }`}
            role={isInteractiveVideo ? "slider" : "region"}
            aria-label={isInteractiveVideo ? "Interactive kitchen camera pan" : `${selectedApartment?.label || "Apartment"} media`}
            aria-valuemin={isInteractiveVideo ? 0 : undefined}
            aria-valuemax={isInteractiveVideo ? 100 : undefined}
            aria-valuenow={isInteractiveVideo ? Math.round(videoProgress * 100) : undefined}
            tabIndex={isInteractiveVideo ? 0 : -1}
            onPointerEnter={handlePointerEnter}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onPointerLeave={handlePointerLeave}
            onKeyDown={handleMediaKeyDown}
          >
            {(slide?.kind === "image" || !slide?.kind) && (slide?.src || (slide as any)?.url) && (
              <Image
                src={slide.src || (slide as any).url}
                alt={slide.label ? `${slide.label} in ${selectedApartment?.label || "residence"}` : `View in ${selectedApartment?.label || "residence"}`}
                fill
                priority={activeSlide === 0}
                sizes="100vw"
                quality={90}
                className="object-cover"
              />
            )}

            {slide?.kind === "video" && (
              <video
                ref={videoRef}
                src={slide.src || (slide as any).url}
                className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover"
                muted
                playsInline
                preload="auto"
                onLoadedMetadata={(event) => {
                  event.currentTarget.pause();
                  event.currentTarget.currentTime = 0.01;
                  setVideoProgress(0);
                }}
                onTimeUpdate={(event) => {
                  const duration = event.currentTarget.duration;
                  if (duration > 0 && !isScrubbing) {
                    setVideoProgress(event.currentTarget.currentTime / duration);
                  }
                }}
              />
            )}

            {!slide && (
              <div className="apartments-empty flex min-h-[64svh] items-center justify-center px-8 text-center lg:min-h-0">
                <div>
                  <p className="font-sans text-xs">
                    {selectedApartment ? `${String(selectedApartment.number).padStart(2, "0")} / ${apartmentsList.length}` : ""}
                  </p>
                  <p className="mt-4 font-serif text-[clamp(2.8rem,6vw,6.8rem)] leading-none">
                    {selectedApartment?.label || "The Bolsover"}
                  </p>
                  <p className="mt-5 font-sans text-xs">Residence imagery to follow</p>
                </div>
              </div>
            )}

            {slide && (
              <>
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(5,5,4,0.03)_45%,rgba(5,5,4,0.62)_100%)]" />

                <div className="pointer-events-none absolute bottom-7 left-6 right-24 z-10 flex items-end justify-between gap-6 text-white sm:bottom-9 sm:left-9 lg:bottom-12 lg:left-12">
                  <div className="max-w-xl">
                    <p className="font-serif text-2xl text-white sm:text-3xl">{slide.label}</p>
                    <p className="mt-2 max-w-lg font-sans text-sm leading-relaxed text-white/70">
                      {slide.caption}
                    </p>
                    {(slide as any).pdfUrl && (
                      <a
                        href={(slide as any).pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="pointer-events-auto mt-3 inline-flex items-center gap-2 rounded bg-white/10 px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-[#c5a059] border border-[#c5a059]/30 transition-colors hover:bg-white/20 hover:text-white"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Download Architectural PDF
                      </a>
                    )}
                  </div>
                  <p className="hidden font-sans text-xs tabular-nums text-white/66 sm:block">
                    0{activeSlide + 1} / 0{slides.length}
                  </p>
                </div>
              </>
            )}

            {isInteractiveVideo && (
              <>
                <div className="pointer-events-none absolute left-6 right-24 top-6 z-10 sm:left-9 sm:top-9 lg:left-12 lg:top-12">
                  <div className="inline-flex border border-white/16 bg-black/58 px-4 py-3 font-sans text-xs text-white">
                    {isScrubbing ? "Release to hold this view" : "Drag across the image to pan"}
                  </div>
                  <div className="mt-3 h-px max-w-52 overflow-hidden bg-white/24">
                    <span
                      className="block h-full origin-left bg-[#c5a059]"
                      style={{ transform: `scaleX(${videoProgress})` }}
                    />
                  </div>
                </div>

                <div
                  ref={cursorRef}
                  aria-hidden="true"
                  className={`apartment-scrub-cursor pointer-events-none absolute left-0 top-0 z-30 items-center justify-center rounded-full border border-[#c5a059] bg-black/82 font-sans tracking-[0.12em] text-white transition-[opacity,width,height,background-color] duration-150 motion-reduce:transition-none ${
                    cursorVisible ? "opacity-100" : "opacity-0"
                  } ${isScrubbing ? "h-14 w-14 bg-black text-[0.5rem]" : "h-16 w-16 text-[0.56rem]"}`}
                >
                  <span className="tracking-normal" aria-hidden="true">←</span>
                  <span className="mx-1">{isScrubbing ? "SCRUB" : "DRAG"}</span>
                  <span className="tracking-normal" aria-hidden="true">→</span>
                </div>
              </>
            )}

            {slides.length > 1 && (
              <button
                type="button"
                onClick={showNextSlide}
                className="absolute right-0 top-1/2 z-20 flex h-28 w-[4.5rem] -translate-y-1/2 items-center justify-center bg-black/68 text-white transition-colors hover:bg-black/88 hover:text-[#c5a059] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-white sm:h-32 sm:w-20"
                aria-label={`Next view: ${slides[(activeSlide + 1) % slides.length].label}`}
              >
                <NextArrow />
              </button>
            )}
          </div>
        </section>
      </main>

      <FooterSection />
    </div>
  );
}

export default function ApartmentsPage() {
  return (
    <CMSProvider>
      <ApartmentsPageContent />
    </CMSProvider>
  );
}
