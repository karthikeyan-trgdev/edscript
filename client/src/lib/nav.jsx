import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLenisInstance } from '../hooks/useLenis.js';

export const NAV_OFFSET = -110; // room for the floating navbar

// Splits "/programs#podcasting" into { path: "/programs", hash: "#podcasting" }.
// A bare "#faq" means "this page".
function parse(to, currentPath) {
  const i = to.indexOf('#');
  const path = (i === -1 ? to : to.slice(0, i)) || currentPath;
  const hash = i === -1 ? '' : to.slice(i);
  return { path: path.split('?')[0], full: i === -1 ? to : to.slice(0, i), hash };
}

/**
 * One click handler for every internal link:
 *  - same page + #hash  → smooth-scroll with Lenis
 *  - same page, no hash → smooth-scroll to top
 *  - other page         → router navigation (RouteEffects handles the scroll)
 */
export function useGo() {
  const lenis = useLenisInstance();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return useCallback((e, to) => {
    if (!to || to === '#' || /^(https?:|mailto:|tel:)/.test(to)) return false;
    if (e && (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1)) return false; // let new-tab clicks through
    const { path, full, hash } = parse(to, pathname);
    e?.preventDefault();

    if (path === pathname && !full.includes('?')) {
      if (hash) {
        const el = document.querySelector(hash);
        if (el) lenis?.scrollTo(el, { offset: NAV_OFFSET, duration: 1.4 });
        window.history.replaceState(null, '', `${pathname}${hash}`);
      } else {
        lenis?.scrollTo(0, { duration: 1.2 });
      }
      return true;
    }
    navigate(to.startsWith('#') ? `${pathname}${to}` : to);
    return true;
  }, [lenis, navigate, pathname]);
}

// <a> that routes through useGo, so it works for "/about", "#faq" and "/programs#slug".
export function SmartLink({ to, onClick, children, ...props }) {
  const go = useGo();
  return (
    <a
      href={to}
      onClick={(e) => {
        onClick?.(e);
        go(e, to);
      }}
      {...props}
    >
      {children}
    </a>
  );
}
