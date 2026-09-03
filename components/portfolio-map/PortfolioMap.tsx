"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  CATEGORY_COLOR,
  CITIES,
  PROJECTS,
  type PortfolioCity,
} from "@/lib/portfolioMapData";
import { onActivateKey, prefersReducedMotion, projectCount } from "./helpers";

interface PortfolioMapProps {
  /** `"all"` for the full view, or a `PortfolioCity.key` for a zoomed cluster. */
  activeCity: string;
  onSelectCity: (key: string) => void;
  onSelectProject: (id: number) => void;
}

type ViewBox = { x: number; y: number; w: number; h: number };

const FULL_VIEW: ViewBox = { x: 0, y: 0, w: 780, h: 450 };
const ZOOM_W = 320;
const ZOOM_H = 184.6;
const PETAL_DIST = 42;
const LABEL_DIST = 60;
const ANIM_MS = 600;

// Hand-derived coastline — copied verbatim from the approved concept so the
// production map doesn't drift from what was signed off (plan §6.3).
const LAND_PATH =
  "M98.6,68.5 L98.6,199.1 L178.6,300.7 L224.3,329.7 L304.3,318.1 L407.1,402.3 L407.1,373.2 L487.1,358.7 L555.7,344.2 L578.6,387.8 L599.1,405.2 L601.4,344.2 L624.3,286.2 L647.1,242.6 L658.6,213.6 L700,235 L715.7,170.1 L750,126.6 L704.3,104.8 L647.1,141.1 L567.1,112.1 L521.4,126.6 L430,68.5 L258.6,68.5 Z";

// Dashed US / Canada border (open path).
const BORDER_PATH =
  "M258.6,68.5 L430,68.5 L521.4,119.3 L567.1,141.1 L612.9,165.7 L635.7,151.2 L704.3,126.6 L744.3,112.1";

// Decorative interior wireframe: the 7 anchor points from plan §6.3 meshed to
// each other and to nearby coastline vertices. Purely cosmetic — clipped to the
// landmass so nothing spills into the ocean.
const FACET_LINES: [number, number, number, number][] = [
  // anchor ↔ anchor
  [330, 205, 480, 205],
  [480, 205, 620, 205],
  [330, 330, 480, 330],
  [480, 330, 620, 300],
  [330, 205, 330, 330],
  [480, 205, 480, 330],
  [620, 205, 620, 300],
  [330, 205, 480, 330],
  [480, 205, 330, 330],
  [480, 205, 620, 300],
  [620, 205, 480, 330],
  [330, 330, 430, 380],
  [480, 330, 430, 380],
  [620, 300, 430, 380],
  [480, 205, 430, 380],
  // anchors ↔ coastline vertices
  [330, 205, 258.6, 68.5],
  [330, 205, 430, 68.5],
  [330, 205, 98.6, 199.1],
  [330, 205, 224.3, 329.7],
  [480, 205, 430, 68.5],
  [480, 205, 521.4, 126.6],
  [480, 205, 567.1, 112.1],
  [620, 205, 567.1, 112.1],
  [620, 205, 647.1, 141.1],
  [620, 205, 658.6, 213.6],
  [620, 205, 715.7, 170.1],
  [330, 330, 178.6, 300.7],
  [330, 330, 224.3, 329.7],
  [330, 330, 304.3, 318.1],
  [330, 330, 98.6, 199.1],
  [480, 330, 304.3, 318.1],
  [480, 330, 407.1, 373.2],
  [480, 330, 487.1, 358.7],
  [620, 300, 555.7, 344.2],
  [620, 300, 601.4, 344.2],
  [620, 300, 624.3, 286.2],
  [620, 300, 647.1, 242.6],
  [430, 380, 407.1, 402.3],
  [430, 380, 407.1, 373.2],
  [430, 380, 304.3, 318.1],
  [430, 380, 487.1, 358.7],
  [430, 380, 555.7, 344.2],
];

