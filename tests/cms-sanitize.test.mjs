// Browser test: the founder CMS editor must clean saved HTML before it is saved or rendered.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { chromium } from 'playwright';

const editor = fs.readFileSync(new URL('../shared/js/cms-editor.js', import.meta.url), 'utf8');

const cases = [
  ['<script>alert(1)</script>ok', 'ok'],
  ['<img src=x onerror=alert(1)>', '<img src="x">'],
  ['<img src="https://a.example/x.png" onerror="alert(1)" alt="a">', '<img src="https://a.example/x.png" alt="a">'],
  ['<img src="data:image/svg+xml,<svg onload=alert(1)>">', ''],
  ['<a href="javascript:alert(1)">x</a>', '<a>x</a>'],
  ['<a href="java\tscript:alert(1)">x</a>', '<a>x</a>'],
  ['<a href="https://ok.example/p" onclick="x()">x</a>', '<a href="https://ok.example/p" rel="noopener noreferrer">x</a>'],
  ['<svg><script>alert(1)</script></svg>t', 't'],
  ['<p style="x" id="y">hi</p>', '<p>hi</p>'],
  ['<iframe src="https://e.example"></iframe>t', 't'],
  ['<table><tbody><tr><td colspan="2" onclick="x()">c</td></tr></tbody></table>', '<table><tbody><tr><td colspan="2">c</td></tr></tbody></table>'],
  ['<form action="x"><input></form>t', 't'],
  ['<b>bold</b> <em>it</em>', '<b>bold</b> <em>it</em>'],
  ['<math><mi xlink:href="javascript:alert(1)">x</mi></math>t', 't'],
  [null, ''],
  [42, '']
];

test('cms-editor sanitizeHTML removes script, handlers, unsafe URLs and keeps safe markup', async () => {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.setContent('<html><body></body></html>');
    await page.addScriptTag({ content: editor });
    assert.equal(await page.evaluate(() => typeof (window.CosyCMS && window.CosyCMS.sanitizeHTML)), 'function');
    for (const [input, expected] of cases) {
      const got = await page.evaluate(x => window.CosyCMS.sanitizeHTML(x), input);
      assert.equal(got, expected, 'input: ' + JSON.stringify(input));
    }
  } finally {
    await browser.close();
  }
});
