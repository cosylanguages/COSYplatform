#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const https = require('https');

const ROOT = path.resolve(__dirname, '..');
const SKIP_DIRS = new Set(['.git', 'node_modules', '.cosy', '.pages-site', 'verification']);
const EXTENSIONS = new Set(['.html', '.js', '.mjs', '.css', '.json']);
const URL_PATTERN = /https:\/\/raw\.githubusercontent\.com\/[^\s"'<>)\\]+/g;

function collectFiles(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collectFiles(full, files);
    } else if (EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      files.push(full);
    }
  }
  return files;
}

function collectUrls() {
  const urls = new Set();
  for (const file of collectFiles(ROOT)) {
    const content = fs.readFileSync(file, 'utf8');
    for (const match of content.matchAll(URL_PATTERN)) {
      const url = match[0];
      // Base URLs are concatenated at runtime; there is no file to HEAD.
      if (/\/(main|master)$/.test(url)) continue;
      urls.add(url);
    }
  }
  return [...urls].sort();
}

function check(url) {
  return new Promise(resolve => {
    const req = https.request(url, { method: 'HEAD', timeout: 15000 }, res => {
      res.resume();
      resolve({ url, status: res.statusCode });
    });
    req.on('timeout', () => req.destroy(new Error('timeout')));
    req.on('error', error => resolve({ url, status: 0, error: error.message }));
    req.end();
  });
}

(async () => {
  const urls = collectUrls();
  if (!urls.length) {
    console.log('No pinned raw.githubusercontent.com references found.');
    return;
  }

  const results = await Promise.all(urls.map(check));
  const failed = results.filter(result => result.status < 200 || result.status >= 400);

  for (const result of results) {
    console.log(`${result.status || 'ERR'} ${result.url}${result.error ? ` (${result.error})` : ''}`);
  }

  if (failed.length) {
    console.error(`\n${failed.length} external reference(s) failed.`);
    process.exit(1);
  }

  console.log(`\nAll ${results.length} external references resolve.`);
})();
