import { Link } from 'react-router-dom';
import { useT } from '../shared/i18n/I18nContext.jsx';
import { EmptyState } from '../shared/ui/primitives.jsx';

export default function NotFound() {
  const t = useT();
  return (
    <div className="content">
      <EmptyState title={t('notfound.heading')} action={<Link className="btn btn-primary" to="/hub">{t('notfound.backToWorkspace')}</Link>}>
        {t('notfound.message')}
      </EmptyState>
    </div>
  );
}
