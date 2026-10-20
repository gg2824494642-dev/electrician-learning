/* =============================================================
   电工学堂 · 站点核心脚本（v3 布局：左侧边栏导航）
   ============================================================= */
window.APP_DATA = window.APP_DATA || { courses: { courses: [] }, questions: { questions: [] } };

const App = (function () {
  const D = window.APP_DATA;
  const LS = {
    get(k, def) { try { const v = localStorage.getItem('ds_' + k); return v ? JSON.parse(v) : def; } catch (e) { return def; } },
    set(k, v) { try { localStorage.setItem('ds_' + k, JSON.stringify(v)); } catch (e) {} }
  };

  const esc = s => String(s == null ? '' : s).replace(/[&<>'"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const $ = sel => document.querySelector(sel);
  const q = name => new URLSearchParams(location.search).get(name);
  const money = n => n;
  function toast(msg) {
    let t = document.getElementById('globalToast');
    if (!t) { t = document.createElement('div'); t.id = 'globalToast'; t.className = 'toast'; document.body.appendChild(t); }
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
  const figure = key => figuresData()[key] || null;
  function figureHtml(key, caption) {
    const fig = figure(key);
    if (!fig) return '';
    if (/^\s*<(div|section)\b/.test(fig)) return fig + (caption ? `<div class="fc-note">${esc(caption)}</div>` : '');
    return `<figure class="fig">${fig}${caption ? `<figcaption>${esc(caption)}</figcaption>` : ''}</figure>`;
  }

  /* ---------------- 视频资源 ---------------- */
  const videos = () => (D.videos && D.videos.videos) || [];
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
  function videoLink(v) {
    const plat = v.platform === 'xiaohongshu' ? '小红书' : 'B 站';
    return `<a class="vlink" href="${v.url}" target="_blank" rel="noopener">
      <span class="vp">▶ 播放</span>
      <span class="vt">${esc(v.title)}</span>
      <span class="vm">${plat} · ${esc(v.author || '')}${v.level ? ' · ' + esc(v.level) : ''}</span></a>`;
  }

  /* ---------------- 导航配置 ---------------- */
  const MENU = [
    { key: 'home', label: '今日学习', icon: '🏠', href: 'index.html' },
    { key: 'course', label: '课程学习', icon: '📚', href: 'courses.html' },
    { key: 'lab', label: '实操仿真', icon: '⚡', href: 'lab.html' },
    { key: 'quiz', label: '考试刷题', icon: '✏️', href: 'quiz.html' },
    { key: 'mine', label: '我的', icon: '👤', href: 'mine.html' }
  ];
  const MENU_SUB = {
    mine: [
      ['70 天学习计划', 'plan.html'],
      ['资料下载', 'docs.html'],
      ['行业资讯', 'news.html'],
      ['考证专区', 'cert.html'],
      ['知识库', 'knowledge.html']
    ]
  };

  /* ---------------- 侧边栏导航 HTML ---------------- */
  function nav(active) {
    const navItems = MENU.map(m =>
      `<a href="${m.href}" class="nav-item ${m.key === active ? 'on' : ''}" data-nav-key="${m.key}">
        <span class="ni-ico">${m.icon}</span>${m.label}</a>`
    ).join('');
    const subItems = (MENU_SUB[active] || []).map(([t, h]) =>
      `<a href="${h}" class="nav-item" style="padding-left:38px;font-size:12.5px">${t}</a>`
    ).join('');
    return `<aside class="sidebar" id="sidebarNav">
      <div class="brand">
        <div class="logo">电</div>
        <div><div class="bt">电工学堂</div><div class="bs">E-LEARN · 公益免费</div></div>
      </div>
      <div class="nav-group-label">主导航</div>
      <nav class="nav">${navItems}</nav>
      ${subItems ? `<div class="nav-group-label">更多</div><nav class="nav">${subItems}</nav>` : ''}
      <div class="nav-group-label">全局工具</div>
      <nav class="nav">
        <a href="search.html" class="nav-item"><span class="ni-ico">🔍</span>元件百科</a>
        <a href="search.html" class="nav-item"><span class="ni-ico">🔎</span>全局搜索</a>
      </nav>
      <div class="side-foot">
        70 天计划 · 第 18/70 天<br>
        数据保存在本机浏览器
      </div>
    </aside>`;
  }

  /* ---------------- 移动端顶部导航 + 底部 Tab ---------------- */
  function mobileNav(active) {
    const tabItems = MENU.map(m =>
      `<div class="mtab ${m.key === active ? 'on' : ''}" onclick="location.href='${m.href}'">
        <div class="mt-ico">${m.icon}</div>${m.label}</div>`
    ).join('');
    const current = MENU.find(m => m.key === active);
    return `
    <div class="mobile-nav">
      <span class="mb-logo">⚡</span>
      <span class="mb-title">${current ? current.label : '电工学堂'}</span>
      <button class="mb-toggle" id="drawerToggle" aria-label="菜单">
        <span></span><span></span><span></span>
      </button>
    </div>
    <div class="mobile-tabbar">${tabItems}</div>
    <div class="mobile-drawer" id="mobileDrawer">
      <div class="md-panel">
        <div style="display:flex;align-items:center;gap:10px;padding-bottom:14px;border-bottom:1px solid var(--line);margin-bottom:10px">
          <div class="logo" style="width:36px;height:36px;border-radius:9px;background:linear-gradient(135deg,var(--blue),var(--blueL));color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800">电</div>
          <div><div style="font-weight:700;font-size:15px">电工学堂</div><div style="font-size:11px;color:var(--muted)">公益免费学习平台</div></div>
        </div>
        <div class="nav-group-label" style="padding-left:0">主导航</div>
        <nav class="nav">
          ${MENU.map(m => `<a href="${m.href}" class="nav-item ${m.key === active ? 'on' : ''}"><span class="ni-ico">${m.icon}</span>${m.label}</a>`).join('')}
        </nav>
        ${MENU_SUB.mine ? `<div class="nav-group-label" style="padding-left:0">更多</div><nav class="nav">${MENU_SUB.mine.map(([t, h]) => `<a href="${h}" class="nav-item" style="padding-left:38px;font-size:12.5px">${t}</a>`).join('')}</nav>` : ''}
      </div>
    </div>`;
  }

  function footer() {
    const col = (t, xs) => `<div><h4>${t}</h4><ul>${xs.map(x => `<li>${x}</li>`).join('')}</ul></div>`;
    return `<div class="wrap" style="max-width:1200px;margin:0 auto;padding:0 24px"><div class="cols">
        <div><h4 style="font-size:15px">电工学堂 / E-LEARN</h4>
          <p style="font-size:12px;line-height:1.9;color:#9AA0A8;margin-top:8px">纯公益、全站免费的电工学习资源站。<br>
          内容整理自《低压电工一站式学习手册》<br>与五套练习卷，仅供学习参考。</p></div>
        ${col('学习模块', ['<a href="courses.html">课程学习</a>', '<a href="lab.html">实操仿真</a>', '<a href="quiz.html">考试刷题</a>', '<a href="docs.html">资料下载</a>'])}
        ${col('考证与计划', ['<a href="cert.html">低压电工证专区</a>', '<a href="plan.html">70 天学习计划</a>', '<a href="quiz.html#exam">模拟考试</a>', '<a href="wrong.html">我的错题本</a>'])}
        ${col('关于本站', ['本站为个人学习整理，非官方站点', '考试政策以当地应急管理部门为准', '内容纠错：issue 反馈', '免责声明'])}
      </div>
      <div class="btm"><span>© 2026 电工学堂 · 公益免费学习平台</span>
      <span style="margin-left:auto">本站资料仅供学习参考，正式考试请以官方要求为准</span></div></div>`;
  }

  /* ---------------- 页面挂载：动态调整布局 ---------------- */
  function mount(active) {
    // 1. 注入侧边栏导航
    const n = document.getElementById('nav');
    if (n) n.innerHTML = nav(active);

    // 2. 注入移动端导航
    const mobileNavHolder = document.createElement('div');
    mobileNavHolder.innerHTML = mobileNav(active);
    document.body.insertBefore(mobileNavHolder, document.body.firstChild);

    // 3. 包裹主内容区（把 #main 和 #footer 包进 .main-area）
    const mainArea = document.createElement('div');
    mainArea.className = 'main-area';
    const main = document.getElementById('main');
    const footer = document.getElementById('footer');
    if (main) {
      mainArea.appendChild(main);
      main.classList.add('content');
      if (footer) mainArea.appendChild(footer);
      document.body.appendChild(mainArea);
    }

    // 4. body 加上 .layout 类
    document.body.classList.add('layout');

    // 5. 页脚样式
    const f = document.getElementById('footer');
    if (f) { f.className = 'footer'; f.innerHTML = footer(); }

    // 6. 移动端抽屉事件
    const drawerToggle = document.getElementById('drawerToggle');
    const drawer = document.getElementById('mobileDrawer');
    if (drawerToggle && drawer) {
      drawerToggle.addEventListener('click', () => {
        drawer.classList.add('open');
      });
      drawer.addEventListener('click', e => {
        if (e.target === drawer) drawer.classList.remove('open');
      });
    }

    // 7. 搜索框回车跳转
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && drawer) drawer.classList.remove('open');
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
        case 'note': return `<div class="callout note"><span class="lb">说明</span>${esc(b.text)}</div>`;
        case 'tip': return `<div class="callout tip"><span class="lb">${esc(b.title || '记忆口诀 / 考点提示')}</span>${esc(b.text)}</div>`;
        case 'warn': return `<div class="callout warn"><span class="lb">${esc(b.title || '安全提醒')}</span>${esc(b.text)}</div>`;
        case 'example': return `<div class="example"><div class="t">${esc(b.title || '例题')}</div>
            <p>${esc(b.text)}</p>${(b.steps || []).length ? `<ol>${b.steps.map(s => `<li>${esc(s)}</li>`).join('')}</ol>` : ''}
            ${b.answer ? `<div class="ans" style="color:var(--blue);font-weight:700;margin-top:8px">答案：${esc(b.answer)}</div>` : ''}</div>`;
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
    return `<div class="ring"><svg viewBox="0 0 200 200" style="width:120px;height:120px;transform:rotate(-90deg)">
      <circle cx="100" cy="100" r="84" fill="none" stroke="#EDF1F6" stroke-width="18"/>
      <circle cx="100" cy="100" r="84" fill="none" stroke="#2B6CB0" stroke-width="18" stroke-linecap="round"
        stroke-dasharray="${C.toFixed(0)}" stroke-dashoffset="${off.toFixed(0)}"/></svg>
      <div class="val"><b>${label}</b><span>${sub || ''}</span></div></div>`;
  }

  return {
    D, LS, esc, $, q, toast, mount, blocks, ring, fmtDate,
    courses, courseById, allLessons, lessonById, lessonCount, questions, questionById, detailLessons, detailedFor,
    progress, notes, fav, wrong, exams, planDone, searchAll, money,
    figure, figureHtml, videos, videosFor, videoLink
  };
})();