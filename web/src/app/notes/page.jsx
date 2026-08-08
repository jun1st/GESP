const CARDS = [
  ['1 KB = ?', '1024 B'],
  ['断电丢失 / 保留', 'RAM、Cache 丢；ROM、硬盘保留'],
  ['速度最快', 'Cache'],
  ['存储单位由小到大', 'bit → Byte → KB → MB → GB → TB'],
  ['OSI 七层顺序', '物数网传会表应'],
  ['网页协议 / 端口', 'HTTP(80)、HTTPS(443)'],
  ['域名解析', 'DNS'],
  ['私有网段', '10.x、172.16~31.x、192.168.x'],
  ['回环地址', '127.0.0.1'],
  ['网络从小到大', 'LAN < MAN < WAN'],
  ['C++ 属于', '编译型高级语言'],
  ['流程图判断框', '菱形'],
  ['空格 / 0 / A / a', '32 / 48 / 65 / 97'],
  ['大写转小写', '+32'],
  ['两个整数相除', '结果是整数（截断）'],
  ['switch 漏 break', '会穿透继续执行'],
  ['else 与谁配对', '最近的未配对 if'],
  ['浮点数比较', '用 fabs(a-b) < 1e-9，不用 ==']
];

export default function NotesPage() {
  return (
    <div className="panel">
      <h2>📖 客观题速记卡（考前背这张表）</h2>
      <table>
        <thead>
          <tr><th>考点</th><th>答案</th></tr>
        </thead>
        <tbody>
          {CARDS.map(([point, answer]) => (
            <tr key={point}><td>{point}</td><td><b>{answer}</b></td></tr>
          ))}
        </tbody>
      </table>
      <div className="callout info">
        备考顺序建议：先把"多层循环 + 数位分解 + 枚举"练熟（编程题 50 分），再背速记卡（客观题 50 分）。
      </div>
    </div>
  );
}
