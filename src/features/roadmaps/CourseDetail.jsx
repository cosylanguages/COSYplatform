import { Link, useParams } from 'react-router-dom';
import { useT } from '../../shared/i18n/I18nContext.jsx';
import { useAsync } from '../../shared/hooks/useAsync.js';
import { Badge, EmptyState, ErrorState, Spinner } from '../../shared/ui/primitives.jsx';
import { fetchCourseLessons, groupLessonsByUnit } from './courses.js';

/** Course roadmap grouped by unit. Used by both student and teacher workspaces via `base`. */
export function CourseDetail({ base }) {
  const t = useT();
  const { courseId } = useParams();
  const { data, error, loading } = useAsync(() => fetchCourseLessons(courseId), [courseId]);

  if (loading) return <Spinner />;
  if (error) return <ErrorState error={error} />;
  if (!data?.length) return <EmptyState title={t('common.courseUnavailableTitle')}>{t('common.roadmapNotFound', { course: courseId })}</EmptyState>;

  return (
    <>
      <p><Link to={`${base}/courses`} className="link">{t('common.backToCatalog')}</Link></p>
      <h1>{data[0].course_title}</h1>
      {groupLessonsByUnit(data).map((u) => (
        <section key={u.unit || 'ungrouped'} className="unit">
          {u.unit && <h2>{u.unit}</h2>}
          <ol className="lessons">
            {u.lessons.map((l) => (
              <li key={l.lesson_id} className="lesson-row">
                <span className="lesson-no">{l.lesson_number}</span>
                <div className="grow">
                  <Link to={`/classroom/${encodeURIComponent(courseId)}?lesson=${encodeURIComponent(l.lesson_id)}`}>{l.lesson_title}</Link>
                  {l.lesson_summary && <p className="muted">{l.lesson_summary}</p>}
                </div>
                {l.status && l.status !== 'available' && <Badge>{t(`common.${l.status === 'planned' ? 'planned' : 'comingSoon'}`)}</Badge>}
              </li>
            ))}
          </ol>
        </section>
      ))}
    </>
  );
}
