import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import test from 'node:test';

const html = readFileSync(new URL('../GESP官方考纲.html', import.meta.url), 'utf8');

test('official resources page exposes a past-paper section', () => {
  assert.match(html, /id="pastPapers"/);
  assert.match(html, /历年真题及解析/);
  assert.match(html, /href="#pastPapers"/);
});

test('past-paper section links all official CCF paper pages', () => {
  const links = [...html.matchAll(/href="https:\/\/gesp\.ccf\.org\.cn\/101\/1010\/\d+\.html"/g)];
  assert.equal(links.length, 15);
  assert.match(html, /2026年6月GESP认证真题/);
  assert.match(html, /https:\/\/gesp\.ccf\.org\.cn\/101\/1010\/10284\.html/);
  assert.match(html, /2023年GESP 3月认证真题/);
  assert.match(html, /https:\/\/gesp\.ccf\.org\.cn\/101\/1010\/10068\.html/);
});
