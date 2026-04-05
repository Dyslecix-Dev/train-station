"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { deleteExercise } from "@/app/(protected)/exercises/actions";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";

export function DeleteExerciseButton({ id }: { id: string }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      const result = await deleteExercise(id);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Exercise deleted.");
      }
    });
  }

  return (
    <>
      <Button variant="destructive" size="sm" onClick={() => setOpen(true)} disabled={isPending}>
        Delete
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Delete exercise?"
        description="This will permanently delete the exercise. If it has been used in workouts, it will be hidden instead."
        confirmLabel="Delete"
        destructive
        onConfirm={handleConfirm}
      />
    </>
  );
}
