CREATE TABLE "exercises" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"category" text NOT NULL,
	"muscle_groups" text[],
	"progress_metric_type" text NOT NULL,
	"image_url" text,
	"video_url" text,
	"is_system" boolean DEFAULT false NOT NULL,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "exercises_name_created_by_unique" UNIQUE("name","created_by")
);
--> statement-breakpoint
CREATE TABLE "mood_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"date" date NOT NULL,
	"mood_score" integer NOT NULL,
	"emotions" text[] NOT NULL,
	"journal_entry" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "mood_logs_user_id_date_unique" UNIQUE("user_id","date"),
	CONSTRAINT "mood_score_range" CHECK ("mood_logs"."mood_score" >= 1 AND "mood_logs"."mood_score" <= 5)
);
--> statement-breakpoint
CREATE TABLE "body_stats_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"date" date NOT NULL,
	"weight_kg" numeric(5, 1),
	"body_fat_percentage" numeric(4, 1),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "body_stats_logs_user_id_date_unique" UNIQUE("user_id","date")
);
--> statement-breakpoint
CREATE TABLE "foods" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"brand" text,
	"serving_size" numeric(8, 2) NOT NULL,
	"serving_unit" text NOT NULL,
	"calories" numeric(8, 2) NOT NULL,
	"protein_g" numeric(8, 2),
	"carbs_g" numeric(8, 2),
	"fat_g" numeric(8, 2),
	"fiber_g" numeric(8, 2),
	"fdc_id" text,
	"is_system" boolean DEFAULT false NOT NULL,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "meal_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"date" date NOT NULL,
	"meal_type" text NOT NULL,
	"food_id" uuid NOT NULL,
	"servings" numeric(6, 2) DEFAULT '1' NOT NULL,
	"calories_snapshot" numeric(8, 2) NOT NULL,
	"protein_g_snapshot" numeric(8, 2),
	"carbs_g_snapshot" numeric(8, 2),
	"fat_g_snapshot" numeric(8, 2),
	"fiber_g_snapshot" numeric(8, 2),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "water_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"date" date NOT NULL,
	"amount_ml" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "push_subscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"endpoint" text NOT NULL,
	"p256dh" text NOT NULL,
	"auth" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "push_subscriptions_endpoint_unique" UNIQUE("endpoint")
);
--> statement-breakpoint
CREATE TABLE "sleep_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"date" date NOT NULL,
	"bedtime" timestamp with time zone NOT NULL,
	"wake_time" timestamp with time zone NOT NULL,
	"duration_minutes" integer NOT NULL,
	"quality" integer NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sleep_logs_user_id_date_unique" UNIQUE("user_id","date"),
	CONSTRAINT "quality_range" CHECK ("sleep_logs"."quality" >= 1 AND "sleep_logs"."quality" <= 5),
	CONSTRAINT "wake_after_bedtime" CHECK ("sleep_logs"."wake_time" > "sleep_logs"."bedtime")
);
--> statement-breakpoint
CREATE TABLE "user_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"auth_user_id" uuid NOT NULL,
	"display_name" text,
	"age" integer,
	"height_cm" numeric(5, 1),
	"weight_kg" numeric(5, 1),
	"sex" text,
	"activity_level" text,
	"primary_goal" text,
	"units_preference" text DEFAULT 'imperial' NOT NULL,
	"timezone" text DEFAULT 'America/New_York' NOT NULL,
	"calorie_target" integer,
	"protein_target_g" integer,
	"carbs_target_g" integer,
	"fat_target_g" integer,
	"fiber_target_g" integer,
	"water_target_ml" integer DEFAULT 2000 NOT NULL,
	"current_streak" integer DEFAULT 0 NOT NULL,
	"last_streak_date" date,
	"onboarding_completed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_profiles_auth_user_id_unique" UNIQUE("auth_user_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"last_active_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "workout_template_exercises" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"template_id" uuid NOT NULL,
	"exercise_id" uuid NOT NULL,
	"section" text NOT NULL,
	"sort_order" integer NOT NULL,
	"default_sets" integer,
	"default_rest_seconds" integer,
	"rest_between_exercises_seconds" integer,
	"notes" text,
	CONSTRAINT "workout_template_exercises_template_id_sort_order_unique" UNIQUE("template_id","sort_order")
);
--> statement-breakpoint
CREATE TABLE "workout_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workout_exercises" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workout_id" uuid NOT NULL,
	"exercise_id" uuid NOT NULL,
	"section" text NOT NULL,
	"sort_order" integer NOT NULL,
	"rest_between_exercises_seconds" integer,
	"notes" text,
	CONSTRAINT "workout_exercises_workout_id_sort_order_unique" UNIQUE("workout_id","sort_order")
);
--> statement-breakpoint
CREATE TABLE "workout_sets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workout_exercise_id" uuid NOT NULL,
	"set_number" integer NOT NULL,
	"is_warmup_set" boolean DEFAULT false NOT NULL,
	"weight_kg" numeric(6, 2),
	"reps" integer,
	"duration_seconds" integer,
	"distance_km" numeric(8, 3),
	"rpe" integer,
	"rir" integer,
	"rest_seconds" integer,
	"completed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "workout_sets_workout_exercise_id_set_number_unique" UNIQUE("workout_exercise_id","set_number"),
	CONSTRAINT "rpe_range" CHECK ("workout_sets"."rpe" IS NULL OR ("workout_sets"."rpe" >= 1 AND "workout_sets"."rpe" <= 10)),
	CONSTRAINT "rir_range" CHECK ("workout_sets"."rir" IS NULL OR ("workout_sets"."rir" >= 0 AND "workout_sets"."rir" <= 5))
);
--> statement-breakpoint
CREATE TABLE "workouts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"template_id" uuid,
	"template_snapshot" jsonb,
	"name" text NOT NULL,
	"started_at" timestamp with time zone NOT NULL,
	"completed_at" timestamp with time zone,
	"duration_seconds" integer,
	"status" text DEFAULT 'in_progress' NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "exercises" ADD CONSTRAINT "exercises_created_by_user_profiles_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mood_logs" ADD CONSTRAINT "mood_logs_user_id_user_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "body_stats_logs" ADD CONSTRAINT "body_stats_logs_user_id_user_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "foods" ADD CONSTRAINT "foods_created_by_user_profiles_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meal_logs" ADD CONSTRAINT "meal_logs_user_id_user_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meal_logs" ADD CONSTRAINT "meal_logs_food_id_foods_id_fk" FOREIGN KEY ("food_id") REFERENCES "public"."foods"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "water_logs" ADD CONSTRAINT "water_logs_user_id_user_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sleep_logs" ADD CONSTRAINT "sleep_logs_user_id_user_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_template_exercises" ADD CONSTRAINT "workout_template_exercises_template_id_workout_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."workout_templates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_template_exercises" ADD CONSTRAINT "workout_template_exercises_exercise_id_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_templates" ADD CONSTRAINT "workout_templates_user_id_user_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_exercises" ADD CONSTRAINT "workout_exercises_workout_id_workouts_id_fk" FOREIGN KEY ("workout_id") REFERENCES "public"."workouts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_exercises" ADD CONSTRAINT "workout_exercises_exercise_id_exercises_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_sets" ADD CONSTRAINT "workout_sets_workout_exercise_id_workout_exercises_id_fk" FOREIGN KEY ("workout_exercise_id") REFERENCES "public"."workout_exercises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workouts" ADD CONSTRAINT "workouts_user_id_user_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workouts" ADD CONSTRAINT "workouts_template_id_workout_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."workout_templates"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "exercises_created_by_idx" ON "exercises" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "exercises_category_idx" ON "exercises" USING btree ("category");--> statement-breakpoint
