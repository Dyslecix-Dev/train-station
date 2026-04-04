ALTER TABLE "user_profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "exercises" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "workout_templates" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "workout_template_exercises" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "workouts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "workout_exercises" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "workout_sets" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "foods" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "meal_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "water_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "body_stats_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "sleep_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "mood_logs" ENABLE ROW LEVEL SECURITY;

-- user_profiles: own rows only (auth_user_id = auth.uid())
CREATE POLICY "user_profiles_select" ON "user_profiles"
  FOR SELECT USING (auth_user_id = auth.uid());

CREATE POLICY "user_profiles_insert" ON "user_profiles"
  FOR INSERT WITH CHECK (auth_user_id = auth.uid());

CREATE POLICY "user_profiles_update" ON "user_profiles"
  FOR UPDATE USING (auth_user_id = auth.uid());

CREATE POLICY "user_profiles_delete" ON "user_profiles"
  FOR DELETE USING (auth_user_id = auth.uid());

-- exercises: SELECT system rows OR own rows; mutate own rows only
CREATE POLICY "exercises_select" ON "exercises"
  FOR SELECT USING (
    is_system = true
    OR created_by = (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "exercises_insert" ON "exercises"
  FOR INSERT WITH CHECK (
    created_by = (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "exercises_update" ON "exercises"
  FOR UPDATE USING (
    created_by = (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "exercises_delete" ON "exercises"
  FOR DELETE USING (
    created_by = (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid())
  );

-- workout_templates: own rows only (user_id = profile id)
CREATE POLICY "workout_templates_select" ON "workout_templates"
  FOR SELECT USING (
    user_id = (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "workout_templates_insert" ON "workout_templates"
  FOR INSERT WITH CHECK (
    user_id = (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "workout_templates_update" ON "workout_templates"
  FOR UPDATE USING (
    user_id = (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "workout_templates_delete" ON "workout_templates"
  FOR DELETE USING (
    user_id = (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid())
  );

-- workout_template_exercises: access only if parent template is owned
CREATE POLICY "workout_template_exercises_select" ON "workout_template_exercises"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workout_templates wt
      JOIN user_profiles up ON up.id = wt.user_id
      WHERE wt.id = template_id AND up.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "workout_template_exercises_insert" ON "workout_template_exercises"
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM workout_templates wt
      JOIN user_profiles up ON up.id = wt.user_id
      WHERE wt.id = template_id AND up.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "workout_template_exercises_update" ON "workout_template_exercises"
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM workout_templates wt
      JOIN user_profiles up ON up.id = wt.user_id
      WHERE wt.id = template_id AND up.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "workout_template_exercises_delete" ON "workout_template_exercises"
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM workout_templates wt
      JOIN user_profiles up ON up.id = wt.user_id
      WHERE wt.id = template_id AND up.auth_user_id = auth.uid()
    )
  );

-- workouts: own rows only (user_id = profile id)
CREATE POLICY "workouts_select" ON "workouts"
  FOR SELECT USING (
    user_id = (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "workouts_insert" ON "workouts"
  FOR INSERT WITH CHECK (
    user_id = (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "workouts_update" ON "workouts"
  FOR UPDATE USING (
    user_id = (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "workouts_delete" ON "workouts"
  FOR DELETE USING (
    user_id = (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid())
  );

-- workout_exercises: access only if parent workout is owned
CREATE POLICY "workout_exercises_select" ON "workout_exercises"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workouts w
      JOIN user_profiles up ON up.id = w.user_id
      WHERE w.id = workout_id AND up.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "workout_exercises_insert" ON "workout_exercises"
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM workouts w
      JOIN user_profiles up ON up.id = w.user_id
      WHERE w.id = workout_id AND up.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "workout_exercises_update" ON "workout_exercises"
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM workouts w
      JOIN user_profiles up ON up.id = w.user_id
      WHERE w.id = workout_id AND up.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "workout_exercises_delete" ON "workout_exercises"
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM workouts w
      JOIN user_profiles up ON up.id = w.user_id
      WHERE w.id = workout_id AND up.auth_user_id = auth.uid()
    )
  );

-- workout_sets: access only if grandparent workout is owned (workout_exercises → workouts)
CREATE POLICY "workout_sets_select" ON "workout_sets"
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workout_exercises we
      JOIN workouts w ON w.id = we.workout_id
      JOIN user_profiles up ON up.id = w.user_id
      WHERE we.id = workout_exercise_id AND up.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "workout_sets_insert" ON "workout_sets"
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM workout_exercises we
      JOIN workouts w ON w.id = we.workout_id
      JOIN user_profiles up ON up.id = w.user_id
      WHERE we.id = workout_exercise_id AND up.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "workout_sets_update" ON "workout_sets"
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM workout_exercises we
      JOIN workouts w ON w.id = we.workout_id
      JOIN user_profiles up ON up.id = w.user_id
      WHERE we.id = workout_exercise_id AND up.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "workout_sets_delete" ON "workout_sets"
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM workout_exercises we
      JOIN workouts w ON w.id = we.workout_id
      JOIN user_profiles up ON up.id = w.user_id
      WHERE we.id = workout_exercise_id AND up.auth_user_id = auth.uid()
    )
  );

-- foods: SELECT system rows OR own rows; mutate own rows only
CREATE POLICY "foods_select" ON "foods"
  FOR SELECT USING (
    is_system = true
    OR created_by = (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "foods_insert" ON "foods"
  FOR INSERT WITH CHECK (
    created_by = (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "foods_update" ON "foods"
  FOR UPDATE USING (
    created_by = (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "foods_delete" ON "foods"
  FOR DELETE USING (
    created_by = (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid())
  );

-- meal_logs: own rows only
CREATE POLICY "meal_logs_select" ON "meal_logs"
  FOR SELECT USING (
    user_id = (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "meal_logs_insert" ON "meal_logs"
  FOR INSERT WITH CHECK (
    user_id = (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "meal_logs_update" ON "meal_logs"
  FOR UPDATE USING (
    user_id = (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "meal_logs_delete" ON "meal_logs"
  FOR DELETE USING (
    user_id = (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid())
  );

-- water_logs: own rows only
CREATE POLICY "water_logs_select" ON "water_logs"
  FOR SELECT USING (
    user_id = (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "water_logs_insert" ON "water_logs"
  FOR INSERT WITH CHECK (
    user_id = (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "water_logs_update" ON "water_logs"
  FOR UPDATE USING (
    user_id = (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "water_logs_delete" ON "water_logs"
  FOR DELETE USING (
    user_id = (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid())
  );

-- body_stats_logs: own rows only
CREATE POLICY "body_stats_logs_select" ON "body_stats_logs"
  FOR SELECT USING (
    user_id = (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "body_stats_logs_insert" ON "body_stats_logs"
  FOR INSERT WITH CHECK (
    user_id = (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "body_stats_logs_update" ON "body_stats_logs"
  FOR UPDATE USING (
    user_id = (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "body_stats_logs_delete" ON "body_stats_logs"
  FOR DELETE USING (
    user_id = (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid())
  );

-- sleep_logs: own rows only
CREATE POLICY "sleep_logs_select" ON "sleep_logs"
  FOR SELECT USING (
    user_id = (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "sleep_logs_insert" ON "sleep_logs"
  FOR INSERT WITH CHECK (
    user_id = (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "sleep_logs_update" ON "sleep_logs"
  FOR UPDATE USING (
    user_id = (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "sleep_logs_delete" ON "sleep_logs"
  FOR DELETE USING (
    user_id = (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid())
  );

-- mood_logs: own rows only
CREATE POLICY "mood_logs_select" ON "mood_logs"
  FOR SELECT USING (
    user_id = (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "mood_logs_insert" ON "mood_logs"
  FOR INSERT WITH CHECK (
    user_id = (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "mood_logs_update" ON "mood_logs"
  FOR UPDATE USING (
    user_id = (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "mood_logs_delete" ON "mood_logs"
  FOR DELETE USING (
    user_id = (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid())
  );
