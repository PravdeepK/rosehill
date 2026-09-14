"use client";

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type RefObject,
} from "react";
import {
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

// The page is prerendered, and useLayoutEffect is a no-op (and warns) on the
// server — measurement only ever matters in the browser.
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

const FULL_VIEW: ViewBox = { x: 0, y: 0, w: 780, h: 450 };
const MAP_ASPECT = 450 / 780;
const ZOOM_W = 320;
// A phone paints the cluster into ~300px, where the desktop zoom leaves each
// petal about 15px across — half a usable tap target. Zooming harder (rather
// than scaling the artwork up inside a fixed viewBox, which would collide the
// petals with each other) magnifies everything at once: at this width the
// petals clear 44px on the narrowest phones and stay well apart.
const COMPACT_ZOOM_W = 200;
const PETAL_DIST = 42;
const LABEL_DIST = 60;
const ANIM_MS = 600;

// Touch target radii for the transparent hit circles. Sized in viewBox units,
// so they hold at every zoom: 14 stays clear of the 42-unit petal spacing, and
// 18 of the 43 units between the map's closest pair of cities (Toronto and the
// Poconos). Both are generous on a pointer, which is harmless.
const PETAL_HIT_R = 14;
const CITY_HIT_R = 18;

// Drives the zoom above. `md` — the same breakpoint globals.css uses to drop
// the map's fine print; keep the two together.
const COMPACT_QUERY = "(max-width: 767px)";

function subscribeCompact(onChange: () => void) {
  const mq = window.matchMedia(COMPACT_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}
const readCompact = () => window.matchMedia(COMPACT_QUERY).matches;
// Prerendered HTML has no viewport to measure; the subscription corrects this
// on mount, before which the map is in its unzoomed full view either way.
const readCompactOnServer = () => false;

// Real US + Canada outline — Natural Earth 1:110m (public domain), projected to
// the 780×450 viewBox (d3-geo conic conformal, cropped to lat 23–60 / lon
// -141–-50), then simplified. Both crops sit on real lines: the west edge is
// the 141st meridian (the Alaska/Yukon border, so Alaska drops out along a true
// border rather than an arbitrary diagonal), and the north edge is 60°N (the
// provinces/territories boundary). Cropping the empty Arctic is also what lets
// the landmass span x 108–672 at *true aspect* — an earlier revision stretched
// x by 1.42 to fill the panel, which visibly skewed the continent.
// Static data: no map library or tiles at runtime.
// Regenerate with `scripts/gen-portfolio-map-path.mjs`.
const LAND_PATH =
  "M109.2,8L175,17.6L240.9,30.5L306,46.8L369.6,66.1L369.8,78.3L378.6,79.8L381.9,90.4L385.3,98.9L393.8,96L405.7,99.9L412.3,103.6L417.4,108.4L425.7,110.5L433,114.2L443.6,113.2L450.7,113.2L451.3,122.9L455.3,133.6L462.3,145L474.3,153.4L478.8,148.8L480,136.8L472.9,120.3L467.2,115.5L476.2,108.2L481.5,98.9L483.1,90.4L480.8,83.1L474.5,74.6L465.5,67.8L469.6,54.4L468.8,52.9L512.8,40.6L518,51.6L523.8,51.6L530.1,56.6L536.1,47.6L537,33.7L537.4,31.9L541.6,30.3L546.6,35.2L559.4,45.9L571,55.9L571.4,63.5L581.7,66L589.6,69.5L600.1,67.8L605.4,69.3L611.9,76.7L617.2,75.7L621.4,78.3L627.5,89.2L624.9,95.1L622.2,100.8L613.6,109.2L609.4,121.1L599.2,127.5L584.4,131.1L574.5,134.9L567.9,138.1L565,147.5L558,155.1L552.6,172.1L547.5,184.3L553,180.7L559.7,163.4L571,149.8L580.7,145L588.6,147.7L584.8,157.1L591.2,167.2L596.5,174L607.6,175.4L618.5,169.1L620.6,154.9L624.2,161.9L630.3,163.5L624.5,173.9L611.4,186.4L605.9,193.3L600.5,203.7L594.7,205L591.2,196.5L600.5,183.4L589.2,188.1L581.7,192.2L584.1,195.2L578.1,202.8L571.7,208.9L564.9,214.5L562.8,221.9L562.3,224.6L563.9,230.1L568.2,234.8L571.4,234.1L569.4,230.6L572.4,232.1L572.8,235.2L568.1,238.6L564.3,239.5L559.1,243.1L555.9,244.6L551.5,246.4L545.8,251.2L556.8,246L559.7,247.3L549.6,253.6L544.5,255L544.4,253.7L542.8,257.2L545.3,257L545.6,265L541.8,274.6L540.5,272.1L538.6,272L535.3,270L538.4,275.2L540.9,276.6L542.1,280.5L540.5,285.2L537.9,294.8L537.1,294.5L537.9,286.8L532.6,283.8L529.5,275.4L529.1,280.3L532.5,286.5L526.6,286.2L533.1,288.2L535.9,298.1L538.5,298.2L540.3,301.6L544.1,311.8L540.6,321L532.4,326.2L528,333.7L523.8,335.4L520.2,340.2L519.7,344.1L511.3,353L507.2,359.1L504.1,366.2L504.1,374.1L507.1,381.3L512,389.9L517.6,396.7L518.6,401.3L525.6,413L526.8,420.3L527.2,424.7L526.1,431.8L523.4,433.8L518.3,433.4L515.8,428.9L511.7,427L504.8,418.6L498.8,411.1L496.7,407.1L497.4,399.5L493.8,394L484.9,386.2L481,385.1L472.3,391.5L470.5,391.1L465.3,386.7L459,384.8L448.6,387.5L440.2,387.2L433.1,388.7L429.4,390.8L431.4,393.5L431.6,397.9L433.8,399.9L432.2,401.5L428.5,400.2L425.1,402.6L418.1,402.9L410.6,397.6L402.4,399.5L395.4,397.4L389.5,398.4L381.6,401.3L373.1,409.7L363.6,414.7L358.4,420L356.2,425L356.2,432.6L356.7,437.9L358.6,441.6L354.7,442L347.6,439.6L339.9,436.1L337.2,430.9L335.2,423.1L329.5,416.7L326.4,410.2L321.8,402.5L315.2,397.9L307.5,397.8L301,406.1L293.3,402.3L288.6,398.7L286.7,392.5L284,386.6L278.8,381.4L274.4,377.5L271.4,373.4L255.4,371.7L254.9,376.2L247.5,375.3L229.2,372.9L209.5,362L196.8,354.4L198,352.4L186.4,351.4L176,350.1L175.7,344.3L171.3,336.9L167.5,334.7L167.2,331.5L162.5,329.8L160,326.2L152.2,323.2L150.4,320.9L150.9,314.9L145.4,302.2L142.4,285.8L143.4,283.5L140.7,279.1L136.9,268.6L138.3,259.8L135.8,252.9L140.1,244.8L142.5,235.9L142.4,227.2L148.3,218.3L152,209.1L155.7,200L158.5,185.6L158.9,176L158.4,170.5L159.8,168.7L168.9,175.3L169.9,186.3L172.4,184L173.7,175L173.7,165.7L172.8,165.4L162.6,151.2L159.2,145.2L148.6,136.9L148.1,126.4L151.3,120.3L144.7,112.9L146.6,104.1L142,93.7L143.9,88.3L142.1,83L138.1,77.7L140.1,67.8L136.1,56.3L137.2,45.1L132.2,42.1L123.5,37.9L118.5,31.9L112.7,15.8L108.7,11.3L108,10.4ZM632.2,97.1L632,105L632.1,115.7L634.6,110.3L639.9,110.3L639.4,114.8L646.4,114.6L648.1,110.7L655.9,110.4L657.8,118.5L661.3,114.5L664.9,119.1L670.2,124L672,133.9L669.3,135.8L664,136.3L661.2,127.7L658.8,127.4L655.5,139.8L651.4,141.4L653.7,134.5L646.2,135.3L639.4,139.4L626.3,145.2L624,142.7L626.5,137.3L622.4,136L625.1,127.4L624.2,108.5L625.3,100.9L628.9,94.9L632,93.9ZM167.6,169.6L163.7,170L153.8,161.7L152.9,157.4L148,151.8L147.8,148.4L141.5,144.2L140.9,137.6L142.3,135.4L148.5,140.1L152,143L158,146.2L159.1,150.5L160.9,156.5L166.4,162.9Z";

// Internal borders, both clipped to the landmass at render time.
const US_CA_BORDER =
  "M143.9,88.3L149.1,84.4L151.4,77.7L144,67.2L142.9,52.7L142.6,43.7L139.5,36.8L137.7,30.9L137.2,24.1L130.3,25.1L122.4,28.6L120.9,19.5L119.4,13.1L115.8,7.7L110.9,4.8L142.2,-55.8L163.7,-97.5M581.7,192.2L575,188.1L570.1,174.1L566,172.2L561.8,175.5L558.6,173.6L555.8,183.2L556.2,191.9L555.1,197.5L552.5,200L550.3,201.2L550.3,204L536.8,208L525.5,211.1L522.7,213.9L516.6,223.5L515.9,224.5L514.5,229.2L507.5,230.8L500,232.6L496.9,235L498.5,236.8L499.9,239.9L500,241L490.9,248.3L483.2,251.6L475,258.9L473,259.3L470,258.1L468.9,256.7L468.9,255.5L470,251.5L472.6,245L473.8,238.3L470.6,229.3L467.3,219.9L458.7,216.2L459.3,214.1L458,213L455.9,213.3L454.2,211.8L453.4,209.4L452.1,210.7L450.1,210.7L450.4,209.5L448.5,208.7L447.4,206L441.2,203.4L434.8,200.5L427.1,197.2L419.9,194.1L413.7,197.8L411.3,198.1L402.1,196.1L396.4,197.9L389.1,195L381.6,193.7L376.6,193.2L374.2,191.5L372.8,185.5L370.3,185.6L370.5,189.8L272.3,176.3L173.7,165.7";

function parseViewBox(svg: SVGSVGElement): ViewBox {
  const parts = (svg.getAttribute("viewBox") ?? "0 0 780 450")
    .split(/[\s,]+/)
    .map(Number);
  return { x: parts[0], y: parts[1], w: parts[2], h: parts[3] };
}

function zoomFor(city: PortfolioCity, w: number): ViewBox {
  const h = w * MAP_ASPECT;
  return { x: city.x - w / 2, y: city.y - h / 2, w, h };
}

export function PortfolioMap({
  activeCity,
  onSelectCity,
  onSelectProject,
}: PortfolioMapProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const [hoverPetal, setHoverPetal] = useState<number | null>(null);
  const compact = useSyncExternalStore(
    subscribeCompact,
    readCompact,
    readCompactOnServer,
  );

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
  // Re-runs on a breakpoint change too, so rotating a phone re-frames the
  // cluster at the zoom that suits the new width.
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const target = selectedCity
      ? zoomFor(selectedCity, compact ? COMPACT_ZOOM_W : ZOOM_W)
      : FULL_VIEW;

    if (prefersReducedMotion()) {
      svg.setAttribute(
        "viewBox",
        `${target.x} ${target.y} ${target.w} ${target.h}`,
      );
      return;
    }

    const from = parseViewBox(svg);
    const start = performance.now();

    // Drops the landmass drop shadow and coastline antialiasing for the
    // duration of the tween — see .map-animating in globals.css. Toggled on the
    // node rather than through state so it costs no re-render, the same way
    // this effect already writes viewBox directly.
    svg.classList.add("map-animating");

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
      else svg.classList.remove("map-animating");
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      svg.classList.remove("map-animating");
    };
  }, [selectedCity, compact]);

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
      aria-label="Map of North America. Select a city to see Rose Hill Design Build's projects there."
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
        className="map-land map-land-shadow"
        d={LAND_PATH}
        fill="url(#pm-land-gradient)"
        stroke="var(--color-gold)"
        strokeWidth="1.4"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        filter="url(#pm-land-shadow)"
      />
      <path
        className="map-land"
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
        className="map-fine-print"
        style={{ pointerEvents: "none" }}
        fill="var(--color-warm-white)"
        fontWeight="300"
      >
        <text
          x="379"
          y="122"
          textAnchor="middle"
          fontSize="11"
          opacity="0.6"
          style={{ letterSpacing: "0.32em" }}
        >
          CANADA
        </text>
        <text
          x="341"
          y="286"
          textAnchor="middle"
          fontSize="11"
          opacity="0.55"
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
                vectorEffect="non-scaling-stroke"
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

              {/* hub — tap / Enter to zoom back out. The dot is decoration;
                  the transparent circle over it carries the interaction so the
                  target is finger-sized without inflating the artwork. */}
              <circle
                cx="0"
                cy="0"
                r="9"
                fill="var(--color-gold)"
                stroke="var(--color-warm-white)"
                strokeWidth="1.5"
                style={{ pointerEvents: "none" }}
              />
              <circle
                cx="0"
                cy="0"
                r={PETAL_HIT_R}
                fill="transparent"
                role="button"
                tabIndex={0}
                aria-label={`Zoom out from ${selectedCity.name}`}
                className="map-node focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold focus-visible:outline-offset-2"
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
                        fill="var(--color-gold)"
                        stroke="var(--color-warm-white)"
                        strokeWidth="1.5"
                        style={{ pointerEvents: "none" }}
                      />
                    </g>
                    {/* Kept out of the bloom <g> so the target is live from
                        the first frame rather than scaling in with the dot. */}
                    <circle
                      r={PETAL_HIT_R}
                      fill="transparent"
                      role="button"
                      tabIndex={0}
                      aria-label={`View project: ${project.name}`}
                      className="map-node focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold focus-visible:outline-offset-2"
                      style={{ cursor: "pointer" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectProject(project.id);
                      }}
                      onKeyDown={(e) =>
                        onActivateKey(e, () => onSelectProject(project.id))
                      }
                      onMouseEnter={() => setHoverPetal(project.id)}
                      onMouseLeave={() => setHoverPetal(null)}
                      onFocus={() => setHoverPetal(project.id)}
                      onBlur={() => setHoverPetal(null)}
                    />
                  </g>
                );
              })}

              {/* hover / focus label for the active petal */}
              {(() => {
                if (hoverPetal == null) return null;
                const i = cityProjects.findIndex((p) => p.id === hoverPetal);
                if (i < 0) return null;
                const { lx, ly, anchor } = petalGeom[i];
                return (
                  <PetalLabel
                    label={truncate(
                      cityProjects[i].shortName ?? cityProjects[i].name,
                    )}
                    lx={lx}
                    ly={ly}
                    anchor={anchor}
                  />
                );
              })()}
            </g>
          )}
    </svg>
  );
}

