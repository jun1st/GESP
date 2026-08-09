#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""把题库题目按关键词匹配到课程章节，生成 web/data/papers/related/level-{n}.json。

匹配依据：解析 PDF 的【考纲知识点】 + 题干/选项文本里的课程关键词。
每课最多保留 8 道（优先带解析的、最近的批次）。
"""

import glob
import json
import os
import re
from unicodedata import normalize

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
PAPERS = os.path.join(ROOT, "web", "public", "data", "papers")
LEVELS = os.path.join(ROOT, "web", "data", "levels")
OUT = os.path.join(ROOT, "web", "data", "papers", "related")

STOP = {"第", "课", "基础", "入门", "问题", "例题", "练习"}

# 课程关键词补充：标题里没直接出现、但真题常用的说法
EXTRA_TERMS = {
    3: {
        "lv3l5": ["字符串", "string", "字符", "strlen", "substr"],
        "lv3l6": ["枚举", "穷举", "模拟", "逐个", "暴力"],
    },
    4: {
        "lv4l8": ["文件", "freopen", "读写", "异常", "try", "catch", "in.txt"],
    },
    5: {
        "lv5l1": ["数论", "整除", "约数", "因数", "公因数", "质数", "素数", "公倍数"],
        "lv5l2": ["高精度", "大数", "大整数", "超级大数"],
        "lv5l4": ["辗转相除", "欧几里得", "gcd", "最大公约数", "素数筛", "埃氏", "筛法"],
        "lv5l5": ["二分", "折半", "binary", "mid", "有序"],
    },
    6: {
        "lv6l1": ["二叉树", "节点", "结点", "叶子", "深度", "层次", "根", "前序", "中序", "后序", "遍历"],
        "lv6l2": ["哈夫曼", "二叉树", "排序树", "完全二叉"],
        "lv6l3": ["哈夫曼", "霍夫曼", "格雷", "编码"],
        "lv6l4": ["dfs", "bfs", "深度优先", "宽度优先", "广度优先", "搜索"],
        "lv6l5": ["动态规划", "dp", "状态", "转移", "爬楼梯", "背包"],
    },
    7: {
        "lv7l3": ["图", "顶点", "边", "邻接表", "邻接矩阵", "度", "连通", "遍历"],
    },
    8: {
        "lv8l1": ["计数", "加法原理", "乘法原理", "方案数", "互斥"],
        "lv8l2": ["排列", "组合", "全排列", "组合数", "排队", "选"],
        "lv8l5": ["代数", "几何", "三角形", "面积", "角度", "坐标", "方程"],
        "lv8l7": ["复杂度", "时间复杂", "空间复杂", "O(", "效率"],
        "lv8l8": ["优化", "剪枝", "预处理", "打表"],
    },
}


def nf(s):
    return normalize("NFKC", s or "")


def lesson_keywords(lesson):
    """从课程标题/标签提取关键词。"""
    title = re.sub(r"^第\s*\d+\s*课[:：]\s*", "", nf(lesson.get("title", "")))
    parts = re.split(r"[:：、，,；;·\s]+", title)
    kws = [p for p in parts if p and p not in STOP and len(p) >= 2]
    for tag in lesson.get("tags", []):
        t = nf(tag).strip()
        if t and len(t) >= 2:
            kws.append(t)
    # 补充同义词
    extra = EXTRA_TERMS.get(lesson.get("_level", 0), {}).get(lesson.get("anchor", ""), [])
    kws.extend(extra)
    # 去重，保持顺序
    return list(dict.fromkeys(kws))


def question_score(text, kws):
    t = nf(text)
    return sum(t.count(k) for k in kws if k)


def main():
    os.makedirs(OUT, exist_ok=True)
    for lv in range(0, 9):
        lpath = os.path.join(LEVELS, f"level-{lv}.json")
        if not os.path.exists(lpath):
            continue
        level = json.load(open(lpath, encoding="utf-8"))
        lessons = []
        for lesson in level["lessons"]:
            lesson = dict(lesson)
            lesson["_level"] = lv
            kws = lesson_keywords(lesson)
            lessons.append({"anchor": lesson["anchor"], "title": lesson["title"], "kws": kws, "items": []})

        # 收集本级别所有题目
        for f in sorted(glob.glob(os.path.join(PAPERS, "*", f"level-{lv}.json"))):
            d = json.load(open(f, encoding="utf-8"))
            batch = d["batch"]
            for sec, tname in (("single", "s"), ("judge", "j"), ("program", "p")):
                for q in d.get(sec, []):
                    text = " ".join(
                        [
                            q.get("point", ""),
                            q.get("title", ""),
                            q.get("text", ""),
                            q.get("thinking", ""),
                            " ".join(q.get("options", [])),
                        ]
                    )
                    scores = [(question_score(text, l["kws"]), l) for l in lessons]
                    scores.sort(key=lambda x: -x[0])
                    best_score, best = scores[0]
                    if best_score <= 0:
                        continue
                    best["items"].append(
                        {
                            "id": f"{batch}-{tname}{q['no']}",
                            "batch": batch,
                            "type": sec,
                            "no": q["no"],
                            "title": q.get("title", ""),
                            "text": q.get("text", ""),
                            "options": q.get("options", []),
                            "answer": q.get("answer", ""),
                            "point": q.get("point", ""),
                            "analysis": q.get("analysis", ""),
                            "outline": q.get("outline", ""),
                            "thinking": q.get("thinking", ""),
                            "program": q.get("program", ""),
                        }
                    )

        out_lessons = []
        for l in lessons:
            items = l["items"]
            # 优先带解析，其次最新批次；每课最多 8 道
            items.sort(key=lambda x: (-bool(x["analysis"] or x["thinking"]), x["batch"]), reverse=True)
            items = items[:8]
            if items:
                out_lessons.append({"anchor": l["anchor"], "title": l["title"], "questions": items})

        with open(os.path.join(OUT, f"level-{lv}.json"), "w", encoding="utf-8") as fh:
            json.dump({"level": lv, "lessons": out_lessons}, fh, ensure_ascii=False, indent=1)
        n_q = sum(len(l["questions"]) for l in out_lessons)
        print(f"level-{lv}: {len(out_lessons)} 课挂题，共 {n_q} 题")


if __name__ == "__main__":
    main()
