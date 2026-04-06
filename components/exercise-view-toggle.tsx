"use client";

import { LayoutGrid, List } from "lucide-react";
import { useQueryState } from "nuqs";

import { Button } from "@/components/ui/button";

export function ExerciseViewToggle() {
  const [view, setView] = useQueryState("view", { defaultValue: "grid", shallow: true });

  return (
    <div className="flex items-center gap-1">
      <Button variant={view === "grid" ? "default" : "ghost"} size="icon" className="h-8 w-8" onClick={() => setView("grid")} aria-label="Grid view">
        <LayoutGrid className="h-4 w-4" />
      </Button>
      <Button variant={view === "list" ? "default" : "ghost"} size="icon" className="h-8 w-8" onClick={() => setView("list")} aria-label="List view">
        <List className="h-4 w-4" />
      </Button>
    </div>
  );
}
