"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { primaryGoalSchema, type PrimaryGoal, type PrimaryGoalValues } from "@/lib/validations/onboarding";

type Props = {
  defaultValues?: Partial<PrimaryGoalValues>;
  onNext: (values: PrimaryGoalValues) => void;
  onBack: () => void;
};

const GOAL_OPTIONS: { value: PrimaryGoal; label: string; description: string }[] = [
  { value: "lose_fat", label: "Lose Fat", description: "Calorie deficit with high protein to preserve muscle" },
  { value: "build_muscle", label: "Build Muscle", description: "Calorie surplus with high protein to maximise gains" },
  { value: "maintain", label: "Maintain", description: "Calorie maintenance to keep current weight and composition" },
  { value: "improve_endurance", label: "Improve Endurance", description: "Balanced macros with moderate surplus to fuel training" },
  { value: "general_health", label: "General Health", description: "Balanced approach for overall well-being" },
];

export function PrimaryGoalStep({ defaultValues, onNext, onBack }: Props) {
  const [selected, setSelected] = useState<PrimaryGoal | "">(defaultValues?.primaryGoal ?? "");
  const [error, setError] = useState<string | undefined>(undefined);

  function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();

    const result = primaryGoalSchema.safeParse({ primaryGoal: selected });

    if (!result.success) {
      setError(result.error.issues[0]?.message);
      return;
    }

    setError(undefined);
    onNext(result.data);
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <fieldset className="flex flex-col gap-3">
          <legend className="text-base font-semibold">What is your primary fitness goal?</legend>

          {GOAL_OPTIONS.map((option) => {
            const isSelected = selected === option.value;
            return (
              <label
                key={option.value}
                className={cn("flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors", isSelected ? "border-primary bg-primary/5" : "hover:border-muted-foreground/40")}
              >
                <input
                  type="radio"
                  name="primaryGoal"
                  value={option.value}
                  checked={isSelected}
                  onChange={() => {
                    setSelected(option.value);
                    setError(undefined);
                  }}
                  className="accent-primary mt-0.5"
                  aria-describedby={error ? "primaryGoal-error" : undefined}
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
          <p id="primaryGoal-error" className="text-sm text-red-500" role="alert">
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
