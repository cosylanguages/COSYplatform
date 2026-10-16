import { useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { roleHome, safeRedirect } from '../shared/auth/access.js';
import { useAuth } from '../shared/auth/AuthContext.jsx';
import { useT } from '../shared/i18n/I18nContext.jsx';
import { LanguageSwitcher } from '../shared/ui/LanguageSwitcher.jsx';
import { Button } from '../shared/ui/primitives.jsx';

export default function Login() {
  const t = useT();
  const { configured, session, profile, signIn } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (session && profile) return <Navigate to={safeRedirect(params.get('redirect'), roleHome(profile.role))} replace />;

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!configured) return setError(t('login.errNotConfigured'));
    setBusy(true); setError('');
    try {
      const { error: err } = await signIn(email.trim(), password);
      if (err) setError(t('login.errInvalidCredentials'));
      else navigate(safeRedirect(params.get('redirect')), { replace: true });
    } catch {
      setError(t('login.errUnexpected'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login">
      <div className="login-lang"><LanguageSwitcher /></div>
      <form className="login-card" onSubmit={onSubmit}>
        <h1>{t('login.heading')}</h1>
        <p className="muted">{t('login.subheading')}</p>
        <label className="field"><span className="field-label">{t('login.emailLabel')}</span>
          <input type="email" required autoComplete="username" value={email} placeholder={t('login.emailPlaceholder')} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label className="field"><span className="field-label">{t('login.passwordLabel')}</span>
          <input type="password" required autoComplete="current-password" value={password} placeholder={t('login.passwordPlaceholder')} onChange={(e) => setPassword(e.target.value)} />
        </label>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="btn btn-primary" type="submit" disabled={busy}>{busy ? t('login.signingIn') : t('login.submitBtn')}</button>
        <p className="muted small">{t('login.footerNote')}</p>
      </form>
    </div>
  );
}
