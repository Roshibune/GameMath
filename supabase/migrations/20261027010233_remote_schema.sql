CREATE TABLE "public"."game_attempts" (
  "id"              uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "student_id"      uuid                     NOT NULL,
  "operation"       text                     NOT NULL,
  "difficulty"      text                     NOT NULL,
  "total_questions" integer                  NOT NULL,
  "correct_answers" integer                  NOT NULL,
  "completed_at"    timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "game_attempts_check" CHECK (((correct_answers >= 0) AND (correct_answers <= total_questions))),
  CONSTRAINT "game_attempts_difficulty_check" CHECK ((difficulty = ANY (ARRAY['easy'::text, 'medium'::text, 'hard'::text]))),
  CONSTRAINT "game_attempts_operation_check" CHECK ((operation = ANY (ARRAY['multiplication'::text, 'division'::text]))),
  CONSTRAINT "game_attempts_pkey" PRIMARY KEY (id),
  CONSTRAINT "game_attempts_total_questions_check" CHECK ((total_questions > 0))
);

ALTER TABLE "public"."game_attempts"
  ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE "public"."game_attempts" FROM "anon";

CREATE TABLE "public"."profiles" (
  "user_id"    uuid                     NOT NULL,
  "role"       text                     NOT NULL,
  "nickname"   text                     NOT NULL,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "profiles_nickname_check" CHECK (((length(TRIM(BOTH FROM nickname)) >= 1) AND (length(TRIM(BOTH FROM nickname)) <= 40))),
  CONSTRAINT "profiles_pkey" PRIMARY KEY (user_id),
  CONSTRAINT "profiles_role_check" CHECK ((role = ANY (ARRAY['teacher'::text, 'student'::text])))
);

ALTER TABLE "public"."profiles"
  ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE "public"."profiles" FROM "anon";

CREATE TABLE "public"."question_answers" (
  "question_id" uuid                     NOT NULL,
  "answer_key"  jsonb                    NOT NULL,
  "explanation" text                     NOT NULL,
  "created_at"  timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "question_answers_pkey" PRIMARY KEY (question_id)
);

ALTER TABLE "public"."question_answers"
  ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE "public"."question_answers" FROM "anon", "authenticated";

CREATE TABLE "public"."questions" (
  "id"            uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "created_by"    uuid,
  "operation"     text                     NOT NULL,
  "difficulty"    text                     NOT NULL,
  "question_type" text                     NOT NULL,
  "prompt"        text                     NOT NULL,
  "content"       jsonb                    NOT NULL DEFAULT '{}'::jsonb,
  "is_active"     boolean                  NOT NULL DEFAULT false,
  "created_at"    timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "questions_operation_check" CHECK ((operation = ANY (ARRAY['multiplication'::text, 'division'::text]))),
  CONSTRAINT "questions_pkey" PRIMARY KEY (id),
  CONSTRAINT "questions_question_type_check" CHECK ((question_type = ANY (ARRAY['multiple_choice'::text, 'true_false'::text, 'image_association'::text])))
);

ALTER TABLE "public"."questions"
  ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE "public"."questions" FROM "anon";

