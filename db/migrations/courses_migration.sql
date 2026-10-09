-- ==============================================================================
-- Migration: Academy Courses & LMS System (Bunny Stream Integration)
-- Run this script in the Supabase SQL Editor:
-- Dashboard -> SQL Editor -> New query -> Paste & Run
-- ==============================================================================

-- 1. Create Course Table
CREATE TABLE IF NOT EXISTS public."Course" (
    "id" TEXT PRIMARY KEY,
    "title" TEXT NOT NULL,
    "titleEn" TEXT,
    "slug" TEXT UNIQUE NOT NULL,
    "description" TEXT,
    "descriptionEn" TEXT,
    "thumbnail" TEXT,
    "previewVideoId" TEXT,
    "bunnyLibraryId" TEXT DEFAULT '774454',
    "level" TEXT DEFAULT 'all_levels', -- 'beginner', 'intermediate', 'advanced', 'all_levels'
    "language" TEXT DEFAULT 'ar',
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "price" NUMERIC NOT NULL DEFAULT 0,
    "currency" TEXT DEFAULT 'USD',
    "totalDuration" INTEGER DEFAULT 0, -- in seconds
    "totalLessons" INTEGER DEFAULT 0,
    "features" JSONB DEFAULT '[]'::jsonb,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "idx_course_slug" ON public."Course" ("slug");
CREATE INDEX IF NOT EXISTS "idx_course_published" ON public."Course" ("isPublished");

-- 2. Create CourseModule Table (Chapters / Collections)
CREATE TABLE IF NOT EXISTS public."CourseModule" (
    "id" TEXT PRIMARY KEY,
    "courseId" TEXT NOT NULL REFERENCES public."Course"("id") ON DELETE CASCADE,
    "bunnyCollectionId" TEXT,
    "title" TEXT NOT NULL,
    "titleAr" TEXT,
    "description" TEXT,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "idx_course_module_course" ON public."CourseModule" ("courseId");
CREATE INDEX IF NOT EXISTS "idx_course_module_order" ON public."CourseModule" ("courseId", "orderIndex");

-- 3. Create CourseLesson Table (Videos)
CREATE TABLE IF NOT EXISTS public."CourseLesson" (
    "id" TEXT PRIMARY KEY,
    "moduleId" TEXT NOT NULL REFERENCES public."CourseModule"("id") ON DELETE CASCADE,
    "courseId" TEXT NOT NULL REFERENCES public."Course"("id") ON DELETE CASCADE,
    "bunnyVideoId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "titleAr" TEXT,
    "slug" TEXT,
    "duration" INTEGER DEFAULT 0, -- in seconds
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "isFreePreview" BOOLEAN NOT NULL DEFAULT true,
    "resources" JSONB DEFAULT '[]'::jsonb,
    "notes" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "idx_course_lesson_module" ON public."CourseLesson" ("moduleId");
CREATE INDEX IF NOT EXISTS "idx_course_lesson_course" ON public."CourseLesson" ("courseId");
CREATE INDEX IF NOT EXISTS "idx_course_lesson_order" ON public."CourseLesson" ("moduleId", "orderIndex");

-- 4. Create CourseEnrollment Table
CREATE TABLE IF NOT EXISTS public."CourseEnrollment" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL REFERENCES public."User"("id") ON DELETE CASCADE,
    "courseId" TEXT NOT NULL REFERENCES public."Course"("id") ON DELETE CASCADE,
    "enrolledAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "completedLessonsCount" INTEGER NOT NULL DEFAULT 0,
    "progressPercentage" NUMERIC NOT NULL DEFAULT 0,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "lastAccessedLessonId" TEXT,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "unique_user_course_enrollment" UNIQUE ("userId", "courseId")
);

CREATE INDEX IF NOT EXISTS "idx_course_enrollment_user" ON public."CourseEnrollment" ("userId");
CREATE INDEX IF NOT EXISTS "idx_course_enrollment_course" ON public."CourseEnrollment" ("courseId");

-- 5. Create CourseProgress Table (Per-lesson completion)
CREATE TABLE IF NOT EXISTS public."CourseProgress" (
    "id" TEXT PRIMARY KEY,
    "userId" TEXT NOT NULL REFERENCES public."User"("id") ON DELETE CASCADE,
    "courseId" TEXT NOT NULL REFERENCES public."Course"("id") ON DELETE CASCADE,
    "lessonId" TEXT NOT NULL REFERENCES public."CourseLesson"("id") ON DELETE CASCADE,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "watchedDuration" INTEGER DEFAULT 0,
    "completedAt" TIMESTAMPTZ,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "unique_user_lesson_progress" UNIQUE ("userId", "lessonId")
);

CREATE INDEX IF NOT EXISTS "idx_course_progress_user" ON public."CourseProgress" ("userId");
CREATE INDEX IF NOT EXISTS "idx_course_progress_course" ON public."CourseProgress" ("courseId");
CREATE INDEX IF NOT EXISTS "idx_course_progress_lesson" ON public."CourseProgress" ("lessonId");

-- Permissions
GRANT ALL ON TABLE public."Course" TO postgres, service_role;
GRANT SELECT ON TABLE public."Course" TO authenticated, anon;

GRANT ALL ON TABLE public."CourseModule" TO postgres, service_role;
GRANT SELECT ON TABLE public."CourseModule" TO authenticated, anon;

GRANT ALL ON TABLE public."CourseLesson" TO postgres, service_role;
GRANT SELECT ON TABLE public."CourseLesson" TO authenticated, anon;

GRANT ALL ON TABLE public."CourseEnrollment" TO postgres, service_role;
GRANT ALL ON TABLE public."CourseEnrollment" TO authenticated;
GRANT SELECT ON TABLE public."CourseEnrollment" TO anon;

GRANT ALL ON TABLE public."CourseProgress" TO postgres, service_role;
GRANT ALL ON TABLE public."CourseProgress" TO authenticated;
GRANT SELECT ON TABLE public."CourseProgress" TO anon;
