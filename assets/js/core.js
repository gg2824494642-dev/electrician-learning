/* =============================================================
   电工学堂 · 站点核心脚本（无依赖、可 file:// 直接打开）
   数据来自 data/*.js，页面结构由 #nav / #footer / #main 三个挂载点渲染
   ============================================================= */
window.APP_DATA = window.APP_DATA || { courses: { courses: [] }, questions: { questions: [] } };

const App = (function () {
  const D = window.APP_DATA;
  const LS = {
    get(k, def) { try { const v = localStorage.getItem('ds_' + k); return v ? JSON.parse(v) : def; } catch (e) { return def; } },
    set(k, v) { try { localStorage.setItem('ds_' + k, JSON.stringify(v)); } catch (e) {} }
  };

  /* ---------------- 基础工具 ---------------- */
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const $ = sel => document.querySelector(sel);
  const q = name => new URLSearchParams(location.search).get(name);
  const money = n => n;
  function toast(msg) {
    let t = $('.toast');
    if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
    t.textContent = msg; t.classList.add('show');
    clearTimeout(t._tm); t._tm = setTimeout(() => t.classList.remove('show'), 1900);
  }

  /* ---------------- 课程数据索引 ---------------- */
  const courses = () => (D.courses && D.courses.courses) || [];
  const courseById = id => courses().find(c => c.id === id);
  function allLessons() {
    const out = [];
    courses().forEach(c => (c.chapters || []).forEach(ch => (ch.lessons || []).forEach(l => out.push({ course: c, chapter: ch, lesson: l }))));
    return out;
  }
  const lessonById = (cid, lid) => {
    const c = courseById(cid); if (!c) return null;
    for (const ch of c.chapters || []) for (const l of ch.lessons || []) if (l.id === lid) return { course: c, chapter: ch, lesson: l };
    return null;
  };
  const questions = () => (D.questions && D.questions.questions) || [];
  const questionById = id => questions().find(x => x.id === id);
  const detailLessons = () => (D.lessons && D.lessons.lessons) || [];
  /** 精讲版讲义：优先按 id 匹配，其次按课程标题关键词匹配 */
  function detailedFor(course, lesson) {
    const all = detailLessons();
    let hit = all.find(x => x.lessonId && x.lessonId === lesson.id);
    if (!hit) {
      const flat = [];
      (course.chapters || []).forEach(ch => (ch.lessons || []).forEach(l => flat.push(l)));
      const idx = flat.findIndex(l => l.id === lesson.id) + 1;
      hit = all.find(x => x.matchTitle && (course.title || '').includes(x.matchTitle) && (x.order || 1) === idx);
    }
    return hit || null;
  }

  /* ---------------- 进度 / 笔记 / 收藏 / 错题 ---------------- */
  const progress = {
    all: () => LS.get('progress', {}),
    done: id => !!LS.get('progress', {})[id],
    toggle(id) { const p = LS.get('progress', {}); p[id] ? delete p[id] : p[id] = Date.now(); LS.set('progress', p); return !!p[id]; },
    count: () => Object.keys(LS.get('progress', {})).length
  };
  const notes = {
    get: id => LS.get('notes', {})[id] || '',
    set(id, v) { const n = LS.get('notes', {}); if (v.trim()) n[id] = v; else delete n[id]; LS.set('notes', n); }
  };
  const fav = {
    all: () => LS.get('fav', {}),
    has: id => !!LS.get('fav', {})[id],
    toggle(id) { const f = LS.get('fav', {}); f[id] ? delete f[id] : f[id] = Date.now(); LS.set('fav', f); return !!f[id]; }
  };
  const wrong = {
    all: () => LS.get('wrong', {}),
    ids: () => Object.keys(LS.get('wrong', {})),
    add(id, my) {
      const w = LS.get('wrong', {}); const cur = w[id] || { count: 0 };
      cur.count++; cur.last = Date.now(); cur.my = my; w[id] = cur; LS.set('wrong', w);
    },
    remove(id) { const w = LS.get('wrong', {}); delete w[id]; LS.set('wrong', w); },
    clear() { LS.set('wrong', {}); }
  };
  const exams = {
    all: () => LS.get('exams', []),
    save(rec) { const a = LS.get('exams', []); a.unshift(rec); LS.set('exams', a.slice(0, 30)); return rec.id; },
    byId: id => (LS.get('exams', [])).find(r => r.id === id)
  };
  const planDone = {
    all: () => LS.get('plan', {}),
    has: k => !!LS.get('plan', {})[k],
    toggle(k) { const p = LS.get('plan', {}); p[k] ? delete p[k] : p[k] = Date.now(); LS.set('plan', p); return !!p[k]; },
    count: () => Object.keys(LS.get('plan', {})).length
  };

  /* ---------------- 配图 ---------------- */
  const figuresData = () => D.figures || {};
  /** 取一张配图（不存在返回 null） */
  const figure = key => figuresData()[key] || null;
  /** 配图 HTML（图解卡自身已带外框，就不再套 figure） */
  function figureHtml(key, caption) {
    const fig = figure(key);
    if (!fig) return '';
    if (/^\s*<(div|section)\b/.test(fig)) return fig + (caption ? `<div class="fc-note">${esc(caption)}</div>` : '');
    return `<figure class="fig">${fig}${caption ? `<figcaption>${esc(caption)}</figcaption>` : ''}</figure>`;
  }

  /* ---------------- 视频资源（来自 videos.json，均已人工核实） ---------------- */
  const videos = () => (D.videos && D.videos.videos) || [];
  /** 按主题关键词匹配视频：文本里出现 topics 关键词越多，排得越前 */
  function videosFor(text, limit) {
    const t = String(text || '');
    const scored = videos().map(v => {
      let s = 0;
      (v.topics || []).forEach(k => { if (k && t.includes(k)) s += (k.length >= 3 ? 2 : 1); });
      return { v, s };
    }).filter(x => x.s > 0)
      .sort((a, b) => b.s - a.s || (a.v.level === '入门' ? -1 : 1));
    return scored.slice(0, limit || 3).map(x => x.v);
  }
  /** 视频链接 HTML（直接可点，不需要自己去搜） */
  function videoLink(v) {
    const plat = v.platform === 'xiaohongshu' ? '小红书' : 'B 站';
    return `<a class="vlink" href="${v.url}" target="_blank" rel="noopener">
      <span class="vp">▶ 播放</span>
      <span class="vt">${esc(v.title)}</span>
      <span class="vm">${plat} · ${esc(v.author || '')}${v.level ? ' · ' + esc(v.level) : ''}</span></a>`;
  }

  /* ---------------- 公共组件 ---------------- */
  const MENU = [
    ['首页', 'index.html'], ['课程中心', 'courses.html'], ['题库系统', 'quiz.html'], ['实操专区', 'hands-on.html'],
    ['知识库', 'knowledge.html'], ['考证专区', 'cert.html'], ['学习计划', 'plan.html'], ['资料下载', 'docs.html'], ['行业资讯', 'news.html']
  ];
  function nav(active) {
    const items = MENU.map(([t, h]) => `<a href="${h}" class="${t === active ? 'on' : ''}">${t}</a>`).join('');
    return `<div class="nav">
      <a class="logo" href="index.html"><span class="mark"></span><span><b>电工学堂</b><small>E-LEARN</small></span></a>
      <nav class="menu" id="navMenu">${items}</nav>
      <div class="navr">
        <div class="searchbox"><i></i><input id="navSearch" placeholder="搜索课程 / 题目 / 资料" autocomplete="off"></div>
        <button class="navsearch-btn" id="navSearchBtn" aria-label="搜索"><i></i></button>
        <button class="navtoggle" id="navToggle" aria-label="菜单"><span></span><span></span><span></span></button>
      </div>
      <div class="mobile-menu" id="mobileMenu">
        <div class="mm-search"><i></i><input id="navSearchM" placeholder="搜索课程 / 题目 / 资料" autocomplete="off"></div>
        ${MENU.map(([t, h]) => `<a href="${h}" class="${t === active ? 'on' : ''}">${t}</a>`).join('')}
      </div></div>`;
  }
  function footer() {
    const col = (t, xs) => `<div><h4>${t}</h4><ul>${xs.map(x => `<li>${x}</li>`).join('')}</ul></div>`;
    return `<div class="wrap"><div class="cols">
        <div><h4 style="font-size:17px">电工学堂 / E-LEARN</h4>
          <p style="font-size:12.5px;line-height:2">纯公益、全站免费的电工学习资源站。<br>
          内容整理自《低压电工一站式学习手册》《低压电工每日学习表》<br>与五套练习卷，仅供学习参考。</p></div>
        ${col('学习模块', ['<a href="courses.html">课程中心</a>', '<a href="quiz.html">题库系统</a>', '<a href="hands-on.html">实操专区</a>', '<a href="docs.html">资料下载</a>'])}
        ${col('考证与计划', ['<a href="cert.html">低压电工证专区</a>', '<a href="plan.html">70 天学习计划</a>', '<a href="quiz.html#exam">模拟考试</a>', '<a href="wrong.html">我的错题本</a>'])}
        ${col('关于本站', ['本站为个人学习整理，非官方站点', '考试政策以当地应急管理部门为准', '内容纠错：issue 反馈', '免责声明'])}
      </div>
      <div class="btm"><span>© 2026 电工学堂 · 公益免费学习平台</span>
      <span style="margin-left:auto">本站资料仅供学习参考，正式考试请以官方要求为准</span></div></div>`;
  }
  function mount(active) {
    const n = document.getElementById('nav'); if (n) n.innerHTML = nav(active);
    const f = document.getElementById('footer'); if (f) { f.className = 'footer'; f.innerHTML = footer(); }
    const si = document.getElementById('navSearch');
    if (si) si.addEventListener('keydown', e => {
      if (e.key === 'Enter' && si.value.trim()) location.href = 'search.html?q=' + encodeURIComponent(si.value.trim());
    });
    const sim = document.getElementById('navSearchM');
    if (sim) sim.addEventListener('keydown', e => {
      if (e.key === 'Enter' && sim.value.trim()) location.href = 'search.html?q=' + encodeURIComponent(sim.value.trim());
    });
    // 移动端：汉堡菜单 / 搜索展开
    const tg = document.getElementById('navToggle');
    const mm = document.getElementById('mobileMenu');
    if (tg && mm) {
      tg.addEventListener('click', e => {
        e.stopPropagation();
        document.body.classList.toggle('menu-open');
        tg.classList.toggle('on');
      });
      mm.addEventListener('click', e => { if (e.target.tagName === 'A') { document.body.classList.remove('menu-open'); tg.classList.remove('on'); } });
      document.addEventListener('click', e => {
        if (document.body.classList.contains('menu-open') && !mm.contains(e.target) && e.target !== tg && !tg.contains(e.target)) {
          document.body.classList.remove('menu-open'); tg.classList.remove('on');
        }
      });
    }
    const sb = document.getElementById('navSearchBtn');
    if (sb) sb.addEventListener('click', e => {
      e.stopPropagation();
      document.body.classList.toggle('search-open');
      const s = document.getElementById('navSearch');
      if (s && document.body.classList.contains('search-open')) s.focus();
    });
    // 点击空白处 / Esc 关闭移动菜单与搜索浮层
    document.addEventListener('click', e => {
      if (document.body.classList.contains('search-open') && !e.target.closest('.navr')) {
        document.body.classList.remove('search-open');
      }
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        document.body.classList.remove('menu-open', 'search-open');
        const t2 = document.getElementById('navToggle');
        if (t2) t2.classList.remove('on');
      }
    });
  }

  /* ---------------- 讲义内容块渲染 ---------------- */
  function blocks(list) {
    return (list || []).map(b => {
      switch (b.type) {
        case 'h2': return `<h2>${esc(b.text)}</h2>`;
        case 'h3': return `<h3>${esc(b.text)}</h3>`;
        case 'p': return `<p>${esc(b.text)}</p>`;
        case 'ul': return `<ul>${(b.items || []).map(i => `<li>${esc(i)}</li>`).join('')}</ul>`;
        case 'ol': return `<ul>${(b.items || []).map((i, n) => `<li>${n + 1}. ${esc(i)}</li>`).join('')}</ul>`;
        case 'table': return `<div class="table-scroll"><table><tr>${(b.head || []).map(h => `<th>${esc(h)}</th>`).join('')}</tr>
            ${(b.rows || []).map(r => `<tr>${r.map(c => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</table></div>`;
        case 'note': return `<div class="callout note"><span class="lb">📘 说明</span>${esc(b.text)}</div>`;
        case 'tip': return `<div class="callout tip"><span class="lb">💡 ${esc(b.title || '记忆口诀 / 考点提示')}</span>${esc(b.text)}</div>`;
        case 'warn': return `<div class="callout warn"><span class="lb">⚠️ ${esc(b.title || '安全提醒')}</span>${esc(b.text)}</div>`;
        case 'example': return `<div class="example"><div class="t">✍️ ${esc(b.title || '例题')}</div>
            <p>${esc(b.text)}</p>${(b.steps || []).length ? `<ol>${b.steps.map(s => `<li>${esc(s)}</li>`).join('')}</ol>` : ''}
            ${b.answer ? `<div class="ans">答案：${esc(b.answer)}</div>` : ''}</div>`;
        case 'svg': return `<figure>${b.code || ''}${b.caption ? `<figcaption>${esc(b.caption)}</figcaption>` : ''}</figure>`;
        case 'html': return b.code || '';
        default: return b.text ? `<p>${esc(b.text)}</p>` : '';
      }
    }).join('');
  }

  /* ---------------- 站内搜索 ---------------- */
  function searchAll(kw) {
    const k = kw.trim().toLowerCase(); if (!k) return { courses: [], lessons: [], questions: [], docs: [], news: [] };
    const hit = s => String(s || '').toLowerCase().includes(k);
    const res = { courses: [], lessons: [], questions: [], docs: [], news: [] };
    courses().forEach(c => {
      if (hit(c.title) || hit(c.subtitle) || hit(c.summary)) res.courses.push(c);
      (c.chapters || []).forEach(ch => (ch.lessons || []).forEach(l => {
        if (hit(l.title) || hit(l.summary) || (l.key_points || []).some(hit)) res.lessons.push({ course: c, lesson: l, chapter: ch });
      }));
    });
    questions().forEach(x => { if (hit(x.stem) || hit(x.analysis)) res.questions.push(x); });
    ((D.docs && D.docs.docs) || []).forEach(x => { if (hit(x.title) || hit(x.desc)) res.docs.push(x); });
    ((D.news && D.news.articles) || []).forEach(x => { if (hit(x.title) || hit(x.summary)) res.news.push(x); });
    res.questions = res.questions.slice(0, 40); res.lessons = res.lessons.slice(0, 40);
    return res;
  }

  /* ---------------- 其它 ---------------- */
  function lessonCount() { return allLessons().length; }
  function fmtDate(ts) { const d = new Date(ts); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }
  function ring(pct, label, sub) {
    const C = 2 * Math.PI * 84, off = C * (1 - pct / 100);
    return `<div class="ring"><svg viewBox="0 0 200 200" style="width:190px;height:190px;transform:rotate(-90deg)">
      <circle cx="100" cy="100" r="84" fill="none" stroke="#EDEFF2" stroke-width="18"/>
      <circle cx="100" cy="100" r="84" fill="none" stroke="#2A4FE4" stroke-width="18" stroke-linecap="round"
        stroke-dasharray="${C.toFixed(0)}" stroke-dashoffset="${off.toFixed(0)}"/></svg>
      <div class="val"><b>${label}</b><span class="mut" style="font-size:12.5px">${sub || ''}</span></div></div>`;
  }

  return {
    D, LS, esc, $, q, toast, mount, blocks, ring, fmtDate,
    courses, courseById, allLessons, lessonById, lessonCount, questions, questionById, detailLessons, detailedFor,
    progress, notes, fav, wrong, exams, planDone, searchAll, money,
    figure, figureHtml, videos, videosFor, videoLink
  };
})();
