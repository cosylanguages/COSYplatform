/**
 * COSYplatform - Lesson Resolver Client
 * Determines lesson availability and resolves lesson file paths for roadmap sequence items.
 */
(function (global) {
  'use strict';

  async function loadLessonContent(client, lessonPath, role) {
    const pathParts = typeof lessonPath === 'string' ? lessonPath.split('/') : [];
    if (
      !lessonPath ||
      pathParts.some(part => !part || part === '.' || part === '..')
    ) {
      throw new Error('Lesson content is unavailable.');
    }

    const studentView = role === 'student';
    if (!studentView && role !== 'teacher' && role !== 'founder') {
      throw new Error('Lesson content is unavailable.');
    }

    if (client) {
      // 1. Students may only receive the RLS-protected sanitized body.
      // First accept a canonical lesson ID, then map legacy roadmap file paths
      // to a unique canonical lesson by slug. Never fetch the legacy file itself.
      if (studentView) {
        try {
          const { data: scData, error: scError } = await client
            .from('lesson_student_content')
            .select('body')
            .eq('lesson_id', lessonPath)
            .maybeSingle();

          if (!scError && scData && typeof scData.body === 'string') {
            return scData.body;
          }

          let canonicalLessonId = null;
          const direct = await client
            .from('lessons')
            .select('id')
            .eq('id', lessonPath)
            .maybeSingle();

          if (!direct.error && direct.data && typeof direct.data.id === 'string') {
            canonicalLessonId = direct.data.id;
          } else {
            const fileName = pathParts[pathParts.length - 1];
            const lessonSlug = fileName.replace(/\.(json|xml)$/i, '');
            if (!lessonSlug || lessonSlug === fileName && /\.(json|xml)$/i.test(fileName)) {
              throw new Error('Student-safe lesson content is unavailable.');
            }

            const bySlug = await client
              .from('lessons')
              .select('id')
              .eq('slug', lessonSlug)
              .maybeSingle();

            // maybeSingle fails when a slug is ambiguous. Fail closed rather
            // than selecting another course/language's lesson.
            if (!bySlug.error && bySlug.data && typeof bySlug.data.id === 'string') {
              canonicalLessonId = bySlug.data.id;
            }
          }

          if (canonicalLessonId && canonicalLessonId !== lessonPath) {
            const { data: canonicalContent, error: canonicalError } = await client
              .from('lesson_student_content')
              .select('body')
              .eq('lesson_id', canonicalLessonId)
              .maybeSingle();

            if (!canonicalError && canonicalContent && typeof canonicalContent.body === 'string') {
              return canonicalContent.body;
            }
          }
        } catch (e) {
          // Fail closed below; never fall back to legacy/public content.
        }

        throw new Error('Student-safe lesson content is unavailable.');
      }

      // 2. Try canonical 'lessons' / 'lesson_protected' for teacher/founder
      try {
        const { data: contractData, error: contractError } = await client
          .from('lessons')
          .select('body')
          .eq('id', lessonPath)
          .maybeSingle();

        if (!contractError && contractData && typeof contractData.body === 'string') {
          return contractData.body;
        }
      } catch (e) {
        // Fallback to legacy content tables
      }

      // 3. Fallback to legacy tables if path matches legacy scheme
      if (lessonPath.startsWith('lessons/')) {
        const table = studentView ? 'student_lesson_content' : 'lesson_content';
        const column = studentView ? 'content' : 'xml_content';
        const { data, error } = await client
          .from(table)
          .select(column)
          .eq('lesson_id', lessonPath)
          .maybeSingle();

        if (!error && data && typeof data[column] === 'string') {
          return data[column];
        }
      }
    }

    // A student must never fall through to static files, even when Supabase
    // has not initialized. Those files may contain legacy answer metadata.
    if (studentView) {
      throw new Error('Student-safe lesson content is unavailable.');
    }

    // Fallback static fetch for local preview or unmigrated assets
    try {
      const res = await fetch(lessonPath);
      if (res.ok) {
        const text = await res.text();
        return text;
      }
    } catch (err) {
      console.warn('[LessonResolver] Static fetch failed:', err);
    }

    throw new Error('Lesson content is unavailable.');
  }

  async function saveLessonToSupabase(payload) {
    const client = global.CosyAuth ? global.CosyAuth.client : null;
    if (!client) {
      throw new Error('Supabase client is not initialized.');
    }

    const { lesson_id, title, language, level, template_type, xml_content } = payload;
    if (!lesson_id || !xml_content) {
      throw new Error('Missing required lesson data.');
    }

    const { data, error } = await client
      .from('lesson_content')
      .upsert({
        lesson_id: lesson_id,
        xml_content: xml_content,
        updated_at: new Date().toISOString()
      }, { onConflict: 'lesson_id' });

    if (error) {
      console.error('[CosyLessons] Error saving lesson to Supabase:', error);
      throw error;
    }
    return data;
  }

  const CosyLessons = {
    loadLessonContent(lessonPath, role) {
      const client = global.CosyAuth ? global.CosyAuth.client : null;
      return loadLessonContent(client, lessonPath, role);
    },

    saveLessonToSupabase(payload) {
      return saveLessonToSupabase(payload);
    },

    getLessonState(item, role) {
      if (item && item.teacherLed && role === 'student') {
        return 'teacher-led';
      }
      if (
        item &&
        typeof item.lessonFile === 'string' &&
        item.lessonFile.trim() !== '' &&
        item.status !== 'planned'
      ) {
        return 'available';
      }
      return 'planned';
    },

    getLessonPath(item) {
      if (
        item &&
        typeof item.lessonFile === 'string' &&
        item.lessonFile.trim() !== ''
      ) {
        return item.lessonFile;
      }
      return null;
    }
  };

  global.CosyLessons = CosyLessons;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { loadLessonContent };
  }
})(typeof window !== 'undefined' ? window : global);
