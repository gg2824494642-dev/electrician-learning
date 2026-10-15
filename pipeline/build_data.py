# -*- coding: utf-8 -*-
"""把 data/*.json 打包成页面直接加载的 data/*.js（跨平台，相对路径）。

用法（在仓库根目录执行）：
    python pipeline/build_data.py

规则：data/<name>.json  →  data/<name>.js  内容形如
    window.APP_DATA = window.APP_DATA || {};
    window.APP_DATA.<name> = {...};
"""
import json
import os
import sys

sys.stdout.reconfigure(encoding="utf-8", errors="replace")

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "data")

# 需要打包的 JSON（文件名即 key）；detail-lessons 会合并进 lessons
NAMES = ["courses", "questions", "plan", "docs", "news", "knowledge", "upmasters", "videos"]

WRAP = "window.APP_DATA = window.APP_DATA || {{}};\nwindow.APP_DATA.{key} = {payload};\n"


def load(path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def emit(name, obj):
    out = os.path.join(DATA, name + ".js")
    payload = json.dumps(obj, ensure_ascii=False, separators=(",", ":"))
    with open(out, "w", encoding="utf-8") as f:
        f.write(WRAP.format(key=name, payload=payload))
    print(f"  data/{name}.js   <- data/{name}.json   ({len(payload)/1024:.1f} KB)")


def main():
    ok = 0
    for name in NAMES:
        src = os.path.join(DATA, name + ".json")
        if os.path.exists(src):
            emit(name, load(src))
            ok += 1
        else:
            print(f"  (跳过 {name}.json：不存在)")

    # 精讲讲义合并
    det = os.path.join(DATA, "detail-lessons")
    lessons = []
    if os.path.isdir(det):
        for fn in sorted(os.listdir(det)):
            if fn.endswith(".json"):
                d = load(os.path.join(det, fn))
                lessons.extend(d if isinstance(d, list) else [d])
    emit("lessons", {"lessons": lessons})
    print(f"  （精讲讲义 {len(lessons)} 篇）")

    print(f"\n完成：{ok} 项 JSON 已打包。刷新浏览器即可看到新内容。")


if __name__ == "__main__":
    main()
