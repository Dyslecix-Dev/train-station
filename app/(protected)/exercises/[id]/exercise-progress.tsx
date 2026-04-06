"use client";

import { TrendingDown, TrendingUp } from "lucide-react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import type { Exercise } from "@/lib/db/schema/exercises";

type ProgressPoint = {
  date: string;
  value: number;
};

type ExerciseProgressChartProps = {
  exercise: Pick<Exercise, "progressMetricType" | "name">;
  points: ProgressPoint[];
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

function getMetricLabel(type: Exercise["progressMetricType"]): string {
  switch (type) {
    case "estimated_1rm":
      return "Est. 1RM (kg)";
    case "best_pace":
      return "Pace (s/km)";
    case "max_reps":
      return "Max reps";
    case "max_duration":
    case "hold_duration":
      return "Duration (s)";
  }
}

function formatSummaryValue(type: Exercise["progressMetricType"], value: number): string {
  switch (type) {
    case "estimated_1rm":
      return `${value.toFixed(1)} kg est. 1RM`;
    case "best_pace": {
      const mins = Math.floor(value / 60);
      const secs = Math.round(value % 60);
      return `${mins}:${secs.toString().padStart(2, "0")} /km pace`;
    }
    case "max_reps":
      return `${value} reps`;
    case "max_duration":
    case "hold_duration":
      return `${value}s`;
  }
}

export function ExerciseProgressChart({ exercise, points }: ExerciseProgressChartProps) {
  if (points.length === 0) {
    return (
      <div className="rounded-lg border p-6 text-center">
        <p className="text-muted-foreground text-sm">No data yet — log a workout using this exercise to see progress.</p>
      </div>
    );
  }

  const first = points[0];
  const last = points[points.length - 1];
  const delta = last.value - first.value;
  const isLowerBetter = exercise.progressMetricType === "best_pace";
  const improved = isLowerBetter ? delta < 0 : delta > 0;
  const deltaLabel = Math.abs(delta).toFixed(exercise.progressMetricType === "max_reps" ? 0 : 1);
  const sign = delta > 0 ? "+" : "-";
  const firstDate = new Date(first.date).toLocaleDateString("en-US", { month: "short", year: "numeric" });

  return (
    <div className="flex flex-col gap-4 rounded-lg border p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-medium">Progress</p>
          <p className="text-muted-foreground text-sm">{getMetricLabel(exercise.progressMetricType)}</p>
        </div>
        {points.length >= 2 && (
          <div className={`flex items-center gap-1 text-sm font-medium ${improved ? "text-green-600 dark:text-green-400" : "text-red-500"}`}>
            {improved ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            <span>
              {sign}
              {deltaLabel} since {firstDate}
            </span>
          </div>
        )}
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={points} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
          <YAxis
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={48}
            reversed={isLowerBetter}
            tickFormatter={(v: number) => (exercise.progressMetricType === "estimated_1rm" ? `${v}` : `${v}`)}
          />
          <Tooltip
            labelFormatter={(label) => new Date(String(label)).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            formatter={(value) => [formatSummaryValue(exercise.progressMetricType, Number(value)), getMetricLabel(exercise.progressMetricType)]}
          />
          <Line type="monotone" dataKey="value" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} className="stroke-primary" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
