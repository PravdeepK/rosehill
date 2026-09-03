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

// Real North America — Natural Earth 1:110m (public domain), projected to the
// 780×450 viewBox (d3-geo conic conformal, clipped to ~lat 6–58 / lon -150–-50,
// mild horizontal stretch), then simplified. Static data: no map library or
// tiles at runtime. Regenerate with `scripts/gen-portfolio-map-path.mjs`.
const LAND_PATH =
  "M370.9,67.2L371.4,68.3L374.4,73.6L381.8,71.8L392.3,74.3L398.1,76.6L402.6,79.7L409.8,81L416.2,83.4L425.5,82.8L431.7,82.8L432.2,88.9L435.6,95.6L441.7,102.8L452.2,108.1L456.1,105.2L457.3,97.8L451.2,87.4L446.2,84.4L454.2,79.8L458.9,74L460.4,68.7L458.4,64.1L453.3,59.1L529.4,42.3L538.1,47.8L538.4,52.6L547.3,54.3L554.2,56.6L563.5,55.6L568.1,56.6L573.7,61.3L578.3,60.8L582,62.4L587.1,69.4L584.8,73L582.3,76.5L574.6,81.7L570.7,89.1L561.7,93L548.7,95.1L540,97.3L534.2,99.3L531.6,105.1L525.3,109.8L520.4,120.4L515.8,127.9L520.6,125.7L526.7,115L536.8,106.6L545.3,103.7L552.1,105.5L548.7,111.2L554.2,117.6L558.7,121.9L568.3,122.9L578,119.1L579.9,110.3L583,114.7L588.3,115.8L583.1,122.1L571.5,129.8L566.6,134L561.8,140.4L556.7,141.2L553.8,135.9L562.1,127.8L552.1,130.6L545.5,133.1L547.6,135L542.3,139.7L536.6,143.4L530.6,146.9L528.8,151.4L528.2,153.1L529.6,156.5L533.2,159.5L536.1,159L534.4,156.8L537,157.8L537.2,159.8L533.1,161.8L529.8,162.4L525.3,164.5L522.5,165.4L518.6,166.5L513.6,169.5L523.2,166.3L525.7,167.2L516.9,171L512.5,171.8L512.4,171L511,173.2L513.1,173.1L513.3,178L509.9,183.9L508.8,182.4L507.2,182.3L504.3,181.1L507,184.3L509.1,185.2L510.1,187.6L508.7,190.5L506.4,196.4L505.6,196.3L506.4,191.5L501.9,189.6L499.3,184.3L498.8,187.4L501.7,191.3L496.6,191L502.2,192.3L504.6,198.5L506.8,198.6L508.3,200.7L511.5,207L508.4,212.6L501.2,215.8L497.5,220.5L493.8,221.5L490.6,224.4L490.1,226.8L482.8,232.3L479.2,236L476.5,240.4L476.4,245.3L479,249.7L483.1,255L488,259.2L488.8,262.1L494.8,269.3L495.7,273.9L496,276.5L495,280.9L492.7,282.1L488.3,281.8L486.2,279L482.6,277.9L476.7,272.7L471.7,268L469.8,265.5L470.5,260.9L467.4,257.5L459.8,252.6L456.5,251.9L448.9,255.8L447.4,255.6L442.8,252.9L437.5,251.7L428.5,253.3L421.2,253.1L415.1,254L411.9,255.3L413.5,256.9L413.7,259.7L415.7,260.9L414.2,261.9L411,261.1L408.1,262.5L402.1,262.7L395.6,259.4L388.6,260.6L382.5,259.3L377.4,259.9L370.6,261.7L363.3,266.9L355.1,269.9L350.5,273.2L348.7,276.2L348.6,280.9L349.1,284.2L350.7,286.5L347.5,292.5L345.9,297.4L345.3,306.6L344.5,310L346,313.8L348.9,317.2L350.8,322.5L356.9,327.7L359.2,331.6L362.9,335L372.9,336.7L376.9,339.6L385,337.3L392,336.4L398.9,334.8L404.7,333.3L410.2,330.2L412,326L412.1,320.1L413.4,318L419.3,315.8L428.7,313.5L436.6,313.2L442,312.2L444.4,313.4L444.7,316.8L440.5,321.3L438.9,325.7L440.8,326.8L439.9,329.9L438.4,335.5L435.8,333.9L433.9,334.2L434,335.2L435.8,335.1L435.9,337L434.9,340.2L435.8,341.2L435.2,343.8L435.9,344.4L435.3,348.1L433.7,350.1L432,350.5L430.5,353.1L433.8,354.1L434.4,353L437.4,353.7L438.4,353.9L440.4,352.5L443.1,352.2L444.1,352.7L445.5,352.2L450,352.5L454.4,351.9L457.4,350.9L458.3,350L461.4,350.1L463.8,350.3L466.3,349.9L468,349.1L472.6,349.7L474.1,349.7L477.3,350.7L480.4,352L484.1,352.7L487.1,354.3L486.4,355.1L486.3,356.8L487.8,359.2L486.1,361.9L485.7,364.9L486.1,368.1L487,369.9L488,373.1L486.6,374L486.3,377.2L487.4,379.1L485.8,381.1L486.6,383.1L488.5,384.1L491.9,387.8L496.4,390.3L501.9,392.9L506.2,395.1L506.3,396.7L510.5,396.5L511.3,395.8L514.6,397.3L519.5,396.1L523.4,393.6L529.1,391.3L532,388.6L537.7,388.3L537.5,389L543.2,388.5L548.1,389.1L552,390.7L556.5,392.2L555.6,393.4L559.3,397.4L558.1,399.9L554.6,399.9L554.4,403.7L550.3,402.1L546.9,398.4L548.8,396.1L546.1,396L543.5,393.8L537.8,392.5L533.5,393.6L532.1,396.5L528.5,398.9L526.3,399.4L525.7,401.1L531.7,404.5L529.2,405.8L528,407.1L523.2,408.2L520.3,403.9L519.3,405.4L515.7,405.4L512.9,402.6L508.6,402.7L505.7,402.1L501.3,402.7L501.3,404.3L499.9,403.3L493.9,402.3L491.5,401L492.4,399.5L491.7,398L488.4,396.5L484.1,395.5L480.5,394.9L479.3,392.8L476.4,391.7L477.5,393.8L475.8,395.8L473.1,394L469.7,393.5L468,392.2L467.7,389.9L468.5,387.5L465.5,386.7L467.6,385.1L463.7,383.1L458.5,380.6L455.9,378.3L451.3,376.4L445.8,373.5L446.8,372.3L448.6,373.3L449.2,372.7L447.2,370.6L444.1,370.2L443.3,372L437.5,372.3L433.9,371.8L429.6,370.7L424.1,370.6L421.1,369.2L416,368.2L409.8,368.4L405.2,367.2L399.7,364.5L388.1,357.2L383,355.1L375.1,353.4L369.7,354L362.1,356.9L357.3,357.6L350.4,355.8L343.2,354.5L334.3,351.2L327.2,350.1L316.5,346.6L308.8,343L306.5,341.1L301.3,340.5L291.9,337.9L288.2,334.5L278.6,330.1L274.5,325.4L272.7,321.9L275.8,321.4L275.1,319.4L277.4,317.7L277.7,315.3L275,312L274.5,309.2L271.9,305.6L265,298.3L257,292.3L253.4,287.7L246.5,284.4L245.2,282.6L247.2,278.5L243.2,276.5L238.8,272.8L237.6,267.9L233.2,266.9L229.1,262.9L226,259.2L226.1,257.1L222.8,251.6L221.1,246.2L221.8,243.6L216.7,240.3L214,240.3L209.9,237.9L208,240.4L208.5,243.8L208,248.9L210.1,251.9L215,257.3L216,259L217.1,259.6L217.7,262L219.2,262.1L219.9,266.6L222,268.6L223.3,271.2L227.9,275.1L229.4,281.7L231.4,284.9L233.1,288.3L232.9,292L237.1,292.6L240,296L242.7,299.3L242.3,300.5L238.1,302.7L236.6,302.5L235,298.2L230,293.7L224.4,289.8L220.3,287.6L221.7,282.7L221.2,278.9L212.5,272.7L211.2,273.4L209.5,271.4L204.7,269.2L200.8,264.7L201.5,264.3L204.8,265.1L208.5,263L209.5,260L204.4,254.4L200.2,252L198.3,247.4L196.5,242.7L194.3,236.9L192.8,230.5L192.5,227L188.7,222.5L185.3,221.1L185.1,219.1L180.9,218.1L178.8,215.9L172,214.1L170.4,212.7L170.8,209L165.9,201.2L163.2,191L164,189.6L161.6,186.8L158.2,180.4L159.3,174.9L157.1,170.6L160.7,165.6L162.7,160L162.5,154.7L167.5,149.1L170.7,143.4L173.8,137.6L176.1,128.7L176.4,122.7L175.8,119.3L177.1,118.1L185,122.1L186,129L188.2,127.5L189.2,122L189.2,116.1L188.3,116L179.3,107.2L176.3,103.4L166.9,98.3L166.3,91.8L169,87.9L163.1,83.4L164.7,77.9L160.5,71.4L162.1,68L160.4,64.7L156.9,61.4L158.5,55.2L154.8,48L155.5,41.8L209.7,45.5L264,51L317.9,58.2ZM591.1,74.4L590.8,79.3L590.7,86L592.9,82.7L597.6,82.7L597,85.5L603.2,85.5L604.7,83.1L611.6,83L613,88.1L616.2,85.6L619.3,88.5L623.8,91.6L625.2,97.8L622.8,99L618.1,99.3L615.9,93.8L613.7,93.6L610.7,101.3L607,102.3L609.2,98L602.6,98.4L596.6,100.9L585.1,104.3L583.1,102.7L585.4,99.4L581.8,98.5L584.4,93.2L583.9,81.4L585,76.7L588.3,72.9L591,72.3ZM183.8,118.6L180.4,118.9L171.7,113.8L170.8,111.1L166.5,107.6L166.3,105.5L160.7,103L160.1,98.9L161.4,97.5L166.8,100.3L169.9,102.1L175.2,104.1L176.2,106.8L177.9,110.5L182.8,114.4Z";

