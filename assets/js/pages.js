/* =============================================================
   电工学堂 · 页面渲染（v3 风格：卡片式仪表盘）
   ============================================================= */
const Pages = (function () {
  const M = () => document.getElementById('main');
  const E = App.esc, S = s => (s == null ? '' : String(s));
  const bl = App.blocks;

  /* ---------------- 今日学习（首页仪表盘 · v3 风格） ---------------- */
  function home() {
    App.mount('home');
    const cs = App.courses(), qn = App.questions().length;
    const lessons = App.lessonCount();
    const plan = App.D.plan || {};
    const doneN = App.progress.count();
    const totalLessons = lessons;
    const pct = totalLessons ? Math.round(doneN / totalLessons * 100) : 0;
    const wrongN = App.wrong.ids().length;
    const exams = App.exams.all();
    const last = exams[0];
    const planDoneN = App.planDone.count();
    const planWeeks = (plan.weeks || []).length;
    const planTotalDays = (plan.weeks || []).reduce((n, w) => n + (w.days || []).length, 0);

    // 找最近学过的课
    const prog = App.progress.all();
    const sortedIds = Object.keys(prog).sort((a, b) => prog[b] - prog[a]);
    let continueLesson = null;
    for (const lid of sortedIds) {
      const hit = App.allLessons().find(x => x.lesson.id === lid);
      if (hit) { continueLesson = hit; break; }
    }
    if (!continueLesson) continueLesson = App.allLessons()[0];

    // 推荐课程（前 3 门未学的）
    const notStarted = cs.filter(c => {
      const ls = (c.chapters || []).flatMap(ch => ch.lessons || []);
      return !ls.some(l => App.progress.done(l.id));
    }).slice(0, 3);

    const today = new Date();
    const weekDays = ['周日','周一','周二','周三','周四','周五','周六'];
    const dateStr = `${weekDays[today.getDay()]} · 第 ${Math.min(planDoneN + 1, 70)}/70 天`;

    M().innerHTML = `
    <!-- Hero 区 -->
    <div class="hero">
      <div class="h-sub">公益免费 · 从零基础到持证上岗</div>
      <h2>今天：继续你的电工备考之路</h2>
      <div class="h-date">${dateStr} · 建议每天 60~90 分钟</div>
      <div class="hero-stats">
        <div onclick="location.href='courses.html'"><b>${cs.length}</b><span>系统课程</span></div>
        <div onclick="location.href='courses.html'"><b>${lessons}+</b><span>图文讲义</span></div>
        <div onclick="location.href='quiz.html'"><b>${qn}+</b><span>合并题库</span></div>
        <div><b>0元</b><span>全站免费</span></div>
      </div>
    </div>

    <!-- 今日任务 -->
    <div class="card">
      <h3>今日任务（3 项）<span class="more" onclick="location.href='plan.html'">查看完整 70 天计划 →</span></h3>
      <div class="task-item">
        <div class="task-check done"></div>
        <div class="task-main">
          <div class="task-t">看课：上次学习的课程内容</div>
          <div class="task-d">图文讲义 + B站辅助视频 · 对应课程章节</div>
        </div>
        <span class="task-tag done">已完成</span>
      </div>
      <div class="task-item" onclick="location.href='lab.html'">
        <div class="task-check"></div>
        <div class="task-main">
          <div class="task-t">实操：接线练习闯关</div>
          <div class="task-d">仿真画布接线，提交后自动校验评分</div>
        </div>
        <span class="task-tag doing">进行中</span>
      </div>
      <div class="task-item" onclick="location.href='practice.html?mode=random&n=10'">
        <div class="task-check"></div>
        <div class="task-main">
          <div class="task-t">刷题：今日 10 题练习</div>
          <div class="task-d">错题自动收入错题本 · 当前阶段重点</div>
        </div>
        <span class="task-tag">待完成</span>
      </div>
    </div>

    <!-- 快捷入口 -->
    <div class="card">
      <h3>快捷入口</h3>
      <div class="quick-grid">
        <div class="quick" onclick="location.href='courses.html'">
          <div class="q-ico" style="background:var(--blue)">▶</div>
          <div class="q-name">继续看课</div>
          <div class="q-desc">上次断点</div>
        </div>
        <div class="quick" onclick="location.href='lab.html'">
          <div class="q-ico" style="background:var(--green)">⚡</div>
          <div class="q-name">开始接线</div>
          <div class="q-desc">仿真画布</div>
        </div>
        <div class="quick" onclick="location.href='practice.html?mode=exam'">
          <div class="q-ico" style="background:var(--purple)">📝</div>
          <div class="q-name">模拟考试</div>
          <div class="q-desc">40题/60分</div>
        </div>
        <div class="quick" onclick="location.href='wrong.html'">
          <div class="q-ico" style="background:var(--red)">✗</div>
          <div class="q-name">错题本</div>
          <div class="q-desc">${wrongN} 道待攻克</div>
        </div>
        <div class="quick" onclick="location.href='docs.html'">
          <div class="q-ico" style="background:#5A6B7E">📄</div>
          <div class="q-name">资料下载</div>
          <div class="q-desc">手册/练习卷</div>
        </div>
        <div class="quick" onclick="location.href='cert.html'">
          <div class="q-ico" style="background:var(--cyan)">📋</div>
          <div class="q-name">考证专区</div>
          <div class="q-desc">报考指南</div>
        </div>
        <div class="quick" onclick="location.href='knowledge.html'">
          <div class="q-ico" style="background:var(--orange)">💡</div>
          <div class="q-name">知识库</div>
          <div class="q-desc">通俗解释</div>
        </div>
        <div class="quick" onclick="location.href='news.html'">
          <div class="q-ico" style="background:#F57C00">📰</div>
          <div class="q-name">政策资讯</div>
          <div class="q-desc">法规更新</div>
        </div>
      </div>
    </div>

    <!-- 双栏：学习路径 + 实操进度 -->
    <div class="two-col">
      <div class="card">
        <h3>学习路径：5 阶段 <span class="more">第 3 阶段「安全」进行中</span></h3>
        <div class="path">
          <div class="path-step done">
            <div class="dot">1</div>
            <div class="pn">入门</div>
            <div class="pd">已完成</div>
          </div>
          <div class="path-step done">
            <div class="dot">2</div>
            <div class="pn">基础</div>
            <div class="pd">已完成</div>
          </div>
          <div class="path-step now">
            <div class="dot">3</div>
            <div class="pn">安全</div>
            <div class="pd">进行中</div>
          </div>
          <div class="path-step">
            <div class="dot">4</div>
            <div class="pn">设备</div>
            <div class="pd">未开始</div>
          </div>
          <div class="path-step">
            <div class="dot">5</div>
            <div class="pn">考证</div>
            <div class="pd">未开始</div>
          </div>
        </div>
      </div>
      <div class="card">
        <h3>学习进度</h3>
        <div class="course-row">
          <div class="cr-main">
            <div class="cr-t" style="font-size:12.5px">全站课程进度</div>
            <div class="bar"><i style="width:${pct}%"></i></div>
          </div>
          <span class="task-tag">${pct}%</span>
        </div>
        <div class="course-row">
          <div class="cr-main">
            <div class="cr-t" style="font-size:12.5px">70 天计划打卡</div>
            <div class="bar green"><i style="width:${planTotalDays ? Math.round(planDoneN / planTotalDays * 100) : 0}%"></i></div>
          </div>
          <span class="task-tag">${planDoneN}/${planTotalDays}天</span>
        </div>
        <div class="course-row">
          <div class="cr-main">
            <div class="cr-t" style="font-size:12.5px">错题本待复习</div>
            <div class="bar orange"><i style="width:${Math.min(wrongN * 2, 100)}%"></i></div>
          </div>
          <span class="task-tag">${wrongN} 道</span>
        </div>
      </div>
    </div>

    <!-- 继续学习 -->
    <div class="card">
      <h3>继续学习：推荐课程 <span class="more" onclick="location.href='courses.html'">进入课程中心 →</span></h3>
      ${notStarted.map(c => {
        const lessons = (c.chapters || []).reduce((n, ch) => n + (ch.lessons || []).length, 0);
        return `<div class="course-row" onclick="location.href='course.html?id=${encodeURIComponent(c.id)}'">
          <div class="cr-ico" style="background:#E8F0FE;color:var(--blue)">📚</div>
          <div class="cr-main">
            <div class="cr-t">${E(c.title)}</div>
            <div class="cr-d">${lessons}节 · ${c.minutes || '—'}分钟 · ${E((c.summary || '').slice(0, 30))}</div>
          </div>
          <div class="cr-meta"><b>未开始</b>未开始</div>
        </div>`;
      }).join('') || cs.slice(0, 3).map(c => {
        const lessons = (c.chapters || []).reduce((n, ch) => n + (ch.lessons || []).length, 0);
        return `<div class="course-row" onclick="location.href='course.html?id=${encodeURIComponent(c.id)}'">
          <div class="cr-ico" style="background:#E8F0FE;color:var(--blue)">📚</div>
          <div class="cr-main">
            <div class="cr-t">${E(c.title)}</div>
            <div class="cr-d">${lessons}节 · ${c.minutes || '—'}分钟</div>
          </div>
          <div class="cr-meta"><b>查看</b>进入课程</div>
        </div>`;
      }).join('')}
    </div>`;
  }

  function courseCard(c) {
    const lessons = (c.chapters || []).reduce((n, ch) => n + (ch.lessons || []).length, 0);
    const done = (c.chapters || []).reduce((n, ch) => n + (ch.lessons || []).filter(l => App.progress.done(l.id)).length, 0);
    return `<a class="card" href="course.html?id=${encodeURIComponent(c.id)}" style="display:block;margin-bottom:14px">
      <div style="display:flex;align-items:center;gap:12px">
        <div class="cr-ico" style="background:#E8F0FE;color:var(--blue);width:44px;height:44px;font-size:18px">📚</div>
        <div style="flex:1;min-width:0">
          <div style="font-size:14px;font-weight:700">${E(c.title)}</div>
          <div style="font-size:12px;color:var(--muted);margin-top:3px">${lessons} 节 · ${c.minutes || '—'} 分钟</div>
        </div>
        <div style="text-align:right;flex:none">
          <div style="font-size:13px;font-weight:700">${done}/${lessons}</div>
          <div style="font-size:11px;color:var(--muted)">${done ? '进行中' : '未开始'}</div>
        </div>
      </div>
      <div class="bar" style="margin-top:10px"><i style="width:${lessons ? Math.round(done / lessons * 100) : 0}%"></i></div>
    </a>`;
  }

  /* ---------------- 课程中心 ---------------- */
  function courses() {
    App.mount('course');
    const cs = App.courses();
    M().innerHTML = `
    <div class="pagehead">
      <h1>课程学习</h1>
      <p>共 ${cs.length} 门课 · ${App.lessonCount()} 节图文讲义，全部免费开放</p>
    </div>
    <div class="seg">
      <button class="on">系统课程</button>
      <button>元件百科（196）</button>
    </div>
    ${cs.map(courseCard).join('') || '<div class="card empty">课程数据加载中…</div>'}`;
  }

  /* ---------------- 课程详情 ---------------- */
  function course() {
    const c = App.courseById(App.q('id')) || App.courses()[0];
    if (!c) { M().innerHTML = '<div class="card empty">课程不存在</div>'; return; }
    App.mount('course');
    const lessons = (c.chapters || []).flatMap(ch => ch.lessons || []);
    const done = lessons.filter(l => App.progress.done(l.id)).length;
    M().innerHTML = `
    <div class="pagehead">
      <div class="breadcrumb"><a href="index.html">今日学习</a> / <a href="courses.html">课程学习</a> / ${E(c.title)}</div>
      <h1>${E(c.title)}</h1>
      <p>${E(c.subtitle || '')}</p>
    </div>
    <div class="card">
      <div style="display:flex;gap:20px;flex-wrap:wrap;align-items:center">
        <div style="flex:1;min-width:200px">
          <div style="font-size:13px;color:var(--muted);margin-bottom:8px">学习进度</div>
          <div class="bar" style="height:10px"><i style="width:${lessons.length ? (done / lessons.length * 100) : 0}%"></i></div>
          <div style="font-size:12.5px;color:var(--muted);margin-top:8px">已学 ${done} / ${lessons.length} 节</div>
        </div>
        <div style="display:flex;gap:10px;flex-wrap:wrap">
          <a class="btn p" href="lesson.html?c=${encodeURIComponent(c.id)}&l=${encodeURIComponent((lessons[0] || {}).id || '')}">开始学习</a>
          <a class="btn o" href="practice.html?mode=chapter&course=${encodeURIComponent(c.id)}">配套练习</a>
        </div>
      </div>
    </div>
    ${c.objectives && c.objectives.length ? `<div class="card"><h3>学完这门课你能</h3>
      <ul style="padding-left:20px;line-height:2">${c.objectives.map(o => `<li>${E(o)}</li>`).join('')}</ul></div>` : ''}
    <div class="card">
      <h3>课程大纲</h3>
      ${(c.chapters || []).map((ch, ci) => `
        <div style="margin-bottom:16px">
          <div style="font-weight:700;font-size:13.5px;margin-bottom:8px;color:var(--blue)">第 ${ci + 1} 章 · ${E(ch.title)}</div>
          ${(ch.lessons || []).map((l, li) => `
            <a href="lesson.html?c=${encodeURIComponent(c.id)}&l=${encodeURIComponent(l.id)}" 
               style="display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid #F0F2F5;font-size:13px">
              <span style="color:var(--muted);width:24px">${String(li + 1).padStart(2, '0')}</span>
              <span style="flex:1">${E(l.title)}${App.detailedFor(c, l) ? ' <span class="pill">精讲</span>' : ''}</span>
              <span style="color:var(--muted);font-size:11.5px">${l.minutes || 15} 分钟</span>
              ${App.progress.done(l.id) ? '<span style="color:var(--green);font-weight:700">✓</span>' : ''}
            </a>`).join('')}
        </div>`).join('')}
    </div>`;
  }

  /* ---------------- 学习页（讲义） ---------------- */
  function lesson() {
    const cid = App.q('c'), lid = App.q('l');
    let hit = App.lessonById(cid, lid);
    if (!hit) { const all = App.allLessons(); hit = all[0]; }
    if (!hit) { M().innerHTML = '<div class="card empty">讲义数据加载中…</div>'; return; }
    App.mount('course');
    const { course, chapter, lesson } = hit;
    const flat = App.allLessons();
    const idx = flat.findIndex(x => x.lesson.id === lesson.id);
    const prev = flat[idx - 1], next = flat[idx + 1];
    const detail = App.detailedFor(course, lesson);
    const content = (detail && detail.content && detail.content.length ? detail.content : lesson.content) || [];
    const kps = (detail && detail.keyPoints) || lesson.key_points || [];
    const tips = (detail && detail.examTips) || lesson.exam_tips || [];
    const done = App.progress.done(lesson.id);
    M().innerHTML = `
    <div class="pagehead">
      <div class="breadcrumb"><a href="index.html">今日学习</a> / <a href="courses.html">课程学习</a> /
        <a href="course.html?id=${encodeURIComponent(course.id)}">${E(course.title)}</a> / ${E(lesson.title)}</div>
      <h1>${E(lesson.title)}</h1>
      <div style="display:flex;gap:8px;align-items:center;margin-top:10px;flex-wrap:wrap">
        <span class="pill">${E(chapter.title)}</span>
        ${detail ? '<span class="pill y">精讲 · 配图</span>' : ''}
        <span class="mut small">${lesson.minutes || 15} 分钟</span>
        <button class="btn s ${done ? 'o' : 'p'}" id="markDone" style="margin-left:auto">${done ? '✓ 已完成' : '标记为已学完'}</button>
      </div>
    </div>
    <div class="card" style="padding:24px">
      ${lesson.summary ? `<p class="mut" style="margin-bottom:16px">${E(lesson.summary)}</p>` : ''}
      ${detail && detail.intro ? `<div class="callout note" style="margin-bottom:16px"><span class="lb">先看这一句</span>${E(detail.intro)}</div>` : ''}
      ${bl(content)}
      ${kps.length ? `<div class="callout note" style="margin-top:20px"><span class="lb">本节必须记住</span>
        <ul style="padding-left:18px;margin-top:6px">${kps.map(k => `<li>${E(k)}</li>`).join('')}</ul></div>` : ''}
      ${tips.length ? `<div class="callout tip" style="margin-top:16px"><span class="lb">考点与易错点</span>${tips.map(t => E(t)).join('<br>')}</div>` : ''}
    </div>

    <div class="card">
      <h3>配套视频（链接已逐条核实）</h3>
      ${(App.videosFor(lesson.title + ' ' + (chapter.title || ''), 3).length
        ? App.videosFor(lesson.title + ' ' + (chapter.title || ''), 3)
        : App.videosFor((course.title || '') + ' ' + (chapter.title || ''), 3)).map(App.videoLink).join('')
        || '<p class="mut small">这一节暂无匹配视频，可先看讲义与配套题目。</p>'}
    </div>

    <div class="card">
      <h3>我的笔记 <span class="more">只保存在本机浏览器里</span></h3>
      <textarea id="noteBox" placeholder="边看边记：把容易忘的数字、口诀写在这里…"
        style="width:100%;min-height:80px;border:1px solid var(--line);border-radius:8px;
        padding:10px;font:inherit;font-size:13.5px;outline:none;resize:vertical">${E(App.notes.get(lesson.id))}</textarea>
      <button class="btn s p" style="margin-top:10px" id="saveNote">保存笔记</button>
    </div>

    <div style="display:flex;gap:10px;margin-top:16px;flex-wrap:wrap">
      ${prev ? `<a class="btn o" href="lesson.html?c=${encodeURIComponent(prev.course.id)}&l=${encodeURIComponent(prev.lesson.id)}">← 上一课</a>` : ''}
      ${next ? `<a class="btn p" style="margin-left:auto" href="lesson.html?c=${encodeURIComponent(next.course.id)}&l=${encodeURIComponent(next.lesson.id)}">下一课 →</a>` : ''}
    </div>`;
    document.getElementById('markDone').onclick = () => {
      const on = App.progress.toggle(lesson.id);
      App.toast(on ? '已标记为学完' : '已取消完成标记');
      lesson();
    };
    document.getElementById('saveNote').onclick = () => {
      App.notes.set(lesson.id, document.getElementById('noteBox').value);
      App.toast('笔记已保存在本机');
    };
  }

  /* ---------------- 题库首页 ---------------- */
  function bank() {
    App.mount('quiz');
    const qs = App.questions();
    const byChapter = {};
    qs.forEach(x => { const k = x.chapter || '未分类'; byChapter[k] = (byChapter[k] || 0) + 1; });
    const types = { single: 0, multi: 0, judge: 0 };
    qs.forEach(x => types[x.type] = (types[x.type] || 0) + 1);
    const wrongN = App.wrong.ids().length, favN = Object.keys(App.fav.all()).length;
    const exams = App.exams.all();
    const last = exams[0];
    M().innerHTML = `
    <div class="pagehead">
      <h1>考试刷题</h1>
      <p>共 ${qs.length} 道题（判断 ${types.judge || 0} · 单选 ${types.single || 0} · 多选 ${types.multi || 0}），全部免费、附解析</p>
    </div>
    <div class="callout note"><span class="lb">题库说明</span>
      本站题目按官方低压电工考试大纲的知识点范围整理，题型对齐官方理论机考（判断题 + 单选题），
      用于日常练习与自测；<b>官方题库不对外公开，本站题目不等同于、也无法代替真实考题</b>。</div>

    <div class="two-col">
      <div class="card">
        <h3>刷题模式</h3>
        <div class="quick-grid" style="grid-template-columns:repeat(2,1fr)">
          <div class="quick" onclick="location.href='practice.html?mode=random&n=20'">
            <div class="q-ico" style="background:var(--blue)">🎲</div>
            <div class="q-name">随机快刷</div>
            <div class="q-desc">20 题/组</div>
          </div>
          <div class="quick" onclick="location.href='practice.html?mode=exam'">
            <div class="q-ico" style="background:var(--purple)">📝</div>
            <div class="q-name">模拟考试</div>
            <div class="q-desc">40题/60分</div>
          </div>
          <div class="quick" onclick="location.href='wrong.html'">
            <div class="q-ico" style="background:var(--red)">✗</div>
            <div class="q-name">错题重练</div>
            <div class="q-desc">${wrongN} 道错题</div>
          </div>
          <div class="quick" onclick="location.href='wrong.html?tab=fav'">
            <div class="q-ico" style="background:var(--yellow)">★</div>
            <div class="q-name">收藏重做</div>
            <div class="q-desc">${favN} 道收藏</div>
          </div>
        </div>
      </div>
      <div class="card">
        <h3>我的刷题数据</h3>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:10px">
          <div class="stat"><b>${wrongN}</b><span>错题本</span></div>
          <div class="stat"><b>${favN}</b><span>收藏题</span></div>
          <div class="stat"><b>${exams.length}</b><span>模拟考次数</span></div>
          <div class="stat"><b>${last ? last.score : '—'}</b><span>上次得分</span></div>
        </div>
        ${last ? `<div style="margin-top:14px;padding-top:14px;border-top:1px solid var(--line);font-size:13px">
          上次模拟考：<b class="blue">${last.score} 分</b>
          <a class="blue" href="result.html?id=${last.id}" style="margin-left:10px">查看报告 →</a></div>` : ''}
      </div>
    </div>

    <div class="card">
      <h3>按模块练习</h3>
      ${Object.entries(byChapter).sort((a, b) => b[1] - a[1]).map(([ch, n]) => `
        <div class="course-row" onclick="location.href='practice.html?mode=chapter&chapter=${encodeURIComponent(ch)}'">
          <div class="cr-ico" style="background:var(--blueT);color:var(--blue);width:36px;height:36px;font-size:14px">📚</div>
          <div class="cr-main">
            <div class="cr-t">${E(ch)}</div>
            <div class="cr-d">按模块顺序练习，做完立即看解析</div>
          </div>
          <div class="cr-meta"><b>${n}</b>道题</div>
        </div>`).join('')}
    </div>`;
  }

  /* ---------------- 练习 / 考试 ---------------- */
  function mapCourseChapter(c) {
    const t = (c.title || '') + (c.subtitle || '') + (c.summary || '');
    const rules = [
      [/急救|消防|触电/, '应急急救处置'],
      [/法规|规程|制度|安全生产法/, '安全生产法规'],
      [/仪表|万用表|兆欧表|钳形|电能表/, '低压设备'],
      [/电机|控制|照明|线路|导线|配线|配电|插座/, '电机控制与线路照明'],
      [/低压电器|熔断|接触器|继电器|断路器|刀开关|开关/, '低压设备'],
      [/安全用电|用具|标识|接地|接零|漏电|防触电/, '电气安全技术'],
      [/基础|电流|电压|电阻|串并联|交流|三相|电容|电感|欧姆/, '电工基础']
    ];
    for (const [re, ch] of rules) if (re.test(t)) return ch;
    return '电工基础';
  }

  function practice() {
    App.mount('quiz');
    const mode = App.q('mode') || 'random';
    const qs = App.questions();
    let list = [], title = '', badge = '练习', exam = false, minutes = 60;
    if (mode === 'chapter') {
      const ch = App.q('chapter'), cid = App.q('course');
      if (ch) { list = qs.filter(x => (x.chapter || '') === ch); title = ch; }
      else if (cid) {
        const c = App.courseById(cid);
        const mapped = mapCourseChapter(c || {});
        list = qs.filter(x => (x.chapter || '') === mapped);
        title = (c ? c.title : '课程练习') + ' · ' + mapped;
      }
      if (!list.length) list = qs.slice(0, 20);
    } else if (mode === 'wrong') {
      list = App.wrong.ids().map(App.questionById).filter(Boolean); title = '错题重练'; badge = '错题本';
    } else if (mode === 'fav') {
      list = Object.keys(App.fav.all()).map(App.questionById).filter(Boolean); title = '收藏题重做'; badge = '收藏题';
    } else if (mode === 'exam') {
      const n = +(App.q('n') || 40);
      list = shuffle(qs.slice()).slice(0, n); title = '低压电工 · 模拟考试'; badge = '模拟考试'; exam = true; minutes = +(App.q('min') || 60);
    } else {
      const n = +(App.q('n') || 20);
      list = shuffle(qs.slice()).slice(0, n); title = '随机刷题'; badge = '随机练习';
    }
    M().innerHTML = `
    <div class="pagehead">
      <div class="breadcrumb"><a href="index.html">今日学习</a> / <a href="quiz.html">考试刷题</a> / ${E(title)}</div>
      <h1>${E(title)}</h1>
    </div>
    ${exam ? `<div class="warnbar"><span class="ic">!</span>
      <div><b>考试须知</b>：共 ${list.length} 题，限时 ${minutes} 分钟，满分 100 分，60 分及格；
      交卷后自动判分并生成错题报告，做错的题会自动进入错题本。</div></div>` : ''}
    <div id="quizRoot"></div>`;
    Quiz.mount(document.getElementById('quizRoot'), {
      questions: list, title, badge, mode: exam ? 'exam' : 'practice', minutes,
      shuffle: mode === 'random' || mode === 'exam'
    });
  }
  const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]]; } return a; };

  /* ---------------- 考试结果 ---------------- */
  function result() {
    App.mount('quiz');
    const rec = App.exams.byId(App.q('id')) || App.exams.all()[0];
    if (!rec) { M().innerHTML = '<div class="card empty">还没有考试记录，<a class="blue" href="practice.html?mode=exam">去做一套模拟考</a>。</div>'; return; }
    const pass = rec.score >= 60;
    const byCh = {};
    (rec.detail || []).forEach(d => { const k = d.chapter || '未分类'; byCh[k] = byCh[k] || { n: 0, r: 0 }; byCh[k].n++; if (d.right) byCh[k].r++; });
    const wrongs = (rec.detail || []).filter(d => !d.right);
    M().innerHTML = `
    <div class="pagehead">
      <div class="breadcrumb"><a href="index.html">今日学习</a> / <a href="quiz.html">考试刷题</a> / 考试结果</div>
      <h1>考试结果</h1>
    </div>
    <div class="card" style="display:flex;gap:30px;align-items:center;flex-wrap:wrap">
      ${App.ring(rec.score, rec.score, '总分 100')}
      <div style="flex:1;min-width:240px">
        <h2 style="font-size:22px;margin-bottom:10px">${pass ? '本次模拟考试已通过' : '本次模拟考试未及格，继续加油'}</h2>
        <div style="font-size:13px;color:var(--muted);line-height:2">
          及格线 <b class="blue">60 分</b> · 答对 ${rec.right} / ${rec.total} 题 · 正确率 ${Math.round(rec.right / rec.total * 100)}%
        </div>
        <div style="display:flex;gap:10px;margin-top:16px;flex-wrap:wrap">
          <a class="btn p" href="practice.html?mode=wrong">重做错题（${wrongs.length}）</a>
          <a class="btn o" href="practice.html?mode=exam">再考一次</a>
        </div>
      </div>
    </div>
    <div class="two-col">
      <div class="card">
        <h3>各模块得分率</h3>
        ${Object.entries(byCh).map(([k, v]) => { const p = Math.round(v.r / v.n * 100); return `
          <div style="margin-bottom:14px">
            <div style="display:flex;font-size:12.5px;margin-bottom:5px">
              <span>${E(k)}</span><span style="margin-left:auto" class="${p >= 80 ? 'blue' : 'mut'}">${p}%（${v.r}/${v.n}）</span>
            </div>
            <div class="bar"><i style="width:${p}%;background:${p >= 80 ? 'var(--green)' : 'var(--yellow)'};"></i></div>
          </div>`; }).join('')}
      </div>
      <div class="card">
        <h3>下一步建议</h3>
        <p style="font-size:13.5px;line-height:1.9;color:var(--ink2)">${pass
          ? '成绩不错。建议把错题全部重做一遍，再刷一套新的模拟卷保持手感，然后进入实操专区看四科目要点。'
          : '先把错题本里的题吃透（每道题都要能说出为什么），回到对应课程把没掌握的章节再看一遍，再做一次模拟考。'}</p>
      </div>
    </div>`;
  }

  /* ---------------- 错题本 / 收藏 ---------------- */
  function wrongPage() {
    App.mount('quiz');
    const tab = App.q('tab') || 'wrong';
    const wrongIds = App.wrong.ids(), favIds = Object.keys(App.fav.all());
    const list = (tab === 'fav' ? favIds : wrongIds).map(App.questionById).filter(Boolean);
    M().innerHTML = `
    <div class="pagehead">
      <div class="breadcrumb"><a href="index.html">今日学习</a> / <a href="quiz.html">考试刷题</a> / 学习记录</div>
      <h1>错题本与收藏</h1>
      <p>记录保存在本机浏览器里 · 错题 ${wrongIds.length} 道 · 收藏 ${favIds.length} 道</p>
    </div>
    <div class="seg">
      <button class="${tab === 'wrong' ? 'on' : ''}" data-tab="wrong">错题本（${wrongIds.length}）</button>
      <button class="${tab === 'fav' ? 'on' : ''}" data-tab="fav">收藏题目（${favIds.length}）</button>
    </div>
    ${list.length ? list.map((x, i) => `
      <div class="card" style="margin-bottom:12px">
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
          <span class="pill">${Quiz.TYPE[x.type] || '单选题'}</span>
          ${x.chapter ? `<span class="pill k">${E(x.chapter)}</span>` : ''}
          <span class="mut small" style="margin-left:auto">正确答案：<b style="color:var(--green)">${E(x.answer)}</b></span>
        </div>
        <div style="font-size:14px;font-weight:600;margin:10px 0">${i + 1}. ${E(x.stem)}</div>
        <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:6px;font-size:13px">
          ${(x.options || []).map(o => `<div style="color:${x.answer.toUpperCase().includes(o.k) ? 'var(--green)' : 'var(--ink2)'}">${o.k}. ${E(o.t)}</div>`).join('')}
        </div>
        ${x.analysis ? `<div class="callout note" style="margin-top:10px;font-size:13px">${E(x.analysis)}</div>` : ''}
        <button class="btn s o" data-remove="${x.id}" style="margin-top:10px">${tab === 'fav' ? '取消收藏' : '移出错题本'}</button>
      </div>`).join('') : `<div class="card empty">${tab === 'fav' ? '还没有收藏题目，做题时点「♡ 收藏」即可加入。' : '还没有错题，去 <a class="blue" href="practice.html?mode=random&n=20">刷 20 题</a> 试试。'}</div>`}
    `;
    M().querySelectorAll('[data-tab]').forEach(el => el.onclick = () => location.href = 'wrong.html?tab=' + el.dataset.tab);
    M().querySelectorAll('[data-remove]').forEach(el => el.onclick = () => {
      const id = el.dataset.remove;
      tab === 'fav' ? App.fav.toggle(id) : App.wrong.remove(id);
      App.toast('已更新'); wrongPage();
    });
  }

  /* ---------------- 实操专区（文字版） ---------------- */
  const HANDS = [
    ['科目一', '安全用具使用与仪表测量', '20 分', ['绝缘手套 / 绝缘鞋 / 安全帽的检查与佩戴', '验电器、临时接地线的正确使用', '万用表测量电压、电阻、通断', '钳形电流表测量电流（不断开电路）', '兆欧表测量绝缘电阻（120 r/min）'],
      ['检查用具是否在检验有效期内', '测量前先确认档位与量程', '带电测量时单手操作，人体不接触金属部分']],
    ['科目二', '导线连接与照明、电机接线', '40 分', ['单股铜导线直接连接与压接', '单控 / 双控照明电路接线', '插座接线：左零右火上接地', '接触器自锁（连续运转）电路', '电动机正反转（双重互锁）接线'],
      ['接线前必须断电、验电、挂接地线', '导线剥削长度合适，芯线不能有损伤', '所有接线端子必须拧紧，导线不能压在绝缘皮上']],
    ['科目三', '作业现场隐患排查', '20 分', ['查找配电箱内的违规接线与老化线路', '识别漏电保护器失效、PE 线断开等隐患', '判断导线截面与负载是否匹配', '安全标识与警示牌设置是否规范', '临时用电线路敷设是否合格'],
      ['隐患要按「位置—现象—危害—整改」四步说清楚', '先看明显的烧焦、异味、松动痕迹', '拍照记录时不得触碰带电部位']],
    ['科目四', '触电急救与消防', '20 分', ['使触电者脱离电源的正确方法', '判断意识与呼吸（10 秒内完成）', '心肺复苏：按压位置、深度 5~6cm、频率 100~120 次/分', '按压与吹气比例 30 : 2', '电气火灾扑救与灭火器选用'],
      ['救人前必须先断电或用绝缘物挑开电源', '严禁直接用手拉拽触电者', '电气火灾严禁用水扑救，用干粉或二氧化碳灭火器']]
  ];
  function handsOn() {
    App.mount('lab');
    M().innerHTML = `
    <div class="pagehead">
      <div class="breadcrumb"><a href="index.html">今日学习</a> / <a href="lab.html">实操仿真</a> / 实操要点</div>
      <h1>实操要点（文字版）</h1>
      <p>低压电工实操四科目 · 共 100 分 · 每个考核要点都配了图和已核实视频</p>
    </div>
    <div class="warnbar"><span class="ic">!</span>
      <div><b>安全操作规范</b>：实操练习前必须确认断电、验电、挂接地线；严禁带电作业。本页内容仅作学习参考，实际作业请严格遵守国家与地方安全规程。</div></div>
    ${HANDS.map(([no, title, score, pts, warns]) => `
      <div class="card">
        <h3><span class="pill">${no}</span> ${title} <span class="more pill y">${score}</span></h3>
        ${pts.map((p, pi) => `
          <div class="course-row">
            <div class="cr-ico" style="background:var(--blueT);color:var(--blue);width:32px;height:32px;font-size:13px">${pi + 1}</div>
            <div class="cr-main">
              <div class="cr-t" style="font-size:13.5px">${E(p)}</div>
            </div>
          </div>`).join('')}
        <div class="callout warn" style="margin-top:10px"><span class="lb">安全禁忌</span>${warns.map(w => E(w)).join('<br>')}</div>
      </div>`).join('')}
    `;
  }

  /* ---------------- 低压电工证专区 ---------------- */
  function cert() {
    App.mount('mine');
    const plan = App.D.plan || {}, exam = plan.exam || {}, fees = plan.fees || [];
    M().innerHTML = `
    <div class="pagehead">
      <div class="breadcrumb"><a href="index.html">今日学习</a> / <a href="mine.html">我的</a> / 考证专区</div>
      <h1>低压电工证 系统化备考</h1>
      <p>报考常识 + 系统课程 + ${App.questions().length} 道免费题库 + 实操四科目要点 + 70 天学习计划，全站免费。</p>
    </div>
    <div class="quick-grid">
      <div class="card" style="margin:0">
        <b style="font-size:14px">理论机考</b>
        <p style="font-size:12.5px;color:var(--muted);margin-top:8px;line-height:1.8">${E(exam.theory || '100 题（70 判断 + 30 单选），120 分钟，80 分合格')}</p>
      </div>
      <div class="card" style="margin:0">
        <b style="font-size:14px">实操考核</b>
        <p style="font-size:12.5px;color:var(--muted);margin-top:8px;line-height:1.8">${E(exam.practice || '四科目：安全用具 20 / 接线 40 / 隐患排查 20 / 急救 20')}</p>
      </div>
      <div class="card" style="margin:0">
        <b style="font-size:14px">合格标准</b>
        <p style="font-size:12.5px;color:var(--muted);margin-top:8px;line-height:1.8">${E(exam.pass_line || '理论与实操均需 80 分合格')}</p>
      </div>
      <div class="card" style="margin:0">
        <b style="font-size:14px">参考费用</b>
        <p style="font-size:12.5px;color:var(--muted);margin-top:8px;line-height:1.8">${fees.map(f => `${E(f.item)} ${E(f.amount)}`).join(' · ') || '以当地公布为准'}</p>
      </div>
    </div>`;
  }

  /* ---------------- 学习计划 ---------------- */
  function plan() {
    App.mount('mine');
    const p = App.D.plan || {}, weeks = p.weeks || [], meta = p.meta || {};
    const totalDays = weeks.reduce((n, w) => n + (w.days || []).length, 0);
    const doneN = App.planDone.count();
    M().innerHTML = `
    <div class="pagehead">
      <div class="breadcrumb"><a href="index.html">今日学习</a> / <a href="mine.html">我的</a> / 70 天学习计划</div>
      <h1>70 天学习计划</h1>
      <p>${E(meta.total_days || 70)} 天 / ${E(meta.weeks || 10)} 周 · 每天 1~2 小时 · 已打卡 ${doneN} / ${totalDays} 天</p>
    </div>
    <div class="two-col">
      <div class="card">
        <h3>整体进度</h3>
        <div style="text-align:center;padding:20px 0">
          <div style="font-size:36px;font-weight:800;color:var(--blue)">${doneN}/${totalDays}</div>
          <div style="font-size:12.5px;color:var(--muted);margin-top:4px">已完成天数</div>
          <div class="bar" style="margin-top:14px"><i style="width:${totalDays ? Math.round(doneN / totalDays * 100) : 0}%"></i></div>
        </div>
      </div>
      <div class="card">
        <h3>考试信息</h3>
        <div class="kv" style="display:flex;padding:9px 0;border-bottom:1px solid #F0F2F5;font-size:13px"><span style="color:var(--muted)">理论考试</span><span style="margin-left:auto;font-weight:600">${E((p.exam || {}).theory || '100 题 / 120 分钟 / 80 分合格')}</span></div>
        <div class="kv" style="display:flex;padding:9px 0;border-bottom:1px solid #F0F2F5;font-size:13px"><span style="color:var(--muted)">实操考核</span><span style="margin-left:auto;font-weight:600">${E((p.exam || {}).practice || '四科目，共 100 分')}</span></div>
        <div class="kv" style="display:flex;padding:9px 0;font-size:13px"><span style="color:var(--muted)">打卡说明</span><span style="margin-left:auto;font-weight:600">保存在本机浏览器</span></div>
      </div>
    </div>
    ${weeks.map(w => `
      <div class="card">
        <h3>第 ${w.week} 周 · ${E(w.theme || '')} <span class="more">${(w.days || []).filter(d => App.planDone.has('w' + w.week + 'd' + d.day)).length} / ${(w.days || []).length} 天</span></h3>
        ${(w.days || []).map(d => {
          const key = 'w' + w.week + 'd' + d.day, on = App.planDone.has(key);
          return `<div class="course-row">
            <div class="task-check ${on ? 'done' : ''}" style="width:18px;height:18px"></div>
            <div class="cr-main">
              <div class="cr-t" style="font-size:13px">第 ${d.day} 天 · ${E(d.task || '')}</div>
            </div>
            <span class="mut small">${E(d.minutes || '')}</span>
          </div>`; }).join('')}
      </div>`).join('') || '<div class="card empty">计划数据加载中…</div>'}
    `;
    M().querySelectorAll('.task-check').forEach((cb, i) => {
      cb.style.cursor = 'pointer';
      cb.onclick = () => {
        const day = weeks[Math.floor(i / 7)].days[i % 7];
        const key = 'w' + weeks[Math.floor(i / 7)].week + 'd' + day.day;
        App.planDone.toggle(key);
        App.toast('打卡成功');
        plan();
      };
    });
  }

  /* ---------------- 通俗知识库 ---------------- */
  function knowledge() {
    App.mount('mine');
    const list = ((App.D.knowledge || {}).entries) || [];
    M().innerHTML = `
    <div class="pagehead">
      <div class="breadcrumb"><a href="index.html">今日学习</a> / <a href="mine.html">我的</a> / 知识库</div>
      <h1>通俗知识库</h1>
      <p>用大白话回答电工学习里最容易卡住的问题 · 共 ${list.length} 条</p>
    </div>
    ${list.map(x => `<div class="card" style="cursor:pointer">
      <div style="font-size:14.5px;font-weight:700">${E(x.title)}</div>
      <p style="font-size:12.5px;color:var(--muted);margin-top:6px;line-height:1.7">${E(x.summary || (x.body || [''])[0] || '').slice(0, 80)}</p>
    </div>`).join('') || '<div class="card empty">知识库内容整理中…</div>'}
    `;
  }

  /* ---------------- 资料下载 ---------------- */
  function docs() {
    App.mount('mine');
    const list = (App.D.docs && App.D.docs.docs) || [];
    M().innerHTML = `
    <div class="pagehead">
      <div class="breadcrumb"><a href="index.html">今日学习</a> / <a href="mine.html">我的</a> / 资料下载</div>
      <h1>资料下载</h1>
      <p>共 ${list.length} 项 · 本地资料可直接打开或打印</p>
    </div>
    <div class="table-card" style="background:#fff;border:1px solid var(--line);border-radius:var(--r);overflow:hidden">
      <table class="list" style="width:100%;border-collapse:collapse;font-size:13px">
        <tr style="background:#F7F8FA"><th style="padding:12px 16px;text-align:left">格式</th><th style="padding:12px 16px;text-align:left">资料名称</th><th style="padding:12px 16px;text-align:left">分类</th><th style="padding:12px 16px;text-align:left">操作</th></tr>
        ${list.map(d => `<tr style="border-bottom:1px solid #F0F2F5">
          <td style="padding:12px 16px"><span class="pill k">${E(d.format)}</span></td>
          <td style="padding:12px 16px;font-weight:600">${E(d.title)}</td>
          <td style="padding:12px 16px;color:var(--muted)">${E(d.category)}</td>
          <td style="padding:12px 16px"><a class="blue" href="${E(d.path)}" target="_blank" style="font-weight:600">${d.local ? '打开' : '前往'}</a></td>
        </tr>`).join('')}
      </table>
    </div>`;
  }

  /* ---------------- 行业资讯 ---------------- */
  function news() {
    App.mount('mine');
    const list = (App.D.news && App.D.news.articles) || [];
    M().innerHTML = `
    <div class="pagehead">
      <div class="breadcrumb"><a href="index.html">今日学习</a> / <a href="mine.html">我的</a> / 行业资讯</div>
      <h1>行业资讯</h1>
      <p>报考政策 · 考试大纲 · 安全警示</p>
    </div>
    ${list.map(a => `<div class="card" style="cursor:pointer">
      <div style="display:flex;align-items:center;gap:8px">
        <span class="pill k">${E(a.category)}</span>
        <span style="margin-left:auto;font-size:12px;color:var(--muted)">${E(a.date)}</span>
      </div>
      <div style="font-size:14.5px;font-weight:700;margin-top:8px">${E(a.title)}</div>
      <p style="font-size:12.5px;color:var(--muted);margin-top:6px;line-height:1.7">${E(a.summary || '')}</p>
    </div>`).join('') || '<div class="card empty">资讯整理中…</div>'}
    `;
  }

  /* ---------------- 我的（个人中心） ---------------- */
  function mine() {
    App.mount('mine');
    const doneN = App.progress.count();
    const totalLessons = App.lessonCount();
    const pct = totalLessons ? Math.round(doneN / totalLessons * 100) : 0;
    const wrongN = App.wrong.ids().length;
    const favN = Object.keys(App.fav.all()).length;
    const planDoneN = App.planDone.count();
    const exams = App.exams.all();
    M().innerHTML = `
    <div class="pagehead">
      <h1>我的</h1>
      <p>学习记录保存在本机浏览器，换设备不会同步</p>
    </div>
    <div class="two-col">
      <div class="card">
        <h3>学习进度</h3>
        <div style="text-align:center;padding:16px 0">
          <div style="font-size:32px;font-weight:800;color:var(--blue)">${pct}%</div>
          <div style="font-size:12.5px;color:var(--muted);margin-top:4px">${doneN} / ${totalLessons} 节已学</div>
          <div class="bar" style="margin-top:14px"><i style="width:${pct}%"></i></div>
        </div>
      </div>
      <div class="card">
        <h3>我的数据</h3>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:8px">
          <div><div class="stat"><b>${wrongN}</b><span>错题本</span></div></div>
          <div><div class="stat"><b>${favN}</b><span>收藏题</span></div></div>
          <div><div class="stat"><b>${planDoneN}</b><span>计划打卡</span></div></div>
          <div><div class="stat"><b>${exams.length}</b><span>模拟考</span></div></div>
        </div>
      </div>
    </div>
    <div class="card">
      <h3>学习工具</h3>
      <div class="quick-grid" style="grid-template-columns:repeat(3,1fr)">
        <div class="quick" onclick="location.href='plan.html'">
          <div class="q-ico" style="background:var(--blue)">📅</div>
          <div class="q-name">70天计划</div>
          <div class="q-desc">每日打卡</div>
        </div>
        <div class="quick" onclick="location.href='docs.html'">
          <div class="q-ico" style="background:#5A6B7E">📄</div>
          <div class="q-name">资料下载</div>
          <div class="q-desc">手册试卷</div>
        </div>
        <div class="quick" onclick="location.href='wrong.html'">
          <div class="q-ico" style="background:var(--red)">✗</div>
          <div class="q-name">错题本</div>
          <div class="q-desc">错题重练</div>
        </div>
        <div class="quick" onclick="location.href='cert.html'">
          <div class="q-ico" style="background:var(--cyan)">📋</div>
          <div class="q-name">考证专区</div>
          <div class="q-desc">报考指南</div>
        </div>
        <div class="quick" onclick="location.href='knowledge.html'">
          <div class="q-ico" style="background:var(--orange)">💡</div>
          <div class="q-name">知识库</div>
          <div class="q-desc">通俗解释</div>
        </div>
        <div class="quick" onclick="location.href='news.html'">
          <div class="q-ico" style="background:#F57C00">📰</div>
          <div class="q-name">行业资讯</div>
          <div class="q-desc">政策更新</div>
        </div>
      </div>
    </div>
    <div class="callout note"><span class="lb">关于数据同步</span>
      本站所有学习进度、笔记、错题、收藏都保存在你当前浏览器的 localStorage 里，<b>不会上传到服务器</b>。换设备或清除浏览器数据后会丢失，建议重要笔记自己另外备份。</div>
    `;
  }

  /* ---------------- 搜索 ---------------- */
  function search() {
    App.mount('');
    const kw = App.q('q') || '';
    const r = App.searchAll(kw);
    const total = r.courses.length + r.lessons.length + r.questions.length + r.docs.length + r.news.length;
    M().innerHTML = `
    <div class="pagehead">
      <div class="breadcrumb"><a href="index.html">今日学习</a> / 站内搜索</div>
      <h1>搜索「${E(kw)}」</h1>
      <p>共找到 ${total} 条结果</p>
    </div>
    ${total ? '' : '<div class="card empty">没有找到相关内容，换个关键词试试。</div>'}
    `;
    if (r.courses.length) M().innerHTML += `<div class="card"><h3>课程（${r.courses.length}）</h3>${r.courses.map(c => `<div class="course-row" onclick="location.href='course.html?id=${encodeURIComponent(c.id)}'"><div class="cr-main"><div class="cr-t">${E(c.title)}</div></div></div>`).join('')}</div>`;
    if (r.lessons.length) M().innerHTML += `<div class="card"><h3>讲义（${r.lessons.length}）</h3>${r.lessons.map(x => `<div class="course-row"><div class="cr-main"><div class="cr-t">${E(x.lesson.title)}</div><div class="cr-d">${E(x.course.title)}</div></div></div>`).join('')}</div>`;
    if (r.questions.length) M().innerHTML += `<div class="card"><h3>题目（${r.questions.length}）</h3>${r.questions.map(x => `<div class="course-row"><div class="cr-main"><div class="cr-t" style="font-size:13px">${E(x.stem).slice(0, 50)}</div></div></div>`).join('')}</div>`;
  }

  const MAP = { home, courses, course, lesson, bank, practice, result, wrong: wrongPage, handsOn, cert, plan, docs, news, search, knowledge, mine };
  function boot() {
    const page = document.body.dataset.page;
    try { (MAP[page] || home)(); }
    catch (e) {
      const m = document.getElementById('main');
      if (m) m.innerHTML = `<div class="card empty">页面渲染出错：${App.esc(e.message)}</div>`;
      console.error(e);
    }
  }
  return { boot };
})();
document.addEventListener('DOMContentLoaded', Pages.boot);