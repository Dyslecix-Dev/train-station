# Phase 5 — Workout Templates

## Done-State Check

Before starting, verify Phase 3 outputs exist: `exercises` table has seed data (`pnpm db:seed` ran), exercise list page renders at `/exercises`.

## Context for Claude Code

Templates define reusable workout structures. Each template has three sections (warm_up, main, cooldown) containing exercises in a specific order. Templates do NOT track sets/reps/weight — those are configured during the actual workout. Templates define the exercise lineup, order, and default rest timers. Use server components for list/detail views, Conform + Zod for forms, server actions for mutations, and move up/down buttons (or drag-and-drop) for reordering.

**Important:** Import `SECTION_LABELS` from `lib/workout-constants.ts` for display labels. Never hardcode "Dynamic Warm-Up", "Main Routine", or "Static Cooldown" as string literals.

---

## Checklist

### Template List Page

- [ ] Create page at `app/(protected)/workouts/templates/page.tsx` (server component)
- [ ] Fetch all templates for the current user with exercise count
- [ ] Display as cards in a grid: template name, description (truncated), number of exercises, last updated date
- [ ] "Create Template" button (prominent, always visible)
- [ ] `EmptyState`: "You haven't created any templates yet. Create your first workout template to get started."
- [ ] No pagination needed for v1

### Create Template Page

- [ ] Create page at `app/(protected)/workouts/templates/new/page.tsx`
- [ ] Two-phase flow: Step 1 = name/description, Step 2 = add exercises to sections

#### Step 1: Template Info

- [ ] Conform form with: name (text, required, max 100 chars), description (textarea, optional, max 500 chars)
- [ ] Zod schema in `lib/validations/template.ts`
- [ ] On submit: create the template row via server action, then navigate to the template editor (Step 2)

#### Step 2: Template Exercise Editor

- [ ] Three collapsible sections using display labels from `SECTION_LABELS` (import from `lib/workout-constants.ts`): "Dynamic Warm-Up", "Main Routine", "Static Cooldown"
- [ ] Each section shows its exercises in order with:
  - Exercise name + category badge
  - Default rest between sets (editable inline, seconds)
  - Rest before next exercise (editable inline, seconds)
  - Notes field (editable inline, optional)
  - Remove button (X icon)
  - Move up/down buttons for reordering (or drag handle if using drag-and-drop)
- [ ] "Add Exercise" button per section — opens a dialog/sheet with:
  - Exercise search (text input, filters the exercise list)
  - Category filter tabs
  - Selectable exercise list (click to add)
  - Shows already-added exercises as disabled/grayed
  - Filters out exercises where `deleted_at IS NOT NULL`
  - After selecting, exercise is appended to that section's list
- [ ] When adding, auto-set `sort_order` based on position in the section
- [ ] Save all changes via a single "Save Template" server action that upserts all `workout_template_exercises` rows

### Reordering Exercises

- [ ] Option A (simpler): Move Up / Move Down icon buttons on each exercise row. Update `sort_order` values on click.
- [ ] Option B (nicer): Drag and drop using native HTML drag-and-drop. Update `sort_order` on drop.
- [ ] Reordering should be possible both within a section and across sections (e.g., move an exercise from warm_up to main — this changes both `sort_order` and `section`)
- [ ] Persist reorder via server action on save (not on every drag)

### Edit Template

- [ ] Create page at `app/(protected)/workouts/templates/[id]/edit/page.tsx`
- [ ] Load the existing template with all its exercises
- [ ] Same editor UI as create, pre-populated
- [ ] Server action: validate ownership, update template name/description, replace exercises (delete removed ones, insert new ones, update order/rest values)
- [ ] Important: editing a template does NOT affect past workouts (they used snapshots)

### Delete Template

- [ ] `ConfirmDialog`: "This will permanently delete this template. Past workouts that used this template are not affected."
- [ ] Server action: verify ownership, delete (cascades to `workout_template_exercises`)
- [ ] On success: call `revalidatePath("/workouts/templates")`, redirect to template list, show toast

### Template Detail / Preview

- [ ] Create page at `app/(protected)/workouts/templates/[id]/page.tsx` (server component)
- [ ] Read-only view of the template: name, description, all exercises grouped by section (using `SECTION_LABELS` for display)
- [ ] Each exercise shows: name, category, rest timers, notes
- [ ] Action buttons: "Start Workout" (navigates to active workout flow), "Edit", "Delete"
- [ ] "Start Workout" is the primary CTA

### Server Actions

- [ ] Create `app/(protected)/workouts/templates/actions.ts` with:
  - `createTemplate(formData)` — validate, insert template, return ID
  - `updateTemplate(id, formData)` — validate ownership, update
  - `deleteTemplate(id)` — validate ownership, delete
  - `updateTemplateExercises(templateId, exercises[])` — validate ownership, replace all exercises for this template (delete existing, insert new in order)
- [ ] All actions: rate limited, authenticated, with proper error handling returning via Conform
- [ ] All mutating actions call `revalidatePath("/workouts/templates")` and the specific template path

### Zod Schemas

- [ ] In `lib/validations/template.ts`:
  - `templateInfoSchema`: name (string, min 1, max 100), description (string, max 500, optional)
  - `templateExerciseSchema`: exercise_id (uuid), section (enum from workout-constants), sort_order (number), default_sets (number, optional), default_rest_seconds (number, optional, 0–600), rest_between_exercises_seconds (number, optional, 0–600), notes (string, max 500, optional)
  - `templateExercisesArraySchema`: array of templateExerciseSchema, min 1 exercise required
