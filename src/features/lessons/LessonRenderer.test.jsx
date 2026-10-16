// @vitest-environment jsdom
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { I18nProvider } from '../../shared/i18n/I18nContext.jsx';
import { SlideContent } from './LessonRenderer.jsx';
import { parseLessonBody } from './parseLesson.js';

const XML = `<cosy-lesson><cosy-slide title="S">
  <p>Hi <cosy-input placeholder="name"><cosy-input-item>Ana</cosy-input-item></cosy-input></p>
  <cosy-teacher-notes>Secret teacher text</cosy-teacher-notes>
  <cosy-test><cosy-test-question><cosy-test-question-text>2+2?</cosy-test-question-text>
    <cosy-test-item>3</cosy-test-item><cosy-test-item correct="true">4</cosy-test-item></cosy-test-question></cosy-test>
  <cosy-image src="http://insecure.test/a.png"/>
  <cosy-iframe src="https://example.test/x"/>
  <p>&lt;script&gt;alert(1)&lt;/script&gt;</p>
</cosy-slide></cosy-lesson>`;

const render = (props) => {
  const slide = parseLessonBody(XML).slides[0];
  return renderToStaticMarkup(<I18nProvider><SlideContent slide={slide} index={0} answers={{}} onAnswer={() => {}} {...props} /></I18nProvider>);
};

describe('SlideContent', () => {
  it('restores saved answers using the legacy field-key scheme', () => {
    const html = render({ answers: { 'slide_0_p_0_cosy-input_0': 'Maria', 'slide_0_cosy-test_2_q0': '4' } });
    expect(html).toContain('value="Maria"');
    expect(html).toMatch(/checked="" value="4"/);
  });
  it('hides teacher notes and answer keys from students', () => {
    const html = render({});
    expect(html).not.toContain('Secret teacher text');
    expect(html).not.toContain('Correct Answer');
  });
  it('shows notes to teachers and answer keys only when toggled', () => {
    expect(render({ teacher: true })).toContain('Secret teacher text');
    expect(render({ teacher: true })).not.toContain('Correct Answer');
    expect(render({ teacher: true, showKeys: true })).toContain('Correct Answer');
  });
  it('never injects lesson text as HTML', () => {
    expect(render({})).not.toContain('<script>');
    expect(render({})).toContain('&lt;script&gt;');
  });
  it('drops non-https images and sandboxes iframes without same-origin', () => {
    const html = render({});
    expect(html).not.toContain('insecure.test');
    expect(html).toContain('sandbox="allow-scripts allow-presentation"');
    expect(html).not.toContain('allow-same-origin');
  });
});
