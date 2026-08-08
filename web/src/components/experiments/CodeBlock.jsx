'use client';

import { useState } from 'react';

export default function CodeBlock({ code, title = '代码示例' }) {
  const [state, setState] = useState('idle'); // idle | done | fail

  const copy = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(code);
      } else {
        const ta = document.createElement('textarea');
        ta.value = code;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setState('done');
      setTimeout(() => setState('idle'), 1600);
    } catch {
      setState('fail');
      setTimeout(() => setState('idle'), 1600);
    }
  };

  return (
    <div className="code-block">
      <div className="code-block-head">
        <span>{title}</span>
        <button type="button" className={'copy-btn' + (state === 'done' ? ' done' : '')} onClick={copy}>
          {state === 'done' ? '✅ 已复制' : state === 'fail' ? '😅 请手动复制' : '📋 复制'}
        </button>
      </div>
      <pre>{code}</pre>
    </div>
  );
}
