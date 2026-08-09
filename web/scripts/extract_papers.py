#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""解析 GESP 真题 / 解析 PDF，生成网站题库 JSON。

用法：python3 extract_papers.py
产物：
  web/public/data/papers/index.json                     批次索引
  web/public/data/papers/{batch}/level-{n}.json         每批次每级别题目（真题+答案+解析）
  web/data/papers/related/level-{n}.json                课程章节 → 相关真题
"""

import glob
import json
import os
import re
import sys
from unicodedata import normalize

import pdfplumber

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SRC = os.path.join(ROOT, "真题PDF")
OUT_PUB = os.path.join(ROOT, "web", "public", "data", "papers")
OUT_REL = os.path.join(ROOT, "web", "data", "papers", "related")


def extract_text(path):
    with pdfplumber.open(path) as pdf:
        parts = [(p.extract_text() or "") for p in pdf.pages]
    full = "\n".join(parts)
    # 去掉页脚页码（如 “3 / 10”）
    full = re.sub(r"^\s*\d+\s*/\s*\d+\s*$", "", full, flags=re.M)
    return full


def clean(s):
    return re.sub(r"\s+", " ", s).strip()


def strip_qno(s):
    """去掉题干开头的 “第 N 题” / “N.” 题号前缀。"""
    return re.sub(r"^\s*(?:第\s*\d+\s*题|\d{1,2}[.、．])\s*", "", s).strip()


def clean_options(opts):
    """去掉空选项和误解析出的纯字母垃圾项（图片选项场景）。"""
    out = []
    for o in opts:
        o = clean(o)
        if not o or re.fullmatch(r"[A-Da-d][.、．)）]?", o):
            continue
        out.append(o)
    return out


def nf(s):
    """NFKC 归一化：⼀→一、Ａ→A 等，便于关键词匹配。"""
    return normalize("NFKC", s or "")


def parse_key(seg):
    """在段落里找“题号 1 2 3…\n答案 X X X…”，返回答案 token 列表。"""
    m = re.search(r"题号[^\n]*\n\s*答案\s*([^\n]*)", seg)
    if not m:
        return []
    ans_str = m.group(1).strip()
    # 答案可能换行（如 2025-06 排版：答案 独占一行，答案写在下一行）
    if not ans_str:
        rest = seg[m.end() : m.end() + 400]
        lines = re.split(r"\n", rest)[:4]
        take = []
        for ln in lines:
            s = ln.strip()
            if re.match(r"^(第\s*\d+\s*题|\d{1,2}[、.．]|二?[一二三四五六]、|单选题|判断题|编程题)", s):
                break
            take.append(s)
        ans_str = " ".join(take).strip()
    tokens = ans_str.split()
    if len(tokens) == 1:
        # 可能没有空格：CDDCD…
        tokens = list(tokens[0])
    out = []
    for t in tokens:
        t = t.strip()
        if not t:
            continue
        if t in ("√", "✓", "对", "正确", "T", "TRUE", "true"):
            out.append("对")
        elif t in ("×", "✗", "错", "错误", "F", "FALSE", "false"):
            out.append("错")
        elif re.fullmatch(r"[A-Da-d]", t):
            out.append(t.upper())
    return out


def split_questions(text, marker_re, start=None, end=None):
    """按题号标记切分题目。marker_re 需捕获题号。返回 [(no, body)]。"""
    seg = text[start:end] if (start is not None or end is not None) else text
    marks = [(m.start(), int(m.group(1) or m.group(2))) for m in marker_re.finditer(seg)]
    out = []
    for i, (pos, no) in enumerate(marks):
        body = seg[pos: marks[i + 1][0] if i + 1 < len(marks) else None]
        out.append((no, body))
    return out


OPT_LINE = re.compile(r"(?:^|\n)\s*([A-Da-d])\s*[.、．)）]\s*")
OPT_INLINE = re.compile(r"(?:^|[\s(（])([A-Da-d])\s*[.、．)）]\s*")


def split_options(body):
    """把题干与 A/B/C/D 选项分开。返回 (question, [options])。"""
    ms = list(OPT_LINE.finditer(body))
    if len(ms) < 2:
        ms = list(OPT_INLINE.finditer(body))
    if not ms:
        return clean(body), []
    q = clean(body[: ms[0].start()])
    opts = []
    for k in range(len(ms)):
        start = ms[k].end()
        end = ms[k + 1].start() if k + 1 < len(ms) else len(body)
        opts.append(clean(body[start:end]))
    return q, opts


def find_section(text, headers):
    """返回第一个命中 header 的位置；找不到返回 -1。"""
    for h in headers:
        i = text.find(h)
        if i >= 0:
            return i
    return -1


def parse_exam_paper(full, expected_single=15, expected_judge=10):
    """解析真题 PDF 全文 → {single, judge, program}。"""
    single = []
    judge = []
    program = []

    # ---------- 单选题 ----------
    i_s = find_section(full, ["单选题"])
    i_j = find_section(full, ["判断题"])
    if i_s >= 0:
        seg = full[i_s : i_j if i_j > i_s else None]
        key = parse_key(seg)
        new_fmt = "第 1 题" in seg or "第 1题" in seg
        if new_fmt:
            qs = split_questions(seg, re.compile(r"(?:^|\n)\s*第\s*(\d+)\s*题\s*"))
        else:
            qs = split_questions(seg, re.compile(r"(?:^|\n)\s*(\d{1,2})[.、．]\s*"))
        for no, body in qs:
            if no > expected_single:
                continue
            q, opts = split_options(body)
            single.append(
                {
                    "no": no,
                    "text": strip_qno(q),
                    "options": clean_options(opts),
                    "answer": key[no - 1] if 0 < no <= len(key) else "",
                }
            )

    # ---------- 判断题 ----------
    i_p = find_section(full, ["编程题"])
    if i_j >= 0:
        seg = full[i_j : i_p if i_p > i_j else None]
        key = parse_key(seg)
        new_fmt = "第 1 题" in seg or "第 1题" in seg
        if new_fmt:
            qs = split_questions(seg, re.compile(r"(?:^|\n)\s*第\s*(\d+)\s*题\s*"))
        else:
            qs = split_questions(seg, re.compile(r"(?:^|\n)\s*(\d{1,2})[.、．]\s*"))
        for no, body in qs:
            if no > expected_judge:
                continue
            judge.append(
                {
                    "no": no,
                    "text": strip_qno(clean(body)),
                    "answer": key[no - 1] if 0 < no <= len(key) else "",
                }
            )

    # ---------- 编程题 ----------
    if i_p >= 0:
        seg = full[i_p:]
        new_fmt = bool(re.search(r"3\.\d+\s*编程题", seg))
        if new_fmt:
            marks = [(m.start(), int(m.group(2))) for m in re.finditer(r"3\.(\d+)\s*编程题\s*(\d+)", seg)]
            for i, (pos, no) in enumerate(marks):
                body = seg[pos : marks[i + 1][0] if i + 1 < len(marks) else None]
                tm = re.search(r"试题名称[:：]\s*([^\n]+)", body)
                title = clean(tm.group(1)) if tm else ""
                body = re.sub(r"试题名称[:：][^\n]*\n?", "", body, count=1)
                program.append({"no": no, "title": title, "text": clean(body)})
        else:
            # 早期格式：真实题目用 “N.”（点号），题干里的 “1、2、3、” 列表不切
            qs = split_questions(seg, re.compile(r"(?:^|\n)\s*(\d{1,2})\.\s*"))
            for no, body in qs:
                if no > 2:
                    continue
                lines = body.strip().splitlines()
                title = clean(lines[0]) if lines else ""
                rest = "\n".join(lines[1:])
                program.append({"no": no, "title": strip_qno(title), "text": clean(rest)})

    return {"single": single, "judge": judge, "program": program}


BLOCK_RE = re.compile(r"(?:^|\n)\s*(?:(?:(\d{1,2})[、.．])|(?:第\s*(\d{1,2})\s*题))\s*")


def parse_analysis_paper(full):
    """解析解析 PDF → 三节 {answer, point, analysis, program} 列表。"""
    result = {"single": [], "judge": [], "program": []}

    def split_blocks(seg, anchor, mode="contains"):
        """按候选编号切分后，用锚点合并：
        mode="contains": 块本身含锚点 → 新题目（适合单选/判断：锚点在题块内）；
        mode="accumulated": 当前累计内容已含锚点 → 新题目（适合编程：锚点在题块末尾）。"""
        raw = split_questions(seg, BLOCK_RE)
        groups = []
        for no, body in raw:
            if mode == "accumulated":
                if groups and anchor in groups[-1]["body"]:
                    groups.append({"no": no, "body": body})
                elif groups:
                    groups[-1]["body"] += "\n" + body
                else:
                    groups.append({"no": no, "body": body})
            elif anchor in body:
                groups.append({"no": no, "body": body})
            elif groups:
                groups[-1]["body"] += "\n" + body
            else:
                groups.append({"no": no, "body": body})
        return [(g["no"], g["body"]) for g in groups]

    def parse_block(body):
        q, opts = split_options(body.split("【答案】")[0])
        ans = re.search(r"【答案】\s*([^\n【]*)", body)
        point = re.search(r"【考纲知识点】\s*([^\n【]*)", body)
        analysis = re.search(r"【解析】\s*([\s\S]*?)(?=\n\s*\d{1,2}[、.．]|\n【|\Z)", body)
        outline = re.search(r"【题目大意】\s*([\s\S]*?)(?=\n【|\Z)", body)
        thinking = re.search(r"【解题思路】\s*([\s\S]*?)(?=\n【|\Z)", body)
        program = re.search(r"【参考程序】\s*([\s\S]*?)(?=\n\s*\d{1,2}[、.．]|\Z)", body)
        item = {
            "q": q,
            "options": opts,
            "answer": clean(ans.group(1)) if ans else "",
            "point": clean(point.group(1)) if point else "",
            "analysis": clean(analysis.group(1)) if analysis else "",
            "outline": clean(outline.group(1)) if outline else "",
            "thinking": clean(thinking.group(1)) if thinking else "",
            "program": clean(program.group(1)) if program else "",
        }
        if item["answer"] in ("正确", "√", "✓", "T"):
            item["answer"] = "对"
        elif item["answer"] in ("错误", "×", "✗", "F"):
            item["answer"] = "错"
        return item

    i1 = find_section(full, ["一、单选题", "单选题"])
    i2 = find_section(full, ["二、判断题", "判断题"])
    i3 = find_section(full, ["三、编程题", "编程题"])
    if i1 >= 0:
        seg = full[i1 : i2 if i2 > i1 else None]
        for no, body in split_blocks(seg, "【答案】"):
            result["single"].append({"no": no, **parse_block(body)})
    if i2 >= 0:
        seg = full[i2 : i3 if i3 > i2 else None]
        for no, body in split_blocks(seg, "【答案】"):
            result["judge"].append({"no": no, **parse_block(body)})
    if i3 >= 0:
        seg = full[i3:]
        for no, body in split_blocks(seg, "【参考程序】", mode="accumulated"):
            result["program"].append({"no": no, **parse_block(body)})
    # 按题型数量上限截断（页脚“联系我们”等可能被误切）
    result["single"] = result["single"][:15]
    result["judge"] = result["judge"][:10]
    result["program"] = result["program"][:2]
    return result


def merge_answer(exam, ana):
    """把解析信息合并进真题数据。"""
    for sec, n in (("single", 15), ("judge", 10), ("program", 2)):
        amap = {q["no"]: q for q in ana.get(sec, [])}
        for q in exam.get(sec, []):
            a = amap.get(q["no"])
            if a:
                q["point"] = a.get("point", "")
                q["analysis"] = a.get("analysis", "")
                if sec == "single":
                    if len(q.get("options", [])) < 4 and a.get("options"):
                        q["options"] = a["options"]
                if sec == "program":
                    q["outline"] = a.get("outline", "")
                    q["thinking"] = a.get("thinking", "")
                    q["program"] = a.get("program", "")
                if not q.get("answer"):
                    q["answer"] = a.get("answer", "")
    return exam


def batch_from_name(name):
    m = re.search(r"GESP-(\d{4})-(\d{2})-C\+\+(\d)", name)
    return m.groups() if m else None


def main():
    os.makedirs(OUT_PUB, exist_ok=True)
    os.makedirs(OUT_REL, exist_ok=True)

    exam_files = sorted(glob.glob(os.path.join(SRC, "*", "GESP-*.pdf")))
    exam_files = [f for f in exam_files if "解析" not in os.path.basename(f)]
    ana_files = sorted(glob.glob(os.path.join(SRC, "2023-解析", "GESP-*.pdf")))

    ana_index = {}
    for f in ana_files:
        g = batch_from_name(os.path.basename(f))
        if not g:
            continue
        batch = f"{g[0]}-{g[1]}"
        level = int(g[2])
        text = extract_text(f)
        ana_index.setdefault(batch, {})[level] = parse_analysis_paper(text)
        print("解析:", batch, "L" + str(level))

    batches = {}
    for f in exam_files:
        g = batch_from_name(os.path.basename(f))
        if not g:
            print("跳过（无法识别）:", os.path.basename(f))
            continue
        batch = f"{g[0]}-{g[1]}"
        level = int(g[2])
        text = extract_text(f)
        exam = parse_exam_paper(text)
        if batch in ana_index and level in ana_index[batch]:
            exam = merge_answer(exam, ana_index[batch][level])
        out = os.path.join(OUT_PUB, batch)
        os.makedirs(out, exist_ok=True)
        with open(os.path.join(out, f"level-{level}.json"), "w", encoding="utf-8") as fh:
            json.dump({"batch": batch, "level": level, **exam}, fh, ensure_ascii=False)
        b = batches.setdefault(
            batch,
            {
                "batch": batch,
                "label": f"{g[0]} 年 {int(g[1])} 月",
                "levels": [],
                "hasAnalysis": batch in ana_index,
            },
        )
        b["levels"].append(level)
        s = len(exam["single"])
        print(f"真题: {batch} L{level} 单选 {s} 判断 {len(exam['judge'])} 编程 {len(exam['program'])}")

    for b in batches.values():
        b["levels"].sort()
    batches = dict(sorted(batches.items()))
    with open(os.path.join(OUT_PUB, "index.json"), "w", encoding="utf-8") as fh:
        json.dump(list(batches.values()), fh, ensure_ascii=False, indent=2)
    print("完成。批次数:", len(batches))


if __name__ == "__main__":
    sys.exit(main())
