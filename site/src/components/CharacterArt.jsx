import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState, useId } from "react";
import { useInView } from "framer-motion";

export default function CharacterArt({
  type,
  speed,
  reverse,
  lines,
  gap,
  backgroundColor,
  radius,
  scale,
  style,
  font,
  gridStyle,
  gridText,
  gridColors,
  waveColors,
}) {
  const instanceId = useInstanceId();
  const { length: lineLength, width: lineWidth, rounded } = lines;
  const tileSize =
    (gridStyle === "text" ? Math.max(parseFloat(font.fontSize), 10) : Math.max(lineLength, lineWidth)) + gap;
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const containerRef = useRef(null);
  const mainRef = useRef(null);
  const isInView = useInView(containerRef, { once: false, amount: "some" });
  const cols =
    Math.max(1, Math.ceil(dimensions.width / tileSize)) +
    (Math.ceil(dimensions.width / tileSize) % 2 === 1 ? 1 : 0);
  const rows = Math.max(1, Math.ceil(dimensions.height / tileSize));
  const n = cols * rows;
  useEffect(() => {
    if (!containerRef.current) return;
    const element = containerRef.current;
    setDimensions({ width: element.offsetWidth, height: element.offsetHeight });
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const element = entry.target;
        setDimensions({ width: element.offsetWidth, height: element.offsetHeight });
      }
    });
    resizeObserver.observe(containerRef.current);
    return () => {
      resizeObserver.disconnect();
    };
  }, [tileSize]);
  useEffect(() => {
    if (!isInView) return;
    let animationFrame;
    let time = 0;
    let lastFrameTime = 0;
    const frameInterval = 1e3 / 30;
    const updateTime = (timestamp) => {
      if (!lastFrameTime || timestamp - lastFrameTime >= frameInterval) {
        const direction = reverse ? -1 : 1;
        time = (time + 10 * direction) % 864e5;
        if (mainRef.current) {
          mainRef.current.style.setProperty("--t", time);
          mainRef.current.style.setProperty("--speed-factor", speed / 25);
        }
        lastFrameTime = timestamp;
      }
      animationFrame = requestAnimationFrame(updateTime);
    };
    animationFrame = requestAnimationFrame(updateTime);
    return () => cancelAnimationFrame(animationFrame);
  }, [speed, reverse, isInView]);
  let styleContent = "";
  const elements = [];
  switch (type) {
    case "grid":
      styleContent = `
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

div.${instanceId}-c {
  position: relative;
  width: fit-content;
  height: fit-content;
  margin: 0 auto;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

div.${instanceId}-l {
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
	--base-color: color-mix(in ${gridColors.interpolation}, 
		${gridColors.center} calc(var(--abs-x) * 200%), 
		${gridColors.sides} calc((0.5 - var(--abs-x)) * 200%)
	);
	color: ${
    gridColors.in
      ? `color-mix(in ${gridColors.interpolation}, 
			var(--base-color) calc(100% - var(--top-range)), 
			${gridColors.in} var(--top-range)
		)`
      : `var(--base-color)`
  };
	opacity: max(var(--l), 0.05);

  ${
    gridStyle === "text"
      ? `text-align: center;
       display: flex;
       justify-content: center;
       align-items: center;
       width: ${tileSize}px;
       height: ${tileSize}px;`
      : `background: currentColor;
			 width: ${lineWidth}px;
       height: ${lineLength}px;
       --sign-x: calc(var(--offset-x) / var(--abs-x));
       rotate: calc(var(--l) * 90deg * var(--sign-x));
       border-radius: ${rounded ? Math.min(lineLength, lineWidth) / 2 : 0}px;`
  }
}`;
      elements.push(
        /*#__PURE__*/ _jsx("div", {
          ref: mainRef,
          className: `${instanceId}-c`,
          style: {
            "--t": 0,
            width: `${cols * tileSize}px`,
            height: `${rows * tileSize}px`,
            pointerEvents: "none",
          },
          children: Array.from({ length: n }).map((_, i) => {
            const x = (i % cols) * tileSize;
            const y = Math.floor(i / cols) * tileSize;
            const xRatio = ((i + 1) % cols) / (cols + 1);
            const yRatio = (rows - Math.floor(i / cols)) / rows;
            const textContent =
              gridStyle === "text" ? gridText.split("")[i % Math.max(1, gridText.length)] : null;
            return /*#__PURE__*/ _jsx(
              "div",
              {
                className: `${instanceId}-l`,
                style: {
                  "--x": xRatio,
                  "--y": yRatio,
                  left: gridStyle === "lines" ? x + tileSize / 2 : x,
                  top: y,
                },
                children: textContent,
              },
              i,
            );
          }),
        }),
      );
      break;
    case "waves":
      styleContent = `
.${instanceId}-l {
	--dash-width: ${10 * scale};
	--gap-width: ${100 * scale};

	stroke-dasharray: var(--dash-width) var(--gap-width);
	stroke-dashoffset: var(--dash-width);
	will-change: stroke, stroke-dashoffset;
	animation: ${instanceId}-pulse 2s cubic-bezier(0.65, 0, 0.35, 1) infinite alternate-reverse;
	animation-delay: var(--delay);
}

@keyframes ${instanceId}-pulse {
	0% { stroke-dashoffset: var(--dash-width); }
	50% { stroke: ${waveColors.color2}; }
	100% { stroke-dashoffset: calc(var(--gap-width) * -8px + 40px); }
}`;
      const numLines =
        Math.max(1, Math.ceil(dimensions.width / (gap + lineWidth))) +
        (Math.ceil(dimensions.width / (gap + lineWidth)) % 2 === 1 ? 1 : 0);
      elements.push(
        /*#__PURE__*/ _jsx(
          "svg",
          {
            ref: mainRef,
            style: {
              position: "absolute",
              left: "0",
              top: "0",
              width: "100%",
              height: "100%",
              pointerEvents: "none",
            },
            viewBox: `0 0 ${dimensions.width} ${dimensions.height}`,
            preserveAspectRatio: "none",
            xmlns: "http://www.w3.org/2000/svg",
            children: Array.from({ length: numLines }).map((_, i) => {
              const x = (i / (numLines - 1)) * dimensions.width;
              const delayFactor = 1 - Math.abs((i - numLines / 2) / numLines);
              return /*#__PURE__*/ _jsxs(
                "g",
                {
                  style: { "--delay": `${(delayFactor * speed) / 50}s` },
                  children: [
                    /*#__PURE__*/ _jsx("line", {
                      x1: x,
                      y1: "0",
                      x2: x,
                      y2: dimensions.height,
                      stroke: waveColors.lineColor,
                      strokeWidth: lineWidth,
                    }),
                    /*#__PURE__*/ _jsx("line", {
                      x1: x,
                      y1: "0",
                      x2: x,
                      y2: dimensions.height,
                      stroke: waveColors.color1,
                      strokeWidth: lineWidth,
                      className: `${instanceId}-l`,
                    }),
                  ],
                },
                i,
              );
            }),
          },
          `dash-waves-${numLines}`,
        ),
      );
      break;
  }
  return /*#__PURE__*/ _jsxs("div", {
    ref: containerRef,
    style: {
      overflow: "hidden",
      position: "relative",
      backgroundColor: backgroundColor,
      borderRadius: radius,
      ...style,
      ...font,
    },
    children: [/*#__PURE__*/ _jsx("style", { children: styleContent }), elements],
  });
}
CharacterArt.displayName = "Character Art";
const useInstanceId = () => {
  const id = useId();
  const cleanId = id.replace(/:/g, "");
  const instanceId = `frameruni-${cleanId}`;
  return instanceId;
};
