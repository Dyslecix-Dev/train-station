"use client";

import type { SubmissionResult } from "@conform-to/react";
import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod/v4";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useActionState, useState } from "react";
import { toast } from "sonner";

import { updateExercise } from "@/app/(protected)/exercises/actions";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Exercise } from "@/lib/db/schema/exercises";
import { createExerciseSchema } from "@/lib/validations/exercise";
import { EXERCISE_CATEGORIES, MUSCLE_GROUPS } from "@/lib/workout-constants";

const CATEGORY_LABELS: Record<string, string> = {
  strength: "Strength",
  cardio: "Cardio",
  bodyweight: "Bodyweight",
  flexibility: "Flexibility",
  other: "Other",
};

const MUSCLE_GROUP_LABELS: Record<string, string> = {
  chest: "Chest",
  back: "Back",
  shoulders: "Shoulders",
  biceps: "Biceps",
  triceps: "Triceps",
  core: "Core",
  quadriceps: "Quadriceps",
  hamstrings: "Hamstrings",
  glutes: "Glutes",
  calves: "Calves",
  full_body: "Full Body",
  other: "Other",
};

export function EditExerciseForm({ exercise }: { exercise: Exercise }) {
  const router = useRouter();

  const boundAction = updateExercise.bind(null, exercise.id);

  const [lastResult, formAction, isPending] = useActionState(async (_prev: SubmissionResult<string[]> | null, formData: FormData): Promise<SubmissionResult<string[]> | null> => {
    const result = await boundAction(_prev, formData);

    if (result && "error" in result) {
      toast.error(result.error as string);
      return null;
    }

    const submission = result as SubmissionResult<string[]>;
    if (submission?.status === "success") {
      toast.success("Exercise updated");
      router.push(`/exercises/${exercise.id}`);
      return null;
    }

    return submission ?? null;
  }, null);

  const [category, setCategory] = useState(exercise.category);
  const [muscleGroups, setMuscleGroups] = useState<string[]>(exercise.muscleGroups ?? []);
  const [imagePreview, setImagePreview] = useState<string | null>(exercise.imageUrl ?? null);

  const [form, fields] = useForm({
    lastResult,
    defaultValue: {
      name: exercise.name,
      category: exercise.category,
      muscleGroups: exercise.muscleGroups ?? [],
      description: exercise.description ?? "",
      imageUrl: exercise.imageUrl ?? "",
      videoUrl: exercise.videoUrl ?? "",
    },
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: createExerciseSchema });
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    }
  }

  function toggleMuscleGroup(mg: string) {
    setMuscleGroups((prev) => (prev.includes(mg) ? prev.filter((x) => x !== mg) : [...prev, mg]));
  }

  return (
    <form id={form.id} onSubmit={form.onSubmit} action={formAction} className="flex flex-col gap-5" encType="multipart/form-data">
      {form.errors && (
        <p className="text-sm text-red-500" role="alert">
          {form.errors[0]}
        </p>
      )}

      {/* Name */}
      <div className="grid gap-2">
        <Label htmlFor={fields.name.id}>Name</Label>
        <Input
          key={fields.name.key}
          id={fields.name.id}
          name={fields.name.name}
          defaultValue={fields.name.initialValue as string | undefined}
          placeholder="e.g. Barbell Squat"
          aria-invalid={!!fields.name.errors}
          aria-describedby={fields.name.errors ? `${fields.name.id}-error` : undefined}
        />
        {fields.name.errors && (
          <p id={`${fields.name.id}-error`} className="text-sm text-red-500" role="alert">
            {fields.name.errors[0]}
          </p>
        )}
      </div>

      {/* Category */}
      <div className="grid gap-2">
        <Label htmlFor={fields.category.id}>Category</Label>
        <input type="hidden" name={fields.category.name} value={category} />
        <Select value={category} onValueChange={(value) => setCategory(value as typeof category)}>
          <SelectTrigger id={fields.category.id} aria-invalid={!!fields.category.errors} aria-describedby={fields.category.errors ? `${fields.category.id}-error` : undefined}>
            <SelectValue placeholder="Select category…" />
          </SelectTrigger>
          <SelectContent>
            {EXERCISE_CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {CATEGORY_LABELS[cat]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {fields.category.errors && (
          <p id={`${fields.category.id}-error`} className="text-sm text-red-500" role="alert">
            {fields.category.errors[0]}
          </p>
        )}
      </div>

      {/* Muscle groups */}
      <div className="grid gap-2">
        <Label>Muscle Groups</Label>
        {muscleGroups.map((mg) => (
          <input key={mg} type="hidden" name={fields.muscleGroups.name} value={mg} />
        ))}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {MUSCLE_GROUPS.map((mg) => (
            <label key={mg} className="flex cursor-pointer items-center gap-2">
              <Checkbox id={`mg-${mg}`} checked={muscleGroups.includes(mg)} onCheckedChange={() => toggleMuscleGroup(mg)} />
              <span className="text-sm">{MUSCLE_GROUP_LABELS[mg]}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Description */}
      <div className="grid gap-2">
        <Label htmlFor={fields.description.id}>
          Description <span className="text-muted-foreground font-normal">(optional)</span>
        </Label>
        <Textarea
          key={fields.description.key}
          id={fields.description.id}
          name={fields.description.name}
          defaultValue={fields.description.initialValue as string | undefined}
          placeholder="Brief description of the exercise…"
          rows={3}
          aria-invalid={!!fields.description.errors}
          aria-describedby={fields.description.errors ? `${fields.description.id}-error` : undefined}
        />
        {fields.description.errors && (
          <p id={`${fields.description.id}-error`} className="text-sm text-red-500" role="alert">
            {fields.description.errors[0]}
          </p>
        )}
      </div>

      {/* Image upload */}
      <div className="grid gap-2">
        <Label htmlFor="imageFile">
          Image <span className="text-muted-foreground font-normal">(optional)</span>
        </Label>
        <Input id="imageFile" name="imageFile" type="file" accept="image/*" onChange={handleImageChange} />
        {imagePreview && <Image src={imagePreview} alt="Preview" width={128} height={128} className="mt-1 h-32 w-32 rounded-md object-cover" />}
      </div>

      {/* Video URL */}
      <div className="grid gap-2">
        <Label htmlFor={fields.videoUrl.id}>
          Video URL <span className="text-muted-foreground font-normal">(optional)</span>
        </Label>
        <Input
          key={fields.videoUrl.key}
          id={fields.videoUrl.id}
          name={fields.videoUrl.name}
          defaultValue={fields.videoUrl.initialValue as string | undefined}
          type="url"
          placeholder="https://youtube.com/…"
          aria-invalid={!!fields.videoUrl.errors}
          aria-describedby={fields.videoUrl.errors ? `${fields.videoUrl.id}-error` : undefined}
        />
        {fields.videoUrl.errors && (
          <p id={`${fields.videoUrl.id}-error`} className="text-sm text-red-500" role="alert">
            {fields.videoUrl.errors[0]}
          </p>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={isPending}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving…" : "Save Changes"}
        </Button>
      </div>
    </form>
  );
}
