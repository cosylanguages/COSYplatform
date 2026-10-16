import { Route, Routes } from 'react-router-dom';
import { CourseCatalog } from '../../features/roadmaps/CourseCatalog.jsx';
import { LessonPage } from '../../features/lessons/LessonPage.jsx';
import { CourseDetail } from '../../features/roadmaps/CourseDetail.jsx';
import { NotesPanel } from '../../features/notes/NotesPanel.jsx';
import { useAuth } from '../../shared/auth/AuthContext.jsx';
import { useT } from '../../shared/i18n/I18nContext.jsx';
import { Navigate } from 'react-router-dom';

export default function StudentRoutes() {
  const t = useT();
  const { profile } = useAuth();
  return (
    <Routes>
      <Route index element={<Navigate to="courses" replace />} />
      <Route path="courses" element={<><h1>{t('student.availableCourses')}</h1><CourseCatalog base="/student" showAll={profile?.role === 'founder'} /></>} />
      <Route path="courses/:courseId" element={<CourseDetail base="/student" />} />
      <Route path="courses/:courseId/lessons/:lessonId" element={<LessonPage base="/student" mode="student" />} />
      <Route path="notes" element={<><h1>{t('notes.titleStudent')}</h1><NotesPanel scope="student" /></>} />
    </Routes>
  );
}
