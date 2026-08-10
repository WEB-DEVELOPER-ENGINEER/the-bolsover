"use client";

import React, { useMemo, useRef, useState } from "react";
import locationMapData from "@/data/locationMapData.json";

type CategoryId = "all" | "dining" | "culture" | "parks" | "education" | "wellbeing" | "connections";

type LocationPoint = {
  id: string;
  name: string;
  category: Exclude<CategoryId, "all">;
  x: number;
  y: number;
  lat: number;
  lon: number;
  address: string;
  kind: "curated" | "context";
};

const points = locationMapData as LocationPoint[];
const VIEW_BOX = "400 300 3600 2545.714";
const BOLSOVER = { x: 2084.1, y: 1759.5 };

const bolsoverPoint: LocationPoint = {
  id: "bolsover",
  name: "The Bolsover",
  category: "all" as any,
  x: BOLSOVER.x,
  y: BOLSOVER.y,
  lat: 51.5202,
  lon: -0.1432,
  address: "3-8 Bolsover Street, Fitzrovia, London W1W 6AB",
  kind: "curated",
};

const categories: Array<{ id: CategoryId; label: string; colour: string }> = [
  { id: "all", label: "All places", colour: "#BA9D81" },
  { id: "dining", label: "Dining", colour: "#F28A2B" },
  { id: "culture", label: "Culture & landmarks", colour: "#2F7C82" },
  { id: "parks", label: "Parks & gardens", colour: "#7E9566" },
  { id: "education", label: "Education", colour: "#B8DCEA" },
  { id: "wellbeing", label: "Wellbeing", colour: "#B5799A" },
  { id: "connections", label: "Connections", colour: "#003688" }
];

const categoryColour = Object.fromEntries(categories.map((category) => [category.id, category.colour]));

