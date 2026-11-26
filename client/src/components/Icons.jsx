import { Clapperboard, Layers, Rocket } from 'lucide-react';

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
