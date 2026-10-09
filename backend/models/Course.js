const supabase = require('../utils/supabase');
const fs = require('fs');
const path = require('path');

function getCachedCourses() {
  try {
    const cachePath = path.join(__dirname, '../data/courses_cache.json');
    if (fs.existsSync(cachePath)) {
      return JSON.parse(fs.readFileSync(cachePath, 'utf8'));
    }
  } catch (e) {
    console.error('Failed to read courses cache:', e.message);
  }
  return [];
}

class Course {
  static async findAll() {
    try {
      const { data, error } = await supabase
        .from('Course')
        .select('*')
        .eq('isPublished', true)
        .order('createdAt', { ascending: false });

      if (!error && data && data.length > 0) {
        return data;
      }
    } catch (e) {
      // Table might not exist yet
    }
    // Fallback to cached courses
    return getCachedCourses().map(c => ({
      id: c.id,
      title: c.title,
      titleEn: c.titleEn,
      slug: c.slug,
      description: c.description,
      descriptionEn: c.descriptionEn,
      thumbnail: c.thumbnail,
      level: c.level,
      isPaid: c.isPaid,
      price: c.price,
      currency: c.currency,
      totalDuration: c.totalDuration,
      totalLessons: c.totalLessons,
      features: c.features
    }));
  }

  static async findBySlug(slug) {
    try {
      const { data: course, error } = await supabase
        .from('Course')
        .select('*')
        .eq('slug', slug)
        .eq('isPublished', true)
        .maybeSingle();

      if (!error && course) {
        const { data: modules } = await supabase
          .from('CourseModule')
          .select('*, CourseLesson(*)')
          .eq('courseId', course.id)
          .order('orderIndex', { ascending: true });

        if (modules) {
          course.modules = modules.map(m => ({
            ...m,
            lessons: (m.CourseLesson || []).sort((a, b) => a.orderIndex - b.orderIndex)
          }));
          return course;
        }
      }
    } catch (e) {
      // Supabase query failed, fallback to cache
    }

    const cached = getCachedCourses();
    return cached.find(c => c.slug === slug) || null;
  }

  static async findLesson(slug, lessonId) {
    const course = await this.findBySlug(slug);
    if (!course) return null;

    let targetLesson = null;
    let targetModule = null;
    let allLessonsFlat = [];

    for (const mod of course.modules || []) {
      for (const les of mod.lessons || []) {
        allLessonsFlat.push({ ...les, moduleTitle: mod.titleAr || mod.title });
        if (les.id === lessonId || les.bunnyVideoId === lessonId) {
          targetLesson = les;
          targetModule = mod;
        }
      }
    }

    if (!targetLesson && allLessonsFlat.length > 0) {
      // Default to first lesson
      targetLesson = allLessonsFlat[0];
      targetModule = course.modules[0];
    }

    if (!targetLesson) return null;

    const currentIndex = allLessonsFlat.findIndex(l => l.id === targetLesson.id);
    const prevLesson = currentIndex > 0 ? allLessonsFlat[currentIndex - 1] : null;
    const nextLesson = currentIndex < allLessonsFlat.length - 1 ? allLessonsFlat[currentIndex + 1] : null;

    return {
      course: {
        id: course.id,
        title: course.title,
        slug: course.slug,
        bunnyLibraryId: course.bunnyLibraryId || '774454'
      },
      module: {
        id: targetModule?.id,
        title: targetModule?.titleAr || targetModule?.title
      },
      lesson: targetLesson,
      prevLesson: prevLesson ? { id: prevLesson.id, title: prevLesson.titleAr || prevLesson.title } : null,
      nextLesson: nextLesson ? { id: nextLesson.id, title: nextLesson.titleAr || nextLesson.title } : null,
      streamUrl: `https://iframe.mediadelivery.net/embed/${course.bunnyLibraryId || '774454'}/${targetLesson.bunnyVideoId}?autoplay=false&loop=false&muted=false&preload=true&responsive=true`
    };
  }

  static async getUserProgress(userId, courseId) {
    if (!userId || !courseId) return { completedLessonIds: [], progressPercentage: 0 };

    try {
      const { data: progress } = await supabase
        .from('CourseProgress')
        .select('lessonId, isCompleted')
        .eq('userId', userId)
        .eq('courseId', courseId)
        .eq('isCompleted', true);

      const completedLessonIds = (progress || []).map(p => p.lessonId);
      return { completedLessonIds };
    } catch (e) {
      return { completedLessonIds: [] };
    }
  }

  static async toggleLessonProgress(userId, courseId, lessonId, isCompleted = true) {
    if (!userId || !courseId || !lessonId) return { success: false };

    try {
      const now = new Date().toISOString();
      const progressId = `prog_${userId.substring(0, 8)}_${lessonId.substring(0, 8)}`;

      await supabase
        .from('CourseProgress')
        .upsert({
          id: progressId,
          userId,
          courseId,
          lessonId,
          isCompleted,
          completedAt: isCompleted ? now : null,
          updatedAt: now
        }, { onConflict: 'userId,lessonId' });

      // Update enrollment stats
      const { data: completedList } = await supabase
        .from('CourseProgress')
        .select('id')
        .eq('userId', userId)
        .eq('courseId', courseId)
        .eq('isCompleted', true);

      const completedCount = completedList?.length || (isCompleted ? 1 : 0);

      const enrollmentId = `enr_${userId.substring(0, 8)}_${courseId.substring(0, 8)}`;
      await supabase
        .from('CourseEnrollment')
        .upsert({
          id: enrollmentId,
          userId,
          courseId,
          completedLessonsCount: completedCount,
          lastAccessedLessonId: lessonId,
          updatedAt: now
        }, { onConflict: 'userId,courseId' });

      return { success: true, isCompleted, completedCount };
    } catch (e) {
      console.warn('Progress update note:', e.message);
      return { success: true, isCompleted, completedCount: 1 };
    }
  }
}

module.exports = Course;
