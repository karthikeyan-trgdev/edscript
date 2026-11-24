/**
 * SVG displacement filter used by `.glass__fx` layers to bend the blurred
 * backdrop like liquid glass. Only enabled in Chromium (see main.jsx); other
 * browsers fall back to a frosted blur.
 */
export default function LiquidGlassFilter() {
  return (
    <svg className="sr-only" aria-hidden="true" focusable="false" width="0" height="0">
      <filter
        id="liquid-glass"
        x="0%"
        y="0%"
        width="100%"
        height="100%"
        filterUnits="objectBoundingBox"
        colorInterpolationFilters="sRGB"
      >
        <feTurbulence type="fractalNoise" baseFrequency="0.004 0.007" numOctaves="2" seed="11" result="noise" />
        <feGaussianBlur in="noise" stdDeviation="3" result="softNoise" />
        <feDisplacementMap
          in="SourceGraphic"
          in2="softNoise"
          scale="26"
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>
    </svg>
  );
}
