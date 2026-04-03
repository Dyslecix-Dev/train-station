"use client";

import { Apple, Brain, Dumbbell, Home, Moon, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  ariaLabel: string;
}

const NAV_ITEMS: NavItem[] = [
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

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Sidebar navigation" className="flex w-56 flex-col gap-1 p-3">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-label={item.ariaLabel}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            {item.icon}
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
