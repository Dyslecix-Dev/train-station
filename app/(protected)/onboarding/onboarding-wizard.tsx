"use client";

import { type BasicStatsValues } from "@/lib/validations/onboarding";
import { useState } from "react";

import { BasicStatsStep } from "./basic-stats-step";

type WizardState = {
  basicStats?: BasicStatsValues;
};

export function OnboardingWizard() {
  const [step, setStep] = useState(1);
  const [wizardState, setWizardState] = useState<WizardState>({});

  function handleBasicStatsNext(values: BasicStatsValues) {
    setWizardState((prev) => ({ ...prev, basicStats: values }));
    setStep(2);
  }

  return (
    <div className="mx-auto w-full max-w-md">
      {step === 1 && <BasicStatsStep defaultValues={wizardState.basicStats} onNext={handleBasicStatsNext} />}
      {step > 1 && (
        <div className="text-muted-foreground py-12 text-center text-sm">
          Step {step} coming soon.{" "}
          <button className="text-foreground underline" onClick={() => setStep(1)}>
            Go back
          </button>
        </div>
      )}
    </div>
  );
}