// Internal borders, both clipped to the landmass at render time.
const US_CA_BORDER =
  "M162.1,68L166.6,65.5L168.6,61.3L161.9,54.7L160.7,45.7L160.3,40L157.5,35.7L155.8,32L155.3,27.7L149.2,28.5L142.3,30.7L140.8,25L139.4,21L136.1,17.7L131.7,15.9L158.3,-22.8L176.7,-49.6M545.5,133.1L539.7,130.5L535.6,121.7L532.1,120.5L528.4,122.6L525.6,121.3L523,127.3L523.3,132.7L522.3,136.1L520,137.7L518.1,138.5L518.1,140.2L506.2,142.6L496.4,144.4L493.9,146.1L488.5,152L487.9,152.7L486.6,155.6L480.5,156.6L473.9,157.6L471.2,159.1L472.6,160.2L473.8,162.1L473.9,162.8L465.9,167.4L459.2,169.3L452,173.8L450.3,174.1L447.7,173.3L446.7,172.4L446.7,171.7L447.7,169.2L450.1,165.2L451.1,161L448.4,155.4L445.6,149.6L438.1,147.2L438.6,145.9L437.5,145.2L435.7,145.4L434.2,144.5L433.5,142.9L432.4,143.7L430.6,143.7L430.9,143L429.2,142.5L428.3,140.8L422.9,139.1L417.3,137.4L410.7,135.3L404.3,133.3L398.9,135.6L396.9,135.8L388.9,134.5L383.8,135.6L377.5,133.8L370.9,132.9L366.5,132.7L364.5,131.6L363.2,127.8L361.1,127.9L361.2,130.5L275.4,122.2L189.2,116.1";
