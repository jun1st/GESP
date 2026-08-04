import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import test from 'node:test';

const html = readFileSync(new URL('../GESP官方考纲.html', import.meta.url), 'utf8');
const paperLibraryHtml = readFileSync(new URL('../真题资料库.html', import.meta.url), 'utf8');
const level2Html = readFileSync(new URL('../GESP2学习乐园.html', import.meta.url), 'utf8');

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

test('paper library organizes official papers into derived practice routes', () => {
  assert.match(paperLibraryHtml, /id="derivedPractice"/);
  assert.match(paperLibraryHtml, /真题改编训练路线/);
  assert.match(paperLibraryHtml, /不搬运原题/);
  assert.match(paperLibraryHtml, /按考点改写/);
  assert.match(paperLibraryHtml, /数位循环训练/);
  assert.match(paperLibraryHtml, /图形输出训练/);
  assert.match(paperLibraryHtml, /数学与枚举训练/);
});

test('level 2 learning content includes derived past-paper practice', () => {
  assert.match(level2Html, /id="pastPaperPractice"/);
  assert.match(level2Html, /真题改编练习/);
  assert.match(level2Html, /来源：CCF GESP 历年真题考点/);
  assert.match(level2Html, /原创改写/);
});
