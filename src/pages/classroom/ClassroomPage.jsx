import { useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { LessonViewer } from '../../features/lessons/LessonViewer.jsx';
import { Toolbox } from '../../features/classroom/Toolbox.jsx';
import { useAuth } from '../../shared/auth/AuthContext.jsx';
import { useT } from '../../shared/i18n/I18nContext.jsx';
import { Button } from '../../shared/ui/primitives.jsx';
import { Drawer } from '../../shared/ui/Drawer.jsx';

/**
 * Live classroom shell: video stage, lesson stage, and a tools drawer.
 * TODO: mount ONE video provider here (Jitsi or PeerJS; see README).
 */
export default function ClassroomPage() {
  const t = useT();
  const { roomId } = useParams();
  const [params] = useSearchParams();
  const { profile } = useAuth();
  const [toolsOpen, setToolsOpen] = useState(false);
  const isTeacher = profile?.role === 'teacher' || profile?.role === 'founder';
  const lesson = params.get('lesson');

  return (
    <div className="classroom">
      <header className="topbar">
        <Link to="/hub" className="btn btn-ghost">{t('classroom.leaveBtn')}</Link>
        <span className="muted">{roomId}</span><span className="grow" />
        <Button variant="secondary" onClick={() => setToolsOpen((o) => !o)} aria-expanded={toolsOpen}>{toolsOpen ? t('toolbox.close') : t('toolbox.open')}</Button>
      </header>
      <div className="stage">
        <section className="video-stage" aria-label={t('classroom.teacherVideo')} />
        <section className="lesson-stage" aria-label={t('classroom.materialSelect')}>
          {lesson && <LessonViewer lessonId={lesson} mode={isTeacher ? 'teacher' : 'student'} />}
        </section>
      </div>
      <Drawer open={toolsOpen} onClose={() => setToolsOpen(false)} title={t('toolbox.title')}>
        <Toolbox scope={`${roomId}:${lesson || ''}`} isTeacher={isTeacher} />
      </Drawer>
    </div>
  );
}
