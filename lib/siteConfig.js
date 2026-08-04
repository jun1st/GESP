export const navLinks = [
  { href: '/', legacyHref: 'index.html', label: '学习中心', key: 'home' },
  { href: '/courses', legacyHref: null, label: '课程', key: 'courses' },
  { href: '/review', legacyHref: '复习站.html', label: '复习站', key: 'review' },
  { href: '/parent', legacyHref: '家长中心.html', label: '家长中心', key: 'parent' },
  { href: '/syllabus', legacyHref: 'GESP官方考纲.html', label: '官方考纲', key: 'syllabus' },
  { href: '/notes', legacyHref: 'GESP二级知识点精讲.html', label: '知识笔记', key: 'notes' },
  { href: '/papers', legacyHref: '真题资料库.html', label: '真题资料库', key: 'papers' }
];

export const pageRoutes = [
  {
    route: '/',
    key: 'home',
    title: 'GESP C++ 学习中心',
    description: 'GESP C++ 备考学习中心：1-8 级课程地图、学习进度、错题复习与家长看板。',
    source: 'index.html',
    shellClass: 'site-shell',
    showAuthControls: true
  },
  {
    route: '/review',
    key: 'review',
    title: 'GESP 复习站',
    description: 'GESP 复习站：自动收集各课程答错的题，考前复习更高效。',
    source: '复习站.html',
    shellClass: 'wrap'
  },
  {
    route: '/parent',
    key: 'parent',
    title: 'GESP 家长中心',
    description: 'GESP 家长中心：查看课程进度、错题情况和备考节奏。',
    source: '家长中心.html',
    shellClass: 'wrap'
  },
  {
    route: '/syllabus',
    key: 'syllabus',
    title: 'GESP 官方考纲',
    description: 'GESP C++ 官方考纲、级别要求和真题资料。',
    source: 'GESP官方考纲.html',
    shellClass: 'wrap'
  },
  {
    route: '/notes',
    key: 'notes',
    title: 'GESP 二级知识点精讲',
    description: 'GESP C++ 二级知识点精讲和备考笔记。',
    source: 'GESP二级知识点精讲.html',
    shellClass: 'wrap'
  },
  {
    route: '/papers',
    key: 'papers',
    title: 'GESP 真题资料库',
    description: 'GESP C++ 历年真题资源和真题改编练习路线。',
    source: '真题资料库.html',
    shellClass: 'wrap'
  }
];

export const levelPages = [
  { id: 0, title: '基础常识乐园', source: '基础常识乐园.html', progressKey: 'gesp_lv0_prog' },
  { id: 1, title: 'GESP C++ 一级学习乐园', source: 'GESP1学习乐园.html', progressKey: 'gesp_lv1_prog' },
  { id: 2, title: 'GESP C++ 二级学习乐园', source: 'GESP2学习乐园.html', progressKey: 'gesp_lv2_prog' },
  { id: 3, title: 'GESP C++ 三级课程', source: 'GESP3课程.html', progressKey: 'gesp_lv3_prog' },
  { id: 4, title: 'GESP C++ 四级课程', source: 'GESP4课程.html', progressKey: 'gesp_lv4_prog' },
  { id: 5, title: 'GESP C++ 五级课程', source: 'GESP5课程.html', progressKey: 'gesp_lv5_prog' },
  { id: 6, title: 'GESP C++ 六级课程', source: 'GESP6课程.html', progressKey: 'gesp_lv6_prog' },
  { id: 7, title: 'GESP C++ 七级课程', source: 'GESP7课程.html', progressKey: 'gesp_lv7_prog' },
  { id: 8, title: 'GESP C++ 八级课程', source: 'GESP8课程.html', progressKey: 'gesp_lv8_prog' }
];

export const legacyRedirects = [
  { from: '/index.html', to: '/' },
  { from: '/复习站.html', to: '/review' },
  { from: '/家长中心.html', to: '/parent' },
  { from: '/GESP官方考纲.html', to: '/syllabus' },
  { from: '/GESP二级知识点精讲.html', to: '/notes' },
  { from: '/真题资料库.html', to: '/papers' },
  ...levelPages.map(level => ({ from: `/${level.source}`, to: `/levels/${level.id}` }))
];

export function findPageByRoute(route) {
  return pageRoutes.find(page => page.route === route);
}

export function findLevelPage(levelId) {
  return levelPages.find(level => level.id === Number(levelId));
}
