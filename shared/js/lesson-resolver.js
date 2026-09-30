/**
 * COSYplatform - Lesson Resolver Client
 * Determines lesson availability and resolves lesson file paths for roadmap sequence items.
 */
(function (global) {
  'use strict';

  const CosyLessons = {
    getLessonState(item) {
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
})(typeof window !== 'undefined' ? window : global);