export const LocationMapExperience = () => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const dragState = useRef<{ pointerId: number; x: number; y: number; originX: number; originY: number } | null>(null);
  const [activeCategory, setActiveCategory] = useState<CategoryId>("all");
  const [selectedPoint, setSelectedPoint] = useState<LocationPoint | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [mobilePanelOpen, setMobilePanelOpen] = useState(false);

  const visiblePoints = useMemo(
    () => points.filter((point) => activeCategory === "all" || point.category === activeCategory),
    [activeCategory]
  );

  const categoryPlaces = activeCategory === "all" ? [] : visiblePoints;

  const resetMap = () => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
    setSelectedPoint(null);
  };

  const changeZoom = (nextScale: number) => {
    const clamped = Math.min(2.25, Math.max(1, nextScale));
    setScale(clamped);
    if (clamped === 1) setOffset({ x: 0, y: 0 });
  };

  const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    changeZoom(scale * Math.exp(-event.deltaY * 0.0012));
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (scale <= 1 || (event.target as Element).closest("[data-map-point]")) return;
    dragState.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      originX: offset.x,
      originY: offset.y
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragState.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const limitX = (mapRef.current?.clientWidth || 0) * (scale - 1) * 0.42;
    const limitY = (mapRef.current?.clientHeight || 0) * (scale - 1) * 0.42;
    const nextX = drag.originX + event.clientX - drag.x;
    const nextY = drag.originY + event.clientY - drag.y;
    setOffset({
      x: Math.max(-limitX, Math.min(limitX, nextX)),
      y: Math.max(-limitY, Math.min(limitY, nextY))
    });
  };

  const handlePointerEnd = (event: React.PointerEvent<HTMLDivElement>) => {
    if (dragState.current?.pointerId === event.pointerId) dragState.current = null;
  };

  const chooseCategory = (category: CategoryId) => {
    setActiveCategory(category);
    setSelectedPoint(null);
  };

  const openPoint = (point: LocationPoint) => {
    setSelectedPoint(point);
    setMobilePanelOpen(true);
  };

  return (
    <section id="neighbourhood-map" className="location-map-scene" aria-labelledby="map-scene-title">
      <div
        ref={mapRef}
        className={`location-map-stage ${scale > 1 ? "is-zoomed" : ""}`}
        onWheel={handleWheel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
      >
        <div
          className="location-map-transform"
          style={{ transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${scale})` }}
        >
          <img
            src="/maps/bolsover-atlist-base.svg"
            alt="Atlist-style vector map of Fitzrovia and central London"
            className="location-map-base"
            loading="lazy"
            decoding="async"
            draggable={false}
          />

          <svg
            className="location-map-points"
            viewBox={VIEW_BOX}
            preserveAspectRatio="xMidYMid slice"
            aria-label="Nearby places around The Bolsover"
          >
            {visiblePoints.map((point) => {
              const selected = selectedPoint?.id === point.id;
              const labelled = selected || hoveredPoint === point.id;
              const colour = categoryColour[point.category];
              const radius = point.kind === "curated" ? 18 : 12;

              return (
                <g
                  key={point.id}
                  data-map-point
                  role="button"
                  tabIndex={0}
                  aria-label={`${point.name}, ${categories.find((item) => item.id === point.category)?.label}`}
                  className={`location-poi ${selected ? "is-selected" : ""}`}
                  transform={`translate(${point.x} ${point.y})`}
                  onMouseEnter={() => setHoveredPoint(point.id)}
                  onMouseLeave={() => setHoveredPoint(null)}
                  onClick={() => openPoint(point)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      openPoint(point);
                    }
                  }}
                >
                  {selected ? (
                    <g className="location-map-pointer">
                      <circle r={radius + 18} fill={colour} className="location-pointer-pulse-ring" />
                      <circle r={radius + 8} fill="none" stroke={colour} strokeWidth="3" className="location-pointer-ring" />
                      <circle r={radius} fill={colour} className="location-poi-disc" />
                      {point.kind === "curated" && <circle r="4.5" className="location-poi-core" />}

                      {/* Map Pin Pointer Icon pointing down at (0, 0) */}
                      <g className="location-pin-icon-group" transform="translate(0, -36)">
                        <path
                          d="M 0 36 C -14 18 -22 4 -22 -16 C -22 -32 -12 -42 0 -42 C 12 -42 22 -32 22 -16 C 22 4 14 18 0 36 Z"
                          fill={colour}
                          stroke="#FFFFFF"
                          strokeWidth="3.5"
                          className="location-pin-path"
                        />
                        <circle cx="0" cy="-16" r="11" fill="#FFFFFF" />
                        <path
                          d="M0 -21 C-3.3 -21 -6 -18.3 -6 -15 C-6 -10 0 -4.5 0 -4.5 C0 -4.5 6 -10 6 -15 C6 -18.3 3.3 -21 0 -21 Z M0 -13.5 C-0.8 -13.5 -1.5 -14.2 -1.5 -15 C-1.5 -15.8 -0.8 -16.5 0 -16.5 C0.8 -16.5 1.5 -15.8 1.5 -15 C1.5 -14.2 0.8 -13.5 0 -13.5 Z"
                          fill={colour}
                        />
                      </g>

                      <g className="location-poi-label location-selected-label" transform={`translate(${radius + 28} -52)`}>
                        <rect rx="6" ry="6" width={Math.max(160, point.name.length * 13 + 36)} height="46" fill="var(--ink)" stroke={colour} strokeWidth="2" />
                        <text x="16" y="29" fill="#FFFFFF" fontSize="18" fontWeight="600">{point.name}</text>
                      </g>
                    </g>
                  ) : (
                    <>
                      <circle r={radius} fill={colour} className="location-poi-disc" />
                      {point.kind === "curated" && <circle r="4.5" className="location-poi-core" />}
                      {labelled && (
                        <g className="location-poi-label" transform={`translate(${radius + 14} -18)`}>
                          <rect width={Math.max(150, point.name.length * 13 + 28)} height="44" />
                          <text x="14" y="28">{point.name}</text>
                        </g>
                      )}
                    </>
                  )}
                </g>
              );
            })}

            <g
              data-map-point
              role="button"
              tabIndex={0}
              aria-label="The Bolsover, 3-8 Bolsover Street"
              className={`bolsover-map-marker ${selectedPoint?.id === "bolsover" ? "is-selected" : ""}`}
              transform={`translate(${BOLSOVER.x} ${BOLSOVER.y})`}
              onClick={() => openPoint(bolsoverPoint)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  openPoint(bolsoverPoint);
                }
              }}
            >
              {selectedPoint?.id === "bolsover" && (
                <>
                  <circle r={43 + 18} fill="#BA9D81" className="location-pointer-pulse-ring" />
                  <circle r={43 + 8} fill="none" stroke="#BA9D81" strokeWidth="3" className="location-pointer-ring" />
                </>
              )}
              <circle r="43" className="bolsover-marker-outer" />
              <circle r="29" className="bolsover-marker-inner" />
              <text y="7" textAnchor="middle">B</text>
              <g transform="translate(58 -23)" className="bolsover-marker-label">
                <rect width="232" height="54" />
                <text x="18" y="23">THE BOLSOVER</text>
                <text x="18" y="43">3-8 BOLSOVER STREET</text>
              </g>

              {selectedPoint?.id === "bolsover" && (
                <g className="location-pin-icon-bolsover">
                  <path
                    d="M 0 36 C -14 18 -22 4 -22 -16 C -22 -32 -12 -42 0 -42 C 12 -42 22 -32 22 -16 C 22 4 14 18 0 36 Z"
                    fill="#BA9D81"
                    stroke="#FFFFFF"
                    strokeWidth="3.5"
                    className="location-pin-path"
                  />
                  <circle cx="0" cy="-16" r="11" fill="#FFFFFF" />
                  <path
                    d="M0 -21 C-3.3 -21 -6 -18.3 -6 -15 C-6 -10 0 -4.5 0 -4.5 C0 -4.5 6 -10 6 -15 C6 -18.3 3.3 -21 0 -21 Z M0 -13.5 C-0.8 -13.5 -1.5 -14.2 -1.5 -15 C-1.5 -15.8 -0.8 -16.5 0 -16.5 C0.8 -16.5 1.5 -15.8 1.5 -15 C1.5 -14.2 0.8 -13.5 0 -13.5 Z"
                    fill="#BA9D81"
                  />
                </g>
              )}
            </g>
          </svg>
        </div>

        <div className="location-map-heading">
          <p>Fitzrovia W1</p>
          <h2 id="map-scene-title">The neighbourhood map</h2>
        </div>

        <div className="location-map-controls" aria-label="Map controls">
          <button type="button" onClick={() => changeZoom(scale + 0.2)} aria-label="Zoom in">+</button>
          <button type="button" onClick={() => changeZoom(scale - 0.2)} aria-label="Zoom out">−</button>
          <button type="button" onClick={resetMap} className="location-map-reset">Centre</button>
        </div>

        <aside
          className={`location-map-panel ${mobilePanelOpen ? "is-open" : ""} ${activeCategory !== "all" ? "has-category" : ""}`}
          aria-label="Map categories and place details"
        >
          <button
            type="button"
            className="location-panel-mobile-toggle"
            onClick={() => setMobilePanelOpen((open) => !open)}
            aria-expanded={mobilePanelOpen}
          >
            <span>Explore nearby</span>
            <span aria-hidden="true">{mobilePanelOpen ? "↓" : "↑"}</span>
          </button>

          <div className="location-panel-content">
            <button
              type="button"
              className="location-panel-intro text-left w-full hover:opacity-80 transition-opacity cursor-pointer"
              onClick={() => openPoint(bolsoverPoint)}
              aria-label="Select The Bolsover on map"
            >
              <p>3-8 Bolsover Street</p>
              <strong>Explore Fitzrovia</strong>
            </button>

            <nav className="location-category-list" aria-label="Filter nearby places">
              {categories.map((category) => {
                const count = category.id === "all" ? points.length : points.filter((point) => point.category === category.id).length;
                return (
                  <button
                    key={category.id}
                    type="button"
                    className={activeCategory === category.id ? "is-active" : ""}
                    onClick={() => chooseCategory(category.id)}
                    aria-pressed={activeCategory === category.id}
                  >
                    <span className="location-category-colour" style={{ backgroundColor: category.colour }} />
                    <span>{category.label}</span>
                    <span className="location-category-count">{String(count).padStart(2, "0")}</span>
                  </button>
                );
              })}
            </nav>

            {activeCategory !== "all" && !selectedPoint && (
              <button type="button" className="location-mobile-category-back" onClick={() => chooseCategory("all")}>
                <span>All categories</span>
                <strong>{categories.find((category) => category.id === activeCategory)?.label}</strong>
              </button>
            )}

            {categoryPlaces.length > 0 && !selectedPoint && (
              <div className="location-place-list" aria-label={`${activeCategory} places`}>
                {categoryPlaces.map((point) => (
                  <button key={point.id} type="button" onClick={() => openPoint(point)}>
                    <span>{point.name}</span>
                    <span aria-hidden="true">↗</span>
                  </button>
                ))}
              </div>
            )}

            {selectedPoint && (
              <div className="location-selected-place" aria-live="polite">
                <button type="button" onClick={() => setSelectedPoint(null)} className="location-selected-back">
                  Back to {categories.find((category) => category.id === activeCategory)?.label.toLowerCase()}
                </button>
                <p>{selectedPoint.id === "bolsover" ? "The Bolsover Residence" : categories.find((category) => category.id === selectedPoint.category)?.label}</p>
                <h3>{selectedPoint.name}</h3>
                {selectedPoint.address && <address>{selectedPoint.address}</address>}
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${selectedPoint.lat},${selectedPoint.lon}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open in Google Maps <span aria-hidden="true">↗</span>
                </a>
              </div>
            )}

            <div className="location-map-attribution">
              Map data © OpenStreetMap contributors
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
};
