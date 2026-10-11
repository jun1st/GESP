#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""用 真题PDF/{Session}/*.pdf 里的“题号/答案”表，补全 / 校对题库 JSON 的答案。

只改 answer 字段，不动题干、选项、解析。
  python3 fill_answers.py          仅报告（dry-run）
  python3 fill_answers.py --write  写回 JSON

依赖：pdfplumber（建议在 venv 里安装）。
"""

import glob
import json
import os
import re
import sys

import pdfplumber

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from extract_papers import parse_key, find_section  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SRC = os.path.join(ROOT, "真题PDF")
DATA = os.path.join(ROOT, "web", "data", "papers", "sessions")

CN = {"一": 1, "二": 2, "三": 3, "四": 4, "五": 5, "六": 6, "七": 7, "八": 8}


def level_of(name):
    m = re.search(r"(\d)\s*级", name)
    if m:
        return int(m.group(1))
    m = re.search(r"([一二三四五六七八])\s*级", name)
    return CN[m.group(1)] if m else None


def pdf_text(path):
    with pdfplumber.open(path) as pdf:
        return "\n".join((p.extract_text() or "") for p in pdf.pages)


def judge_key_from_marks(pdf_path):
    """判断题答案表里的 √/× 是矢量图形，不是文字：按图形尺寸区分（√ 比 × 大）。
    返回 ['对'/'错', ...]（按题号 1..N），识别不全时返回空列表。"""
    with pdfplumber.open(pdf_path) as pdf:
        started = False
        for page in pdf.pages:
            words = page.extract_words()
            hdr_top = None
            for w in words:
                if w["text"].startswith("判断题"):
                    started = True
                    hdr_top = w["top"]
            if not started:
                continue
            heads = [w for w in words if w["text"] == "题号" and (hdr_top is None or w["top"] > hdr_top)]
            if not heads:
                continue
            head = heads[0]
            nums = sorted(
                (w for w in words if abs(w["top"] - head["top"]) < 3 and w["text"].isdigit()),
                key=lambda w: w["x0"],
            )
            ans = [w for w in words if w["text"] == "答案" and w["top"] > head["top"]]
            if not nums or not ans:
                continue
            row = ans[0]
            marks = [
                c for c in (page.curves + page.images)
                if row["top"] - 12 < (c["top"] + c["bottom"]) / 2 < row["bottom"] + 20 and c["x0"] > row["x1"] - 1
                and (c["x1"] - c["x0"]) < 20 and (c["bottom"] - c["top"]) > 3
            ]
            key = []
            for n in nums:
                cx = (n["x0"] + n["x1"]) / 2
                cand = [m for m in marks if abs((m["x0"] + m["x1"]) / 2 - cx) < 7]
                if not cand:
                    return []
                m = max(cand, key=lambda m: (m["x1"] - m["x0"]) * (m["bottom"] - m["top"]))
                area = (m["x1"] - m["x0"]) * (m["bottom"] - m["top"])
                key.append("对" if area > 45 else "错")
            return key
    return []


def key_tables(text):
    i_s = find_section(text, ["单选题"])
    i_j = find_section(text, ["判断题"])
    i_p = find_section(text, ["编程题"])
    single = parse_key(text[i_s : i_j if i_j > i_s else None]) if i_s >= 0 else []
    judge = parse_key(text[i_j : i_p if i_p > i_j else None]) if i_j >= 0 else []
    return single, judge


def main():
    write = "--write" in sys.argv
    stat = dict(filled=0, same=0, conflict=0, missing_pdf_key=0, files=0)
    problems = []
    for pdf in sorted(glob.glob(os.path.join(SRC, "*", "*.pdf"))):
        session = os.path.basename(os.path.dirname(pdf))
        level = level_of(os.path.basename(pdf))
        jf = os.path.join(DATA, session, f"level-{level}.json")
        if level is None or not os.path.exists(jf):
            problems.append(f"无对应 JSON: {pdf}")
            continue
        stat["files"] += 1
        with open(jf, encoding="utf-8") as fh:
            data = json.load(fh)
        single_key, judge_key = key_tables(pdf_text(pdf))
        marks = judge_key_from_marks(pdf)
        if marks:
            judge_key = marks
        for sec, key, valid in (("single", single_key, "ABCD"), ("judge", judge_key, ("对", "错"))):
            qs = data.get(sec, [])
            if len(key) < len(qs):
                problems.append(f"{session} L{level} {sec}: 题 {len(qs)} 道，PDF 答案 {len(key)} 个")
            for q in qs:
                k = key[q["no"] - 1] if 0 < q["no"] <= len(key) else ""
                if not k or k not in valid:
                    stat["missing_pdf_key"] += 1
                    continue
                old = q.get("answer", "")
                if old == k:
                    stat["same"] += 1
                elif not old or (sec == "judge" and old not in valid):
                    q["answer"] = k
                    stat["filled"] += 1
                else:
                    stat["conflict"] += 1
                    problems.append(f"冲突 {session} L{level} {sec}#{q['no']}: 原 {old!r} PDF {k!r}")
                    q["answer"] = k
        if write:
            with open(jf, "w", encoding="utf-8") as fh:
                json.dump(data, fh, ensure_ascii=False)
    print(stat)
    for p in problems:
        print(" -", p)
    print("已写回" if write else "dry-run，未写入（加 --write 写回）")


if __name__ == "__main__":
    main()
