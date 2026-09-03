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

// Real US + Canada outline — Natural Earth 1:110m (public domain), projected to
// the 780×450 viewBox (d3-geo conic conformal, cropped to ~lat 23–71 / lon
// -150–-50, far-Arctic islands dropped, mild horizontal stretch), then
// simplified. Static data: no map library or tiles at runtime. Regenerate with
// `scripts/gen-portfolio-map-path.mjs`.
const LAND_PATH =
  "M216.3,71.2L221.5,75.1L224.8,80.4L228.1,82.2L233.1,80.3L238.8,79.4L243.6,81.8L250.7,80.1L257.6,79.8L258.5,83.5L262,82.5L264.6,79.2L266.6,80.6L269.7,88.7L276.8,84.6L274.8,90.5L279.9,90.2L282.2,88.2L286.5,89.5L291.1,93.8L299.1,98L304,100.1L308,100.1L312.2,104.7L305.7,107.7L312.5,110.2L323.6,110.5L327.3,109.5L330.8,114.5L335.9,111L332.3,107.4L335.3,105L340.2,105L343.4,104.5L346.4,106.5L350,110.9L354.6,110.5L361.5,114.2L367.9,113.1L373.9,113.3L373.4,108.6L377,107.2L383.3,109.8L383.5,117L385.9,110.9L389.1,111L390.5,103.2L386.1,98.5L381.5,95.4L381.6,88.2L396,87.8L400.3,94L397.2,98.1L404.6,99.3L405.5,107.2L410,100.8L415.4,105.4L415.1,111.1L419.9,115.9L423.2,110.1L424.8,103.3L423.4,94.8L428.9,94.8L434.8,95.3L440.9,98.5L442.1,102.2L440.2,106.6L444.1,110.2L444.5,113.9L437.7,120.1L432.1,121.9L427.3,120.1L426.8,123.9L423.7,130.5L423,133.8L418.6,139.1L412.2,140L409,143.3L409.3,148L404,149.2L398.7,155.2L394,163.4L392.4,169L392.6,177.1L400.2,178L403,184.4L405.9,189.5L413.1,187.8L423.3,190.1L429,192.3L433.4,195.2L440.4,196.5L446.7,198.8L455.8,198.2L461.8,198.1L462.4,204L465.8,210.5L471.8,217.3L482.1,222.4L485.9,219.6L486.9,212.4L480.9,202.5L476,199.5L483.7,195.2L488.2,189.5L489.6,184.4L487.6,180L482.2,174.9L474.5,170.8L478,162.7L473.9,156.9L468.8,146.3L471.5,144.2L480,144.7L485,144.6L488.1,142L493.2,143.5L500.5,146.3L503.1,148.7L511.5,147.3L514,153L519.5,161L524.4,161L529.8,164L535,158.6L535.7,150.2L537.1,146.4L544,151.2L554.9,157.6L564.8,163.6L565.2,168.2L574,169.7L580.7,171.8L589.7,170.8L594.3,171.7L599.8,176.1L604.3,175.6L608,177.1L613.2,183.7L611,187.3L608.7,190.7L601.3,195.8L597.7,202.9L588.9,206.8L576.2,208.9L567.8,211.2L562.2,213.2L559.7,218.8L553.7,223.4L549.1,233.7L544.7,241L549.4,238.8L555.2,228.4L564.8,220.2L573.1,217.3L579.8,219L576.6,224.6L582.1,230.7L586.6,234.8L596.1,235.6L605.5,231.9L607.2,223.3L610.3,227.5L615.5,228.5L610.6,234.7L599.4,242.3L594.6,246.4L590.1,252.7L585.1,253.5L582.1,248.4L590.1,240.5L580.4,243.3L573.9,245.8L576,247.5L570.9,252.2L565.4,255.9L559.6,259.2L557.8,263.7L557.4,265.3L558.7,268.6L562.4,271.5L565.2,271L563.5,268.9L566,269.8L566.3,271.7L562.3,273.7L559.1,274.3L554.7,276.4L551.9,277.3L548.1,278.4L543.3,281.4L552.6,278.2L555.1,279L546.5,282.8L542.2,283.6L542.1,282.8L540.7,284.9L542.8,284.8L543.1,289.6L539.8,295.4L538.7,293.9L537.1,293.9L534.3,292.7L536.9,295.8L539.1,296.6L540.1,299L538.7,301.8L536.5,307.6L535.8,307.5L536.4,302.8L532,301L529.3,295.9L528.9,298.8L531.8,302.6L526.8,302.4L532.4,303.6L534.8,309.6L537,309.7L538.5,311.7L541.8,317.9L538.8,323.4L531.7,326.5L528,331.1L524.4,332.1L521.3,335L520.9,337.3L513.7,342.7L510.2,346.3L507.5,350.7L507.5,355.4L510.1,359.7L514.3,364.9L519.1,369L520,371.8L526,378.8L527,383.3L527.3,385.9L526.4,390.2L524.1,391.4L519.7,391.1L517.6,388.4L514,387.3L508.1,382.2L503.1,377.7L501.2,375.3L501.8,370.7L498.7,367.4L491.1,362.7L487.8,362L480.3,365.9L478.8,365.7L474.3,363L469,361.9L460.1,363.5L452.8,363.3L446.8,364.2L443.6,365.4L445.3,367.1L445.5,369.8L447.4,370.9L446,371.9L442.8,371.1L439.9,372.6L434,372.7L427.5,369.6L420.5,370.7L414.5,369.4L409.5,370.1L402.7,371.8L395.5,376.9L387.3,379.9L382.8,383.1L381,386.1L380.9,390.6L381.4,393.8L383,396.1L379.7,396.3L373.7,394.9L367,392.7L364.7,389.6L363,384.9L358.2,381.1L355.4,377.1L351.5,372.5L345.9,369.8L339.3,369.7L333.7,374.7L327.1,372.4L323.1,370.2L321.5,366.5L319.2,362.9L314.8,359.8L311,357.5L308.4,354.9L294.7,353.9L294.3,356.6L288,356.1L272.3,354.7L255.4,348.1L244.6,343.5L245.6,342.3L235.7,341.7L226.8,340.9L226.5,337.4L222.8,333L219.5,331.7L219.3,329.7L215.2,328.7L213.1,326.5L206.4,324.7L204.9,323.4L205.3,319.7L200.6,312.1L198,302.2L198.8,300.8L196.6,298.1L193.3,291.8L194.5,286.5L192.3,282.3L196,277.5L198,272.1L198,266.9L203,261.5L206.2,256L209.4,250.5L211.8,241.8L212.2,236L211.7,232.7L212.9,231.6L220.7,235.6L221.5,242.2L223.7,240.8L224.8,235.4L224.8,229.8L224,229.6L215.3,221.1L212.4,217.4L203.3,212.4L202.9,206.1L205.6,202.4L200,198L201.6,192.7L197.6,186.4L199.3,183.1L197.7,180L194.3,176.7L196,170.8L192.6,163.9L193.6,157.1L189.3,155.3L181.9,152.8L177.6,149.2L172.6,139.4L169.1,136.7L163.1,131.7L156.6,129.9L150.5,123.6L147.6,119L141.9,118.2L139.1,122.8L136.4,122.1L130.4,121.2L128.7,121.2L191.1,53.7L192.1,53.9L197,59L202.7,62.3L204.5,64.2L209.8,64.8L213.3,68.8ZM617.2,188.5L617,193.2L617.1,199.7L619.2,196.4L623.8,196.4L623.3,199.1L629.3,199L630.8,196.7L637.5,196.5L639.1,201.4L642.1,198.9L645.2,201.7L649.7,204.6L651.3,210.6L648.9,211.8L644.4,212.1L642,206.9L639.9,206.7L637.1,214.2L633.6,215.2L635.6,211L629.2,211.5L623.3,214L612.2,217.4L610.1,215.9L612.3,212.7L608.8,211.9L611.1,206.7L610.3,195.3L611.3,190.8L614.4,187.1L617,186.5ZM437.6,129.9L442.9,131.8L448.5,133.5L449.8,136.8L452.9,135.8L456.8,137.8L453.4,140.5L446,139.7L442.7,136.8L439.1,141.1L433.4,145.5L431,141.5L425,142.7L428.3,138.8L427.8,133L428,126.2L431.2,126.5L432.7,129.6L434.7,128.3ZM219.6,232.1L216.2,232.4L207.7,227.4L207,224.8L202.8,221.4L202.6,219.4L197.2,216.8L196.7,212.9L197.9,211.6L203.2,214.4L206.3,216.1L211.3,218L212.3,220.6L213.9,224.3L218.6,228.1Z";

