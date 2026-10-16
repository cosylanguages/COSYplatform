import { Link } from 'react-router-dom';
import { roleHome } from '../shared/auth/access.js';
import { useAuth } from '../shared/auth/AuthContext.jsx';
import { useT } from '../shared/i18n/I18nContext.jsx';
import { LanguageSwitcher } from '../shared/ui/LanguageSwitcher.jsx';

/** Launcher: one card per workspace the role may open. Courses live inside the workspaces. */
export default function Hub() {
  const t = useT();
  const { profile, signOut } = useAuth();
  const role = profile?.role;
  const spaces = [
    { to: '/student', title: t('student.title'), roles: ['student', 'founder'] },
    { to: '/teacher', title: t('teacher.title'), roles: ['teacher', 'founder'] },
    { to: '/founder', title: t('founder.title'), roles: ['founder'] },
  ].filter((s) => s.roles.includes(role));

  return (
    <div className="hub">
      <header className="topbar">
        <span className="brand">COSYplatform</span><span className="grow" />
        <LanguageSwitcher />
        <button type="button" className="btn btn-ghost" onClick={signOut}>{t('common.logout')}</button>
      </header>
      <main className="content">
        <h1>{t('hub.title')}</h1>
        <ul className="grid">
          {spaces.map((s) => (
            <li key={s.to} className={`card ${s.to === roleHome(role) ? 'card-primary' : ''}`}>
              <h2><Link to={s.to}>{s.title}</Link></h2>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
