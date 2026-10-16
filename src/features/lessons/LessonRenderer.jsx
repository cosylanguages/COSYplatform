import { Fragment, useState } from 'react';
import { useT } from '../../shared/i18n/I18nContext.jsx';
import { findAll, textOf } from './parseLesson.js';
import { RecordWidget } from './RecordWidget.jsx';

/**
 * Renders a slide's nodes as React elements (React escapes all text, so lesson content cannot inject HTML).
 * Field keys follow the legacy scheme `${prefix}_${tag}_${elementIndex}` so saved answers still match.
 * ctx: { teacher, showKeys, answers, onAnswer, t }
 */
const BLOCK_TAGS = { p: 'p', ul: 'ul', ol: 'ol', li: 'li', h1: 'h1', h2: 'h2', h3: 'h3' };
const isHttps = (s) => typeof s === 'string' && s.startsWith('https://');

function renderChildren(children, prefix, ctx) {
  const out = [];
  let idx = 0;
  children.forEach((child, i) => {
    if (typeof child === 'string') { out.push(child); return; }
    const key = `${prefix}_${child.tag}_${idx++}`; // index counts every element, as the legacy renderer did
    out.push(<Fragment key={i}>{renderNode(child, key, ctx)}</Fragment>);
  });
  return out;
}

function AnswerKey({ ctx, children }) {
  if (!ctx.teacher || !ctx.showKeys) return null;
  return <div className="answer-key"><strong>{ctx.t('lesson.answerKey')}</strong> <span>{children}</span></div>;
}

function ChoiceCard({ fieldKey, ctx, node }) {
  const selected = ctx.answers[fieldKey] === 'selected';
  return (
    <button type="button" className={`choice-card${selected ? ' selected' : ''}`} aria-pressed={selected} disabled={ctx.teacher}
      onClick={() => ctx.onAnswer(fieldKey, selected ? '' : 'selected')}>
      {renderChildren(node.children, fieldKey, ctx)}
    </button>
  );
}

function Essay({ fieldKey, node, ctx }) {
  const [copied, setCopied] = useState('');
  const key = `${fieldKey}_essay`;
  const value = ctx.answers[key] || '';
  const topic = textOf(findAll(node, 'cosy-essay-topic')[0] || '') || ctx.t('lesson.essayTopicFallback');
  const copy = async () => {
    try { await navigator.clipboard.writeText(value); setCopied(ctx.t('lesson.copied')); } catch { setCopied(ctx.t('lesson.copyFailed')); }
  };
  return (
    <div className="widget">
      <p><strong>{topic}</strong></p>
      <textarea rows={6} value={value} disabled={ctx.teacher} placeholder={ctx.t('lesson.essayPlaceholder')} aria-label={topic}
        onChange={(e) => ctx.onAnswer(key, e.target.value)} />
      <div className="row">
        <button type="button" className="btn btn-secondary" onClick={copy} disabled={!value}>{ctx.t('lesson.copyText')}</button>
        <span className="muted small" aria-live="polite">{copied || (value ? ctx.t('lesson.savedOnDevice') : '')}</span>
      </div>
    </div>
  );
}

function renderDndContent(children, fieldKey, words, ctx, counter) {
  return children.map((c, i) => {
    if (typeof c === 'string') return c;
    if (c.tag === 'cosy-dnd-text-drop') {
      const dropKey = `${fieldKey}_drop_${counter.n++}`;
      return (
        <select key={i} className="inline-select" value={ctx.answers[dropKey] || ''} disabled={ctx.teacher} aria-label={ctx.t('lesson.selectPlaceholder')}
          onChange={(e) => ctx.onAnswer(dropKey, e.target.value)}>
          <option value="">[ ___ ]</option>
          {words.map((w) => <option key={w} value={w}>{w}</option>)}
        </select>
      );
    }
    const Tag = BLOCK_TAGS[c.tag] || 'span';
    return <Tag key={i}>{renderDndContent(c.children, fieldKey, words, ctx, counter)}</Tag>;
  });
}

