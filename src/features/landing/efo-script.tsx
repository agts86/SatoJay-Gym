"use client";

import Script from "next/script";

declare global {
  interface Window {
    efoInit?: (appId: string) => void;
  }
}

const BOTCHAN_EFO_APP_ID = "69ba26b7c938e06f6c21a699";
const BOTCHAN_EFO_SCRIPT_SRC = "https://app2.blob.core.windows.net/botchan/js/efoapp.js";

export function EfoScript() {
  return (
    <Script
      src={BOTCHAN_EFO_SCRIPT_SRC}
      strategy="afterInteractive"
      onLoad={() => window.efoInit?.(BOTCHAN_EFO_APP_ID)}
    />
  );
}
