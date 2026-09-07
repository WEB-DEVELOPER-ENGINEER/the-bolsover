"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { FloorLevelData, SubUnitPlan } from "@/data/floorPlansData";
import {
  Maximize2,
  Download,
  X,
  Layers,
  Sparkles,
  ChevronUp,
  ChevronDown,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ArrowRight,
  Loader2,
  Building2,
  Home
} from "lucide-react";
import { bolsoverConfig as defaultBolsoverConfig } from "@/data/projectData";
import { useCMS } from "@/context/CMSContext";

const AccordionMark = ({ open }: { open: boolean }) => (
  <span aria-hidden="true" className="relative block h-3.5 w-3.5 shrink-0">
    <span className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-current" />
    <span
      className={`absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-current transition-transform duration-300 motion-reduce:transition-none ${
        open ? "scale-y-0" : "scale-y-100"
      }`}
    />
  </span>
);

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

export const FloorPlansAscent: React.FC = () => {
  const cms = useCMS();
  const bolsoverConfig = cms?.data?.bolsoverConfig || defaultBolsoverConfig;
  const brochurePath = bolsoverConfig.brochurePath || "/assets/the-bolsover-brochure.pdf";
  const floorPlansPdfPath = bolsoverConfig.floorPlansPdfPath || brochurePath;

  // 100% DB-driven: derived directly from CMS PostgreSQL records
  const floorLevels = useMemo(() => {
    const raw = cms?.data?.floorLevels || [];
    return [...raw].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [cms?.data?.floorLevels]);

  const [activeFloorIndex, setActiveFloorIndex] = useState<number>(0);
  const [expandedFloorIndex, setExpandedFloorIndex] = useState<number | null>(0);
  const [selectedSubUnits, setSelectedSubUnits] = useState<Record<string, string>>({});
  const [viewMode, setViewMode] = useState<"tiers" | "residences">("tiers");

  // Keep active index in bounds when floor levels load from database
  useEffect(() => {
    if (floorLevels.length > 0) {
      setActiveFloorIndex((prev) => (prev >= floorLevels.length ? floorLevels.length - 1 : prev));
      setExpandedFloorIndex((prev) => (prev === null || prev >= floorLevels.length ? floorLevels.length - 1 : prev));
    }
  }, [floorLevels.length]);

  const prefersReducedMotion = useReducedMotion();
  const directoryRef = useRef<HTMLElement | null>(null);

  // Flatten all residences for direct 1–25 navigation
  const allApartments = useMemo(() => {
    const list: Array<{
      sub: SubUnitPlan;
      floor: FloorLevelData;
      floorIndex: number;
      aptNum: number;
    }> = [];

    floorLevels.forEach((floor, fIdx) => {
      if (floor.subUnits && floor.subUnits.length > 0) {
        floor.subUnits.forEach((sub) => {
          const m = sub.name.match(/\d+/) || sub.unitCode.match(/\d+/);
          const aptNum = m ? parseInt(m[0], 10) : 0;
          list.push({ sub, floor, floorIndex: fIdx, aptNum });
        });
      }
    });

    return list.sort((a, b) => a.aptNum - b.aptNum);
  }, [floorLevels]);

  // Full Inspection Modal State
  const [inspectingPlan, setInspectingPlan] = useState<{
    imageUrl: string;
    title: string;
    subTitle: string;
    specs: string;
    pdfUrl?: string;
  } | null>(null);

  const [zoomScale, setZoomScale] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Sync initial sub-units when floorLevels change
  useEffect(() => {
    if (floorLevels.length === 0) return;

    setSelectedSubUnits((prev) => {
      let changed = false;
      const next = { ...prev };
      floorLevels.forEach((fl) => {
        if (!next[fl.id] && fl.subUnits && fl.subUnits.length > 0) {
          next[fl.id] = fl.subUnits[0].id;
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [floorLevels]);

  // Lock scroll on inspection mode activate
  useEffect(() => {
    if (inspectingPlan) {
      document.body.style.overflow = "hidden";
      setZoomScale(1);
      setPanOffset({ x: 0, y: 0 });
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [inspectingPlan]);

  // Escape key listener to close inspection mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && inspectingPlan) {
        setInspectingPlan(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [inspectingPlan]);

  // Select Floor Level
  const selectFloor = useCallback((index: number) => {
    const clamped = Math.max(0, Math.min(floorLevels.length - 1, index));
    setActiveFloorIndex(clamped);
    setExpandedFloorIndex((current) => (current === clamped ? null : clamped));
  }, [floorLevels.length]);

  const handleSubUnitSelect = (floorId: string, subUnitId: string) => {
    setSelectedSubUnits((prev) => ({
      ...prev,
      [floorId]: subUnitId,
    }));
  };

  const handleApartmentDirectSelect = (item: { sub: SubUnitPlan; floor: FloorLevelData; floorIndex: number }) => {
    setActiveFloorIndex(item.floorIndex);
    setExpandedFloorIndex(item.floorIndex);
    setSelectedSubUnits((prev) => ({
      ...prev,
      [item.floor.id]: item.sub.id,
    }));
  };

  // Zoom helpers
  const handleZoomIn = () => setZoomScale((prev) => Math.min(4, prev + 0.4));
  const handleZoomOut = () => setZoomScale((prev) => Math.max(1, prev - 0.4));
  const handleZoomReset = () => {
    setZoomScale(1);
    setPanOffset({ x: 0, y: 0 });
  };

  const handleWheelZoom = (e: React.WheelEvent) => {
    e.stopPropagation();
    if (e.deltaY < 0) {
      setZoomScale((prev) => Math.min(4, prev + 0.2));
    } else {
      setZoomScale((prev) => {
        const next = Math.max(1, prev - 0.2);
        if (next === 1) setPanOffset({ x: 0, y: 0 });
        return next;
      });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomScale <= 1) return;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - panOffset.x, y: e.clientY - panOffset.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || zoomScale <= 1) return;
    setPanOffset({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  if (cms?.isLoading && floorLevels.length === 0) {
    return (
      <div className="flex h-[60vh] w-full flex-col items-center justify-center space-y-4 bg-[var(--paper)] text-[var(--ink)]">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--brand-taupe-deep)]" />
        <p className="font-sans text-xs uppercase tracking-widest text-[var(--body-ink)]">
          Loading Floor Plans from Database...
        </p>
      </div>
    );
  }

  if (floorLevels.length === 0) {
    return (
      <div className="flex h-[60vh] w-full flex-col items-center justify-center space-y-4 bg-[var(--paper)] text-[var(--ink)] p-8 text-center">
        <Layers className="h-10 w-10 text-[var(--brand-taupe-deep)] opacity-60" />
        <h2 className="font-serif text-2xl text-[var(--ink)]">No Floor Plans Configured</h2>
        <p className="font-sans text-xs text-[var(--body-ink)] max-w-md">
          Floor levels and apartments are managed directly in the Admin Dashboard.
        </p>
      </div>
    );
  }

  const activeFloor = floorLevels[activeFloorIndex] || floorLevels[0];
  const activeSubId = selectedSubUnits[activeFloor.id] || activeFloor.subUnits[0]?.id;
  const activeSubUnit = activeFloor.subUnits.find((s) => s.id === activeSubId) || activeFloor.subUnits[0];
  const displayImage = activeSubUnit ? activeSubUnit.image : activeFloor.masterImage;
  const displayTitle = activeSubUnit ? activeSubUnit.name : activeFloor.title;
  const displaySpecs = activeSubUnit
    ? `${activeSubUnit.bedrooms} • ${activeSubUnit.areaSqFt} (${activeSubUnit.areaSqM})`
    : `${activeFloor.unitsRange} • ${activeFloor.areaSqFtRange}`;
  const activePdfUrl = activeSubUnit?.pdfUrl || floorPlansPdfPath;

  return (
    <div className="apartments-light-page">
      <section
        className="apartments-shell grid min-h-[calc(100svh-4.75rem)] lg:min-h-[calc(100svh-4.9rem)] lg:h-[calc(100svh-4.9rem)] lg:grid-cols-[minmax(22rem,32vw)_minmax(0,1fr)] lg:overflow-hidden"
        aria-labelledby="floor-plans-title"
      >
        {/* LEFT COLUMN: FLOOR LEVEL DIRECTORY & SPECS */}
        <aside className="apartments-directory flex min-h-[42rem] flex-col lg:min-h-0 border-r border-[var(--line)]">
          <header className="apartments-directory-header px-6 py-6 sm:px-8 lg:px-8 lg:py-7 xl:px-10">
            <div className="mb-3 flex items-baseline justify-between gap-4 font-sans text-xs">
              <p className="apartments-kicker font-mono tracking-widest uppercase text-[var(--brand-taupe-deep)]">The Bolsover</p>
              <p className="apartments-count text-[var(--body-ink)]">
                <span className="mr-1.5 font-bold text-[var(--ink)]">{allApartments.length}</span>
                private residences
              </p>
            </div>
            
            <div className="flex items-center justify-between gap-4">
              <h1
                id="floor-plans-title"
                className="font-serif text-[clamp(2.4rem,3.8vw,4.2rem)] leading-[0.9] tracking-[-0.035em]"
              >
                Floor plans
              </h1>
              
              <a
                href={activePdfUrl}
                target="_blank"
                rel="noreferrer"
                download
                className="inline-flex items-center gap-1.5 rounded-full border border-[var(--line)] bg-[var(--surface)] px-3.5 py-1.5 font-sans text-xs text-[var(--ink)] transition-colors hover:border-[var(--brand-taupe)] hover:text-[var(--brand-taupe-deep)] lg:hidden"
                title="Download floor plan PDF"
              >
                <span>PDF</span> <DownloadIcon />
              </a>
            </div>

            {/* DIRECTORY VIEW SWITCHER */}
            <div className="mt-5 grid grid-cols-2 gap-1 rounded-lg border border-[var(--line)] bg-[var(--surface)]/60 p-1 text-xs font-sans">
              <button
                type="button"
                onClick={() => setViewMode("tiers")}
                className={`flex items-center justify-center gap-2 rounded-md py-1.5 transition-all ${
                  viewMode === "tiers"
                    ? "bg-[var(--ink)] text-white shadow-sm font-medium"
                    : "text-[var(--body-ink)] hover:text-[var(--ink)]"
                }`}
              >
                <Layers className="h-3.5 w-3.5" />
                <span>By Floor Tier ({floorLevels.length})</span>
              </button>
              
              <button
                type="button"
                onClick={() => setViewMode("residences")}
                className={`flex items-center justify-center gap-2 rounded-md py-1.5 transition-all ${
                  viewMode === "residences"
                    ? "bg-[var(--ink)] text-white shadow-sm font-medium"
                    : "text-[var(--body-ink)] hover:text-[var(--ink)]"
                }`}
              >
                <Home className="h-3.5 w-3.5" />
                <span>All Units (1–25)</span>
              </button>
            </div>
          </header>

          <nav
            ref={directoryRef}
            className="apartments-directory-list min-h-0 flex-1 overscroll-contain px-6 sm:px-8 lg:overflow-y-auto lg:px-8 xl:px-10"
            aria-label="Floor level directory"
          >
            {/* VIEW MODE 1: BY FLOOR LEVEL TIERS */}
            {viewMode === "tiers" && (
              <div className="space-y-1">
                {[...floorLevels].reverse().map((fl) => {
                  const actualIdx = floorLevels.findIndex((item) => item.id === fl.id);
                  const isSelected = activeFloorIndex === actualIdx;
                  const isExpanded = expandedFloorIndex === actualIdx;
                  const panelId = `floor-${fl.id}-details`;
                  const triggerId = `floor-${fl.id}-trigger`;

                  return (
                    <div key={fl.id} className="apartment-row">
                      <button
                        id={triggerId}
                        type="button"
                        aria-expanded={isExpanded}
                        aria-controls={panelId}
                        onClick={() => selectFloor(actualIdx)}
                        className={`apartment-row-button group grid min-h-16 w-full grid-cols-[2.5rem_1fr_auto] items-center gap-3 text-left font-sans ${
                          isSelected ? "is-selected" : ""
                        }`}
                      >
                        <span className="apartment-number text-xs font-semibold tabular-nums uppercase">
                          L{fl.floorCode}
                        </span>
                        <div className="min-w-0">
                          <span className="block text-sm font-medium truncate">{fl.title}</span>
                          <span className="block text-[11px] text-[var(--body-ink)] truncate">{fl.unitsRange}</span>
                        </div>
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
                              duration: prefersReducedMotion ? 0 : 0.3,
                              ease: [0.22, 1, 0.36, 1],
                            }}
                            className="overflow-hidden"
                          >
                            <div className="apartment-row-details pb-6 pl-12 pr-1">
                              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 pt-3 font-sans">
                                <div>
                                  <dt className="text-[0.68rem] uppercase tracking-wider text-[var(--body-ink)]">Units range</dt>
                                  <dd className="mt-0.5 text-xs font-medium text-[var(--ink)]">{fl.unitsRange}</dd>
                                </div>
                                <div>
                                  <dt className="text-[0.68rem] uppercase tracking-wider text-[var(--body-ink)]">Total area</dt>
                                  <dd className="mt-0.5 text-xs font-medium text-[var(--ink)]">{fl.areaSqFtRange}</dd>
                                </div>
                                <div className="col-span-2">
                                  <dt className="text-[0.68rem] uppercase tracking-wider text-[var(--body-ink)]">Residences</dt>
                                  <dd className="mt-0.5 text-xs text-[var(--ink)]">{fl.residenceCount} Luxury Private Suites</dd>
                                </div>
                              </dl>

                              {fl.highlight && (
                                <div className="mt-3.5 border-l-2 border-[var(--brand-taupe)] pl-3 py-1">
                                  <p className="font-serif italic text-xs text-[var(--brand-taupe-deep)]">
                                    &ldquo;{fl.highlight}&rdquo;
                                  </p>
                                </div>
                              )}

                              <p className="apartment-description mt-3 font-sans text-xs leading-relaxed text-[var(--body-ink)]">
                                {fl.description}
                              </p>

                              {/* Sub-unit Tabs */}
                              {fl.subUnits && fl.subUnits.length > 0 && (
                                <div className="mt-5" role="tablist" aria-label={`Sub-units in ${fl.title}`}>
                                  <p className="mb-2 text-[0.68rem] uppercase tracking-wider text-[var(--body-ink)]">Select Layout</p>
                                  <div className="space-y-1">
                                    {fl.subUnits.map((sub, sIdx) => {
                                      const subSelected = (selectedSubUnits[fl.id] || fl.subUnits[0].id) === sub.id;
                                      return (
                                        <button
                                          key={sub.id}
                                          type="button"
                                          role="tab"
                                          aria-selected={subSelected}
                                          onClick={() => handleSubUnitSelect(fl.id, sub.id)}
                                          className={`apartment-view-tab flex min-h-11 w-full items-center justify-between text-left font-sans text-xs px-3 rounded transition-colors ${
                                            subSelected ? "is-active font-medium bg-[var(--surface)] text-[var(--ink)] border-l-2 border-[var(--brand-taupe-deep)]" : "hover:bg-[var(--surface)]/50"
                                          }`}
                                        >
                                          <div className="min-w-0 pr-2">
                                            <span className="block font-medium truncate">{sub.name}</span>
                                            <span className="block text-[11px] text-[var(--body-ink)] truncate">{sub.bedrooms} • {sub.areaSqFt}</span>
                                          </div>
                                          <span className="tabular-nums opacity-60 text-[10px] shrink-0 font-mono">0{sIdx + 1}</span>
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            )}

            {/* VIEW MODE 2: DIRECT ALL RESIDENCES (1–25) */}
            {viewMode === "residences" && (
              <div className="space-y-1 py-2">
                {allApartments.map((item) => {
                  const isCurrent =
                    activeFloorIndex === item.floorIndex &&
                    (selectedSubUnits[item.floor.id] || item.floor.subUnits[0]?.id) === item.sub.id;

                  return (
                    <button
                      key={item.sub.id}
                      type="button"
                      onClick={() => handleApartmentDirectSelect(item)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg text-left font-sans transition-all border ${
                        isCurrent
                          ? "bg-[var(--surface)] border-[var(--brand-taupe)] shadow-sm"
                          : "border-transparent hover:bg-[var(--surface)]/50 text-[var(--body-ink)]"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--ink)] text-white text-[10px] font-mono font-bold shrink-0">
                          {String(item.aptNum).padStart(2, "0")}
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-[var(--ink)] truncate">
                            {item.sub.name}
                          </p>
                          <p className="text-[11px] text-[var(--body-ink)] truncate">
                            Level {item.floor.floorCode} • {item.sub.bedrooms}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0 pl-2">
                        <span className="block text-xs font-medium text-[var(--brand-taupe-deep)] tabular-nums">
                          {item.sub.areaSqFt}
                        </span>
                        <span className="block text-[10px] text-[var(--body-ink)] tabular-nums">
                          {item.sub.areaSqM}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </nav>
        </aside>

        {/* RIGHT COLUMN: MAIN FLOOR PLAN STAGE */}
        <div
          id="floor-plan-stage"
          className="apartments-media relative flex min-h-[68svh] flex-col justify-between overflow-hidden p-6 sm:p-8 lg:min-h-0 xl:p-10 bg-[var(--paper)]"
        >
          {/* Top Bar Actions */}
          <div className="z-20 flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2.5 rounded-full border border-[var(--line)] bg-[var(--surface)]/90 px-4 py-2 text-xs font-sans text-[var(--ink)] shadow-sm backdrop-blur-md">
              <span className="font-semibold uppercase tracking-wider text-[var(--brand-taupe-deep)]">Level {activeFloor.floorCode}</span>
              <span className="h-1 w-1 rounded-full bg-[var(--line)]" />
              <span className="font-medium">{displayTitle}</span>
            </div>

            <div className="flex items-center gap-2.5">
              <a
                href={activePdfUrl}
                target="_blank"
                rel="noreferrer"
                download
                className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-4 py-2 font-sans text-xs text-[var(--ink)] transition-colors hover:border-[var(--brand-taupe)] hover:text-[var(--brand-taupe-deep)] shadow-sm"
                title={`Download ${displayTitle} architectural PDF`}
              >
                <span>{activeSubUnit ? `${activeSubUnit.name} PDF` : "Floor Plans PDF"}</span>
                <DownloadIcon />
              </a>

              <button
                type="button"
                onClick={() =>
                  setInspectingPlan({
                    imageUrl: displayImage,
                    title: displayTitle,
                    subTitle: activeFloor.title,
                    specs: displaySpecs,
                    pdfUrl: activePdfUrl
                  })
                }
                className="inline-flex items-center gap-2 rounded-full border border-[var(--ink)] bg-[var(--ink)] px-4 py-2 font-sans text-xs text-white transition-colors hover:bg-[var(--brand-taupe-deep)] hover:border-[var(--brand-taupe-deep)] shadow-sm"
              >
                <Maximize2 className="h-3.5 w-3.5" />
                <span>Inspect full plan</span>
              </button>
            </div>
          </div>

          {/* Central Interactive Floor Plan Image Stage */}
          <div className="relative my-auto flex-1 min-h-0 w-full h-full flex items-center justify-center py-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${activeFloor.id}_${activeSubId}`}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.03 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.35, ease: "easeOut" }}
                onClick={() =>
                  setInspectingPlan({
                    imageUrl: displayImage,
                    title: displayTitle,
                    subTitle: activeFloor.title,
                    specs: displaySpecs,
                    pdfUrl: activePdfUrl
                  })
                }
                className="group relative cursor-zoom-in h-full w-full max-w-none flex items-center justify-center p-0"
              >
                <img
                  src={displayImage}
                  alt={displayTitle}
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    if (activeFloor?.masterImage && (e.target as HTMLImageElement).src !== activeFloor.masterImage) {
                      (e.target as HTMLImageElement).src = activeFloor.masterImage;
                    }
                  }}
                  className="h-full w-full max-h-[calc(100vh-14rem)] lg:max-h-[calc(100vh-11.5rem)] object-contain transition-transform duration-300 group-hover:scale-[1.02] drop-shadow-md"
                />
                <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/0 transition-colors group-hover:bg-black/10">
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-[var(--ink)]/85 px-4 py-2 font-sans text-xs uppercase tracking-widest text-white opacity-0 shadow-xl transition-opacity group-hover:opacity-100">
                    <Maximize2 className="h-3.5 w-3.5 text-[var(--brand-taupe)]" />
                    <span>Inspect layout</span>
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Bottom Caption Overlay */}
          <div className="z-20 flex items-end justify-between gap-6 border-t border-[var(--line)] pt-4 text-[var(--ink)]">
            <div>
              <p className="font-serif text-xl sm:text-2xl text-[var(--ink)] font-normal">{displayTitle}</p>
              <p className="mt-0.5 font-serif italic text-xs sm:text-sm text-[var(--body-ink)]">
                {activeSubUnit ? `${activeFloor.title} — ${activeSubUnit.bedrooms}` : activeFloor.subtitle || activeFloor.highlight}
              </p>
            </div>
            <div className="text-right font-sans text-xs">
              <span className="block font-medium text-[var(--brand-taupe-deep)]">
                {activeSubUnit ? `${activeSubUnit.areaSqFt} (${activeSubUnit.areaSqM})` : activeFloor.areaSqFtRange}
              </span>
              <span className="text-[var(--body-ink)]">
                {activeSubUnit ? `Unit ${activeSubUnit.unitCode}` : activeFloor.unitsRange}
              </span>
            </div>
          </div>

          {/* Floating Tier Ascent Controller (Right Edge) */}
          <div className="absolute right-4 top-1/2 z-30 hidden -translate-y-1/2 flex-col items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)]/95 p-2.5 shadow-md backdrop-blur-md sm:flex">
            <button
              type="button"
              onClick={() => selectFloor(activeFloorIndex + 1)}
              disabled={activeFloorIndex === floorLevels.length - 1}
              className="p-1 text-[var(--body-ink)] transition-colors hover:text-[var(--ink)] disabled:opacity-30"
              title="Higher level"
            >
              <ChevronUp className="h-4 w-4" />
            </button>

            <div className="flex flex-col gap-2 py-1">
              {[...floorLevels].reverse().map((fl) => {
                const actualIdx = floorLevels.findIndex((item) => item.id === fl.id);
                const isSelected = activeFloorIndex === actualIdx;
                return (
                  <button
                    key={fl.id}
                    type="button"
                    onClick={() => selectFloor(actualIdx)}
                    className={`relative flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-sans transition-all duration-200 ${
                      isSelected
                        ? "bg-[var(--ink)] text-white font-semibold shadow-sm"
                        : "text-[var(--body-ink)] hover:bg-[var(--paper-soft)] hover:text-[var(--ink)]"
                    }`}
                    title={fl.title}
                  >
                    L{fl.floorCode}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => selectFloor(activeFloorIndex - 1)}
              disabled={activeFloorIndex === 0}
              className="p-1 text-[var(--body-ink)] transition-colors hover:text-[var(--ink)] disabled:opacity-30"
              title="Lower level"
            >
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* FULL INSPECTION MODAL LIGHTBOX */}
      <AnimatePresence>
        {inspectingPlan && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setInspectingPlan(null)}
            className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-[var(--ink)]/90 p-4 sm:p-8 backdrop-blur-md select-none"
          >
            {/* Top Controls Bar */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="z-10 flex w-full max-w-5xl items-center justify-between rounded-full border border-white/15 bg-black/60 px-6 py-3.5 text-white shadow-2xl backdrop-blur-md"
            >
              <div>
                <span className="block font-sans text-[10px] uppercase tracking-widest text-[var(--brand-taupe)]">
                  Architectural Layout Inspection
                </span>
                <h3 className="font-serif text-lg sm:text-xl text-white">
                  {inspectingPlan.title} <span className="font-serif italic text-white/70 text-sm">— {inspectingPlan.subTitle}</span>
                </h3>
              </div>

              <div className="flex items-center gap-3">
                {inspectingPlan.pdfUrl && (
                  <a
                    href={inspectingPlan.pdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    download
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 font-sans text-xs text-white transition-colors hover:bg-white/25 shadow-sm"
                    title="Download Original Vector PDF"
                  >
                    <Download className="h-3.5 w-3.5 text-[var(--brand-taupe)]" />
                    <span className="hidden sm:inline">Vector PDF</span>
                  </a>
                )}

                <div className="flex items-center gap-1.5 rounded-full border border-white/20 bg-black/40 px-3 py-1.5 font-sans text-xs text-white">
                  <button
                    type="button"
                    onClick={handleZoomOut}
                    disabled={zoomScale <= 1}
                    className="p-1 hover:text-[var(--brand-taupe)] disabled:opacity-30"
                    title="Zoom out"
                  >
                    <ZoomOut className="h-4 w-4" />
                  </button>
                  <span className="w-12 text-center font-semibold text-[var(--brand-taupe)]">{Math.round(zoomScale * 100)}%</span>
                  <button
                    type="button"
                    onClick={handleZoomIn}
                    disabled={zoomScale >= 4}
                    className="p-1 hover:text-[var(--brand-taupe)] disabled:opacity-30"
                    title="Zoom in"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleZoomReset}
                    className="ml-1 border-l border-white/20 pl-2 text-white/70 hover:text-white"
                    title="Reset view"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setInspectingPlan(null)}
                  className="rounded-full border border-white/20 bg-white/10 p-2 text-white transition-colors hover:bg-white/25"
                  title="Close (Esc)"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Interactive Image Container */}
            <div
              onClick={(e) => e.stopPropagation()}
              onWheel={handleWheelZoom}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              className={`relative my-auto flex h-[76vh] w-full max-w-[92vw] items-center justify-center overflow-hidden rounded-2xl ${
                zoomScale > 1 ? (isDragging ? "cursor-grabbing" : "cursor-grab") : "cursor-default"
              }`}
            >
              <motion.div
                animate={{
                  scale: zoomScale,
                  x: zoomScale > 1 ? panOffset.x : 0,
                  y: zoomScale > 1 ? panOffset.y : 0,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="flex max-h-full max-w-full items-center justify-center p-4"
              >
                <img
                  src={inspectingPlan.imageUrl}
                  alt={inspectingPlan.title}
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    // prevent infinite loop if failed
                    (e.target as HTMLImageElement).style.opacity = "0.5";
                  }}
                  className="max-h-[72vh] max-w-[88vw] object-contain drop-shadow-2xl select-none"
                  draggable={false}
                />
              </motion.div>
            </div>

            {/* Bottom Info Bar */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex w-full max-w-3xl items-center justify-between rounded-full border border-white/15 bg-black/60 px-6 py-2.5 font-sans text-xs text-white/80 backdrop-blur-md"
            >
              <span className="font-medium text-[var(--brand-taupe)]">{inspectingPlan.specs}</span>
              <span className="hidden sm:inline text-white/60">
                {zoomScale > 1 ? "Drag to pan layout • Scroll to zoom" : "Scroll or click buttons to zoom • Press ESC to close"}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