function parseViewBox(svg: SVGSVGElement): ViewBox {
  const parts = (svg.getAttribute("viewBox") ?? "0 0 780 450")
    .split(/[\s,]+/)
    .map(Number);
  return { x: parts[0], y: parts[1], w: parts[2], h: parts[3] };
}

function zoomFor(city: PortfolioCity): ViewBox {
  return {
    x: city.x - ZOOM_W / 2,
    y: city.y - ZOOM_H / 2,
    w: ZOOM_W,
    h: ZOOM_H,
  };
}

export function PortfolioMap({
  activeCity,
  onSelectCity,
  onSelectProject,
}: PortfolioMapProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const [hoverPetal, setHoverPetal] = useState<number | null>(null);

  const selectedCity = useMemo(
    () => CITIES.find((c) => c.key === activeCity) ?? null,
    [activeCity],
  );

  const cityProjects = useMemo(
    () =>
      selectedCity
        ? PROJECTS.filter((p) => p.city === selectedCity.key)
        : [],
    [selectedCity],
  );

  // Precompute each petal's position, its hover-label anchor point, and which
  // way the label text should align (away from the cluster centre).
  const petalGeom = useMemo(
    () =>
      cityProjects.map((_, i) => {
        const angle = ((-90 + i * (360 / cityProjects.length)) * Math.PI) / 180;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        return {
          px: cos * PETAL_DIST,
          py: sin * PETAL_DIST,
          lx: cos * LABEL_DIST,
          ly: sin * LABEL_DIST,
          anchor: cos < -0.01 ? ("end" as const) : ("start" as const),
        };
      }),
    [cityProjects],
  );

  // Animate the viewBox toward the target whenever the selection changes. Not a
  // CSS transition — viewBox isn't animatable that way — so drive it with rAF
  // and an ease-in-out cubic. Under prefers-reduced-motion, jump straight there.
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const target = selectedCity ? zoomFor(selectedCity) : FULL_VIEW;

    if (prefersReducedMotion()) {
      svg.setAttribute(
        "viewBox",
        `${target.x} ${target.y} ${target.w} ${target.h}`,
      );
      return;
    }

    const from = parseViewBox(svg);
    const start = performance.now();

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / ANIM_MS);
      const e =
        t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; // easeInOutCubic
      svg.setAttribute(
        "viewBox",
        [
          from.x + (target.x - from.x) * e,
          from.y + (target.y - from.y) * e,
          from.w + (target.w - from.w) * e,
          from.h + (target.h - from.h) * e,
        ].join(" "),
      );
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [selectedCity]);

  // Drop a stale hover highlight when the cluster changes — reset during render
  // rather than in an effect (see React docs: "adjusting some state when a prop
  // changes"), the same pattern Navbar uses for route changes.
  const [lastActiveCity, setLastActiveCity] = useState(activeCity);
  if (activeCity !== lastActiveCity) {
    setLastActiveCity(activeCity);
    setHoverPetal(null);
  }

  const zoomedOut = () => {
    if (activeCity !== "all") onSelectCity("all");
  };

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 780 450"
      xmlns="http://www.w3.org/2000/svg"
      className="block h-auto w-full select-none"
      role="group"
      aria-label="Map of North America — select a city to see Rose Hill's projects there"
      onClick={zoomedOut}
    >
      <defs>
        <linearGradient id="pm-land-gradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#42393a" />
          <stop offset="100%" stopColor="#4a3a22" />
        </linearGradient>
        <pattern
          id="pm-ocean-grid"
          width="26"
          height="26"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M26 0 L0 0 0 26"
            fill="none"
            stroke="#d9d6cd"
            strokeWidth="1"
          />
        </pattern>
        <filter
          id="pm-land-shadow"
          x="-30%"
          y="-30%"
          width="160%"
          height="160%"
        >
          <feDropShadow
            dx="0"
            dy="8"
            stdDeviation="10"
            floodColor="#000000"
            floodOpacity="0.18"
          />
        </filter>
        <clipPath id="pm-land-clip">
          <path d={LAND_PATH} />
        </clipPath>
      </defs>

      {/* Oversized so zooming toward a corner never reveals blank canvas. */}
      <rect
        x="-300"
        y="-300"
        width="1380"
        height="1050"
        fill="var(--color-warm-white)"
      />
      <rect
        x="-300"
        y="-300"
        width="1380"
        height="1050"
        fill="url(#pm-ocean-grid)"
      />

      <path
        d={LAND_PATH}
        fill="url(#pm-land-gradient)"
        stroke="var(--color-gold)"
        strokeWidth="1.4"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        filter="url(#pm-land-shadow)"
      />

      {/* Decorative wireframe + border, clipped to the landmass — non-interactive
          so map clicks fall through to the zoom-out handler on <svg>. Strokes are
          non-scaling so the coastline stays crisp at the zoomed-in viewBox. */}
      <g clipPath="url(#pm-land-clip)" style={{ pointerEvents: "none" }}>
        {FACET_LINES.map(([x1, y1, x2, y2], i) => (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="var(--color-gold)"
            strokeWidth="0.6"
            opacity="0.16"
            vectorEffect="non-scaling-stroke"
          />
        ))}
        <path
          d={BORDER_PATH}
          fill="none"
          stroke="var(--color-warm-white)"
          strokeWidth="1"
          strokeDasharray="5 5"
          opacity="0.4"
          vectorEffect="non-scaling-stroke"
        />
      </g>

      {/* Region labels — outside the clip so "CANADA" (which sits above the
          coastline) still shows. */}
      <g
        style={{ pointerEvents: "none" }}
        fill="var(--color-medium-grey)"
        fontSize="11"
        fontWeight="300"
      >
        <text x="555" y="88" style={{ letterSpacing: "0.3em" }}>
          CANADA
        </text>
        <text
          x="255"
          y="235"
          fill="var(--color-warm-white)"
          opacity="0.32"
          style={{ letterSpacing: "0.3em" }}
        >
          UNITED STATES
        </text>
      </g>

      {activeCity === "all"
        ? CITIES.map((city) => (
            <DefaultMarker
              key={city.key}
              city={city}
              count={projectCount(city.key)}
              onSelect={() => onSelectCity(city.key)}
            />
          ))
        : selectedCity && (
            <g transform={`translate(${selectedCity.x} ${selectedCity.y})`}>
              {/* pulsing hub ring */}
              <circle
                className="map-pin-pulse"
                cx="0"
                cy="0"
                r="7"
                fill="none"
                stroke="var(--color-gold)"
                strokeWidth="1.5"
                style={{ pointerEvents: "none" }}
              />

              {/* stems */}
              {petalGeom.map(({ px, py }, i) => (
                <line
                  key={`stem-${cityProjects[i].id}`}
                  x1="0"
                  y1="0"
                  x2={px}
                  y2={py}
                  stroke="var(--color-gold)"
                  strokeWidth="0.75"
                  opacity="0.5"
                />
              ))}

              {/* hub — click / Enter to zoom back out */}
              <circle
                cx="0"
                cy="0"
                r="9"
                fill="var(--color-gold)"
                stroke="var(--color-warm-white)"
                strokeWidth="1.5"
                role="button"
                tabIndex={0}
                aria-label={`Zoom out from ${selectedCity.name}`}
                className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold focus-visible:outline-offset-2"
                style={{ cursor: "pointer" }}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectCity("all");
                }}
                onKeyDown={(e) =>
                  onActivateKey(e, () => onSelectCity("all"))
                }
              />

              {/* petals — one per project in this city */}
              {cityProjects.map((project, i) => {
                const { px, py } = petalGeom[i];
                return (
                  <g
                    key={project.id}
                    transform={`translate(${px} ${py})`}
                  >
                    <g
                      className="map-cluster-bloom"
                      style={{
                        transformBox: "fill-box",
                        transformOrigin: "center",
                        animationDelay: `${i * 45}ms`,
                      }}
                    >
                      <circle
                        r="8"
                        fill={CATEGORY_COLOR[project.category]}
                        stroke="var(--color-warm-white)"
                        strokeWidth="1.5"
                        role="button"
                        tabIndex={0}
                        aria-label={`View project: ${project.name}`}
                        className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold focus-visible:outline-offset-2"
                        style={{ cursor: "pointer" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectProject(project.id);
                        }}
                        onKeyDown={(e) =>
                          onActivateKey(e, () =>
                            onSelectProject(project.id),
                          )
                        }
                        onMouseEnter={() => setHoverPetal(project.id)}
                        onMouseLeave={() => setHoverPetal(null)}
                        onFocus={() => setHoverPetal(project.id)}
                        onBlur={() => setHoverPetal(null)}
                      />
                    </g>
                  </g>
                );
              })}

              {/* hover / focus label for the active petal */}
              {hoverPetal != null &&
                (() => {
                  const i = cityProjects.findIndex(
                    (p) => p.id === hoverPetal,
                  );
                  if (i < 0) return null;
                  const { lx, ly, anchor } = petalGeom[i];
                  const label = truncate(cityProjects[i].name);
                  const tw = label.length * 5 + 8;
                  return (
                    <g style={{ pointerEvents: "none" }}>
                      <rect
                        x={anchor === "end" ? lx - tw + 4 : lx - 4}
                        y={ly - 8}
                        width={tw}
                        height="15"
                        fill="var(--color-warm-white)"
                        opacity="0.92"
                      />
                      <text
                        x={lx}
                        y={ly}
                        textAnchor={anchor}
                        dominantBaseline="middle"
                        fontSize="9"
                        fontWeight="500"
                        fill="var(--color-dark)"
                        style={{ letterSpacing: "0.04em" }}
                      >
                        {label}
                      </text>
                    </g>
                  );
                })()}
            </g>
          )}
    </svg>
  );
}

