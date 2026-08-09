// 客户端：localStorage 与云端数据合并（进度数组按位合并、错题去重、其余云端优先）

export function isProgressKey(key) {
  return /^gesp_lv\d_prog$/.test(key);
}

function parseJson(raw, fallback) {
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function mergeValue(key, localRaw, cloudRaw) {
  if (isProgressKey(key)) {
    const a = parseJson(localRaw, []);
    const b = parseJson(cloudRaw, []);
    const len = Math.max(Array.isArray(a) ? a.length : 0, Array.isArray(b) ? b.length : 0);
    const out = [];
    for (let i = 0; i < len; i += 1) {
      out.push(Boolean(a[i]) || Boolean(b[i]));
    }
    return JSON.stringify(out);
  }
  if (key === 'gesp_wrong') {
    const a = parseJson(localRaw, []);
    const b = parseJson(cloudRaw, []);
    const map = new Map();
    const put = (item) => {
      if (!item || typeof item !== 'object') return;
      const id = [item.lv, item.lesson, item.q, item.chosen].join('|');
      const prev = map.get(id);
      if (!prev || Number(item.time || 0) >= Number(prev.time || 0)) {
        map.set(id, item);
      }
    };
    (Array.isArray(a) ? a : []).forEach(put);
    (Array.isArray(b) ? b : []).forEach(put);
    return JSON.stringify([...map.values()]);
  }
  // 其余 key：云端优先
  return cloudRaw != null ? cloudRaw : localRaw;
}
