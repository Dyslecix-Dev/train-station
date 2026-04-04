"use client";

import { useState } from "react";

import { ActivityLevelStep } from "@/app/(protected)/onboarding/activity-level-step";
import { BasicStatsStep } from "@/app/(protected)/onboarding/basic-stats-step";
import { type ActivityLevelValues, type BasicStatsValues } from "@/lib/validations/onboarding";

type WizardState = {
  basicStats?: BasicStatsValues;
  activityLevel?: ActivityLevelValues;
};

export function OnboardingWizard() {
  const [step, setStep] = useState(1);
  const [wizardState, setWizardState] = useState<WizardState>({});

  function handleBasicStatsNext(values: BasicStatsValues) {
    setWizardState((prev) => ({ ...prev, basicStats: values }));
    setStep(2);
  }

  function handleActivityLevelNext(values: ActivityLevelValues) {
    setWizardState((prev) => ({ ...prev, activityLevel: values }));
    setStep(3);
  }

  return (
    <div className="mx-auto w-full max-w-md">
      {step === 1 && <BasicStatsStep defaultValues={wizardState.basicStats} onNext={handleBasicStatsNext} />}
      {step === 2 && <ActivityLevelStep defaultValues={wizardState.activityLevel} onNext={handleActivityLevelNext} onBack={() => setStep(1)} />}
      {step > 2 && (
        <div className="text-muted-foreground py-12 text-center text-sm">
          Step {step} coming soon.{" "}
          <button className="text-foreground underline" onClick={() => setStep(2)}>
            Go back
          </button>
        </div>
      )}
    </div>
  );
}
