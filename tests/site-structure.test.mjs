import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import test from 'node:test';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const css = readFileSync(new URL('../apple.css', import.meta.url), 'utf8');

test('homepage defines separate visitor and signed-in dashboard states', () => {
  assert.match(html, /id="visitorView"/);
  assert.match(html, /id="dashboardView"/);
  assert.match(html, /data-auth-view="visitor"/);
  assert.match(html, /data-auth-view="dashboard"/);
});

test('visitor state has the planned landing-page structure', () => {
  assert.match(html, /id="landingHero"/);
  assert.match(html, /id="trustGrid"/);
  assert.match(html, /id="pathPreview"/);
  assert.match(html, /id="visitorCta"/);
});

test('signed-in state keeps the learning dashboard structure', () => {
  assert.match(html, /id="nextCard"/);
  assert.match(html, /id="priorityActions"/);
  assert.match(html, /id="levelList"/);
  assert.match(html, /id="badgeWall"/);
});

test('homepage includes local-only login and logout controls', () => {
  assert.match(html, /id="loginForm"/);
  assert.match(html, /id="studentNameInput"/);
  assert.match(html, /id="logoutBtn"/);
  assert.match(html, /gesp_user_profile/);
  assert.match(html, /function getUserProfile\(/);
  assert.match(html, /function renderAuthState\(/);
});

test('apple design system styles the new homepage structure responsively', () => {
  assert.match(css, /\[hidden\]/);
  assert.match(css, /\.site-topbar/);
  assert.match(css, /\.landing-hero/);
  assert.match(css, /\.trust-grid/);
  assert.match(css, /\.path-preview/);
  assert.match(css, /\.dashboard-hero/);
  assert.match(css, /\.next-lesson/);
  assert.match(css, /@media \(max-width: 720px\)/);
});

test('pages share a stable outer layout shell', () => {
  assert.match(css, /\.site-shell, \.wrap, \.course-shell/);
  assert.match(css, /--page-max/);
  assert.match(css, /--page-gutter/);
});

test('top navigation stays pinned consistently across pages', () => {
  assert.match(css, /html\s*\{[^}]*scroll-padding-top:\s*96px/);
  assert.doesNotMatch(css, /padding-(top|left|right):\s*0\s*!important/);
  assert.match(css, /\.site-topbar\s*\{[^}]*position:\s*sticky;[^}]*top:\s*0;/);
  assert.match(css, /\.site-topbar\s*\{[^}]*text-align:\s*left;/);
  assert.doesNotMatch(css, /\.site-topbar\s*\{[^}]*top:\s*12px;/);
  assert.doesNotMatch(css, /\.site-topbar\s*\{[^}]*margin:\s*14px\s+0\s+30px;/);
});

test('breadcrumb labels are hidden from page headers', () => {
  assert.match(css, /\.crumb\s*\{[^}]*display:\s*none;/);
});
