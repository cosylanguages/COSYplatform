import { Navigate, Route, Routes } from 'react-router-dom';
import { CourseCatalog } from '../../features/roadmaps/CourseCatalog.jsx';
import { LessonPage } from '../../features/lessons/LessonPage.jsx';
import { CourseDetail } from '../../features/roadmaps/CourseDetail.jsx';
import { NotesPanel } from '../../features/notes/NotesPanel.jsx';
import { useAuth } from '../../shared/auth/AuthContext.jsx';
import { useT } from '../../shared/i18n/I18nContext.jsx';
import { EmptyState } from '../../shared/ui/primitives.jsx';

export default function TeacherRoutes() {
  const t = useT();
  const { profile } = useAuth();
  return (
    <Routes>
      <Route index element={<Navigate to="courses" replace />} />
      <Route path="courses" element={<><h1>{t('teacher.catalogTitle')}</h1><CourseCatalog base="/teacher" showAll={profile?.role === 'founder'} /></>} />
      <Route path="courses/:courseId" element={<CourseDetail base="/teacher" />} />
      <Route path="courses/:courseId/lessons/:lessonId" element={<LessonPage base="/teacher" mode="teacher" />} />
      {/* TODO: wire to teacher_students / lesson_submissions once their migrations exist. */}
      <Route path="students" element={<><h1>{t('teacher.myStudentsTitle')}</h1><EmptyState title={t('common.comingSoon')} /></>} />
      <Route path="submissions" element={<><h1>{t('teacher.submissionsTitle')}</h1><EmptyState title={t('common.comingSoon')} /></>} />
      <Route path="notes" element={<><h1>{t('notes.titleTeacher')}</h1><NotesPanel scope="teacher" /></>} />
    </Routes>
  );
}