CREATE INDEX "mood_logs_user_id_date_idx" ON "mood_logs" USING btree ("user_id","date");--> statement-breakpoint
CREATE INDEX "body_stats_logs_user_id_date_idx" ON "body_stats_logs" USING btree ("user_id","date");--> statement-breakpoint
CREATE INDEX "meal_logs_user_id_date_idx" ON "meal_logs" USING btree ("user_id","date");--> statement-breakpoint
CREATE INDEX "water_logs_user_id_date_idx" ON "water_logs" USING btree ("user_id","date");--> statement-breakpoint
CREATE INDEX "sleep_logs_user_id_date_idx" ON "sleep_logs" USING btree ("user_id","date");--> statement-breakpoint
CREATE INDEX "workout_templates_user_id_idx" ON "workout_templates" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "workout_sets_workout_exercise_id_idx" ON "workout_sets" USING btree ("workout_exercise_id");--> statement-breakpoint
CREATE INDEX "workouts_user_id_idx" ON "workouts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "workouts_started_at_idx" ON "workouts" USING btree ("started_at");--> statement-breakpoint
CREATE TRIGGER set_updated_at BEFORE UPDATE ON user_profiles
FOR EACH ROW EXECUTE FUNCTION set_updated_at();--> statement-breakpoint
CREATE TRIGGER set_updated_at BEFORE UPDATE ON exercises
FOR EACH ROW EXECUTE FUNCTION set_updated_at();--> statement-breakpoint
CREATE TRIGGER set_updated_at BEFORE UPDATE ON workout_templates
FOR EACH ROW EXECUTE FUNCTION set_updated_at();--> statement-breakpoint
CREATE TRIGGER set_updated_at BEFORE UPDATE ON foods
FOR EACH ROW EXECUTE FUNCTION set_updated_at();