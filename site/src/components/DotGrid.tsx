import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { useInView } from "framer-motion";

interface DotGridProps {
  /** Space between dots, in px. */
  gap: number;
  /** Wave speed. */
  speed: number;
}

const GLYPH = ".";
const GLYPH_SIZE = 24;
const TILE_SIZE_MIN = 10;
const FRAME_MS = 1000 / 30;
const TIME_STEP = 10;
const TIME_WRAP = 864e5;

// Colour of the dot centre, wave crest and edges, mixed in LCH.
const CENTER = "rgb(255, 255, 255)";
const CREST = "rgb(255, 255, 255)";
const SIDES = "rgb(0, 0, 0)";

/**
 * Animated grid of dots that fills its parent. A travelling wave changes the
 * opacity and colour of each dot. Ported from the PeskyZone site.
 */
export default function DotGrid({ gap, speed }: DotGridProps) {
  const id = `dots-${useId().replace(/:/g, "")}`;
  const tileSize = Math.max(GLYPH_SIZE, TILE_SIZE_MIN) + gap;
  const [size, setSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: false, amount: "some" });

  const colsRaw = Math.ceil(size.width / tileSize);
  const cols = Math.max(1, colsRaw) + (colsRaw % 2 === 1 ? 1 : 0);
  const rows = Math.max(1, Math.ceil(size.height / tileSize));

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    const measure = () =>
      setSize({ width: element.offsetWidth, height: element.offsetHeight });
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isInView) return;
    let frame = 0;
    let time = 0;
    let lastFrame = 0;
    const tick = (timestamp: number) => {
      if (!lastFrame || timestamp - lastFrame >= FRAME_MS) {
        time = (time + TIME_STEP) % TIME_WRAP;
        gridRef.current?.style.setProperty("--t", String(time));
        gridRef.current?.style.setProperty("--speed-factor", String(speed / 25));
        lastFrame = timestamp;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [speed, isInView]);

  const css = `
@property --t {
  syntax: "<integer>";
  initial-value: 0;
  inherits: true
}

@property --speed-factor {
  syntax: "<number>";
  initial-value: 1;
  inherits: true
}

div.${id}-c {
  position: relative;
  width: fit-content;
  height: fit-content;
  margin: 0 auto;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

div.${id}-l {
  position: absolute;
  --offset-x: calc(var(--x) - 0.5);
  --abs-x: calc(max(var(--offset-x), -1 * var(--offset-x)));
  --offset-y: calc(var(--y) - 0.5);
  --abs-y: calc(max(var(--offset-y), -1 * var(--offset-y)));
  will-change: transform, opacity, color;

  --l: calc(
    sin(var(--abs-x) / cos(sin(var(--abs-y) * 2 + 60) * 2.5) * 3 - (var(--t) * var(--speed-factor)) / 350)
  );
  --top-range: max(min(calc((var(--l) - 0.6) / 0.4 * 100%), 100%), 0%);
  --base-color: color-mix(in lch,
    ${CENTER} calc(var(--abs-x) * 200%),
    ${SIDES} calc((0.5 - var(--abs-x)) * 200%)
  );
  color: color-mix(in lch,
    var(--base-color) calc(100% - var(--top-range)),
    ${CREST} var(--top-range)
  );
  opacity: max(var(--l), 0.05);

  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  width: ${tileSize}px;
  height: ${tileSize}px;
}`;

  return (
    <div
      ref={containerRef}
      style={{
        overflow: "hidden",
        position: "relative",
        width: "100%",
        height: "100%",
        fontFamily: '"Fragment Mono", monospace',
        fontSize: `${GLYPH_SIZE}px`,
        fontWeight: 400,
        letterSpacing: "0em",
        lineHeight: "1em",
      }}
    >
      <style>{css}</style>
      <div
        ref={gridRef}
        className={`${id}-c`}
        style={{
          "--t": 0,
          width: `${cols * tileSize}px`,
          height: `${rows * tileSize}px`,
          pointerEvents: "none",
        } as CSSProperties}
      >
        {Array.from({ length: cols * rows }, (_, i) => (
          <div
            key={i}
            className={`${id}-l`}
            style={{
              "--x": ((i + 1) % cols) / (cols + 1),
              "--y": (rows - Math.floor(i / cols)) / rows,
              left: (i % cols) * tileSize,
              top: Math.floor(i / cols) * tileSize,
            } as CSSProperties}
          >
            {GLYPH}
          </div>
        ))}
      </div>
    </div>
  );
}
