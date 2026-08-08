'use client';

import { useState } from 'react';

function txt(arr) {
  return (arr || []).map((o) => o.text || '').join('');
}

const SAMPLES = {
  hello: '#include <iostream>\nusing namespace std;\nint main() {\n    cout << "你好，世界！" << endl;\n    return 0;\n}',
  sum: '#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    cout << "和是：" << a + b << endl;\n    return 0;\n}',
  digits: '#include <iostream>\nusing namespace std;\nint main() {\n    int n, sum = 0;\n    cin >> n;\n    while (n > 0) {\n        sum += n % 10;\n        n /= 10;\n    }\n    cout << sum << endl;\n    return 0;\n}'
};

export default function CodeRunner() {
  const [code, setCode] = useState(SAMPLES.hello);
  const [stdin, setStdin] = useState('');
  const [out, setOut] = useState('// 点"运行"，云端编译器马上帮你编译执行！');
  const [busy, setBusy] = useState(false);

  const run = async () => {
    if (!code.trim()) { setOut('// 先写代码再运行哦～'); return; }
    setBusy(true);
    setOut('// 正在编译运行……');
    try {
      const res = await fetch('https://godbolt.org/api/compiler/g122/compile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          source: code,
          options: {
            userArguments: '',
            executeParameters: { args: '', stdin },
            compilerOptions: { executorRequest: true },
            filters: { execute: true, binary: false, labels: false, directives: false, commentOnly: false, trim: false, intel: true, demangle: true, libraryCode: true }
          }
        })
      });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const d = await res.json();
      const build = d.buildResult || {};
      if (build.code !== 0 && build.code !== undefined) {
        setOut(txt(build.stderr).replace(/\x1b\[[0-9;]*m/g, '') || '编译出错（没有更多信息）');
      } else {
        setOut(txt(d.stdout) + (txt(d.stderr) ? '\n' + txt(d.stderr) : '') || '（程序没有输出）');
      }
    } catch (e) {
      setOut('// 连不上在线编译器…检查网络再试一次（' + e.message + '）');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="exp-card">
      <h3>🛠️ 在线编译 C++（需要联网）</h3>
      <div className="exp-row">
        <label className="exp-label">示例：
          <select className="exp-input" onChange={(e) => setCode(SAMPLES[e.target.value])}>
            <option value="hello">👋 你好，世界</option>
            <option value="sum">➕ 两数之和</option>
            <option value="digits">🔢 数位之和</option>
          </select>
        </label>
      </div>
      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        rows="10"
        spellCheck="false"
        style={{ width: '100%', fontFamily: 'monospace', fontSize: 13, padding: 10, borderRadius: 12, border: '2px solid #20232e', background: '#20232e', color: '#d6f5e3', resize: 'vertical' }}
      />
      <div className="exp-row">
        <label className="exp-label">输入（给 cin）：
          <input className="exp-input" style={{ width: 180 }} value={stdin} onChange={(e) => setStdin(e.target.value)} placeholder="例如：3 5" />
        </label>
        <button className="exp-btn go" onClick={run} disabled={busy}>{busy ? '⏳ 编译中…' : '▶️ 运行'}</button>
      </div>
      <pre className="exp-out" style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: 13 }}>{out}</pre>
    </div>
  );
}