function truncate(name: string): string {
  return name.length > 12 ? `${name.slice(0, 12).trimEnd()}…` : name;
}

function DefaultMarker({
  city,
  count,
  onSelect,
}: {
  city: PortfolioCity;
  count: number;
  onSelect: () => void;
}) {
  const label = `${city.shortLabel} · ${count}`;
  const chipW = label.length * 6 + 14;
  const dir = city.labelDir === "left" ? -1 : 1;

  return (
    <g
      transform={`translate(${city.x} ${city.y})`}
      role="button"
      tabIndex={0}
      aria-label={`View projects in ${city.name} (${count})`}
      className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold focus-visible:outline-offset-2"
      style={{ cursor: "pointer" }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onKeyDown={(e) => onActivateKey(e, onSelect)}
    >
      {/* comfortable hit area around the diamond */}
      <circle r="13" fill="transparent" />

      <line
        x1={7 * dir}
        y1="0"
        x2={13 * dir}
        y2="0"
        stroke="var(--color-dark)"
        strokeWidth="1"
        opacity="0.55"
      />
      <rect
        x={dir === 1 ? 13 : -13 - chipW}
        y="-8"
        width={chipW}
        height="16"
        fill="var(--color-dark)"
      />
      <text
        x={dir === 1 ? 20 : -20}
        y="0"
        textAnchor={dir === 1 ? "start" : "end"}
        dominantBaseline="middle"
        fontSize="10"
        fontWeight="500"
        fill="var(--color-warm-white)"
        style={{ letterSpacing: "0.1em" }}
      >
        {label}
      </text>

      {/* gold diamond */}
      <path
        d="M0,-6 L6,0 L0,6 L-6,0 Z"
        fill="var(--color-gold)"
        stroke="var(--color-warm-white)"
        strokeWidth="1.5"
      />
    </g>
  );
}
