"use client";

import * as Sentry from "@sentry/nextjs";
import Link from "next/link";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";

function DerailedTrainIllustration() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 200" fill="none" className="h-48 w-60" aria-hidden="true">
      {/* Tracks */}
      <line x1="0" y1="170" x2="240" y2="170" stroke="currentColor" strokeWidth="3" className="text-muted-foreground/30" />
      <line x1="0" y1="178" x2="240" y2="178" stroke="currentColor" strokeWidth="3" className="text-muted-foreground/30" />
      {/* Railroad ties */}
      {[20, 50, 80, 110, 140, 170, 200].map((x) => (
        <rect key={x} x={x} y="166" width="12" height="16" rx="1" fill="currentColor" className="text-muted-foreground/20" />
      ))}
      {/* Train body */}
      <g transform="translate(70, 60) rotate(-12, 50, 50)">
        {/* Main body */}
        <rect x="10" y="40" width="100" height="60" rx="8" className="fill-primary" />
        {/* Roof */}
        <rect x="14" y="34" width="92" height="12" rx="4" className="fill-primary/80" />
        {/* Windows */}
        <rect x="24" y="52" width="20" height="18" rx="3" className="fill-primary-foreground/90" />
        <rect x="52" y="52" width="20" height="18" rx="3" className="fill-primary-foreground/90" />
        <rect x="80" y="52" width="20" height="18" rx="3" className="fill-primary-foreground/90" />
        {/* Wheels — one off the track */}
        <circle cx="36" cy="104" r="10" strokeWidth="3" stroke="currentColor" className="fill-background text-secondary" />
        <circle cx="84" cy="104" r="10" strokeWidth="3" stroke="currentColor" className="fill-background text-secondary" />
      </g>
    </svg>
  );
}

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    if (error) Sentry.captureException(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="flex max-w-md flex-col items-center text-center">
        <DerailedTrainIllustration />

        <h1 className="font-display mt-8 text-5xl font-bold tracking-tight">Derailed</h1>

        <p className="text-muted-foreground mt-3 text-lg">We hit an unexpected bump on the tracks.</p>

        {error?.digest && <p className="text-muted-foreground/50 mt-4 font-mono text-xs">Error ID: {error.digest}</p>}

        <div className="mt-8 flex items-center gap-4">
          <Button size="lg" onClick={reset}>
            Try Again
          </Button>
          <Button asChild size="lg" variant={"outline"}>
            <Link href="/">Return Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
