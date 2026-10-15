# -*- coding: utf-8 -*-
"""在本仓库内把当前目录部署到 GitHub Pages（REST API，不需要本地 git）。

适用于「以后想更新网站」的场景：
    1) 改完 data/*.json 后先跑  python pipeline/build_data.py
    2) 再跑                    python pipeline/deploy_github.py

token 读取顺序：环境变量 GH_TOKEN → 当前目录/.gh_token → 上一级目录/.gh_token
"""
import argparse
import base64
import json
import os
import sys
import time
import urllib.error
import urllib.request

sys.stdout.reconfigure(encoding="utf-8", errors="replace")
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
API = "https://api.github.com"
DEFAULT_REPO = "electrician-learning"


def find_token():
    if os.environ.get("GH_TOKEN"):
        return os.environ["GH_TOKEN"].strip()
    for p in (os.path.join(ROOT, ".gh_token"), os.path.join(os.path.dirname(ROOT), ".gh_token"),
              os.path.join(ROOT, "token.gh_token"), os.path.join(os.path.dirname(ROOT), "token.gh_token")):
        if os.path.exists(p):
            t = open(p, encoding="utf-8", errors="replace").read().strip().splitlines()
            if t and len(t[0]) > 20:
                print(f"· 使用 token 文件：{os.path.basename(p)}")
                return t[0].strip()
    raise SystemExit("未找到 token：请设置环境变量 GH_TOKEN，或把 token 写入 .gh_token 文件")


def api(path, method="GET", body=None, tok=None, raw=False, timeout=60):
    url = path if path.startswith("http") else API + path
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(url, data=data, method=method)
    req.add_header("User-Agent", "electrician-learning-deploy")
    req.add_header("Accept", "application/vnd.github+json")
    if tok:
        req.add_header("Authorization", "Bearer " + tok)
    if data:
        req.add_header("Content-Type", "application/json")
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            payload = r.read()
            return r.status, (payload if raw else (json.loads(payload) if payload else {}))
    except urllib.error.HTTPError as e:
        return e.code, {"error": e.read().decode("utf-8", "replace")[:400]}
    except Exception as e:
        return 0, {"error": f"{type(e).__name__}: {e}"}


def files():
    out = []
    for r, dirs, fs in os.walk(ROOT):
        dirs[:] = [d for d in dirs if d not in (".git", "node_modules", "__pycache__")]
        for f in fs:
            full = os.path.join(r, f)
            rel = os.path.relpath(full, ROOT).replace("\\", "/")
            if rel.startswith(".") and rel != ".nojekyll":
                continue
            if rel.endswith((".tmp", ".pyc")):
                continue
            out.append((rel, full))
    return sorted(out)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--repo", default=DEFAULT_REPO)
    ap.add_argument("--message", default="update: 更新站点内容")
    args = ap.parse_args()

    tok = find_token()
    st, me = api("/user", tok=tok)
    if st != 200:
        raise SystemExit(f"token 无效（HTTP {st}）：{me.get('error','')[:200]}")
    login = me["login"]
    print(f"✓ 账号：{login}")

    st, info = api(f"/repos/{login}/{args.repo}", tok=tok)
    if st != 200:
        raise SystemExit(f"仓库不存在：{login}/{args.repo}（请先创建）")
    branch = info.get("default_branch") or "main"

    fs = files()
    print(f"→ 上传 {len(fs)} 个文件…")
    tree = []
    for i, (rel, full) in enumerate(fs, 1):
        st, blob = api(f"/repos/{login}/{args.repo}/git/blobs", "POST",
                       {"content": base64.b64encode(open(full, "rb").read()).decode(), "encoding": "base64"}, tok)
        if st not in (200, 201):
            raise SystemExit(f"上传 {rel} 失败：{blob.get('error','')[:200]}")
        tree.append({"path": rel, "mode": "100644", "type": "blob", "sha": blob["sha"]})
        if i % 20 == 0 or i == len(fs):
            print(f"   {i}/{len(fs)}")

    st, newtree = api(f"/repos/{login}/{args.repo}/git/trees", "POST", {"tree": tree}, tok)
    if st not in (200, 201):
        raise SystemExit(f"建树失败：{newtree.get('error','')[:200]}")
    st, ref = api(f"/repos/{login}/{args.repo}/git/ref/heads/{branch}", tok=tok)
    parents = [ref["object"]["sha"]] if st == 200 else []
    st, commit = api(f"/repos/{login}/{args.repo}/git/commits", "POST",
                     {"message": args.message, "tree": newtree["sha"], "parents": parents}, tok)
    if st not in (200, 201):
        raise SystemExit(f"提交失败：{commit.get('error','')[:200]}")
    api(f"/repos/{login}/{args.repo}/git/refs/heads/{branch}", "PATCH", {"sha": commit["sha"]}, tok)
    print("✓ 已提交并推送")

    url = f"https://{login}.github.io/{args.repo}/"
    print(f"→ 等待 Pages 构建：{url}")
    for i in range(30):
        time.sleep(8)
        st, html = api(url, raw=True, timeout=30)
        if st == 200 and b"\xe7\x94\xb5\xe5\xb7\xa5\xe5\xad\xa6\xe5\xa0\x82" in html:
            print(f"✓ 更新已生效：{url}")
            return
        print(f"   …{(i+1)*8}s（HTTP {st}）")
    print(f"! 请稍后手动确认：{url}")


if __name__ == "__main__":
    main()
