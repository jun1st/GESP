#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""从 CCF GESP 官网下载历年 C++ 真题 PDF 到 真题PDF/{YYYY-MM}/。

页面地址来自 web/src/app/papers/page.jsx 里的 OFFICIAL 列表。
只下载 C++ 的 PDF（排除图形化编程 / Python）；已存在的文件会跳过。
用法：python3 download_papers.py
"""

import os
import re
import sys
import time
import urllib.request
from urllib.parse import urljoin

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
PAGE_JSX = os.path.join(ROOT, "web", "src", "app", "papers", "page.jsx")
OUT = os.path.join(ROOT, "真题PDF")
UA = {"User-Agent": "Mozilla/5.0"}


def fetch(url, binary=False):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=60) as r:
        data = r.read()
    return data if binary else data.decode("utf-8", "ignore")


def pages():
    src = open(PAGE_JSX, encoding="utf-8").read()
    out = []
    for y, m, url in re.findall(r"\['(\d{4}) 年 (\d{1,2}) 月', '(https://[^']+)'", src):
        out.append((f"{y}-{int(m):02d}", url))
    return out


def safe(s):
    return re.sub(r'[\\/:*?"<>|\s]+', "_", s).strip("_")


def main():
    total = skipped = failed = 0
    for session, url in pages():
        try:
            html = fetch(url)
        except Exception as e:
            print(f"[页面失败] {session} {url}: {e}")
            failed += 1
            continue
        links = []
        for m in re.finditer(r'<a[^>]*href="([^"]*\.pdf)"[^>]*>(.*?)</a>', html, re.S | re.I):
            text = re.sub(r"<[^>]+>|\s+", " ", m.group(2)).strip()
            if re.search(r"图形化|Python|scratch", text, re.I):
                continue
            links.append((urljoin(url, m.group(1)), text))
        os.makedirs(os.path.join(OUT, session), exist_ok=True)
        print(f"{session}: {len(links)} 个 C++/通用 PDF")
        for href, text in links:
            name = safe(text or os.path.basename(href)) + ".pdf"
            path = os.path.join(OUT, session, name)
            if os.path.exists(path) and os.path.getsize(path) > 1000:
                skipped += 1
                continue
            try:
                data = fetch(href, binary=True)
                if not data.startswith(b"%PDF"):
                    raise ValueError("不是 PDF")
                open(path, "wb").write(data)
                total += 1
                print(f"  ✓ {name}")
            except Exception as e:
                failed += 1
                print(f"  ✗ {name}: {e}")
            time.sleep(0.3)
    print(f"完成：新下载 {total}，跳过 {skipped}，失败 {failed}。目录：{OUT}")


if __name__ == "__main__":
    sys.exit(main())