// 16 keeps the longest label inside the 160px half-width of the zoomed
// viewBox with room to spare; 12 was cutting most real project names down to
// an initial word. Only the pointer path renders these — the tighter compact
// zoom has half the room, and touch has no hover to trigger them.
const PETAL_LABEL_MAX = 16;

/**
 * Measured advance width of an SVG <text>, so a label's background hugs the
 * glyphs actually drawn. A per-character estimate can't do this: DM Sans plus
 * letter-spacing runs wider than any single constant, and long labels spilled
 * out of their chips. `estimate` is only the pre-measurement fallback (SSR and
 * the first paint), so it errs generous.
 */
function useTextWidth(
  ref: RefObject<SVGTextElement | null>,
  text: string,
  estimate: number,
): number {
  const [width, setWidth] = useState<number | null>(null);

  useIsomorphicLayoutEffect(() => {
    const measure = () => {
      if (ref.current) setWidth(ref.current.getComputedTextLength());
    };
    measure();
    // Measuring before the webfont swaps in reads the fallback face, which is
    // a different width — re-measure once fonts settle.
    document.fonts?.ready.then(measure).catch(() => {});
  }, [ref, text]);

  // Round up: keeps the emitted markup free of float noise, and any rounding
  // error lands on the side that fits.
  return Math.ceil(width ?? estimate);
}

