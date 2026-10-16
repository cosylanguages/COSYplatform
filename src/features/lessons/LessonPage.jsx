import { Link, useParams } from 'react-router-dom';
import { useT } from '../../shared/i18n/I18nContext.jsx';
import { LessonViewer } from './LessonViewer.jsx';

export function LessonPage({ base, mode }) {
  const t = useT();
  const { courseId, lessonId } = useParams();
  return (
    <>
      <p><Link to={`${base}/courses/${encodeURIComponent(courseId)}`} className="link">{t('common.backToCourse')}</Link></p>
      <LessonViewer lessonId={lessonId} mode={mode} />
    </>
  );
}