// Internal borders, both clipped to the landmass at render time.
const US_CA_BORDER =
  "M199.3,183.1L203.8,180.8L205.7,176.8L199.4,170.4L198.5,161.7L198.1,156.3L195.5,152.1L194,148.5L193.6,144.5L187.7,145.1L180.9,147.2L179.6,141.7L178.3,137.8L175.2,134.6L171,132.8L197.8,96.3L216.3,71.2M573.9,245.8L568.2,243.3L564,234.9L560.5,233.7L557,235.7L554.2,234.6L551.8,240.3L552.1,245.6L551.2,248.9L549,250.5L547.1,251.2L547.1,252.9L535.5,255.3L525.9,257.2L523.5,258.9L518.3,264.6L517.7,265.2L516.4,268.1L510.4,269.1L504,270.1L501.4,271.5L502.8,272.6L504,274.5L504.1,275.2L496.3,279.6L489.6,281.6L482.6,286L480.9,286.2L478.4,285.5L477.4,284.6L477.4,283.9L478.3,281.5L480.6,277.6L481.6,273.6L478.9,268.1L476.1,262.5L468.7,260.2L469.2,259L468.1,258.3L466.3,258.5L464.8,257.6L464.2,256.1L463.1,256.9L461.3,256.9L461.6,256.2L460,255.7L459,254.1L453.7,252.5L448.2,250.8L441.7,248.8L435.5,246.9L430.2,249.1L428.2,249.3L420.3,248.1L415.4,249.2L409.1,247.5L402.7,246.7L398.4,246.4L396.4,245.3L395.2,241.7L393.1,241.8L393.2,244.3L309.2,236.2L224.8,229.8";

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
        <linearGradient id="pm-land-gradient" x1="0.1" y1="0" x2="0.7" y2="1">
          <stop offset="0%" stopColor="#403c39" />
          <stop offset="55%" stopColor="#3b3937" />
          <stop offset="100%" stopColor="#4a4030" />
        </linearGradient>
        {/* Soft light from the upper-left so the landmass reads as a surface,
            not a flat cut-out. */}
        <radialGradient id="pm-land-sheen" cx="0.3" cy="0.22" r="0.85">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.09" />
          <stop offset="55%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
        <pattern
          id="pm-ocean-grid"
          width="32"
          height="32"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M32 0 L0 0 0 32"
            fill="none"
            stroke="#e2dfd6"
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
            dy="12"
            stdDeviation="16"
            floodColor="#000000"
            floodOpacity="0.14"
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
      <path
        d={LAND_PATH}
        fill="url(#pm-land-sheen)"
        style={{ pointerEvents: "none" }}
      />

      {/* Dashed US/Canada border, clipped to the landmass — non-interactive so
          map clicks fall through to the zoom-out handler on <svg>. Non-scaling
          stroke so it stays a hairline at the zoomed-in viewBox. */}
      <g clipPath="url(#pm-land-clip)" style={{ pointerEvents: "none" }}>
        <path
          d={US_CA_BORDER}
          fill="none"
          stroke="var(--color-warm-white)"
          strokeWidth="1"
          strokeDasharray="5 5"
          opacity="0.38"
          vectorEffect="non-scaling-stroke"
        />
      </g>

      {/* Country labels — light type on the dark fill, centred on each mass. */}
      <g
        style={{ pointerEvents: "none" }}
        fill="var(--color-warm-white)"
        fontWeight="300"
      >
        <text
          x="362"
          y="162"
          textAnchor="middle"
          fontSize="11"
          opacity="0.4"
          style={{ letterSpacing: "0.32em" }}
        >
          CANADA
        </text>
        <text
          x="432"
          y="300"
          textAnchor="middle"
          fontSize="11"
          opacity="0.36"
          style={{ letterSpacing: "0.32em" }}
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
