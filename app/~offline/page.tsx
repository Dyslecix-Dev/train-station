import type { Metadata } from "next";

import { RetryButton } from "./retry-button";

export const metadata: Metadata = {
  title: "Offline",
};

function TunnelIllustration() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 200" fill="none" className="h-48 w-60" aria-hidden="true">
      {/* Tunnel arch */}
      <path d="M40 200 L40 100 Q40 40 120 40 Q200 40 200 100 L200 200" stroke="currentColor" strokeWidth="3" className="text-muted-foreground/40" fill="none" />
      {/* Inner darkness */}
      <path d="M48 200 L48 104 Q48 50 120 50 Q192 50 192 104 L192 200 Z" className="fill-secondary" />

      {/* Signal bars */}
      <g transform="translate(72, 84)">
        <rect x="0" y="56" width="16" height="32" rx="3" className="fill-primary-foreground/80" />
        <rect x="24" y="38" width="16" height="50" rx="3" className="fill-primary-foreground/80" />
        <rect x="48" y="20" width="16" height="68" rx="3" className="fill-primary-foreground/80" />
        <rect x="72" y="2" width="16" height="86" rx="3" className="fill-primary-foreground/80" />
        {/* Slash across Bars */}
        <line x1="-6" y1="94" x2="94" y2="-4" stroke="currentColor" strokeWidth="6" strokeLinecap="round" className="text-destructive" />
      </g>
    </svg>
  );
}

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="flex max-w-md flex-col items-center text-center">
        <TunnelIllustration />

        <h1 className="font-display mt-8 text-5xl font-bold tracking-tight">Stuck in a Tunnel</h1>

        <p className="text-muted-foreground mt-3 text-lg">No signal right now but your device is saving your data.</p>

        <div className="mt-8 flex items-center gap-4">
          <RetryButton />
        </div>
      </div>
    </div>
  );
}
