'use client';

import { useEffect, useState } from 'react';

export default function CheckButton({ progressKey, index }) {
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(progressKey) || '[]');
      setChecked(Boolean(saved[index]));
    } catch (e) {}
  }, [progressKey, index]);

  const toggle = () => {
    try {
      const saved = JSON.parse(localStorage.getItem(progressKey) || '[]');
      saved[index] = !checked;
      localStorage.setItem(progressKey, JSON.stringify(saved));
      setChecked(!checked);
      window.dispatchEvent(new CustomEvent('gesp-progress'));
    } catch (e) {}
  };

  return (
    <button type="button" onClick={toggle}>
      {checked ? '已打卡，点击取消' : '学完了，打卡'}
    </button>
  );
}
