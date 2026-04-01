import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Not Found",
};

function EmptyPlatformIllustration() {
  // Vanishing point: (120, 92). Rails bottom: left=(52,200), right=(188,200).
  // Rail x at y: left = 120 - 68*p, right = 120 + 68*p, where p = (y - 92) / 108
  const railX = (y: number) => {
    const p = (y - 92) / 108;
    return { left: 120 - 68 * p, right: 120 + 68 * p };
  };

  const tieYs = [197, 185, 173, 161, 151, 141, 133, 125, 118, 112, 107, 103, 99, 96];

  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 200" fill="none" className="h-48 w-60" aria-hidden="true">
      {/* Horizon line */}
      <line x1="0" y1="92" x2="240" y2="92" stroke="currentColor" strokeWidth="0.5" className="text-muted-foreground/20" />

      {/* Rails */}
      <line x1="52" y1="200" x2="120" y2="92" stroke="currentColor" strokeWidth="2.5" className="text-muted-foreground/40" />
      <line x1="188" y1="200" x2="120" y2="92" stroke="currentColor" strokeWidth="2.5" className="text-muted-foreground/40" />

      {/* Railroad ties */}
      {tieYs.map((y) => {
        const { left, right } = railX(y);
        const sw = Math.max(0.5, 2.2 * ((y - 92) / 108));
        return <line key={y} x1={left} y1={y} x2={right} y2={y} stroke="currentColor" strokeWidth={sw} className="text-muted-foreground/25" />;
      })}

      {/* Left platform */}
      <rect x="0" y="150" width="52" height="50" className="fill-muted/50" />
      <line x1="0" y1="150" x2="52" y2="150" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground/40" />
      <line x1="52" y1="150" x2="52" y2="200" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground/30" />
      {/* Safety stripe */}
      <line x1="0" y1="153" x2="52" y2="153" stroke="currentColor" strokeWidth="2" className="text-primary/60" />

      {/* Right platform */}
      <rect x="188" y="150" width="52" height="50" className="fill-muted/50" />
      <line x1="188" y1="150" x2="240" y2="150" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground/40" />
      <line x1="188" y1="150" x2="188" y2="200" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground/30" />
      {/* Safety stripe */}
      <line x1="188" y1="153" x2="240" y2="153" stroke="currentColor" strokeWidth="2" className="text-primary/60" />

      {/* Left bench */}
      {/* Back */}
      <rect x="4" y="134" width="3.5" height="16" rx="1" className="fill-muted-foreground/40" />
      {/* Seat */}
      <rect x="4" y="144" width="30" height="4" rx="1" className="fill-muted-foreground/40" />
      {/* Front leg */}
      <rect x="30" y="148" width="3" height="2" rx="0.5" className="fill-muted-foreground/28" />

      {/* Right bench */}
      {/* Back */}
      <rect x="232.5" y="134" width="3.5" height="16" rx="1" className="fill-muted-foreground/40" />
      {/* Seat */}
      <rect x="206" y="144" width="30" height="4" rx="1" className="fill-muted-foreground/40" />
      {/* Front leg */}
      <rect x="207" y="148" width="3" height="2" rx="0.5" className="fill-muted-foreground/28" />

      {/* Caution sign */}
      {/* Post */}
      <line x1="120" y1="186" x2="120" y2="200" stroke="currentColor" strokeWidth="2.5" className="text-muted-foreground/60" />
      {/* Sign body */}
      <rect x="88" y="156" width="64" height="30" rx="2.5" fill="#FACC15" stroke="#111827" strokeWidth="2" />
      {/* Inner border */}
      <rect x="92" y="160" width="56" height="22" rx="1.5" fill="none" stroke="#111827" strokeWidth="1.2" />
      {/* 404 text */}
      <text x="120" y="176" textAnchor="middle" fontSize="14" fontWeight="800" fontFamily="monospace" fill="#111827" letterSpacing="1">
        404
      </text>
    </svg>
  );
}

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="flex max-w-md flex-col items-center text-center">
        <EmptyPlatformIllustration />

        <h1 className="font-display mt-8 text-5xl font-bold tracking-tight">Wrong Platform</h1>

        <p className="text-muted-foreground mt-3 text-lg">This destination isn&apos;t on our route.</p>

        <div className="mt-8 flex items-center gap-4">
          <Button asChild size="lg">
            <Link href="/">Return Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
