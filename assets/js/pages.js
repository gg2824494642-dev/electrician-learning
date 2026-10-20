/* =============================================================
   电工学堂 · 页面渲染（每页由 body[data-page] 决定渲染哪个视图）
   ============================================================= */
const Pages = (function () {
  const M = () => document.getElementById('main');
  const E = App.esc, S = s => (s == null ? '' : String(s));
  const bl = App.blocks;

  /* ---------------- 今日学习（首页仪表盘） ---------------- */
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

    // 找最近学过的课（按进度里最后更新的）
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

    M().innerHTML = `
    <section class="hero" style="padding:40px 0 30px"><div class="wrap">
      <div class="slash">/ 今日学习 · 继续你的电工之路</div>
      <h1 class="display" style="font-size:38px">系统学电工<br><span class="blue">从零基础到持证上岗</span></h1>
      <div class="sub" style="max-width:560px">课程讲义 + 免费题库 + 实操仿真 + 70 天计划，全部免费开放。</div>
    </div></section>

    <section class="sec" style="padding-top:10px"><div class="wrap">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;align-items:stretch;flex-wrap:wrap">
        <div class="card pad" style="display:flex;align-items:center;gap:24px;min-width:280px">
          ${App.ring(pct, pct + '%', '总进度')}
          <div style="flex:1">
            <b style="font-size:17px">全站学习进度</b>
            <div class="meta" style="margin-top:8px;font-size:13.5px">
              <span>${doneN} / ${totalLessons} 节已学</span>
            </div>
            <div style="display:flex;gap:10px;margin-top:16px;flex-wrap:wrap">
              ${continueLesson ? `<a class="btn p" href="lesson.html?c=${encodeURIComponent(continueLesson.course.id)}&l=${encodeURIComponent(continueLesson.lesson.id)}">继续学习</a>` : ''}
              <a class="btn o" href="courses.html">全部课程</a>
            </div>
          </div>
        </div>
        <div class="card pad" style="display:flex;flex-direction:column;justify-content:center">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
            <div><div class="stat"><b>${cs.length}</b><span>门课程</span></div></div>
            <div><div class="stat"><b>${qn}</b><span>道题库</span></div></div>
            <div><div class="stat"><b>${wrongN}</b><span>错题本</span></div></div>
            <div><div class="stat"><b>${planDoneN}/${planTotalDays}</b><span>计划打卡</span></div></div>
          </div>
          ${last ? `<div style="margin-top:14px;padding-top:14px;border-top:1px solid var(--line);font-size:13px">
            上次模拟考：<b class="blue">${last.score} 分</b>
            <a class="blue" href="result.html?id=${last.id}" style="margin-left:10px">查看报告 →</a></div>` : ''}
        </div>
      </div>
    </div></section>

    <section class="sec g"><div class="wrap">
      <div class="sechead"><div><div class="slash">/ quick access</div><h2>快捷入口</h2></div></div>
      <div class="grid c4">
        <a class="qcard" href="courses.html"><span class="no">01</span><div><b>课程学习</b><p>${cs.length} 门课 · ${lessons} 节讲义</p></div></a>
        <a class="qcard" href="lab.html"><span class="no">02</span><div><b>实操仿真</b><p>自由接线 · 练习闯关 · 进阶仿真</p></div></a>
        <a class="qcard" href="quiz.html"><span class="no">03</span><div><b>考试刷题</b><p>${qn} 道题 · 模拟考 · 错题本</p></div></a>
        <a class="qcard" href="mine.html"><span class="no">04</span><div><b>我的</b><p>学习计划 · 资料下载 · 设置</p></div></a>
      </div>
    </div></section>

    <section class="sec"><div class="wrap">
      <div class="sechead"><div><div class="slash">/ recommend</div><h2>推荐课程</h2></div>
        <a class="more" href="courses.html">全部课程 →</a></div>
      <div class="grid c3">${notStarted.map(courseCard).join('') || cs.slice(0, 3).map(courseCard).join('')}
      </div>
    </div></section>

    <section class="sec g"><div class="wrap">
      <div class="sechead"><div><div class="slash">/ learning roadmap</div><h2>学习路径</h2></div>
        <a class="more" href="plan.html">70 天计划 →</a></div>
      <div class="grid c5">
        ${[
        ['01', '入门', '2–3 周', ['认识电流电压电阻功率', '会用万用表测电压电阻', '看懂最简单的电路'], '能读懂家用电路'],
        ['02', '基础', '3–4 周', ['欧姆定律与串并联计算', '交直流与三相电常识', '电气图形符号识读'], '会算简单电路'],
        ['03', '安全', '2–3 周', ['触电危害与安全电压', '接地接零与漏电保护', '安全用具与标识'], '能识别现场风险'],
        ['04', '设备', '3–4 周', ['低压电器与熔断器', '接触器与继电器', '电机控制：自锁/互锁'], '能看懂控制电路'],
        ['05', '考证', '考前 2–4 周', ['五套练习卷刷题', '高频数字速记', '实操四科目演练'], '理论与实操双 80']
      ].map(([n, t, w, ps, g]) => `<div class="pathc"><div class="st">STEP ${n}</div><b>${t}</b>
        <div class="rw">建议周期 ${w}</div><ul>${ps.map(x => `<li>${x}</li>`).join('')}</ul>
        <div class="meta"><span class="pill g">${g}</span></div></div>`).join('')}
      </div>
    </div></section>`;
  }

  function courseCard(c) {
    const lessons = (c.chapters || []).reduce((n, ch) => n + (ch.lessons || []).length, 0);
    const done = (c.chapters || []).reduce((n, ch) => n + (ch.lessons || []).filter(l => App.progress.done(l.id)).length, 0);
    const fig = App.figure('cover:' + c.id);
    return `<a class="card" href="course.html?id=${encodeURIComponent(c.id)}">
      ${fig || '<div class="cover-svg"><span class="bl b1"></span><span class="bl b2"></span><span class="bl b3"></span></div>'}
      <div class="cbody"><div class="ctitle">${E(c.title)}</div>
        <div class="meta"><span>${lessons} 节</span><span>${c.minutes || '—'} 分钟</span>
          ${done ? `<span class="pill g">已学 ${done} 节</span>` : ''}</div>
        <p class="mut" style="font-size:12.5px;line-height:1.7;margin-top:8px">${E((c.summary || '').slice(0, 46))}</p>
      </div></a>`;
  }

  /* ---------------- 课程中心 ---------------- */
  function courses() {
    App.mount('course');
    const cs = App.courses();
    const levels = ['全部', ...Array.from(new Set(cs.map(c => c.level || '其他')))];
    M().innerHTML = `
    <div class="wrap pagehead">
      <div class="breadcrumb"><a href="index.html">今日学习</a> / 课程学习</div>
      <h1>课程学习</h1>
      <p class="mut" style="margin-top:10px">共 ${cs.length} 门课 · ${App.lessonCount()} 节图文讲义，全部免费开放</p>
    </div>
    <div class="wrap" style="padding-bottom:60px">
      <div class="toolbar">
        <span class="mut small">难度</span>
        ${levels.map((l, i) => `<span class="pill ${i === 0 ? '' : 'k'}" data-lv="${l}" style="cursor:pointer">${l}</span>`).join('')}
        <span class="inp" style="margin-left:auto"><input id="cFilter" placeholder="在课程里搜关键词" style="border:0;outline:none;background:transparent;font:inherit;color:inherit;width:200px"></span>
      </div>
      <div class="grid c3" id="courseGrid">${cs.map(courseCard).join('') || '<div class="empty">课程数据加载中…</div>'}</div>
    </div>`;
    let lv = '全部';
    const draw = () => {
      const kw = (document.getElementById('cFilter').value || '').trim().toLowerCase();
      const list = cs.filter(c => (lv === '全部' || (c.level || '其他') === lv) &&
        (!kw || (c.title + (c.summary || '')).toLowerCase().includes(kw)));
      document.getElementById('courseGrid').innerHTML = list.map(courseCard).join('') || '<div class="empty">没有匹配的课程</div>';
    };
    M().querySelectorAll('[data-lv]').forEach(el => el.onclick = () => {
      lv = el.dataset.lv;
      M().querySelectorAll('[data-lv]').forEach(x => x.className = 'pill ' + (x.dataset.lv === lv ? '' : 'k'));
      M().querySelectorAll('[data-lv]').forEach(x => x.style.cursor = 'pointer');
      draw();
    });
    document.getElementById('cFilter').oninput = draw;
  }

  /* ---------------- 课程详情 ---------------- */
  function course() {
    const c = App.courseById(App.q('id')) || App.courses()[0];
    if (!c) { M().innerHTML = '<div class="wrap empty">课程不存在</div>'; return; }
    App.mount('course');
    const lessons = (c.chapters || []).flatMap(ch => ch.lessons || []);
    const done = lessons.filter(l => App.progress.done(l.id)).length;
    M().innerHTML = `
    <div class="wrap pagehead">
      <div class="breadcrumb"><a href="index.html">今日学习</a> / <a href="courses.html">课程学习</a> / ${E(c.title)}</div>
      <div style="display:flex;gap:30px;flex-wrap:wrap">
        <div class="cside">
          <div style="position:relative">${(App.figure('cover:' + c.id) || '').replace("class='cover-real'", "class='cover-real-lg'")}
            <span class="pill tag" style="position:absolute;left:16px;top:16px;background:#fff">${E(c.level || '入门')}</span></div>
        </div>
        <div class="lay-main">
          <h1 class="display" style="font-size:34px">${E(c.title)}</h1>
          <p class="mut" style="margin-top:14px;font-size:15px;line-height:1.9">${E(c.subtitle || '')}</p>
          <div class="meta" style="margin-top:16px;font-size:13px"><span>${lessons.length} 节课</span>
            <span>约 ${c.minutes || '—'} 分钟</span><span>已学 ${done} 节</span></div>
          <div style="display:flex;gap:12px;margin-top:22px;flex-wrap:wrap">
            <a class="btn p" href="lesson.html?c=${encodeURIComponent(c.id)}&l=${encodeURIComponent((lessons[0] || {}).id || '')}">开始学习</a>
            <a class="btn o" href="practice.html?mode=chapter&course=${encodeURIComponent(c.id)}">配套练习</a>
          </div>
        </div>
      </div>
    </div>
    <div class="wrap" style="display:flex;gap:28px;padding-bottom:60px;align-items:flex-start;flex-wrap:wrap">
      <div class="lay-main">
        ${c.objectives && c.objectives.length ? `<div class="keypoints" style="margin-top:0"><h4>学完这门课你能</h4>
          <ul>${c.objectives.map(o => `<li>${E(o)}</li>`).join('')}</ul></div>` : ''}
        <h3 style="margin:24px 0 14px;font-size:18px">课程大纲</h3>
        ${(c.chapters || []).map((ch, ci) => `
          <div class="chapter">
            <div class="ch-head"><span class="pill k">第 ${ci + 1} 章</span><span>${E(ch.title)}</span>
              <span class="mut small" style="margin-left:auto">${(ch.lessons || []).length} 节</span></div>
            ${(ch.lessons || []).map((l, li) => `
              <a class="lesson-row ${App.progress.done(l.id) ? 'on' : ''}" href="lesson.html?c=${encodeURIComponent(c.id)}&l=${encodeURIComponent(l.id)}">
                <span class="idx">${String(li + 1).padStart(2, '0')}</span>
                <span class="ttl">${E(l.title)}${App.detailedFor(c, l) ? ' <span class="pill">精讲</span>' : ''}</span>
                <span class="dur">${l.minutes || 15} 分钟</span></a>`).join('')}
          </div>`).join('')}
      </div>
      <div class="lay-side">
        <div class="sidebox"><h4>学习进度</h4>
          <div class="bar"><i style="width:${lessons.length ? (done / lessons.length * 100) : 0}%"></i></div>
          <p class="mut small" style="margin-top:10px">已学 ${done} / ${lessons.length} 节</p>
          <a class="btn p block" style="margin-top:14px" href="lesson.html?c=${encodeURIComponent(c.id)}&l=${encodeURIComponent((lessons[done] || lessons[0] || {}).id || '')}">
            ${done ? '继续学习' : '开始第一课'}</a></div>
        <div class="sidebox" style="margin-top:16px"><h4>课程信息</h4>
          <div class="kv"><span>难度</span><span>${E(c.level || '入门')}</span></div>
          <div class="kv"><span>节数</span><span>${lessons.length} 节</span></div>
          <div class="kv"><span>时长</span><span>约 ${c.minutes || '—'} 分钟</span></div>
          <div class="kv"><span>费用</span><span class="blue">免费</span></div></div>
        <div class="sidebox" style="margin-top:16px"><h4>相关练习</h4>
          <p class="mut small" style="line-height:1.9">本课程配套题库练习，做完的错题会自动进错题本。</p>
          <a class="btn o block" style="margin-top:12px" href="practice.html?mode=chapter&course=${encodeURIComponent(c.id)}">开始配套练习</a></div>
      </div>
    </div>`;
  }

  /* ---------------- 学习页（讲义） ---------------- */
  function lesson() {
    const cid = App.q('c'), lid = App.q('l');
    let hit = App.lessonById(cid, lid);
    if (!hit) { const all = App.allLessons(); hit = all[0]; }
    if (!hit) { M().innerHTML = '<div class="wrap empty">讲义数据加载中…</div>'; return; }
    App.mount('course');
    const { course, chapter, lesson } = hit;
    const flat = App.allLessons();
    const idx = flat.findIndex(x => x.lesson.id === lesson.id);
    const prev = flat[idx - 1], next = flat[idx + 1];
    const detail = App.detailedFor(course, lesson);
    const content = (detail && detail.content && detail.content.length ? detail.content : lesson.content) || [];
    const kps = (detail && detail.keyPoints) || lesson.key_points || [];
    const tips = (detail && detail.examTips) || lesson.exam_tips || [];
    const related = App.questions().filter(x => x.chapter && lesson.title && (x.stem.includes(lesson.title.slice(0, 2)) || false)).slice(0, 6);
    const done = App.progress.done(lesson.id);
    M().innerHTML = `
    <div class="wrap padtop">
      <div class="breadcrumb"><a href="index.html">今日学习</a> / <a href="courses.html">课程学习</a> /
        <a href="course.html?id=${encodeURIComponent(course.id)}">${E(course.title)}</a> / ${E(lesson.title)}</div>
    </div>
    <div class="wrap" style="display:flex;gap:26px;padding-bottom:60px;align-items:flex-start;flex-wrap:wrap">
      <div class="lay-main">
        <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:16px">
          <span class="pill">${E(chapter.title)}</span>
          ${detail ? '<span class="pill y">精讲 · 配图</span>' : ''}
          <span class="mut small">${lesson.minutes || 15} 分钟</span>
          <span class="mut small" style="margin-left:auto">
            <button class="btn s ${done ? 'o' : 'p'}" id="markDone">${done ? '✓ 已完成' : '标记为已学完'}</button></span>
        </div>
        <article class="article">
          <h1 style="font-size:27px;font-weight:900;letter-spacing:-.4px">${E(lesson.title)}</h1>
          ${lesson.summary ? `<p class="mut" style="margin-top:10px">${E(lesson.summary)}</p>` : ''}
          ${detail && detail.intro ? `<div class="callout note" style="margin-top:20px"><span class="lb">📖 先看这一句</span>${E(detail.intro)}</div>` : ''}
          ${bl(content)}
          ${kps.length ? `<div class="keypoints"><h4>本节必须记住</h4><ul>${kps.map((k, i) => `<li>${E(k)}${(detail && detail.keyPointImages && detail.keyPointImages[i]) ? `<img class="kp-img" src="${detail.keyPointImages[i]}" alt="要点配图" loading="lazy">` : ''}</li>`).join('')}</ul></div>` : ''}
          ${tips.length ? `<div class="callout tip"><span class="lb">💡 考点与易错点</span>${tips.map(t => E(t)).join('<br>')}</div>` : ''}
        </article>

        <div class="card pad" style="margin-top:18px">
          <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap"><b>配套视频（链接已逐条核实）</b>
            <span class="mut small" style="margin-left:auto">点开即播，不用自己去搜</span></div>
          ${(App.videosFor(lesson.title + ' ' + (chapter.title || ''), 3).length
            ? App.videosFor(lesson.title + ' ' + (chapter.title || ''), 3)
            : App.videosFor((course.title || '') + ' ' + (chapter.title || ''), 3)).map(App.videoLink).join('')
            || '<p class="mut small" style="margin-top:10px">这一节暂无匹配视频，可先看讲义与配套题目。</p>'}
        </div>

        <div class="card pad" style="margin-top:18px">
          <div style="display:flex;align-items:center"><b>我的笔记</b>
            <span class="mut small" style="margin-left:auto" id="noteTip">只保存在本机浏览器里</span></div>
          <textarea id="noteBox" placeholder="边看边记：把容易忘的数字、口诀写在这里…"
            style="width:100%;min-height:96px;margin-top:12px;border:1px solid var(--line);border-radius:8px;
            padding:12px;font:inherit;font-size:14px;outline:none;resize:vertical">${E(App.notes.get(lesson.id))}</textarea>
          <button class="btn s p" style="margin-top:10px" id="saveNote">保存笔记</button>
        </div>

        <div style="display:flex;gap:12px;margin-top:18px;flex-wrap:wrap">
          ${prev ? `<a class="btn o" href="lesson.html?c=${encodeURIComponent(prev.course.id)}&l=${encodeURIComponent(prev.lesson.id)}">← ${E(prev.lesson.title)}</a>` : ''}
          ${next ? `<a class="btn p" style="margin-left:auto" href="lesson.html?c=${encodeURIComponent(next.course.id)}&l=${encodeURIComponent(next.lesson.id)}">下一课：${E(next.lesson.title)} →</a>` : ''}
        </div>
      </div>
      <div class="lay-side">
        <div class="toc">
          <div class="th">${E(course.title)}</div>
          ${(course.chapters || []).flatMap(ch => (ch.lessons || []).map(l => `
            <a class="ch ${l.id === lesson.id ? 'on' : ''}" href="lesson.html?c=${encodeURIComponent(course.id)}&l=${encodeURIComponent(l.id)}">
              ${App.progress.done(l.id) ? '✓' : ''} ${E(l.title)}<span class="d">${l.minutes || 15}′</span></a>`)).join('')}
        </div>
        <div class="sidebox" style="margin-top:16px">
          <h4>本节自测</h4>
          <p class="mut small" style="line-height:1.9">从题库里抽 8 道题检验一下这节课学得怎么样。</p>
          <a class="btn p block" style="margin-top:12px" href="practice.html?mode=random&n=8">开始自测</a>
        </div>
        <div class="sidebox" style="margin-top:16px">
          <h4>学习进度</h4>
          <div class="bar"><i style="width:${Math.round(App.progress.count() / Math.max(1, flat.length) * 100)}%"></i></div>
          <p class="mut small" style="margin-top:10px">全站已学 ${App.progress.count()} / ${flat.length} 节</p>
        </div>
      </div>
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
    <div class="wrap pagehead">
      <div class="breadcrumb"><a href="index.html">今日学习</a> / 考试刷题</div>
      <h1>考试刷题</h1>
      <p class="mut" style="margin-top:10px">共 ${qs.length} 道题（判断 ${types.judge || 0} · 单选 ${types.single || 0} · 多选 ${types.multi || 0}），全部免费、附解析</p>
      <div class="callout note" style="margin-top:14px"><span class="lb">📘 题库说明（请务必阅读）</span>
        本站题目按<b>官方低压电工考试大纲的知识点范围</b>整理，题型对齐官方理论机考（判断题 + 单选题），
        用于日常练习与自测；<b>官方题库不对外公开，本站题目不等同于、也无法代替真实考题</b>，
        正式考试以应急管理部门当期考卷为准。<br>
        需要同步最新考题时：把新题整理成 Excel/CSV/JSON，运行 <code>python scripts/import_questions.py 文件路径</code> 即可合并进题库。</div>
    </div>
    <div class="wrap" style="padding-bottom:60px">
      <div style="display:flex;gap:20px;flex-wrap:wrap;align-items:flex-start">
        <div class="lay-main">
          <h3 style="font-size:18px;margin-bottom:14px">按模块练习</h3>
          <div class="grid c2">
            ${Object.entries(byChapter).sort((a, b) => b[1] - a[1]).map(([ch, n]) => `
              <a class="card pad" href="practice.html?mode=chapter&chapter=${encodeURIComponent(ch)}">
                <div style="display:flex;align-items:center"><b style="font-size:15.5px">${E(ch)}</b>
                  <span class="pill k" style="margin-left:auto">${n} 题</span></div>
                <p class="mut small" style="margin-top:8px">按模块顺序练习，做完立即看解析，错题自动进错题本。</p>
                <span class="btn s p" style="margin-top:12px;display:inline-flex">开始练习</span></a>`).join('')}
          </div>
        </div>
        <div class="lay-side">
          <div class="card pad"><h4 style="font-size:15px">我的刷题数据</h4>
            <div class="grid c2" style="gap:12px;margin-top:14px">
              <div class="stat"><b>${wrongN}</b><span>错题本</span></div>
              <div class="stat"><b>${favN}</b><span>收藏题</span></div>
              <div class="stat"><b>${exams.length}</b><span>模拟考次数</span></div>
              <div class="stat"><b>${last ? last.score : '—'}</b><span>上次得分</span></div>
            </div>
            <a class="btn o block" style="margin-top:14px" href="wrong.html">打开错题本</a></div>
          <div class="sidebox" style="margin-top:16px"><h4>刷题模式</h4>
            <a class="btn p block" style="margin-bottom:10px" href="practice.html?mode=random&n=20">随机 20 题快刷</a>
            <a class="btn o block" style="margin-bottom:10px" href="practice.html?mode=exam">模拟考试（40 题 / 60 分钟）</a>
            <a class="btn o block" style="margin-bottom:10px" href="practice.html?mode=wrong">错题重练</a>
            <a class="btn o block" href="practice.html?mode=fav">收藏题重做</a></div>
          ${last ? `<div class="sidebox" style="margin-top:16px"><h4>最近一次模拟考</h4>
            <div class="kv"><span>得分</span><span class="blue">${last.score} 分</span></div>
            <div class="kv"><span>正确率</span><span>${last.right}/${last.total}</span></div>
            <a class="btn o block" style="margin-top:12px" href="result.html?id=${last.id}">查看报告</a></div>` : ''}
        </div>
      </div>
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
    M().innerHTML = `<div class="wrap padtop-b">
      <div class="breadcrumb"><a href="index.html">今日学习</a> / <a href="quiz.html">考试刷题</a> / ${E(title)}</div>
      ${exam ? `<div class="warnbar" style="margin-bottom:18px"><span class="ic">!</span>
        <div><b>考试须知</b>：共 ${list.length} 题，限时 ${minutes} 分钟，满分 100 分，60 分及格；
        交卷后自动判分并生成错题报告，做错的题会自动进入错题本。</div></div>` : ''}
      <div id="quizRoot"></div></div>`;
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
    if (!rec) { M().innerHTML = '<div class="wrap empty">还没有考试记录，<a class="blue" href="practice.html?mode=exam">去做一套模拟考</a>。</div>'; return; }
    const pass = rec.score >= 60;
    const byCh = {};
    (rec.detail || []).forEach(d => { const k = d.chapter || '未分类'; byCh[k] = byCh[k] || { n: 0, r: 0 }; byCh[k].n++; if (d.right) byCh[k].r++; });
    const wrongs = (rec.detail || []).filter(d => !d.right);
    M().innerHTML = `<div class="wrap padtop-b">
      <div class="breadcrumb"><a href="index.html">今日学习</a> / <a href="quiz.html">考试刷题</a> / 考试结果</div>
      <div class="card" style="padding:34px 38px;display:flex;gap:44px;align-items:center;flex-wrap:wrap">
        ${App.ring(rec.score, rec.score, '总分 100')}
        <div style="flex:1;min-width:280px">
          <div class="slash">/ exam result</div>
          <h2 class="display" style="font-size:30px;margin:10px 0 12px">${pass ? '本次模拟考试已通过 🎉' : '本次模拟考试未及格，继续加油 💪'}</h2>
          <div class="meta" style="font-size:13.5px;gap:20px">
            <span>及格线 <b class="blue">60 分</b></span>
            <span>答对 ${rec.right} / ${rec.total} 题</span>
            <span>正确率 ${Math.round(rec.right / rec.total * 100)}%</span>
            <span>交卷时间 ${App.fmtDate(rec.time)}</span></div>
          <div style="display:flex;gap:12px;margin-top:22px;flex-wrap:wrap">
            <a class="btn p" href="practice.html?mode=wrong">重做错题（${wrongs.length}）</a>
            <a class="btn o" href="practice.html?mode=exam">再考一次</a>
            <a class="btn o" href="wrong.html">打开错题本</a>
            <a class="btn o" href="quiz.html">返回题库</a></div>
        </div>
      </div>
      <div class="grid c2" style="margin-top:20px">
        <div class="card pad"><b>各模块得分率</b>
          <div style="margin-top:18px">
          ${Object.entries(byCh).map(([k, v]) => { const p = Math.round(v.r / v.n * 100); return `
            <div style="margin-bottom:16px"><div style="display:flex;font-size:13.5px"><span>${E(k)}</span>
              <span style="margin-left:auto" class="${p >= 80 ? 'blue' : 'mut'}">${p}%（${v.r}/${v.n}）</span></div>
              <div class="bar" style="margin-top:7px"><i style="width:${p}%;background:${p >= 80 ? '#2A4FE4' : '#F7B500'}"></i></div></div>`; }).join('')}
          </div></div>
        <div class="card pad"><b>下一步建议</b>
          <p style="margin-top:12px;line-height:1.95">${pass
            ? '成绩不错。建议把错题全部重做一遍，再刷一套新的模拟卷保持手感，然后进入实操专区看四科目要点。'
            : '先把错题本里的题吃透（每道题都要能说出为什么），回到对应课程把没掌握的章节再看一遍，再做一次模拟考。'}</p>
          <div style="display:flex;gap:10px;margin-top:14px;flex-wrap:wrap">
            <a class="btn s o" href="courses.html">回课程中心</a>
            <a class="btn s o" href="hands-on.html">实操专区</a></div></div>
      </div>
      <div class="card" style="margin-top:20px;overflow-x:auto">
        <table class="list">
          <tr><th style="width:60px">序号</th><th>题目</th><th style="width:110px">你的答案</th><th style="width:110px">正确答案</th><th style="width:150px">模块</th></tr>
          ${wrongs.map((d, i) => `<tr><td class="nowrap">${i + 1}</td><td>${E(d.stem)}</td>
            <td class="nowrap" style="color:#E5484D;font-weight:700">${E(d.my || '未作答')}</td>
            <td class="nowrap" style="color:#16A34A;font-weight:700">${E(d.answer)}</td>
            <td class="nowrap mut">${E(d.chapter || '')}</td></tr>`).join('') || '<tr><td colspan="5" class="empty">全部答对，没有错题 🎉</td></tr>'}
        </table>
      </div>
    </div>`;
  }

  /* ---------------- 错题本 / 收藏 ---------------- */
  function wrongPage() {
    App.mount('quiz');
    const tab = App.q('tab') || 'wrong';
    const wrongIds = App.wrong.ids(), favIds = Object.keys(App.fav.all());
    const list = (tab === 'fav' ? favIds : wrongIds).map(App.questionById).filter(Boolean);
    M().innerHTML = `<div class="wrap pagehead">
        <div class="breadcrumb"><a href="index.html">今日学习</a> / <a href="quiz.html">考试刷题</a> / 学习记录</div>
        <h1>错题本与收藏</h1>
        <p class="mut" style="margin-top:10px">记录保存在本机浏览器里 · 错题 ${wrongIds.length} 道 · 收藏 ${favIds.length} 道</p></div>
      <div class="wrap" style="padding-bottom:60px">
        <div class="tabs" style="margin-bottom:20px">
          <div class="${tab === 'wrong' ? 'on' : ''}" data-tab="wrong">错题本（${wrongIds.length}）</div>
          <div class="${tab === 'fav' ? 'on' : ''}" data-tab="fav">收藏题目（${favIds.length}）</div>
        </div>
        <div class="toolbar">
          <a class="btn s p" href="practice.html?mode=${tab === 'fav' ? 'fav' : 'wrong'}">${tab === 'fav' ? '重做收藏题' : '重做全部错题'}</a>
          ${tab === 'wrong' ? '<button class="btn s o" id="clearWrong">清空错题本</button>' : ''}
        </div>
        ${list.length ? list.map((x, i) => `
          <div class="card pad" style="margin-bottom:14px">
            <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
              <span class="pill">${Quiz.TYPE[x.type] || '单选题'}</span>
              ${x.chapter ? `<span class="pill k">${E(x.chapter)}</span>` : ''}
              <span class="mut small" style="margin-left:auto">正确答案：<b style="color:#16A34A">${E(x.answer)}</b></span>
            </div>
            <div style="font-size:15.5px;font-weight:700;margin:12px 0 10px">${i + 1}. ${E(x.stem)}</div>
            <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px">
              ${(x.options || []).map(o => `<div style="font-size:13.5px;color:${x.answer.toUpperCase().includes(o.k) ? '#12833F' : '#5A6068'}">${o.k}. ${E(o.t)}</div>`).join('')}
            </div>
            ${x.analysis ? `<div class="callout note" style="margin-top:12px;font-size:13.5px">${E(x.analysis)}</div>` : ''}
            <div style="display:flex;gap:10px;margin-top:12px">
              <button class="btn s o" data-remove="${x.id}">${tab === 'fav' ? '取消收藏' : '移出错题本'}</button>
            </div>
          </div>`).join('') : `<div class="card empty">${tab === 'fav' ? '还没有收藏题目，做题时点「♡ 收藏」即可加入。' : '还没有错题，去 <a class="blue" href="practice.html?mode=random&n=20">刷 20 题</a> 试试。'}</div>`}
      </div>`;
    M().querySelectorAll('[data-tab]').forEach(el => el.onclick = () => location.href = 'wrong.html?tab=' + el.dataset.tab);
    M().querySelectorAll('[data-remove]').forEach(el => el.onclick = () => {
      const id = el.dataset.remove;
      tab === 'fav' ? App.fav.toggle(id) : App.wrong.remove(id);
      App.toast('已更新'); wrongPage();
    });
    const cw = document.getElementById('clearWrong');
    if (cw) cw.onclick = () => { if (confirm('确定清空全部错题吗？')) { App.wrong.clear(); wrongPage(); } };
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
  function vmini(v) {
    return `<a class="vlink" href="${v.url}" target="_blank" rel="noopener" style="margin:0;padding:5px 10px">
      <span class="vp" style="padding:2px 7px">▶</span>
      <span class="vt" style="font-size:12px;font-weight:600;max-width:300px">${E(v.title)}</span>
      <span class="vm" style="font-size:11px">${v.platform === 'xiaohongshu' ? '小红书' : 'B 站'} · ${E(v.author || '')}</span></a>`;
  }

  function handsOn() {
    App.mount('lab');
    const only = App.q('sub');
    const subs = (only === null || only === '' || isNaN(+only))
      ? HANDS.map((h, i) => h.concat([i]))
      : [HANDS[+only].concat([+only])];
    M().innerHTML = `
    <div class="wrap pagehead">
      <div class="breadcrumb"><a href="index.html">今日学习</a> / <a href="lab.html">实操仿真</a> / 实操要点</div>
      <h1>实操要点（文字版）</h1>
      <p class="mut" style="margin-top:10px">低压电工实操四科目 · 共 100 分 · 每个考核要点都配了图和已核实视频（点开即播）</p>
      <div class="toolbar" style="margin-top:16px">
        <a class="pill" href="lab.html" style="margin-right:8px">← 返回实操仿真</a>
        ${HANDS.map(([no, title, score], si) => `<a class="pill" href="#lab${si}">${no} ${title}（${score}）</a>`).join('')}
      </div>
    </div>
    <div class="wrap" style="padding-bottom:60px">
      <div class="warnbar"><span class="ic">!</span>
        <div><b>安全操作规范</b>：实操练习前必须确认断电、验电、挂接地线；严禁带电作业；所有操作须在持证人员指导下进行。
        本页内容仅作学习参考，实际作业请严格遵守国家与地方安全规程。</div></div>

      ${subs.map(([no, title, score, pts, warns, si]) => `
        <section id="lab${si}" style="margin-top:34px">
          <div class="card pad">
            <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
              <span class="pill">${no}</span><b style="font-size:19px">${title}</b>
              <span class="pill y" style="margin-left:auto">${score}</span></div>
            ${App.figureHtml('lab:' + si)}
            <div style="margin-top:22px">
              <div class="mut small" style="margin-bottom:6px">考核要点（逐条配图 + 视频）</div>
              ${pts.map((p, pi) => `
                <div class="lp">
                  <div class="lp-head"><span class="n">${pi + 1}</span><span>${E(p)}</span></div>
                  ${App.figureHtml('lab:' + si + ':' + pi)}
                  <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px">
                    ${(App.videosFor(p, 2).length ? App.videosFor(p, 2) : App.videosFor(title + ' ' + no, 2)).map(vmini).join('')
                      || '<span class="mut small">该要点暂无匹配的核实视频，以现场演示与教材为准。</span>'}
                  </div>
                </div>`).join('')}
            </div>
            <div class="callout warn" style="margin-top:14px"><span class="lb">⚠️ 安全禁忌</span>${warns.map(w => E(w)).join('<br>')}</div>
          </div>
        </section>`).join('')}
    </div>`;
  }

  /* ---------------- 低压电工证专区 ---------------- */
  function cert() {
    App.mount('mine');
    const plan = App.D.plan || {}, exam = plan.exam || {}, fees = plan.fees || [];
    const cs = App.courses();
    const docs = ((App.D.docs && App.D.docs.docs) || []).filter(d => d.local);
    const news = ((App.D.news && App.D.news.articles) || []).slice(0, 4);
    M().innerHTML = `
    <section class="hero" style="padding:56px 0 48px"><div class="wrap">
      <div class="slash">/ low-voltage electrician · 公益免费专区</div>
      <h1 class="display" style="font-size:46px">低压电工证 系统化备考</h1>
      <div class="sub">报考常识 + 系统课程 + ${App.questions().length} 道免费题库 + 实操四科目要点 + 70 天学习计划，全站免费。</div>
      <div class="cta">
        <a class="btn p" href="courses.html">开始学习</a>
        <a class="btn o" href="practice.html?mode=exam">进入模拟考试</a></div>
    </div></section>

    <section class="sec"><div class="wrap">
      <div class="sechead"><div><div class="slash">/ application guide</div><h2>考试信息速查</h2></div></div>
      <div class="grid c4">
        <div class="card pad"><div class="no display" style="font-size:20px;color:#C3C8CF">01</div>
          <b style="display:block;font-size:16px;margin:10px 0 8px">理论机考</b>
          <p class="mut small" style="line-height:1.85">${E(exam.theory || '100 题（70 判断 + 30 单选），120 分钟，80 分合格')}</p></div>
        <div class="card pad"><div class="no display" style="font-size:20px;color:#C3C8CF">02</div>
          <b style="display:block;font-size:16px;margin:10px 0 8px">实操考核</b>
          <p class="mut small" style="line-height:1.85">${E(exam.practice || '四科目：安全用具 20 / 接线 40 / 隐患排查 20 / 急救 20')}</p></div>
        <div class="card pad"><div class="no display" style="font-size:20px;color:#C3C8CF">03</div>
          <b style="display:block;font-size:16px;margin:10px 0 8px">合格标准</b>
          <p class="mut small" style="line-height:1.85">${E(exam.pass_line || '理论与实操均需 80 分合格')}</p></div>
        <div class="card pad"><div class="no display" style="font-size:20px;color:#C3C8CF">04</div>
          <b style="display:block;font-size:16px;margin:10px 0 8px">参考费用</b>
          <p class="mut small" style="line-height:1.85">${fees.map(f => `${E(f.item)} ${E(f.amount)}`).join(' · ') || '以当地培训机构与考核机构公布为准'}</p></div>
      </div>
    </div></section>`;
  }

  /* ---------------- 学习计划 ---------------- */
  function plan() {
    App.mount('mine');
    const p = App.D.plan || {}, weeks = p.weeks || [], meta = p.meta || {};
    const totalDays = weeks.reduce((n, w) => n + (w.days || []).length, 0);
    const doneN = App.planDone.count();
    M().innerHTML = `
    <div class="wrap pagehead">
      <div class="breadcrumb"><a href="index.html">今日学习</a> / <a href="mine.html">我的</a> / 70 天学习计划</div>
      <h1>70 天学习计划</h1>
      <p class="mut" style="margin-top:10px">${E(meta.total_days || 70)} 天 / ${E(meta.weeks || 10)} 周 ·
        ${E(meta.daily_rhythm || '每天 1~2 小时')} · 已打卡 ${doneN} / ${totalDays} 天</p>
    </div>
    <div class="wrap" style="padding-bottom:60px">
      <div class="grid c4" style="margin-bottom:26px">
        <div class="card pad"><div class="stat"><b>${doneN}</b><span>已完成天数</span></div>
          <div class="bar" style="margin-top:12px"><i style="width:${totalDays ? Math.round(doneN / totalDays * 100) : 0}%"></i></div></div>
        <div class="card pad"><div class="mut small">理论考试</div>
          <p style="margin-top:8px;font-size:13.5px;line-height:1.85">${E((p.exam || {}).theory || '100 题 / 120 分钟 / 80 分合格')}</p></div>
        <div class="card pad"><div class="mut small">实操考核</div>
          <p style="margin-top:8px;font-size:13.5px;line-height:1.85">${E((p.exam || {}).practice || '四科目，共 100 分')}</p></div>
        <div class="card pad"><div class="mut small">打卡说明</div>
          <p style="margin-top:8px;font-size:13.5px;line-height:1.85">打勾记录保存在本机浏览器，换设备不会同步。</p></div>
      </div>
      ${weeks.map(w => `
        <div class="week" id="w${w.week}">
          <div class="wk-head"><span class="pill">第 ${w.week} 周</span><b>${E(w.theme || '')}</b>
            <span class="mut small" style="margin-left:auto">${(w.days || []).filter(d => App.planDone.has('w' + w.week + 'd' + d.day)).length} / ${(w.days || []).length} 天</span></div>
          <div class="wk-body">
            ${(w.days || []).map(d => {
              const key = 'w' + w.week + 'd' + d.day, on = App.planDone.has(key);
              return `<div class="day-row ${on ? 'done' : ''}" style="align-items:flex-start">
                <input type="checkbox" data-day="${key}" ${on ? 'checked' : ''} style="margin-top:8px">
                <span class="wd" style="margin-top:4px">${E(d.weekday || '')}</span>
                <span class="tk" style="flex:1">
                  <span style="display:block">第 ${d.day} 天 · ${E(d.task || '')}</span>
                </span>
                <span class="du" style="margin-top:4px">${E(d.minutes || '')}</span>
              </div>`; }).join('')}
          </div>
        </div>`).join('') || '<div class="empty">计划数据加载中…</div>'}
    </div>`;
    M().querySelectorAll('[data-day]').forEach(cb => cb.onchange = () => {
      App.planDone.toggle(cb.dataset.day);
      const row = cb.closest('.day-row'); row.classList.toggle('done', cb.checked);
      App.toast(cb.checked ? '打卡成功，继续保持！' : '已取消打卡');
    });
  }

  /* ---------------- 通俗知识库 ---------------- */
  function knowledge() {
    App.mount('mine');
    const list = ((App.D.knowledge || {}).entries) || [];
    M().innerHTML = `
    <div class="wrap pagehead">
      <div class="breadcrumb"><a href="index.html">今日学习</a> / <a href="mine.html">我的</a> / 知识库</div>
      <h1>通俗知识库</h1>
      <p class="mut" style="margin-top:10px">用大白话回答电工学习里最容易卡住的问题 · 共 ${list.length} 条</p>
    </div>
    <div class="wrap" style="padding-bottom:60px">
      <div class="grid" style="grid-template-columns:1fr;gap:22px">
        ${list.map(x => `<a class="card pad" href="knowledge.html?id=${x.id}">
          <b style="display:block;font-size:16.5px;margin:12px 0 8px">${E(x.title)}</b>
          <p class="mut" style="font-size:13px;line-height:1.8">${E(x.summary || (x.body || [''])[0] || '').slice(0, 72)}</p>
        </a>`).join('') || '<div class="empty">知识库内容整理中…</div>'}
      </div>
    </div>`;
  }

  /* ---------------- 资料下载 ---------------- */
  function docs() {
    App.mount('mine');
    const list = (App.D.docs && App.D.docs.docs) || [];
    M().innerHTML = `
    <div class="wrap pagehead">
      <div class="breadcrumb"><a href="index.html">今日学习</a> / <a href="mine.html">我的</a> / 资料下载</div>
      <h1>资料下载</h1>
      <p class="mut" style="margin-top:10px">共 ${list.length} 项 · 本地资料可直接打开或打印（Ctrl+P 可存为 PDF）</p>
    </div>
    <div class="wrap" style="padding-bottom:60px">
      <div class="table-card"><table class="list" id="docTable">
        <tr><th style="width:70px">格式</th><th>资料名称</th><th style="width:120px">分类</th><th style="width:90px">大小</th><th style="width:220px">说明</th><th style="width:90px">操作</th></tr>
        ${list.map(d => `<tr><td class="nowrap"><span class="pill k">${E(d.format)}</span></td>
          <td><b style="color:#111">${E(d.title)}</b></td><td class="nowrap mut">${E(d.category)}</td>
          <td class="nowrap mut">${E(d.size || '')}</td><td class="mut" style="font-size:12.5px">${E(d.desc || '')}</td>
          <td class="nowrap"><a class="blue" style="font-weight:700" href="${E(d.path)}" target="_blank">${d.local ? '打开' : '前往'}</a></td></tr>`).join('')}
      </table></div>
    </div>`;
  }

  /* ---------------- 行业资讯 ---------------- */
  function news() {
    App.mount('mine');
    const list = (App.D.news && App.D.news.articles) || [];
    M().innerHTML = `
    <div class="wrap pagehead">
      <div class="breadcrumb"><a href="index.html">今日学习</a> / <a href="mine.html">我的</a> / 行业资讯</div>
      <h1>行业资讯</h1>
      <p class="mut" style="margin-top:10px">报考政策 · 考试大纲 · 安全警示</p>
    </div>
    <div class="wrap" style="padding-bottom:60px">
      ${list.map(a => `<a class="card pad" href="news.html?id=${a.id}" style="display:block;margin-bottom:14px">
        <div style="display:flex;align-items:center;gap:12px">
          <span class="pill k">${E(a.category)}</span>
          <b style="font-size:17px">${E(a.title)}</b>
          <span class="mut small" style="margin-left:auto">${E(a.date)}</span></div>
        <p class="mut" style="margin-top:10px;font-size:13.5px;line-height:1.85">${E(a.summary || '')}</p>
      </a>`).join('') || '<div class="empty">资讯整理中…</div>'}
    </div>`;
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
    <div class="wrap pagehead">
      <div class="breadcrumb"><a href="index.html">今日学习</a> / 我的</div>
      <h1>我的</h1>
      <p class="mut" style="margin-top:10px">学习记录保存在本机浏览器，换设备不会同步</p>
    </div>
    <div class="wrap" style="padding-bottom:60px">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;flex-wrap:wrap;margin-bottom:26px">
        <div class="card pad" style="display:flex;align-items:center;gap:24px">
          ${App.ring(pct, pct + '%', '总进度')}
          <div style="flex:1">
            <b style="font-size:17px">全站学习进度</b>
            <div class="meta" style="margin-top:8px;font-size:13.5px">
              <span>${doneN} / ${totalLessons} 节已学</span>
            </div>
          </div>
        </div>
        <div class="card pad">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
            <div><div class="stat"><b>${wrongN}</b><span>错题本</span></div></div>
            <div><div class="stat"><b>${favN}</b><span>收藏题</span></div></div>
            <div><div class="stat"><b>${planDoneN}</b><span>计划打卡天数</span></div></div>
            <div><div class="stat"><b>${exams.length}</b><span>模拟考次数</span></div></div>
          </div>
        </div>
      </div>
      <h3 style="font-size:18px;margin-bottom:14px">学习工具</h3>
      <div class="grid c3" style="margin-bottom:26px">
        <a class="card pad" href="plan.html"><b>70 天学习计划</b><p class="mut small" style="margin-top:8px">每日打卡，按周推进备考节奏。</p><span class="btn s p" style="margin-top:12px;display:inline-flex">打开计划</span></a>
        <a class="card pad" href="docs.html"><b>资料下载</b><p class="mut small" style="margin-top:8px">手册、练习卷、学习表，可打印。</p><span class="btn s p" style="margin-top:12px;display:inline-flex">全部资料</span></a>
        <a class="card pad" href="wrong.html"><b>错题本</b><p class="mut small" style="margin-top:8px">自动收录做错的题，反复练到会。</p><span class="btn s p" style="margin-top:12px;display:inline-flex">错题重练</span></a>
        <a class="card pad" href="cert.html"><b>考证专区</b><p class="mut small" style="margin-top:8px">报考常识、考试信息速查。</p><span class="btn s p" style="margin-top:12px;display:inline-flex">查看详情</span></a>
        <a class="card pad" href="knowledge.html"><b>知识库</b><p class="mut small" style="margin-top:8px">用大白话回答电工学习里的问题。</p><span class="btn s p" style="margin-top:12px;display:inline-flex">浏览知识</span></a>
        <a class="card pad" href="news.html"><b>行业资讯</b><p class="mut small" style="margin-top:8px">报考政策、考试大纲、安全警示。</p><span class="btn s p" style="margin-top:12px;display:inline-flex">全部资讯</span></a>
      </div>
      <div class="callout note" style="margin-top:20px"><span class="lb">📘 关于数据同步</span>
        本站所有学习进度、笔记、错题、收藏都保存在你当前浏览器的 localStorage 里，<b>不会上传到服务器</b>。
        换设备或清除浏览器数据后会丢失，建议重要笔记自己另外备份。</div>
    </div>`;
  }

  /* ---------------- 搜索 ---------------- */
  function search() {
    App.mount('');
    const kw = App.q('q') || '';
    const r = App.searchAll(kw);
    const total = r.courses.length + r.lessons.length + r.questions.length + r.docs.length + r.news.length;
    M().innerHTML = `
    <div class="wrap pagehead">
      <div class="breadcrumb"><a href="index.html">今日学习</a> / 站内搜索</div>
      <h1>搜索「${E(kw)}」</h1>
      <p class="mut" style="margin-top:10px">共找到 ${total} 条结果</p>
    </div>
    <div class="wrap" style="padding-bottom:60px">
      ${section('课程', r.courses.map(c => `<a class="kv" href="course.html?id=${encodeURIComponent(c.id)}"><span style="font-weight:700">${E(c.title)}</span><span class="mut small">${E(c.level || '')}</span></a>`))}
      ${section('讲义', r.lessons.map(x => `<a class="kv" href="lesson.html?c=${encodeURIComponent(x.course.id)}&l=${encodeURIComponent(x.lesson.id)}"><span>${E(x.lesson.title)}</span><span class="mut small">${E(x.course.title)}</span></a>`))}
      ${section('题目', r.questions.map(x => `<a class="kv" href="practice.html?mode=chapter&chapter=${encodeURIComponent(x.chapter || '')}"><span>${E(x.stem).slice(0, 60)}</span><span class="mut small">${E(x.chapter || '')}</span></a>`))}
      ${section('资料', r.docs.map(d => `<a class="kv" href="${E(d.path)}" target="_blank"><span>${E(d.title)}</span><span class="mut small">${E(d.category)}</span></a>`))}
      ${section('资讯', r.news.map(a => `<a class="kv" href="news.html?id=${a.id}"><span>${E(a.title)}</span><span class="mut small">${E(a.date)}</span></a>`))}
      ${total ? '' : '<div class="card empty">没有找到相关内容，换个关键词试试。</div>'}
    </div>`;
    function section(t, rows) {
      if (!rows.length) return '';
      return `<h3 style="margin:26px 0 10px;font-size:17px">${t}（${rows.length}）</h3><div class="card pad">${rows.join('')}</div>`;
    }
  }

  const MAP = { home, courses, course, lesson, bank, practice, result, wrong: wrongPage, handsOn, cert, plan, docs, news, search, knowledge, mine };
  function boot() {
    const page = document.body.dataset.page;
    try { (MAP[page] || home)(); }
    catch (e) {
      const m = document.getElementById('main');
      if (m) m.innerHTML = `<div class="wrap empty">页面渲染出错：${App.esc(e.message)}</div>`;
      console.error(e);
    }
  }
  return { boot };
})();
document.addEventListener('DOMContentLoaded', Pages.boot);
