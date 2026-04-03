-- NOTE: shared trigger function - auto-updates `updated_at` on every row change.
-- NOTE: applied to - user_profiles, exercises, workout_templates, foods

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
