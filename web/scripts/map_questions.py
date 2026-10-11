#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""把每道真题映射到所属 Level 的一课，生成 web/data/papers/lesson-map.json。

键：  "{session}/{level}"  ->  { "single:1": "<lesson anchor>" | null, ... }
null 表示未覆盖题（该级别没有合适的 Lesson）。
复用 build_related.py 的关键词规则。
"""

import glob
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from build_related import PAPERS, LEVELS, lesson_keywords, question_score  # noqa: E402

# 放在 web/data/papers（服务端读取，不对外公开）
OUT = os.path.normpath(os.path.join(LEVELS, "..", "papers", "lesson-map.json"))


def main():
    mapping = {}
    stats = {}
    for lv in range(1, 9):
        level = json.load(open(os.path.join(LEVELS, f"level-{lv}.json"), encoding="utf-8"))
        lessons = []
        for lesson in level["lessons"]:
            lesson = dict(lesson)
            lesson["_level"] = lv
            lessons.append({"anchor": lesson["anchor"], "kws": lesson_keywords(lesson)})

        total = uncovered = 0
        for f in sorted(glob.glob(os.path.join(PAPERS, "*", f"level-{lv}.json"))):
            d = json.load(open(f, encoding="utf-8"))
            entry = {}
            for sec in ("single", "judge", "program"):
                for q in d.get(sec, []):
                    text = " ".join([q.get("point", ""), q.get("title", ""), q.get("text", ""),
                                     q.get("thinking", ""), " ".join(q.get("options", []))])
                    best, best_score = None, 0
                    for l in lessons:
                        s = question_score(text, l["kws"])
                        if s > best_score:
                            best, best_score = l["anchor"], s
                    entry[f"{sec}:{q['no']}"] = best
                    total += 1
                    uncovered += best is None
            mapping[f"{d['batch']}/{lv}"] = entry
        stats[lv] = (total, uncovered)

    with open(OUT, "w", encoding="utf-8") as fh:
        json.dump(mapping, fh, ensure_ascii=False)
    for lv, (t, u) in stats.items():
        print(f"level-{lv}: {t} 题，未覆盖 {u}（{u * 100 // max(t, 1)}%）")


if __name__ == "__main__":
    main()
