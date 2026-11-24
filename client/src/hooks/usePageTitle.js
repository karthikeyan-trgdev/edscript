import { useEffect } from 'react';
import content from '@shared/content.json';

const SITE = `${content.brand.name} – ${content.brand.tagline}`;

export default function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} | ${SITE}` : SITE;
  }, [title]);
}
