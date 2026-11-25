/**
 * COSYplatform role access rules.
 *
 * The catalog is a staff tool: teachers and founders browse it. Students are
 * sent to their workspace, which owns homework and vocabulary.
 */
(function (global) {
  'use strict';

  const ROLES = ['student', 'teacher', 'founder'];
  const STAFF_ROLES = ['teacher', 'founder'];
  const WORKSPACES = {
    student: 'student.html',
    teacher: 'teacher.html',
    founder: 'founder.html'
  };

  function normalizeRole(value) {
    const role = String(value || 'student').trim().toLowerCase();
    return ROLES.includes(role) ? role : 'student';
  }

  function isStaff(value) {
    return STAFF_ROLES.includes(normalizeRole(value));
  }

  function isStudent(value) {
    return normalizeRole(value) === 'student';
  }

  function workspaceForRole(value) {
    return WORKSPACES[normalizeRole(value)];
  }

  /**
   * Returns the student workspace URL for a catalog visit, or null when the
   * visitor is allowed to stay in the catalog.
   */
  function catalogRedirect(value, search) {
    if (isStaff(value)) return null;
    return workspaceForRole(value) + (search || '');
  }

  global.CosyAccess = {
    ROLES,
    STAFF_ROLES,
    normalizeRole,
    isStaff,
    isStudent,
    workspaceForRole,
    catalogRedirect
  };
})(typeof window !== 'undefined' ? window : globalThis);
