/**
 * COSYplatform - Lesson Resolver Client
 * Determines lesson availability and resolves lesson file paths for roadmap sequence items.
 */
(function (global) {
  'use strict';

  async function loadLessonContent(client, lessonPath, role) {
    const pathParts = typeof lessonPath === 'string' ? lessonPath.split('/') : [];
    if (
      !client ||
      !lessonPath.startsWith('lessons/') ||
      pathParts.some(part => !part || part === '.' || part === '..') ||
      !/\.(json|xml)$/i.test(lessonPath)
    ) {
      throw new Error('Lesson content is unavailable.');
    }

    const studentView = role === 'student';
    if (!studentView && role !== 'teacher' && role !== 'founder') {
      throw new Error('Lesson content is unavailable.');
    }

    const table = studentView ? 'student_lesson_content' : 'lesson_content';
    const column = studentView ? 'content' : 'xml_content';
    const { data, error } = await client
      .from(table)
      .select(column)
      .eq('lesson_id', lessonPath)
      .maybeSingle();

    if (error || !data || typeof data[column] !== 'string') {
      throw new Error('Lesson content is unavailable.');
    }
    return data[column];
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
