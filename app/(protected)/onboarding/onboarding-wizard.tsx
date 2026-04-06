"use client";

import { AnimatePresence, motion, useSpring, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";

import { type ActivityLevelValues, type BasicStatsValues, type PrimaryGoalValues } from "@/lib/validations/onboarding";

import { ActivityLevelStep } from "@/app/(protected)/onboarding/activity-level-step";
import { BasicStatsStep } from "@/app/(protected)/onboarding/basic-stats-step";
import { PrimaryGoalStep } from "@/app/(protected)/onboarding/primary-goal-step";
import { ReviewConfirmStep } from "@/app/(protected)/onboarding/review-confirm-step";

type WizardState = {
  basicStats?: BasicStatsValues;
  activityLevel?: ActivityLevelValues;
  primaryGoal?: PrimaryGoalValues;
};

const STEPS = [{ label: "Basic Stats" }, { label: "Activity Level" }, { label: "Primary Goal" }, { label: "Review & Confirm" }];

const contentVariants = {
  enter: (direction: number) => ({ x: direction > 0 ? 40 : -40, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: direction > 0 ? -40 : 40, opacity: 0 }),
};

export function OnboardingWizard() {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [wizardState, setWizardState] = useState<WizardState>({});
  const prevStep = useRef(step);

  const progressSpring = useSpring(25, { stiffness: 120, damping: 20 });
  const progressWidth = useTransform(progressSpring, (v) => `${v}%`);

  // Warn before leaving mid-onboarding
  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault();
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  function goTo(next: number) {
    setDirection(next > prevStep.current ? 1 : -1);
    prevStep.current = next;
    setStep(next);
    progressSpring.set((next / STEPS.length) * 100);
  }

  function handleBasicStatsNext(values: BasicStatsValues) {
    setWizardState((prev) => ({ ...prev, basicStats: values }));
    goTo(2);
  }

  function handleActivityLevelNext(values: ActivityLevelValues) {
    setWizardState((prev) => ({ ...prev, activityLevel: values }));
    goTo(3);
  }

  function handlePrimaryGoalNext(values: PrimaryGoalValues) {
    setWizardState((prev) => ({ ...prev, primaryGoal: values }));
    goTo(4);
  }

  function handleBack(target: 1 | 2 | 3) {
    goTo(target);
  }

  return (
    <div className="mx-auto w-full max-w-md">
      {/* Progress bar — static, outside AnimatePresence */}
      <div className="mb-6 flex flex-col gap-2 px-2">
        <div className="flex items-center justify-between text-sm">
          <AnimatePresence mode="wait">
            <motion.span
              key={step}
              className="text-muted-foreground"
              initial={{ opacity: 0, y: direction > 0 ? 6 : -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: direction > 0 ? -6 : 6 }}
              transition={{ duration: 0.15, ease: "easeInOut" }}
            >
              Step {step} of {STEPS.length}
            </motion.span>
          </AnimatePresence>
          <AnimatePresence mode="wait">
            <motion.span
              key={step}
              className="font-medium"
              initial={{ opacity: 0, y: direction > 0 ? 6 : -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: direction > 0 ? -6 : 6 }}
              transition={{ duration: 0.15, ease: "easeInOut" }}
            >
              {STEPS[step - 1].label}
            </motion.span>
          </AnimatePresence>
        </div>
        <div className="bg-secondary h-2 w-full overflow-hidden rounded-full">
          <motion.div className="bg-primary h-full rounded-full" style={{ width: progressWidth }} />
        </div>
      </div>

      {/* Step content */}
      <div className="overflow-hidden px-2">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div key={step} custom={direction} variants={contentVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.2, ease: "easeInOut" }}>
            {step === 1 && <BasicStatsStep defaultValues={wizardState.basicStats} onNext={handleBasicStatsNext} />}
            {step === 2 && <ActivityLevelStep defaultValues={wizardState.activityLevel} onNext={handleActivityLevelNext} onBack={() => goTo(1)} />}
            {step === 3 && <PrimaryGoalStep defaultValues={wizardState.primaryGoal} onNext={handlePrimaryGoalNext} onBack={() => goTo(2)} />}
            {step === 4 && wizardState.basicStats && wizardState.activityLevel && wizardState.primaryGoal && (
              <ReviewConfirmStep basicStats={wizardState.basicStats} activityLevel={wizardState.activityLevel} primaryGoal={wizardState.primaryGoal} onBack={handleBack} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
