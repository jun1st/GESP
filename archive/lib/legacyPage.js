import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { renderDocument } from './renderHtml.js';

const rootDir = process.cwd();

function extractMatches(html, regex) {
  return [...html.matchAll(regex)].map(match => match[0]).join('\n');
}

function stripMatches(html, regex) {
  return html.replace(regex, '');
}

function removeOuterShell(content) {
  const shellStart = /^\s*<div class="(?:site-shell|wrap|course-shell)[^"]*">\s*/;
  if (!shellStart.test(content)) return content.trim();

  let stripped = content.replace(shellStart, '').trim();
  stripped = stripped.replace(/<\/div>\s*$/, '').trim();
  return stripped;
}

export async function renderLegacyPage(page) {
  const html = await readFile(path.join(rootDir, page.source), 'utf8');
  const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
  const descriptionMatch = html.match(/<meta name="description" content="([^"]*)">/i);
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);

  let body = bodyMatch ? bodyMatch[1] : '';
  const bodyScripts = extractMatches(body, /<script\b[\s\S]*?<\/script>/gi);
  body = stripMatches(body, /<script\b[\s\S]*?<\/script>/gi);
  body = removeOuterShell(body);
  body = stripMatches(body, /<header class="site-topbar">[\s\S]*?<\/header>/i);
  body = stripMatches(body, /<div class="crumb">[\s\S]*?<\/div>/i);

  return renderDocument({
    title: page.title || titleMatch?.[1] || 'GESP 学习中心',
    description: page.description || descriptionMatch?.[1] || '',
    activeKey: page.key,
    shellClass: page.shellClass,
    showAuthControls: page.showAuthControls,
    headExtra: extractMatches(html, /<style\b[\s\S]*?<\/style>/gi),
    body,
    bodyEnd: bodyScripts
  });
}