CREATE TABLE "public"."student_teacher_links" (
  "id"          uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "student_id"  uuid                     NOT NULL,
  "teacher_id"  uuid                     NOT NULL,
  "linked_at"   timestamp with time zone NOT NULL DEFAULT now(),
  "unlinked_at" timestamp with time zone,
  CONSTRAINT "student_teacher_links_different_users" CHECK ((student_id <> teacher_id)),
  CONSTRAINT "student_teacher_links_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."student_teacher_links"
  ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE "public"."student_teacher_links" FROM "anon";

CREATE TABLE "public"."teacher_codes" (
  "code"       text                     NOT NULL,
  "teacher_id" uuid                     NOT NULL,
  "active"     boolean                  NOT NULL DEFAULT true,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "teacher_codes_pkey" PRIMARY KEY (code)
);

ALTER TABLE "public"."teacher_codes"
  ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE "public"."teacher_codes" FROM "anon";

ALTER TABLE "public"."game_attempts"
  ADD CONSTRAINT "game_attempts_student_id_fkey" FOREIGN KEY (student_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

ALTER TABLE "public"."profiles"
  ADD CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE "public"."questions"
  ADD CONSTRAINT "questions_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public.profiles(user_id) ON DELETE SET NULL;

ALTER TABLE "public"."question_answers"
  ADD CONSTRAINT "question_answers_question_id_fkey" FOREIGN KEY (question_id) REFERENCES public.questions(id) ON DELETE CASCADE;

ALTER TABLE "public"."student_teacher_links"
  ADD CONSTRAINT "student_teacher_links_student_id_fkey" FOREIGN KEY (student_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

ALTER TABLE "public"."student_teacher_links"
  ADD CONSTRAINT "student_teacher_links_teacher_id_fkey" FOREIGN KEY (teacher_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

ALTER TABLE "public"."teacher_codes"
  ADD CONSTRAINT "teacher_codes_teacher_id_fkey" FOREIGN KEY (teacher_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

CREATE INDEX game_attempts_student_date ON public.game_attempts USING btree (student_id, completed_at DESC);

CREATE UNIQUE INDEX one_active_teacher_per_student ON public.student_teacher_links USING btree (student_id)
  WHERE (unlinked_at IS NULL);

CREATE UNIQUE INDEX profiles_student_nickname_unique ON public.profiles USING btree (lower(TRIM(BOTH FROM nickname)))
  WHERE (ROLE = 'student'::text);

CREATE INDEX student_teacher_links_teacher_active ON public.student_teacher_links USING btree (teacher_id)
  WHERE (unlinked_at IS NULL);

CREATE POLICY "Users can read their own profile" ON "public"."profiles"
  FOR SELECT
  TO "authenticated"
  USING ((( SELECT auth.uid() AS uid) = user_id));

CREATE POLICY "Authenticated users can read active questions" ON "public"."questions"
  FOR SELECT
  TO "authenticated"
  USING ((is_active = true));

REVOKE ALL ON TABLE "public"."game_attempts" FROM "authenticated";

GRANT DELETE, INSERT, SELECT, UPDATE ON TABLE "public"."game_attempts" TO "authenticated";

REVOKE ALL ON TABLE "public"."game_attempts" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."game_attempts" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."game_attempts" TO "service_role";

REVOKE ALL ON TABLE "public"."profiles" FROM "authenticated";

GRANT DELETE, INSERT, SELECT, UPDATE ON TABLE "public"."profiles" TO "authenticated";

REVOKE ALL ON TABLE "public"."profiles" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."profiles" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."profiles" TO "service_role";

REVOKE ALL ON TABLE "public"."question_answers" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."question_answers" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."question_answers" TO "service_role";

REVOKE ALL ON TABLE "public"."questions" FROM "authenticated";

GRANT SELECT ON TABLE "public"."questions" TO "authenticated";

REVOKE ALL ON TABLE "public"."questions" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."questions" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."questions" TO "service_role";

REVOKE ALL ON TABLE "public"."student_teacher_links" FROM "authenticated";

GRANT DELETE, INSERT, SELECT, UPDATE ON TABLE "public"."student_teacher_links" TO "authenticated";

REVOKE ALL ON TABLE "public"."student_teacher_links" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."student_teacher_links" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."student_teacher_links" TO "service_role";

REVOKE ALL ON TABLE "public"."teacher_codes" FROM "authenticated";

GRANT DELETE, INSERT, SELECT, UPDATE ON TABLE "public"."teacher_codes" TO "authenticated";

REVOKE ALL ON TABLE "public"."teacher_codes" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."teacher_codes" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."teacher_codes" TO "service_role";

