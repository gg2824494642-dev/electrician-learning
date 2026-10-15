# 电工学堂 · E-LEARN

纯公益、全站免费的电工学习网站。**在线访问：** https://gg2824494642-dev.github.io/electrician-learning/

- 12 门课程 / 50 节图文讲义（含 1 篇配图精讲）
- 293 道题（判断 / 单选 / 多选，全部附解析）
- 70 天学习计划（可打卡）
- 实操四科目 · 24 张图解卡
- 41 条逐条核实过的视频链接（点开即播）
- 48 张「实物组件 + 标注框」图解卡
- 行业资讯（可从官方渠道一键更新）

---

## 目录结构

```
.
├─ index.html            首页
├─ courses.html          课程中心
├─ course.html           课程详情        ?id=<课程ID>
├─ lesson.html           图文讲义        ?c=<课程ID>&l=<课时ID>
├─ quiz.html             题库系统
├─ practice.html         练习 / 模拟考试  ?mode=chapter|random|exam|wrong|fav
├─ result.html           考试结果        ?id=<记录ID>
├─ wrong.html            错题本与收藏     ?tab=wrong|fav
├─ hands-on.html         实操专区        ?sub=0..3 只看某一科目
├─ knowledge.html        通俗知识库      ?id=<条目ID>
├─ cert.html             低压电工证专区
├─ plan.html             70 天学习计划
├─ docs.html             资料下载
├─ news.html             行业资讯        ?id=<资讯ID>
├─ search.html           站内搜索        ?q=<关键词>
├─ assets/
│  ├─ css/site.css       全站样式（含图解卡样式）
│  ├─ js/core.js         数据索引、导航/页脚、本地存储
│  ├─ js/quiz.js         答题引擎（判分 / 计时 / 答题卡）
│  ├─ js/pages.js        各页面渲染
│  └─ source/            5 份源资料（可直接打开、打印）
├─ data/
│  ├─ *.json             内容源数据（课程 / 题库 / 计划 / 资料 / 资讯 / 知识库 / 视频 / 名师）
│  ├─ *.js               由 JSON 打包而成，页面直接加载（**改完 JSON 必须同步**）
│  ├─ detail-lessons/    精讲讲义（含手绘 SVG 配图）
│  └─ figures.js         48 张图解卡（HTML 片段，可直接改）
└─ pipeline/build_data.py  JSON → JS 打包脚本（跨平台）
```

## 本地预览

直接双击 `index.html` 即可（Chrome / Edge）。也可以起一个本地服务器：

```bash
python -m http.server 8080      # 然后访问 http://localhost:8080
```

## 怎么改内容（给未来的你 / 其他 AI 工具）

页面读的是 `data/*.js`，而它是从 `data/*.json` 打包出来的，所以标准流程是：

```bash
# 1) 改 data/*.json（加课程、加题、改计划……）
# 2) 重新打包
python pipeline/build_data.py
# 3) 刷新浏览器
```

| 想改什么 | 改哪里 |
|---|---|
| 加课程 / 课时 / 讲义正文 | `data/courses.json` → `courses[].chapters[].lessons[].content`（支持 `h2 / p / ul / table / note / tip / warn / example`） |
| 加精讲讲义 | `data/detail-lessons/*.json`（额外支持 `svg` 内容块） |
| 加题目 | `data/questions.json` |
| 改 70 天计划 | `data/plan.json` → `weeks[].days[]` |
| 改通俗知识库 | `data/knowledge.json` |
| 换图解卡 | `data/figures.js` 里按 key 存放的 HTML 片段：`cover:<课程ID>` / `know:<条目ID>` / `lab:<科目>[:<要点>]` |
| 改配色与版式 | `assets/css/site.css` |
| 改交互逻辑 | `assets/js/core.js`（数据与本地存储）、`assets/js/quiz.js`（答题引擎）、`assets/js/pages.js`（页面渲染） |

> 图解卡 = HTML 片段 + 内联 SVG，文字全部是矢量文字，改文案不会破坏图形。
> 更详细的说明（内容来源、去重规则、验收方式）见 [README-详细说明.md](README-详细说明.md)。

## 内容来源

| 来源 | 用在哪 |
|---|---|
| 低压电工一站式学习手册 | 课程讲义正文、例题、口诀 |
| 低压电工每日学习表 | 70 天计划、考试信息与费用 |
| 五套练习卷（含答案解析） | 题库主体 |
| 公开视频平台 | 41 条已核实视频链接（逐个验证可播放且主题一致） |
| 应急管理部 / 各省应急管理厅等官方渠道 | 行业资讯 |

## 部署（GitHub Pages）

仓库根目录就是站点根目录，Pages 选择 `main` 分支 `/ (root)` 即可。
若改了 `data/*.json`，记得先跑 `python pipeline/build_data.py` 再提交，否则页面读到的还是旧的 `data/*.js`。

## 以后怎么更新网站

```bash
# 改完内容后
python pipeline/build_data.py        # JSON -> JS
python pipeline/deploy_github.py     # 提交并等待 Pages 生效（需要 GH_TOKEN 或 .gh_token）
```n
## 免责声明

本站为个人学习整理的公益站点，**非官方站点**。考试政策、报名时间、费用与考核标准请以当地应急管理部门、
培训机构与考核机构的最新公布为准。题库按官方考试大纲的知识点范围整理，**不等同于、也无法代替官方考题**。
实操内容仅作学习参考，实际作业必须断电、验电并在持证人员指导下进行。
