"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

// Renders children only in the browser. Used for the login page and the
// dashboard, whose ported code reads localStorage/window while rendering.
export default function ClientOnly({ children, fallback = null }) {
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  return mounted ? children : fallback;
}
