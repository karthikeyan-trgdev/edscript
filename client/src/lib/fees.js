import content from '@shared/content.json';

export const { scholarships } = content;

/** 144000 → "₹1,44,000" (Indian digit grouping) */
export const inr = (n) => `₹${Math.round(n).toLocaleString('en-IN')}`;

/** Fee after a scholarship of `pct` percent */
export const afterScholarship = (fee, pct) => fee * (1 - pct / 100);

/** The largest scholarship on offer (20%) */
export const topPct = Math.max(...scholarships.tiers.map((t) => t.pct));
