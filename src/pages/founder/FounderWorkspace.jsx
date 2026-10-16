import { Navigate, Route, Routes } from 'react-router-dom';
import { useT } from '../../shared/i18n/I18nContext.jsx';
import { EmptyState } from '../../shared/ui/primitives.jsx';

export default function FounderRoutes() {
  const t = useT();
  return (
    <Routes>
      <Route index element={<Navigate to="users" replace />} />
      {/* TODO: port the profiles admin table (role, language_access, course_level, main teacher). */}
      <Route path="users" element={<><h1>{t('founder.userAdminTitle')}</h1><EmptyState title={t('common.comingSoon')} /></>} />
      <Route path="courses" element={<><h1>{t('nav.courses')}</h1><EmptyState title={t('common.comingSoon')} /></>} />
    </Routes>
  );
}
