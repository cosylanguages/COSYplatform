import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../shared/auth/AuthContext.jsx';
import { isCourseAccessible } from '../../shared/auth/access.js';
import { useT } from '../../shared/i18n/I18nContext.jsx';
import { useAsync } from '../../shared/hooks/useAsync.js';
import { useUrlFilters } from '../../shared/hooks/useUrlFilters.js';
import { FilterBar } from '../../shared/ui/FilterBar.jsx';
import { Badge, EmptyState, ErrorState, Spinner } from '../../shared/ui/primitives.jsx';
import { distinct, fetchCourses, filterCourses } from './courses.js';

const KEYS = ['q', 'language', 'type', 'level'];

/**
 * Filterable course list. `base` is the route prefix for links (/student or /teacher).
 * Courses the profile cannot open are hidden unless `showAll` (RLS still protects content).
 */
export function CourseCatalog({ base, showAll = false }) {
  const t = useT();
  const { profile } = useAuth();
  const { data, error, loading } = useAsync(fetchCourses, []);
  const { values, set, clear, active } = useUrlFilters(KEYS);

  const visible = useMemo(
    () => (data || []).filter((c) => showAll || isCourseAccessible(c, profile)),
    [data, profile, showAll],
  );
  const filtered = useMemo(() => filterCourses(visible, values), [visible, values]);

  if (loading) return <Spinner />;
  if (error) return <ErrorState error={error} />;

  const langName = (code) => t(`langname.${code}`) === `langname.${code}` ? code.toUpperCase() : t(`langname.${code}`);
  const trackName = (id) => {
    const key = `track.${id.charAt(0).toUpperCase()}${id.slice(1)}`;
    return t(key) === key ? id : t(key);
  };

  return (
    <>
      <FilterBar
        values={values}
        onChange={set}
        onClear={clear}
        active={active}
        shown={filtered.length}
        total={visible.length}
        searchPlaceholder={t('student.searchPlaceholder')}
        selects={[
          { key: 'language', label: t('student.filterLanguage'), allLabel: t('student.filterAllLanguages'), options: distinct(visible, 'language').map((v) => ({ value: v, label: langName(v) })) },
          { key: 'type', label: t('student.filterTrack'), allLabel: t('student.filterAllTypes'), options: distinct(visible, 'course_type').map((v) => ({ value: v, label: trackName(v) })) },
        ]}
        chips={{ key: 'level', label: t('student.filterLevel'), options: distinct(visible, 'cefr').map((v) => ({ value: v, label: v.toUpperCase() })) }}
      />
      {filtered.length === 0 ? (
        <EmptyState title={t('common.noCoursesMatch')} action={active && <button type="button" className="btn btn-secondary" onClick={clear}>{t('filters.clear')}</button>} />
      ) : (
        <ul className="grid">
          {filtered.map((c) => (
            <li key={c.id} className="card">
              <div className="card-meta">
                <Badge tone="accent">{String(c.cefr).toUpperCase()}</Badge>
                <span className="muted">{langName(c.language)} · {trackName(c.course_type)}</span>
              </div>
              <h3><Link to={`${base}/courses/${encodeURIComponent(c.id)}`}>{c.title}</Link></h3>
              <p className="muted">{t('common.lessons', { count: c.total_lessons ?? 0 })}</p>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
