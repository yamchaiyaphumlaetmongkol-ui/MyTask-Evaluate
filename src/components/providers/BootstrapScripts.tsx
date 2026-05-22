"use client";

import Script from "next/script";

/** Bootstrap 5 JS bundle (dropdown, modal, collapse, etc.) */
export function BootstrapScripts() {
  return (
    <Script
      src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js"
      integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz"
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}