const US_MX_BORDER =
  "M350.7,286.5L347.4,286.7L341.3,285.2L334.6,283.1L332.3,279.9L330.5,275.1L325.7,271.1L322.9,267.1L319,262.4L313.3,259.6L306.6,259.5L301.1,264.6L294.4,262.3L290.3,260.1L288.7,256.3L286.3,252.7L281.9,249.4L278,247.1L275.4,244.5L261.6,243.5L261.2,246.3L254.8,245.8L238.9,244.4L221.9,237.7L210.8,233.1L211.9,231.9L201.8,231.3L192.8,230.5";

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

      {/* Dashed internal borders, clipped to the landmass — non-interactive so
          map clicks fall through to the zoom-out handler on <svg>. Strokes are
          non-scaling so everything stays a hairline at the zoomed-in viewBox. */}
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
        <path
          d={US_MX_BORDER}
          fill="none"
          stroke="var(--color-warm-white)"
          strokeWidth="1"
          strokeDasharray="5 5"
          opacity="0.3"
          vectorEffect="non-scaling-stroke"
        />
      </g>

      {/* Region labels — all on the landmass now, so light type on the dark
          fill. */}
      <g
        style={{ pointerEvents: "none" }}
        fill="var(--color-warm-white)"
        fontWeight="300"
      >
        <text
          x="380"
          y="98"
          textAnchor="middle"
          fontSize="11"
          opacity="0.34"
          style={{ letterSpacing: "0.34em" }}
        >
          CANADA
        </text>
        <text
          x="398"
          y="214"
          textAnchor="middle"
          fontSize="11"
          opacity="0.32"
          style={{ letterSpacing: "0.32em" }}
        >
          UNITED STATES
        </text>
        <text
          x="360"
          y="342"
          textAnchor="middle"
          fontSize="8.5"
          opacity="0.32"
          style={{ letterSpacing: "0.24em" }}
        >
          MEXICO
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
