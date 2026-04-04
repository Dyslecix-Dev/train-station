"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { activityLevelSchema, type ActivityLevel, type ActivityLevelValues } from "@/lib/validations/onboarding";

type Props = {
  defaultValues?: Partial<ActivityLevelValues>;
  onNext: (values: ActivityLevelValues) => void;
  onBack: () => void;
};

const ACTIVITY_OPTIONS: { value: ActivityLevel; label: string; description: string }[] = [
  { value: "sedentary", label: "Sedentary", description: "Desk job, little or no exercise" },
  { value: "lightly_active", label: "Lightly Active", description: "Light exercise 1–3 days/week" },
  { value: "moderately_active", label: "Moderately Active", description: "Moderate exercise 3–5 days/week" },
  { value: "very_active", label: "Very Active", description: "Hard exercise 6–7 days/week" },
  { value: "extremely_active", label: "Extremely Active", description: "Very hard exercise or physical job" },
];

export function ActivityLevelStep({ defaultValues, onNext, onBack }: Props) {
  const [selected, setSelected] = useState<ActivityLevel | "">(defaultValues?.activityLevel ?? "");
  const [error, setError] = useState<string | undefined>(undefined);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const result = activityLevelSchema.safeParse({ activityLevel: selected });

    if (!result.success) {
      setError(result.error.issues[0]?.message);
      return;
    }

    setError(undefined);
    onNext(result.data);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Progress indicator */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Step 2 of 4</span>
          <span className="font-medium">Activity Level</span>
        </div>
        <Progress value={50} className="h-2" />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <fieldset className="flex flex-col gap-3">
          <legend className="text-base font-semibold">How active are you on a typical week?</legend>

          {ACTIVITY_OPTIONS.map((option) => {
            const isSelected = selected === option.value;
            return (
              <label
                key={option.value}
                className={cn("flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors", isSelected ? "border-primary bg-primary/5" : "hover:border-muted-foreground/40")}
              >
                <input
                  type="radio"
                  name="activityLevel"
                  value={option.value}
                  checked={isSelected}
                  onChange={() => {
                    setSelected(option.value);
                    setError(undefined);
                  }}
                  className="accent-primary mt-0.5"
                  aria-describedby={error ? "activityLevel-error" : undefined}
                />
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium">{option.label}</span>
                  <span className="text-muted-foreground text-sm">{option.description}</span>
                </div>
              </label>
            );
          })}
        </fieldset>

        {error && (
          <p id="activityLevel-error" className="text-sm text-red-500" role="alert">
            {error}
          </p>
        )}

        <div className="mt-2 flex gap-3">
          <Button type="button" variant="outline" className="flex-1" onClick={onBack}>
            Back
          </Button>
          <Button type="submit" className="flex-1">
            Continue
          </Button>
        </div>
      </form>
    </div>
  );
}
