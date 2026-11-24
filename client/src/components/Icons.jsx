import { Clapperboard, Layers, Rocket } from 'lucide-react';

export function LogoMark({ className = '', ...props }) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none" aria-hidden="true" {...props}>
      <defs>
        <linearGradient id="logo-grad" x1="4" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#16b3a2" />
          <stop offset="1" stopColor="#0b6f68" />
        </linearGradient>
      </defs>
      <path
        className="logo-mark__outer"
        d="M8 4.8 35 20 8 35.2Z"
        stroke="url(#logo-grad)"
        strokeWidth="4"
        strokeLinejoin="round"
        pathLength="1"
      />
      <path className="logo-mark__inner" d="M14 14.2 24.4 20 14 25.8Z" fill="url(#logo-grad)" />
    </svg>
  );
}

export function AiChipIcon(props) {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <rect x="10" y="10" width="28" height="28" rx="5" />
      <path d="M17 4v6M24 4v6M31 4v6M17 38v6M24 38v6M31 38v6M4 17h6M4 24h6M4 31h6M38 17h6M38 24h6M38 31h6" />
      <path d="M16.5 30 20 18h1.6L25 30M17.6 26.4h6.8M30 18v12" strokeWidth="2.4" />
    </svg>
  );
}

const map = {
  clapper: (p) => <Clapperboard strokeWidth={1.9} {...p} />,
  ai: (p) => <AiChipIcon {...p} />,
  layers: (p) => <Layers strokeWidth={1.9} {...p} />,
  rocket: (p) => <Rocket strokeWidth={1.9} {...p} />,
};

export function FeatureIcon({ name, ...props }) {
  const Icon = map[name] || map.layers;
  return <Icon aria-hidden="true" {...props} />;
}