function PetalLabel({
  label,
  lx,
  ly,
  anchor,
}: {
  label: string;
  lx: number;
  ly: number;
  anchor: "start" | "end";
}) {
  const textRef = useRef<SVGTextElement>(null);
  const textW = useTextWidth(textRef, label, label.length * 5.6);
  const tw = textW + 8; // 4px padding either side of the glyphs

  return (
    <g
      className="map-hover-label"
      style={{ pointerEvents: "none" }}
    >
      <rect
        x={anchor === "end" ? lx - tw + 4 : lx - 4}
        y={ly - 8}
        width={tw}
        height="15"
        fill="var(--color-warm-white)"
        opacity="0.92"
      />
      <text
        ref={textRef}
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
}

function truncate(name: string): string {
  return name.length > PETAL_LABEL_MAX
    ? `${name.slice(0, PETAL_LABEL_MAX).trimEnd()}…`
    : name;
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
  const textRef = useRef<SVGTextElement>(null);
  // Text sits 20 from the marker and the chip starts at 13, so the chip needs
  // the glyph width plus that 7 offset — +14 leaves 7px clear either side.
  const chipW = useTextWidth(textRef, label, label.length * 7.6) + 14;
  const dir = city.labelDir === "left" ? -1 : 1;

  return (
    <g
      transform={`translate(${city.x} ${city.y})`}
      role="button"
      tabIndex={0}
      aria-label={`View projects in ${city.name} (${count})`}
      className="map-node focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold focus-visible:outline-offset-2"
      style={{ cursor: "pointer" }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      onKeyDown={(e) => onActivateKey(e, onSelect)}
    >
      {/* comfortable hit area around the diamond — the whole marker is one
          target, but below `md` the chip is hidden and this is all that's
          left of it, so it carries the touch sizing on its own */}
      <circle r={CITY_HIT_R} fill="transparent" />

      <g className="map-fine-print">
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
          ref={textRef}
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
      </g>

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
