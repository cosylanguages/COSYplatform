import { useT } from '../../shared/i18n/I18nContext.jsx';
import { Tabs } from '../../shared/ui/Tabs.jsx';
import { DictionaryPanel } from '../dictionary/DictionaryPanel.jsx';
import { IrregularVerbsPanel } from '../dictionary/IrregularVerbsPanel.jsx';
import { NotesPanel } from '../notes/NotesPanel.jsx';
import { Timer } from './Timer.jsx';

/** One tab per tool instead of a wall of always-visible panels (the "too noisy" fix). */
export function Toolbox({ scope, isTeacher }) {
  const t = useT();
  const tabs = [
    { id: 'dict', label: t('classroom.toolDictionary'), content: <DictionaryPanel /> },
    { id: 'verbs', label: t('classroom.toolVerbs'), content: <IrregularVerbsPanel /> },
    { id: 'notes', label: t('classroom.toolNotes'), content: <NotesPanel scope={scope} /> },
    ...(isTeacher ? [{ id: 'timer', label: t('classroom.toolTimer'), content: <Timer /> }] : []),
  ];
  return <Tabs tabs={tabs} />;
}
