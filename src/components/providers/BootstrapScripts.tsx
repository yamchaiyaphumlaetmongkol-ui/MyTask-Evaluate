"use client";

import Script from "next/script";

/** Bootstrap 5 JS bundle (dropdown, modal, collapse, etc.) */
export function BootstrapScripts() {
  return (
    <Script
      src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js"
      integrity="sha384-FKyoEForCGlyvwx9Hj09JcYn3nv7wiPVlz7YYwJrWVcXK/BmnVDxM+D2scQbITxI"
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}
