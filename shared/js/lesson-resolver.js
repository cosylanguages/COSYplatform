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

  const CosyLessons = {
    loadLessonContent(lessonPath, role) {
      const client = global.CosyAuth ? global.CosyAuth.client : null;
      return loadLessonContent(client, lessonPath, role);
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
