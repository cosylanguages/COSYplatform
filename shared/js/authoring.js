(function() {
  'use strict';

  let cachedIsAuthor = null;
  let queryPromise = null;

  async function checkLessonAuthorsTable(userId) {
    if (cachedIsAuthor !== null) return cachedIsAuthor;
    if (queryPromise) return queryPromise;

    queryPromise = (async () => {
      try {
        const client = window.CosyAuth ? window.CosyAuth.client : null;
        if (!client || !userId) {
          cachedIsAuthor = false;
          return false;
        }

        const { data, error } = await client
          .from('lesson_authors')
          .select('user_id')
          .eq('user_id', userId)
          .maybeSingle();

        if (error) {
          console.warn('CosyAuthoring: Error checking lesson_authors table:', error);
          cachedIsAuthor = false;
          return false;
        }

        cachedIsAuthor = Boolean(data && data.user_id);
        return cachedIsAuthor;
      } catch (err) {
        console.warn('CosyAuthoring: Exception checking lesson_authors table:', err);
        cachedIsAuthor = false;
        return false;
      } finally {
        queryPromise = null;
      }
    })();

    return queryPromise;
  }

  async function canAuthor(activeView) {
    try {
      if (!window.CosyAuth || typeof window.CosyAuth.getAuthAndProfile !== 'function') {
        return false;
      }

      const auth = await window.CosyAuth.getAuthAndProfile();
      if (!auth || !auth.user || !auth.profile) {
        return false;
      }

      const userRole = auth.profile.role ? auth.profile.role.toLowerCase() : 'student';

      // Student role or student view cannot author lessons
      const currentRole = (typeof window !== 'undefined' && window.currentRole) ? window.currentRole : null;
      if (userRole === 'student' || activeView === 'student' || currentRole === 'student') {
        return false;
      }

      if (userRole === 'founder') {
        return true;
      }

      if (userRole === 'teacher') {
        return await checkLessonAuthorsTable(auth.user.id);
      }

      return false;
    } catch (err) {
      console.warn('CosyAuthoring.canAuthor error:', err);
      return false;
    }
  }

  function clearCache() {
    cachedIsAuthor = null;
    queryPromise = null;
  }

  window.CosyAuthoring = {
    canAuthor: canAuthor,
    clearCache: clearCache
  };
})();
