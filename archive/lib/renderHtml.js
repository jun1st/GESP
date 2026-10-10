import { navLinks } from './siteConfig.js';

export function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function renderTopbar(activeKey, showAuthControls = true) {
  const links = navLinks.map(link => {
    const active = link.key === activeKey ? ' class="active" aria-current="page"' : '';
    return `<a href="${link.href}"${active}>${escapeHtml(link.label)}</a>`;
  }).join('');

  const authControls = showAuthControls
    ? `
    <form id="loginForm" class="login-card" aria-label="本地学习档案登录">
      <input id="studentNameInput" type="text" maxlength="16" autocomplete="nickname" placeholder="孩子昵称">
      <button type="submit">登录学习</button>
    </form>
    <div id="profileBar" class="profile-card" hidden>
      <span id="profileName">小勇士</span>
      <button id="logoutBtn" type="button">退出</button>
    </div>`
    : '';

  return `
  <header class="site-topbar">
    <a href="/" class="brand-mark" aria-label="GESP 学习中心首页">
      <span class="brand-icon">C</span>
      <span>GESP 学习中心</span>
    </a>
    <nav class="site-nav" aria-label="主导航">
      ${links}
    </nav>${authControls}
  </header>`;
}

export function renderDocument({
  title,
  description = '',
  activeKey = '',
  shellClass = 'site-shell',
  headExtra = '',
  body = '',
  bodyEnd = '',
  showAuthControls = true
}) {
  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
${description ? `<meta name="description" content="${escapeHtml(description)}">` : ''}
<title>${escapeHtml(title)}</title>
<link rel="stylesheet" href="/gesp-style.css">
${headExtra}
<link rel="stylesheet" href="/site.css">
</head>
<body>
<div class="${escapeHtml(shellClass)}">
${renderTopbar(activeKey, showAuthControls)}
${body}
</div>
${bodyEnd}
<script src="/site-auth.js"></script>
</body>
</html>`;
}
