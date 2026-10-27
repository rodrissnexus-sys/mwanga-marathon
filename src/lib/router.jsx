"use client";

// Small react-router compatibility layer on top of next-intl navigation,
// so the components ported from the Vite app keep their routing code.
// Paths are locale-free ("/about"); the current locale is added automatically.

import { useEffect, useSyncExternalStore } from "react";
import { Link as IntlLink, usePathname, useRouter } from "@/i18n/navigation";

// react-router's `location.state` has no Next.js equivalent; keep it in memory
// for the next page, which is all the ported code needs (scroll-to-section).
let navState = null;
const listeners = new Set();

function setNavState(state) {
  navState = state ?? null;
  listeners.forEach((listener) => listener());
}

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const getNavState = () => navState;
const getServerNavState = () => null;

export function useLocation() {
  const pathname = usePathname();
  const state = useSyncExternalStore(subscribe, getNavState, getServerNavState);

  return {
    pathname,
    state,
    get search() {
      return typeof window === "undefined" ? "" : window.location.search;
    },
    get hash() {
      return typeof window === "undefined" ? "" : window.location.hash;
    },
  };
}

export function useNavigate() {
  const router = useRouter();

  return (to, options = {}) => {
    if (typeof to === "number") {
      if (to < 0) router.back();
      else router.forward();
      return;
    }
    setNavState(options.state);
    if (options.replace) router.replace(to);
    else router.push(to);
  };
}

export function Link({ to, href, state, replace, onClick, ...props }) {
  return (
    <IntlLink
      {...props}
      href={to ?? href}
      replace={replace}
      onClick={(event) => {
        if (state !== undefined) setNavState(state);
        onClick?.(event);
      }}
    />
  );
}

export function Navigate({ to, replace = false, state = undefined }) {
  const navigate = useNavigate();

  useEffect(() => {
    navigate(to, { replace, state });
    // Run once, like react-router's <Navigate>.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
