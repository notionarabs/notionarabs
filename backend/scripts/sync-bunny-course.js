const https = require('https');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const supabase = require('../utils/supabase');

const LIBRARY_ID = process.env.BUNNY_STREAM_LIBRARY_ID || '774454';
const API_KEY = process.env.BUNNY_STREAM_API_KEY || '72f63dcc-f6b4-47c7-8eef37759f8c-7110-4d71';

function fetchBunny(endpoint) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'video.bunnycdn.com',
      path: endpoint,
      method: 'GET',
      headers: {
        'AccessKey': API_KEY,
        'accept': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve(parsed);
        } catch (e) {
          reject(new Error(`Failed to parse response: ${body.substring(0, 200)}`));
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

// Arabic translations for the collections
const MODULE_ARABIC_NAMES = {
  '02 — Getting Started': '02 — البداية وأساسيات الواجهة',
  '03 — Pages & Blocks': '03 — الصفحات والكتل المتقدمة',
  '04 — Database Fundamentals': '04 — أساسيات قواعد البيانات',
  '05 — Advanced Databases': '05 — قواعد البيانات والعلاقات المتقدمة',
  '06 — Advanced Features': '06 — الميزات المتقدمة والصيغ الرياضية',
  '07 — Notion AI': '07 — إتقان الذكاء الاصطناعي Notion AI'
};

function formatLessonTitle(rawTitle) {
  // e.g. "Lesson 2.1.mp4" -> "Lesson 2.1"
  return rawTitle.replace(/\.mp4$/i, '').trim();
}

function naturalSortLessons(a, b) {
  return a.title.localeCompare(b.title, undefined, { numeric: true, sensitivity: 'base' });
}

async function syncCourse() {
  console.log(`🚀 Starting sync from Bunny Stream Library: ${LIBRARY_ID}...`);

  // 1. Fetch Collections
  const collectionsRes = await fetchBunny(`/library/${LIBRARY_ID}/collections?itemsPerPage=100`);
  const collections = (collectionsRes.items || []).sort((a, b) => a.name.localeCompare(b.name));
  console.log(`📦 Found ${collections.length} collections.`);

  // 2. Fetch Videos
  const videosRes = await fetchBunny(`/library/${LIBRARY_ID}/videos?itemsPerPage=100`);
  const allVideos = videosRes.items || [];
  console.log(`🎬 Found ${allVideos.length} total videos.`);

  let totalDuration = 0;
  let totalLessons = allVideos.length;

  const courseSlug = 'notion-masterclass';
  const courseId = 'course_notion_masterclass_01';

  const courseData = {
    id: courseId,
    title: 'دورة احتراف نوشن الشاملة',
    titleEn: 'Notion Masterclass',
    slug: courseSlug,
    description: 'الدورة التطبيقية المتكاملة لإتقان نوشن من الصفر وحتى الاحتراف: بناء أنظمة إدارة متكاملة، قواعد البيانات المتقدمة، الصيغ والمعادلات، واستثمار الذكاء الاصطناعي Notion AI.',
    descriptionEn: 'The ultimate practical masterclass to master Notion from scratch: building workspaces, advanced databases, formulas, and Notion AI.',
    thumbnail: 'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=1200&q=80',
    bunnyLibraryId: LIBRARY_ID,
    previewVideoId: allVideos.find(v => v.title.includes('2.1'))?.guid || allVideos[0]?.guid,
    level: 'all_levels',
    language: 'ar',
    isPublished: true,
    isPaid: false,
    price: 0,
    currency: 'USD',
    features: [
      '29 درساً تطبيقياً فائق الجودة مسجل بدقة عالية',
      '6 فصول متكاملة تشمل كل تفاصيل وخفايا نوشن',
      'بناء أنظمة وقواعد بيانات متقدمة خطوة بخطوة',
      'تطبيقات عملية على ميزات الذكاء الاصطناعي Notion AI',
      'ملفات وقوالب جاهزة قابلة للنسخ مع كل فصل',
      'شهادة إتمام ومتابعة للتقدم خطوة بخطوة'
    ],
    modules: []
  };

  for (let mIndex = 0; mIndex < collections.length; mIndex++) {
    const col = collections[mIndex];
    const colVideos = allVideos
      .filter(v => v.collectionId === col.guid)
      .map(v => ({
        bunnyVideoId: v.guid,
        title: formatLessonTitle(v.title),
        duration: v.length || 0,
        views: v.views || 0
      }))
      .sort(naturalSortLessons);

    const moduleId = `mod_${col.guid.substring(0, 8)}`;
    const modTitleAr = MODULE_ARABIC_NAMES[col.name] || col.name;

    const moduleObj = {
      id: moduleId,
      courseId: courseId,
      bunnyCollectionId: col.guid,
      title: col.name,
      titleAr: modTitleAr,
      orderIndex: mIndex,
      lessons: colVideos.map((vid, lIndex) => {
        totalDuration += vid.duration;
        return {
          id: `les_${vid.bunnyVideoId.substring(0, 8)}`,
          moduleId: moduleId,
          courseId: courseId,
          bunnyVideoId: vid.bunnyVideoId,
          title: vid.title,
          titleAr: vid.title.replace('Lesson', 'الدرس'),
          duration: vid.duration,
          orderIndex: lIndex,
          isFreePreview: true,
          resources: []
        };
      })
    };

    courseData.modules.push(moduleObj);
  }

  courseData.totalDuration = totalDuration;
  courseData.totalLessons = totalLessons;

  // Save to local cache file for immediate frontend/backend availability
  const dataDir = path.join(__dirname, '../data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  const cachePath = path.join(dataDir, 'courses_cache.json');
  fs.writeFileSync(cachePath, JSON.stringify([courseData], null, 2), 'utf8');
  console.log(`💾 Saved course cache to: ${cachePath}`);

  // Try inserting/updating into Supabase if tables exist
  try {
    const { error: courseErr } = await supabase
      .from('Course')
      .upsert({
        id: courseData.id,
        title: courseData.title,
        titleEn: courseData.titleEn,
        slug: courseData.slug,
        description: courseData.description,
        descriptionEn: courseData.descriptionEn,
        thumbnail: courseData.thumbnail,
        previewVideoId: courseData.previewVideoId,
        bunnyLibraryId: courseData.bunnyLibraryId,
        level: courseData.level,
        language: courseData.language,
        isPublished: courseData.isPublished,
        isPaid: courseData.isPaid,
        price: courseData.price,
        currency: courseData.currency,
        totalDuration: courseData.totalDuration,
        totalLessons: courseData.totalLessons,
        features: courseData.features,
        updatedAt: new Date().toISOString()
      }, { onConflict: 'slug' });

    if (courseErr) {
      console.warn(`ℹ️ Supabase Course table note: ${courseErr.message}`);
    } else {
      console.log(`✅ Supabase Course record saved!`);

      // Upsert modules and lessons
      for (const m of courseData.modules) {
        await supabase.from('CourseModule').upsert({
          id: m.id,
          courseId: m.courseId,
          bunnyCollectionId: m.bunnyCollectionId,
          title: m.title,
          titleAr: m.titleAr,
          orderIndex: m.orderIndex,
          updatedAt: new Date().toISOString()
        }, { onConflict: 'id' });

        for (const l of m.lessons) {
          await supabase.from('CourseLesson').upsert({
            id: l.id,
            moduleId: l.moduleId,
            courseId: l.courseId,
            bunnyVideoId: l.bunnyVideoId,
            title: l.title,
            titleAr: l.titleAr,
            duration: l.duration,
            orderIndex: l.orderIndex,
            isFreePreview: l.isFreePreview,
            resources: l.resources,
            updatedAt: new Date().toISOString()
          }, { onConflict: 'id' });
        }
      }
      console.log(`✅ Supabase Modules and Lessons synced successfully!`);
    }
  } catch (err) {
    console.warn(`Supabase sync deferred until migration is applied: ${err.message}`);
  }

  console.log(`🎉 Sync completed successfully! Total Lessons: ${totalLessons}, Total Duration: ${(totalDuration / 60).toFixed(1)} mins.`);
}

syncCourse().catch(console.error);