function renderNode(node, fieldKey, ctx) {
  const { tag, attrs, children } = node;
  const { t, answers, onAnswer, teacher } = ctx;

  if (BLOCK_TAGS[tag]) { const Tag = BLOCK_TAGS[tag]; return <Tag>{renderChildren(children, fieldKey, ctx)}</Tag>; }

  switch (tag) {
    case 'cosy-teacher-notes': {
      if (!teacher) return null;
      const speech = (attrs.type || 'instruction') === 'speech';
      const title = attrs.title || t(speech ? 'lesson.noteSpeechTitle' : 'lesson.noteGuidanceTitle');
      return (
        <aside className={`teacher-note ${speech ? 'is-speech' : ''}`}>
          <strong>{speech ? '💬' : '💡'} {title}</strong>
          <div>{renderChildren(children, fieldKey, ctx)}</div>
        </aside>
      );
    }
    case 'cosy-instruction': return <div className="cosy-instruction">📋 {renderChildren(children, fieldKey, ctx)}</div>;
    case 'cosy-blockquote': return <blockquote>{renderChildren(children, fieldKey, ctx)}</blockquote>;
    case 'cosy-text': {
      const inner = renderChildren(children, fieldKey, ctx);
      return attrs.type === 'strong' ? <strong>{inner}</strong> : attrs.type === 'em' ? <em>{inner}</em> : <>{inner}</>;
    }
    case 'cosy-input': {
      const keyAnswers = findAll(node, 'cosy-input-item').map(textOf);
      return (
        <span className="inline-field">
          <input type="text" value={teacher ? '' : answers[fieldKey] || ''} disabled={teacher}
            placeholder={attrs.placeholder || t(teacher ? 'lesson.studentInput' : 'lesson.typeHere')} aria-label={attrs.placeholder || t('lesson.typeHere')}
            onChange={(e) => onAnswer(fieldKey, e.target.value)} />
          <AnswerKey ctx={ctx}>{keyAnswers.join(' / ') || t('lesson.freeResponse')}</AnswerKey>
        </span>
      );
    }
    case 'cosy-select': {
      const titles = findAll(node, 'cosy-select-item-title').map((n) => textOf(n).trim());
      const correct = findAll(node, 'cosy-select-item').filter((n) => n.attrs.correct === 'true').map((n) => textOf(n).trim());
      return (
        <span className="inline-field">
          <select value={answers[fieldKey] || ''} disabled={teacher} aria-label={t('lesson.selectPlaceholder')} onChange={(e) => onAnswer(fieldKey, e.target.value)}>
            <option value="">{t('lesson.selectPlaceholder')}</option>
            {titles.map((x) => <option key={x} value={x}>{x}</option>)}
          </select>
          {correct.length > 0 && <AnswerKey ctx={ctx}>{correct.join(' / ')}</AnswerKey>}
        </span>
      );
    }
    case 'cosy-test':
      return findAll(node, 'cosy-test-question').map((q, qi) => {
        const qKey = `${fieldKey}_q${qi}`;
        const text = textOf(findAll(q, 'cosy-test-question-text')[0] || '') || t('lesson.questionFallback');
        return (
          <fieldset className="test-question" key={qKey}>
            <legend>{text}</legend>
            {findAll(q, 'cosy-test-item').map((a) => {
              const val = textOf(a).trim();
              const ok = a.attrs.correct === 'true';
              return (
                <label key={val} className={`test-option${teacher && ctx.showKeys && ok ? ' is-correct' : ''}`}>
                  <input type="radio" name={qKey} value={val} checked={answers[qKey] === val} disabled={teacher} onChange={() => onAnswer(qKey, val)} />
                  {' '}{val}{teacher && ctx.showKeys && ok ? ` ${t('lesson.correctAnswer')}` : ''}
                </label>
              );
            })}
          </fieldset>
        );
      });
    case 'cosy-dnd-text': {
      const words = findAll(node, 'cosy-dnd-text-drag').map((n) => textOf(n).trim());
      const content = findAll(node, 'cosy-dnd-text-content')[0];
      return (
        <div className="widget">
          <p className="muted small"><strong>{t('lesson.wordBank')}</strong></p>
          <div className="row">{words.map((w) => <span key={w} className="badge badge-accent">{w}</span>)}</div>
          {content && <div className="dnd-content">{renderDndContent(content.children, fieldKey, words, ctx, { n: 0 })}</div>}
        </div>
      );
    }
    case 'cosy-vocabulary':
      return (
        <dl className="vocab">
          {findAll(node, 'cosy-vocabulary-item').map((v) => (
            <div key={v.attrs.word}><dt>{v.attrs.word}</dt><dd className="muted">{v.attrs.definition}</dd></div>
          ))}
        </dl>
      );
    case 'cosy-record': return <RecordWidget maxSeconds={Number(attrs.time) || 120} disabled={teacher} />;
    case 'cosy-essay': return <Essay fieldKey={fieldKey} node={node} ctx={ctx} />;
    case 'cosy-choice':
    case 'cosy-choice-image': return <div className="choice-grid">{renderChildren(children, fieldKey, ctx)}</div>;
    case 'cosy-choice-option':
    case 'cosy-choice-image-option': return <ChoiceCard fieldKey={fieldKey} ctx={ctx} node={node} />;
    case 'cosy-image': {
      const src = attrs.src || attrs['resource-id'] || '';
      return isHttps(src) ? <img className="lesson-img" src={src} alt={attrs.alt || ''} loading="lazy" /> : null;
    }
    case 'cosy-iframe':
      // No allow-same-origin: sibling sites under *.github.io share one origin with this app.
      return isHttps(attrs.src) ? <iframe className="lesson-embed" src={attrs.src} title={attrs.title || 'Embedded activity'} sandbox="allow-scripts allow-presentation" allow="fullscreen" loading="lazy" /> : null;
    case '#skip': return null;
    default: return <>{renderChildren(children, fieldKey, ctx)}</>;
  }
}

export function SlideContent({ slide, index, teacher = false, showKeys = false, answers, onAnswer }) {
  const t = useT();
  const ctx = { teacher, showKeys, answers, onAnswer, t };
  return <div className="slide-body">{renderChildren(slide.children, `slide_${index}`, ctx)}</div>;
}
