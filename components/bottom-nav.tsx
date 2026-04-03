"use client";

import { Apple, Brain, Dumbbell, Home, Moon, MoreVertical, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  ariaLabel: string;
}

const PRIMARY_ITEMS: NavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: <Home className="h-5 w-5" />,
    ariaLabel: "Dashboard",
  },
  {
    href: "/workouts",
    label: "Workouts",
    icon: <Dumbbell className="h-5 w-5" />,
    ariaLabel: "Workouts",
  },
  {
    href: "/nutrition",
    label: "Nutrition",
    icon: <Apple className="h-5 w-5" />,
    ariaLabel: "Nutrition",
  },
];

const SECONDARY_ITEMS: NavItem[] = [
  {
    href: "/sleep",
    label: "Sleep",
    icon: <Moon className="h-5 w-5" />,
    ariaLabel: "Sleep",
  },
  {
    href: "/mental-health",
    label: "Mental Health",
    icon: <Brain className="h-5 w-5" />,
    ariaLabel: "Mental Health",
  },
  {
    href: "/settings",
    label: "Settings",
    icon: <Settings className="h-5 w-5" />,
    ariaLabel: "Settings",
  },
];

function NavLink({ item, isActive }: { item: NavItem; isActive: boolean }) {
  return (
    <Button
      asChild
      variant="ghost"
      className={cn(
        "relative flex h-12 w-full flex-col items-center justify-center gap-1 rounded-none transition-colors",
        isActive ? "text-foreground after:bg-foreground after:absolute after:bottom-0 after:h-1 after:w-full" : "text-muted-foreground hover:text-foreground",
      )}
    >
      <Link href={item.href} aria-label={item.ariaLabel}>
        {item.icon}
        <span className="text-xs font-medium">{item.label}</span>
      </Link>
    </Button>
  );
}

export function BottomNav() {
  const pathname = usePathname();

  const activePrimaryItem = PRIMARY_ITEMS.find((item) => pathname === item.href || pathname.startsWith(item.href + "/"));

  const activeSecondaryItem = SECONDARY_ITEMS.find((item) => pathname === item.href || pathname.startsWith(item.href + "/"));

  return (
    <nav className="border-border bg-background fixed right-0 bottom-0 left-0 z-40 border-t" aria-label="Mobile navigation">
      <div className="flex h-20 items-center justify-between gap-1 px-2 md:gap-4 md:px-6">
        {/* Primary navigation items */}
        <div className="flex flex-1 items-center justify-around">
          {PRIMARY_ITEMS.map((item) => (
            <div key={item.href} className="flex-1">
              <NavLink item={item} isActive={!activeSecondaryItem && activePrimaryItem?.href === item.href} />
            </div>
          ))}
        </div>

        {/* More menu for secondary items */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "relative h-12 w-12 rounded-none transition-colors",
                activeSecondaryItem ? "text-foreground after:bg-foreground after:absolute after:bottom-0 after:h-1 after:w-full" : "text-muted-foreground hover:text-foreground",
              )}
              aria-label="More options"
              title="More"
            >
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="top" className="w-48">
            {SECONDARY_ITEMS.map((item) => (
              <DropdownMenuItem key={item.href} asChild>
                <Link href={item.href} className={cn(activeSecondaryItem?.href === item.href && "bg-accent")}>
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}
