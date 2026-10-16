import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import { useT } from '../i18n/I18nContext.jsx';
import { config } from '../config/config.js';
import { LanguageSwitcher } from './LanguageSwitcher.jsx';
import logo from './logo.svg';

/**
 * One shell for every workspace. `nav` = [{ to, label, end? }]; `role` sets the accent colour
 * (student = sapphire, teacher = purple, founder = sage), keeping the existing brand split.
 */
export function AppShell({ role, nav }) {
  const t = useT();
  const { user, signOut } = useAuth();
  return (
    <div className="shell" data-role={role}>
      <header className="topbar">
        <NavLink to="/hub" className="brand"><img src={logo} alt="" width="28" height="28" /> <span>COSYplatform</span></NavLink>
        <span className="role-pill">{t(`role.${role}`)}</span>
        <span className="grow" />
        <span className="muted user-email">{user?.email}</span>
        <LanguageSwitcher />
        <button type="button" className="btn btn-ghost" onClick={signOut}>{t('common.logout')}</button>
      </header>
      <nav className="sidenav" aria-label={t('nav.main')}>
        {nav.map((n) => (
          <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => `navlink${isActive ? ' is-active' : ''}`}>{n.label}</NavLink>
        ))}
        <NavLink to="/hub" className="navlink navlink-secondary">{t('nav.hub')}</NavLink>
      </nav>
      <main className="content"><Outlet /></main>
      <footer className="footer muted">
        {t('footer.partOfEcosystem')}{' '}
        <a href={config.ecosystem.languages}>{t('footer.cosylanguages')}</a>{' '}
        <a href={config.ecosystem.data}>{t('footer.cosydata')}</a>{' '}
        <a href={config.ecosystem.tools}>{t('footer.cosytools')}</a>{' '}
        <a href={config.ecosystem.games}>{t('footer.cosygames')}</a>{' '}
        <a href={config.ecosystem.events}>{t('footer.cosyevents')}</a>
      </footer>
    </div>
  );
}
