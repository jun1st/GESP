'use client';

import { useEffect, useRef, useState } from 'react';
import { CLOUD_KEYS } from '@/lib/syncKeys';
import { mergeValue } from '@/lib/cloudSync';

export default function CloudSync() {
  const [me, setMe] = useState(null);
  const meRef = useRef(null);
  const syncingRef = useRef(false);

  useEffect(() => {
    meRef.current = me;
  }, [me]);

  const saveKey = async (key) => {
    if (!meRef.current || !key) return;
    try {
      const raw = localStorage.getItem(key);
      if (raw == null) return;
      // 先拉云端合并，避免多设备并发时互相覆盖丢数据
      const res = await fetch('/api/account/data', { cache: 'no-store' });
      if (res.ok) {
        const { data } = await res.json();
        const cloud = data && data[key] != null ? data[key] : null;
        if (cloud != null) {
          const merged = mergeValue(key, raw, cloud);
          localStorage.setItem(key, merged);
          await fetch('/api/account/data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key, value: merged })
          });
          return;
        }
      }
      await fetch('/api/account/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value: raw })
      });
    } catch {
      /* 网络异常时静默，下次同步再补 */
    }
  };

  const syncAll = async () => {
    if (syncingRef.current) return;
    syncingRef.current = true;
    try {
      const res = await fetch('/api/account/data', { cache: 'no-store' });
      if (!res.ok) return;
      const { data } = await res.json();
      const toUpload = [];
      for (const key of CLOUD_KEYS) {
        const local = localStorage.getItem(key);
        const cloud = data && data[key] != null ? data[key] : null;
        if (cloud != null && local != null) {
          const merged = mergeValue(key, local, cloud);
          localStorage.setItem(key, merged);
          if (merged !== cloud) toUpload.push({ key, value: merged });
        } else if (cloud != null) {
          localStorage.setItem(key, cloud);
        } else if (local != null) {
          toUpload.push({ key, value: local });
        }
      }
      if (toUpload.length) {
        await fetch('/api/account/data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: toUpload })
        });
      }
      window.dispatchEvent(new CustomEvent('gesp-progress'));
      window.dispatchEvent(new CustomEvent('gesp-data-synced'));
    } catch {
      /* 静默 */
    } finally {
      syncingRef.current = false;
    }
  };

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch('/api/account/me', { cache: 'no-store' });
        const d = await res.json();
        if (cancelled) return;
        setMe(d.user || null);
        if (d.user) await syncAll();
      } catch {
        /* 静默 */
      }
    };
    const onAuth = () => load();
    const onData = (e) => {
      if (meRef.current && e.detail && e.detail.key) saveKey(e.detail.key);
    };
    load();
    window.addEventListener('gesp-auth-changed', onAuth);
    window.addEventListener('gesp-progress', onData);
    window.addEventListener('gesp-data-changed', onData);
    return () => {
      cancelled = true;
      window.removeEventListener('gesp-auth-changed', onAuth);
      window.removeEventListener('gesp-progress', onData);
      window.removeEventListener('gesp-data-changed', onData);
    };
  }, []);

  return null;
}
