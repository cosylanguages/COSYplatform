import { lazy, Suspense } from 'react';
import { BrowserRouter, HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { founderNav } from '../pages/founder/navs.js';
import Hub from '../pages/Hub.jsx';
import Login from '../pages/Login.jsx';
import NotFound from '../pages/NotFound.jsx';
import { studentNav } from '../pages/student/navs.js';
import { teacherNav } from '../pages/teacher/navs.js';
import { useAuth } from '../shared/auth/AuthContext.jsx';
import { config } from '../shared/config/config.js';
import { I18nProvider, useT } from '../shared/i18n/I18nContext.jsx';
import { AppShell } from '../shared/ui/AppShell.jsx';
import { Spinner } from '../shared/ui/primitives.jsx';
import { ToastProvider } from '../shared/ui/Toast.jsx';
import { RequireAuth, RequireRole } from './guards.jsx';

const ClassroomPage = lazy(() => import('../pages/classroom/ClassroomPage.jsx'));
const StudentRoutes = lazy(() => import('../pages/student/StudentWorkspace.jsx'));
const TeacherRoutes = lazy(() => import('../pages/teacher/TeacherWorkspace.jsx'));
const FounderRoutes = lazy(() => import('../pages/founder/FounderWorkspace.jsx'));

const Router = config.routerMode === 'hash' ? HashRouter : BrowserRouter;

function AppRoutes() {
  const t = useT();
  const studentGuard = ['student', 'founder'];
  const teacherGuard = ['teacher', 'founder'];
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<RequireAuth />}>
        <Route path="/" element={<Navigate to="/hub" replace />} />
        <Route path="/hub" element={<Hub />} />
        <Route path="/classroom/:roomId" element={<ClassroomPage />} />

        <Route element={<RequireRole roles={studentGuard} />}>
          <Route element={<AppShell role="student" nav={studentNav(t)} />}>
            <Route path="/student/*" element={<StudentRoutes />} />
          </Route>
        </Route>
        <Route element={<RequireRole roles={teacherGuard} />}>
          <Route element={<AppShell role="teacher" nav={teacherNav(t)} />}>
            <Route path="/teacher/*" element={<TeacherRoutes />} />
          </Route>
        </Route>
        <Route element={<RequireRole roles={['founder']} />}>
          <Route element={<AppShell role="founder" nav={founderNav(t)} />}>
            <Route path="/founder/*" element={<FounderRoutes />} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function WithProfileLanguage() {
  const { profile } = useAuth();
  return (
    <I18nProvider profileLang={profile?.ui_lang}>
      <ToastProvider><Suspense fallback={<Spinner />}><AppRoutes /></Suspense></ToastProvider>
    </I18nProvider>
  );
}

export default function App() {
  const base = config.routerMode === 'hash' ? undefined : config.basePath.replace(/\/$/, '') || undefined;
  return (
    <Router basename={base}>
      <WithProfileLanguage />
    </Router>
  );
}
