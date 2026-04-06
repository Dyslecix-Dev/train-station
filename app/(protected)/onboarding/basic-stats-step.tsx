"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { buildBasicStatsSchema, type BasicStatsValues } from "@/lib/validations/onboarding";

type Props = {
  defaultValues?: Partial<BasicStatsValues>;
  onNext: (values: BasicStatsValues) => void;
};

type Units = "imperial" | "metric";

type FieldErrors = Partial<Record<keyof BasicStatsValues, string>>;

function cmToFeetInches(cm: number): { feet: number; inches: number } {
  const totalInches = cm / 2.54;
  return { feet: Math.floor(totalInches / 12), inches: Math.round(totalInches % 12) };
}

function feetInchesToCm(feet: number, inches: number): number {
  return Math.round((feet * 12 + inches) * 2.54 * 10) / 10;
}

function kgToLb(kg: number): number {
  return Math.round(kg * 2.2046 * 10) / 10;
}

function lbToKg(lb: number): number {
  return Math.round((lb / 2.2046) * 10) / 10;
}

export function BasicStatsStep({ defaultValues, onNext }: Props) {
  const [units, setUnits] = useState<Units>(defaultValues?.unitsPreference ?? "imperial");
  const [displayName, setDisplayName] = useState(defaultValues?.displayName ?? "");
  const [age, setAge] = useState(defaultValues?.age?.toString() ?? "");
  const [sex, setSex] = useState<string>(defaultValues?.sex ?? "");

  // Height state: stored as strings to preserve decimal input while typing
  const [heightCm, setHeightCm] = useState<string>(defaultValues?.heightCm?.toString() ?? "");
  const [heightFeet, setHeightFeet] = useState<string>(() => {
    if (defaultValues?.heightCm) return cmToFeetInches(defaultValues.heightCm).feet.toString();
    return "";
  });
  const [heightInches, setHeightInches] = useState<string>(() => {
    if (defaultValues?.heightCm) return cmToFeetInches(defaultValues.heightCm).inches.toString();
    return "";
  });

  // Weight state: stored as strings to preserve decimal input while typing
  const [weightKg, setWeightKg] = useState<string>(defaultValues?.weightKg?.toString() ?? "");
  const [weightLb, setWeightLb] = useState<string>(() => {
    if (defaultValues?.weightKg) return kgToLb(defaultValues.weightKg).toString();
    return "";
  });

  const [errors, setErrors] = useState<FieldErrors>({});

  function toggleUnits(next: Units) {
    setUnits(next);
    // Convert currently-entered values to the new unit display
    if (next === "metric") {
      if (heightFeet !== "" || heightInches !== "") {
        setHeightCm(feetInchesToCm(Number(heightFeet || 0), Number(heightInches || 0)).toString());
      }
      if (weightLb !== "") {
        setWeightKg(lbToKg(Number(weightLb)).toString());
      }
    } else {
      if (heightCm !== "") {
        const { feet, inches } = cmToFeetInches(Number(heightCm));
        setHeightFeet(feet.toString());
        setHeightInches(inches.toString());
      }
      if (weightKg !== "") {
        setWeightLb(kgToLb(Number(weightKg)).toString());
      }
    }
  }

  function getResolvedHeightCm(): number | "" {
    if (units === "metric") return heightCm === "" ? "" : Number(heightCm);
    if (heightFeet !== "" || heightInches !== "") {
      return feetInchesToCm(Number(heightFeet || 0), Number(heightInches || 0));
    }
    return "";
  }

  function getResolvedWeightKg(): number | "" {
    if (units === "metric") return weightKg === "" ? "" : Number(weightKg);
    if (weightLb !== "") return lbToKg(Number(weightLb));
    return "";
  }

  function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();

    const payload = {
      displayName,
      age,
      heightCm: getResolvedHeightCm(),
      weightKg: getResolvedWeightKg(),
      sex,
      unitsPreference: units,
    };

    const result = buildBasicStatsSchema(units).safeParse(payload);

    if (!result.success) {
      const fieldErrors: FieldErrors = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof BasicStatsValues;
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    onNext(result.data);
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Units toggle */}
        <div className="flex items-center gap-1 self-end rounded-md border p-1">
          <button
            type="button"
            onClick={() => toggleUnits("imperial")}
            className={cn("rounded px-3 py-1 text-sm font-medium transition-colors", units === "imperial" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}
          >
            Imperial
          </button>
          <button
            type="button"
            onClick={() => toggleUnits("metric")}
            className={cn("rounded px-3 py-1 text-sm font-medium transition-colors", units === "metric" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}
          >
            Metric
          </button>
        </div>

        {/* Display name */}
        <div className="grid gap-2">
          <Label htmlFor="displayName">Display Name</Label>
          <Input
            id="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your name"
            aria-invalid={!!errors.displayName}
            aria-describedby={errors.displayName ? "displayName-error" : undefined}
          />
          {errors.displayName && (
            <p id="displayName-error" className="text-sm text-red-500" role="alert">
              {errors.displayName}
            </p>
          )}
        </div>

        {/* Age */}
        <div className="grid gap-2">
          <Label htmlFor="age">Age</Label>
          <Input
            id="age"
            type="number"
            min={13}
            max={120}
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="Years"
            aria-invalid={!!errors.age}
            aria-describedby={errors.age ? "age-error" : undefined}
          />
          {errors.age && (
            <p id="age-error" className="text-sm text-red-500" role="alert">
              {errors.age}
            </p>
          )}
        </div>

        {/* Height */}
        <div className="grid gap-2">
          <Label>Height</Label>
          {units === "imperial" ? (
            <div className="flex gap-2">
              <div className="flex flex-1 flex-col gap-1">
                <Input type="number" min={0} max={9} value={heightFeet} onChange={(e) => setHeightFeet(e.target.value)} placeholder="ft" aria-label="Height feet" aria-invalid={!!errors.heightCm} />
              </div>
              <div className="flex flex-1 flex-col gap-1">
                <Input
                  type="number"
                  min={0}
                  max={11}
                  value={heightInches}
                  onChange={(e) => setHeightInches(e.target.value)}
                  placeholder="in"
                  aria-label="Height inches"
                  aria-invalid={!!errors.heightCm}
                />
              </div>
            </div>
          ) : (
            <Input
              type="number"
              step="any"
              min={50}
              max={300}
              value={heightCm}
              onChange={(e) => setHeightCm(e.target.value)}
              placeholder="cm"
              aria-label="Height in centimeters"
              aria-invalid={!!errors.heightCm}
              aria-describedby={errors.heightCm ? "height-error" : undefined}
            />
          )}
          {errors.heightCm && (
            <p id="height-error" className="text-sm text-red-500" role="alert">
              {errors.heightCm}
            </p>
          )}
        </div>

        {/* Weight */}
        <div className="grid gap-2">
          <Label htmlFor="weight">Weight</Label>
          {units === "imperial" ? (
            <Input
              id="weight"
              type="number"
              step="any"
              min={44}
              max={1100}
              value={weightLb}
              onChange={(e) => setWeightLb(e.target.value)}
              placeholder="lb"
              aria-invalid={!!errors.weightKg}
              aria-describedby={errors.weightKg ? "weight-error" : undefined}
            />
          ) : (
            <Input
              id="weight"
              type="number"
              step="any"
              min={20}
              max={500}
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
              placeholder="kg"
              aria-invalid={!!errors.weightKg}
              aria-describedby={errors.weightKg ? "weight-error" : undefined}
            />
          )}
          {errors.weightKg && (
            <p id="weight-error" className="text-sm text-red-500" role="alert">
              {errors.weightKg}
            </p>
          )}
        </div>

        {/* Sex */}
        <div className="grid gap-2">
          <Label htmlFor="sex">Biological Sex</Label>
          <Select value={sex} onValueChange={setSex}>
            <SelectTrigger id="sex" aria-invalid={!!errors.sex} aria-describedby={errors.sex ? "sex-error" : undefined}>
              <SelectValue placeholder="Select…" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
              <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
            </SelectContent>
          </Select>
          {errors.sex && (
            <p id="sex-error" className="text-sm text-red-500" role="alert">
              {errors.sex}
            </p>
          )}
        </div>

        <Button type="submit" className="mt-2 w-full">
          Continue
        </Button>
      </form>
    </div>
  );
}
