"use client";

import { useState, useTransition } from "react";

import { completeOnboarding } from "@/app/(protected)/onboarding/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { calculateBMR, calculateTargets, calculateTDEE } from "@/lib/tdee";
import type { ActivityLevel, ActivityLevelValues, BasicStatsValues, PrimaryGoalValues } from "@/lib/validations/onboarding";

type Props = {
  basicStats: BasicStatsValues;
  activityLevel: ActivityLevelValues;
  primaryGoal: PrimaryGoalValues;
  onBack: (step: 1 | 2 | 3) => void;
};

const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  sedentary: "Sedentary",
  lightly_active: "Lightly Active",
  moderately_active: "Moderately Active",
  very_active: "Very Active",
  extremely_active: "Extremely Active",
};

const GOAL_LABELS: Record<string, string> = {
  lose_fat: "Lose Fat",
  build_muscle: "Build Muscle",
  maintain: "Maintain",
  improve_endurance: "Improve Endurance",
  general_health: "General Health",
};

const SEX_LABELS: Record<string, string> = {
  male: "Male",
  female: "Female",
  other: "Other",
  prefer_not_to_say: "Prefer not to say",
};

export function ReviewConfirmStep({ basicStats, activityLevel, primaryGoal, onBack }: Props) {
  const bmr = calculateBMR(basicStats.weightKg, basicStats.heightCm, basicStats.age, basicStats.sex);
  const tdee = calculateTDEE(bmr, activityLevel.activityLevel);
  const defaultTargets = calculateTargets(tdee, primaryGoal.primaryGoal, basicStats.weightKg);

  const [calories, setCalories] = useState(defaultTargets.calories);
  const [protein, setProtein] = useState(defaultTargets.protein_g);
  const [carbs, setCarbs] = useState(defaultTargets.carbs_g);
  const [fat, setFat] = useState(defaultTargets.fat_g);
  const [fiber, setFiber] = useState(defaultTargets.fiber_g);
  const [error, setError] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();

  // Detect timezone on mount — only runs client-side
  const [timezone] = useState(() => Intl.DateTimeFormat().resolvedOptions().timeZone);

  // Height display
  const heightDisplay =
    basicStats.unitsPreference === "imperial"
      ? (() => {
          const totalInches = basicStats.heightCm / 2.54;
          const ft = Math.floor(totalInches / 12);
          const inc = Math.round(totalInches % 12);
          return `${ft}ft ${inc}in`;
        })()
      : `${basicStats.heightCm} cm`;

  // Weight display
  const weightDisplay = basicStats.unitsPreference === "imperial" ? `${Math.round(basicStats.weightKg * 2.2046 * 10) / 10} lb` : `${basicStats.weightKg} kg`;

  function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setError(undefined);

    startTransition(async () => {
      const result = await completeOnboarding({
        ...basicStats,
        ...activityLevel,
        ...primaryGoal,
        timezone,
        calorieTarget: calories,
        proteinTargetG: protein,
        carbsTargetG: carbs,
        fatTargetG: fat,
        fiberTargetG: fiber,
      });

      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Progress indicator */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Step 4 of 4</span>
          <span className="font-medium">Review & Confirm</span>
        </div>
        <Progress value={100} className="h-2" />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Stats summary */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Your Stats</h2>
            <button type="button" className="text-muted-foreground hover:text-foreground text-sm underline" onClick={() => onBack(1)}>
              Edit
            </button>
          </div>
          <div className="bg-muted/40 grid grid-cols-2 gap-x-4 gap-y-2 rounded-lg p-4 text-sm">
            <span className="text-muted-foreground">Name</span>
            <span className="font-medium">{basicStats.displayName}</span>
            <span className="text-muted-foreground">Age</span>
            <span className="font-medium">{basicStats.age}</span>
            <span className="text-muted-foreground">Height</span>
            <span className="font-medium">{heightDisplay}</span>
            <span className="text-muted-foreground">Weight</span>
            <span className="font-medium">{weightDisplay}</span>
            <span className="text-muted-foreground">Sex</span>
            <span className="font-medium">{SEX_LABELS[basicStats.sex]}</span>
          </div>
        </section>

        <Separator />

        {/* Activity + goal summary */}
        <section className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">Activity Level</span>
                <button type="button" className="text-muted-foreground hover:text-foreground text-xs underline" onClick={() => onBack(2)}>
                  Edit
                </button>
              </div>
              <span className="text-sm font-medium">{ACTIVITY_LABELS[activityLevel.activityLevel]}</span>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">Primary Goal</span>
                <button type="button" className="text-muted-foreground hover:text-foreground text-xs underline" onClick={() => onBack(3)}>
                  Edit
                </button>
              </div>
              <span className="text-sm font-medium">{GOAL_LABELS[primaryGoal.primaryGoal]}</span>
            </div>
          </div>
        </section>

        <Separator />

        {/* Calculated TDEE */}
        <section className="flex flex-col gap-3">
          <h2 className="text-base font-semibold">Calculated TDEE</h2>
          <div className="bg-muted/40 grid grid-cols-2 gap-x-4 gap-y-2 rounded-lg p-4 text-sm">
            <span className="text-muted-foreground">BMR</span>
            <span className="font-medium">{Math.round(bmr)} kcal</span>
            <span className="text-muted-foreground">TDEE</span>
            <span className="font-medium">{tdee} kcal</span>
          </div>
        </section>

        <Separator />

        {/* Macro targets — editable */}
        <section className="flex flex-col gap-3">
          <h2 className="text-base font-semibold">Daily Targets</h2>
          <p className="text-muted-foreground text-xs">These are calculated from your TDEE and goal. You can override any value.</p>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="calorieTarget">Calories (kcal)</Label>
              <Input id="calorieTarget" type="number" min={1200} max={6000} value={calories} onChange={(e) => setCalories(Number(e.target.value))} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="proteinTarget">Protein (g)</Label>
              <Input id="proteinTarget" type="number" min={40} max={400} value={protein} onChange={(e) => setProtein(Number(e.target.value))} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="carbsTarget">Carbs (g)</Label>
              <Input id="carbsTarget" type="number" min={50} max={800} value={carbs} onChange={(e) => setCarbs(Number(e.target.value))} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="fatTarget">Fat (g)</Label>
              <Input id="fatTarget" type="number" min={20} max={300} value={fat} onChange={(e) => setFat(Number(e.target.value))} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="fiberTarget">Fiber (g)</Label>
              <Input id="fiberTarget" type="number" min={10} max={100} value={fiber} onChange={(e) => setFiber(Number(e.target.value))} />
            </div>
          </div>
        </section>

        {error && (
          <p className="text-sm text-red-500" role="alert">
            {error}
          </p>
        )}

        <div className="mt-2 flex gap-3">
          <Button type="button" variant="outline" className="flex-1" onClick={() => onBack(3)} disabled={isPending}>
            Back
          </Button>
          <Button type="submit" className="flex-1" disabled={isPending}>
            {isPending ? "Saving…" : "Confirm"}
          </Button>
        </div>
      </form>
    </div>
  );
}
