import { PROGRESS_METRIC_MAP } from "@/lib/workout-constants";

export const systemExercises = [
  // Strength
  {
    name: "Barbell Bench Press",
    category: "strength" as const,
    muscleGroups: ["chest", "triceps", "shoulders"],
    progressMetricType: PROGRESS_METRIC_MAP.strength,
    description:
      "Lie flat on a bench, grip the barbell slightly wider than shoulder-width, and lower it to your mid-chest before pressing back up. Keep your feet flat on the floor and maintain a slight arch in your lower back.",
  },
  {
    name: "Barbell Back Squat",
    category: "strength" as const,
    muscleGroups: ["quadriceps", "glutes", "hamstrings"],
    progressMetricType: PROGRESS_METRIC_MAP.strength,
    description:
      "Position the barbell across your upper traps, feet shoulder-width apart, and descend until your thighs are parallel to the floor. Drive through your heels to return to standing while keeping your chest up and knees tracking over your toes.",
  },
  {
    name: "Conventional Deadlift",
    category: "strength" as const,
    muscleGroups: ["hamstrings", "glutes", "back"],
    progressMetricType: PROGRESS_METRIC_MAP.strength,
    description:
      "Stand with feet hip-width apart and grip the barbell just outside your legs. Hinge at the hips with a neutral spine, then drive your hips forward to stand tall — think of pushing the floor away rather than pulling the bar up.",
  },
  {
    name: "Overhead Press",
    category: "strength" as const,
    muscleGroups: ["shoulders", "triceps"],
    progressMetricType: PROGRESS_METRIC_MAP.strength,
    description:
      "Start with the barbell at shoulder height, grip just outside shoulder-width, and press straight up until your arms are locked out overhead. Keep your core braced and avoid excessive lumbar extension.",
  },
  {
    name: "Barbell Row",
    category: "strength" as const,
    muscleGroups: ["back", "biceps"],
    progressMetricType: PROGRESS_METRIC_MAP.strength,
    description:
      "Hinge forward to roughly 45 degrees, keep a neutral spine, and pull the barbell toward your lower ribcage. Squeeze your shoulder blades together at the top and lower the bar under control.",
  },
  {
    name: "Lat Pulldown",
    category: "strength" as const,
    muscleGroups: ["back", "biceps"],
    progressMetricType: PROGRESS_METRIC_MAP.strength,
    description:
      "Grip the bar slightly wider than shoulder-width, lean back slightly, and pull the bar down to your upper chest while driving your elbows toward the floor. Avoid using momentum — control the weight on the way back up.",
  },
  {
    name: "Dumbbell Curl",
    category: "strength" as const,
    muscleGroups: ["biceps"],
    progressMetricType: PROGRESS_METRIC_MAP.strength,
    description:
      "Stand with dumbbells at your sides, palms facing forward, and curl the weights toward your shoulders while keeping your elbows pinned at your sides. Lower slowly to fully stretch the bicep.",
  },
  {
    name: "Tricep Pushdown",
    category: "strength" as const,
    muscleGroups: ["triceps"],
    progressMetricType: PROGRESS_METRIC_MAP.strength,
    description:
      "Attach a cable to an overhead pulley, grip with elbows tucked, and press the handle straight down until your arms are fully extended. Keep your upper arms stationary throughout the movement.",
  },
  {
    name: "Lateral Raise",
    category: "strength" as const,
    muscleGroups: ["shoulders"],
    progressMetricType: PROGRESS_METRIC_MAP.strength,
    description: "Hold dumbbells at your sides with a slight bend in the elbows and raise them out to shoulder height, leading with your elbows. Lower under control and avoid shrugging your traps.",
  },
  {
    name: "Romanian Deadlift",
    category: "strength" as const,
    muscleGroups: ["hamstrings", "glutes"],
    progressMetricType: PROGRESS_METRIC_MAP.strength,
    description:
      "Start standing with a barbell or dumbbells, hinge at the hips while keeping a slight knee bend, and lower the weight along your legs until you feel a deep hamstring stretch. Drive your hips forward to return to standing.",
  },

  // Cardio
  {
    name: "Running",
    category: "cardio" as const,
    muscleGroups: ["quadriceps", "hamstrings", "calves"],
    progressMetricType: PROGRESS_METRIC_MAP.cardio,
    description: "Run at a steady or varied pace, landing with a midfoot strike below your center of mass. Maintain an upright posture with a slight forward lean and relaxed arm swing.",
  },
  {
    name: "Cycling",
    category: "cardio" as const,
    muscleGroups: ["quadriceps", "hamstrings"],
    progressMetricType: PROGRESS_METRIC_MAP.cardio,
    description:
      "Pedal at a consistent cadence (80–100 RPM is a good target) while maintaining a slight bend in the knee at the bottom of the pedal stroke. Adjust seat height so your hips don't rock side to side.",
  },
  {
    name: "Rowing Machine",
    category: "cardio" as const,
    muscleGroups: ["back", "biceps", "quadriceps"],
    progressMetricType: PROGRESS_METRIC_MAP.cardio,
    description:
      "Drive with your legs first, then lean back slightly and pull the handle to your lower ribcage. Return by extending your arms, leaning forward, and bending your knees — legs, body, arms on the drive; arms, body, legs on the recovery.",
  },
  {
    name: "Jump Rope",
    category: "cardio" as const,
    muscleGroups: ["calves", "shoulders"],
    progressMetricType: PROGRESS_METRIC_MAP.cardio,
    description:
      "Keep the rope's rotation in your wrists rather than your arms, stay on the balls of your feet, and aim for a small, consistent hop. Start with basic two-foot jumps before progressing to alternate-foot or double-unders.",
  },
  {
    name: "Stair Climber",
    category: "cardio" as const,
    muscleGroups: ["quadriceps", "glutes", "calves"],
    progressMetricType: PROGRESS_METRIC_MAP.cardio,
    description: "Step at a controlled pace without leaning heavily on the handrails, driving through your full foot on each step. Keeping your torso upright maximizes glute and quad engagement.",
  },

  // Bodyweight
  {
    name: "Push-up",
    category: "bodyweight" as const,
    muscleGroups: ["chest", "triceps", "shoulders"],
    progressMetricType: PROGRESS_METRIC_MAP.bodyweight,
    description:
      "Start in a high plank with hands just outside shoulder-width, lower your chest to the floor while keeping your body in a straight line, then press back up. Keep your core tight and avoid letting your hips sag or pike.",
  },
  {
    name: "Pull-up",
    category: "bodyweight" as const,
    muscleGroups: ["back", "biceps"],
    progressMetricType: PROGRESS_METRIC_MAP.bodyweight,
    description:
      "Hang from a bar with an overhand grip slightly wider than shoulder-width and pull until your chin clears the bar. Lower slowly to a full dead hang before each rep to maximize range of motion.",
  },
  {
    name: "Lunge",
    category: "bodyweight" as const,
    muscleGroups: ["quadriceps", "glutes", "hamstrings"],
    progressMetricType: PROGRESS_METRIC_MAP.bodyweight,
    description:
      "Step forward with one foot and lower your back knee toward the floor, keeping your front shin vertical and torso upright. Push through your front heel to return to standing, then alternate legs.",
  },
  {
    name: "Burpee",
    category: "bodyweight" as const,
    muscleGroups: ["chest", "quadriceps", "shoulders"],
    progressMetricType: PROGRESS_METRIC_MAP.bodyweight,
    description:
      "From standing, drop your hands to the floor, jump or step your feet back to a push-up position, perform a push-up, jump your feet back to your hands, then explode upward with a jump and clap overhead.",
  },

  // Flexibility
  {
    name: "Plank",
    category: "flexibility" as const,
    muscleGroups: ["core"],
    progressMetricType: PROGRESS_METRIC_MAP.flexibility,
    description:
      "Hold a forearm or high plank position with your body forming a straight line from head to heels. Brace your core, squeeze your glutes, and breathe steadily — avoid letting your hips sag or rise.",
  },
  {
    name: "Hamstring Stretch",
    category: "flexibility" as const,
    muscleGroups: ["hamstrings"],
    progressMetricType: PROGRESS_METRIC_MAP.flexibility,
    description:
      "Sit on the floor with one leg extended, hinge forward from the hips (not the waist), and reach toward your foot until you feel a gentle pull in the back of the thigh. Hold the position without bouncing.",
  },
  {
    name: "Pigeon Pose",
    category: "flexibility" as const,
    muscleGroups: ["glutes", "hamstrings"],
    progressMetricType: PROGRESS_METRIC_MAP.flexibility,
    description:
      "From a high plank, bring one knee forward and place it behind your same-side wrist, then lower your back leg flat on the floor. Fold forward over your front shin and breathe into the hip stretch.",
  },
  {
    name: "Child's Pose",
    category: "flexibility" as const,
    muscleGroups: ["back", "shoulders"],
    progressMetricType: PROGRESS_METRIC_MAP.flexibility,
    description:
      "Kneel on the floor, sit back toward your heels, and stretch your arms forward on the ground while lowering your forehead to the floor. Breathe deeply and allow your lower back and hips to relax with each exhale.",
  },
] as const;
