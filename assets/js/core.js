/* =============================================================
   电工学堂 · 站点核心脚本（v3 布局：左侧边栏导航 · 修复版）
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
  function sidebarHtml(active) {
    const navItems = MENU.map(m =>
      `<a href="${m.href}" class="nav-item ${m.key === active ? 'on' : ''}" data-nav-key="${m.key}">
        <span class="ni-ico">${m.icon}</span>${m.label}</a>`
    ).join('');
    const subItems = (MENU_SUB[active] || []).map(([t, h]) =>
      `<a href="${h}" class="nav-item nav-sub">${t}</a>`
    ).join('');
    return `
      <aside class="sidebar" id="sidebarNav">
        <div class="brand">
          <div class="brand-logo">电</div>
          <div class="brand-text">
            <div class="brand-name">电工学堂</div>
            <div class="brand-tag">E-LEARN · 公益免费</div>
          </div>
        </div>
        <div class="nav-group-label">主导航</div>
        <nav class="nav-list">${navItems}</nav>
        ${subItems ? `<div class="nav-group-label">更多</div><nav class="nav-list">${subItems}</nav>` : ''}
        <div class="nav-group-label">全局工具</div>
        <nav class="nav-list">
          <a href="search.html" class="nav-item"><span class="ni-ico">🔍</span>元件百科</a>
          <a href="search.html" class="nav-item"><span class="ni-ico">🔎</span>全局搜索</a>
        </nav>
        <div class="sidebar-foot">
          70 天计划 · 第 18/70 天<br>
          数据保存在本机浏览器
        </div>
      </aside>
    `;
  }

  /* ---------------- 移动端导航 HTML ---------------- */
  function mobileNavHtml(active) {
    const tabItems = MENU.map(m =>
      `<a href="${m.href}" class="mtab ${m.key === active ? 'on' : ''}">
        <div class="mt-ico">${m.icon}</div>${m.label}</a>`
    ).join('');
    const current = MENU.find(m => m.key === active);
    return `
    <div class="mobile-topbar">
      <span class="mb-logo">⚡ 电工学堂</span>
      <span class="mb-title">${current ? current.label : ''}</span>
      <button class="mb-toggle" id="drawerToggle" aria-label="菜单">☰</button>
    </div>
    <div class="mobile-tabbar">${tabItems}</div>
    <div class="mobile-drawer" id="mobileDrawer">
      <div class="md-panel">
        <div class="md-brand">
          <div class="brand-logo">电</div>
          <div><div style="font-weight:700;font-size:15px">电工学堂</div><div style="font-size:11px;color:var(--muted)">公益免费学习平台</div></div>
        </div>
        <div class="nav-group-label">主导航</div>
        <nav class="nav-list">
          ${MENU.map(m => `<a href="${m.href}" class="nav-item ${m.key === active ? 'on' : ''}"><span class="ni-ico">${m.icon}</span>${m.label}</a>`).join('')}
        </nav>
        ${MENU_SUB.mine ? `<div class="nav-group-label">更多</div><nav class="nav-list">${MENU_SUB.mine.map(([t, h]) => `<a href="${h}" class="nav-item nav-sub">${t}</a>`).join('')}</nav>` : ''}
      </div>
    </div>`;
  }

  /* ---------------- 页脚 HTML ---------------- */
  function footerHtml() {
    return `<div style="text-align:center;padding:20px;font-size:12px;color:#9AA0A8">© 2026 电工学堂 · 公益免费学习平台 · 本站资料仅供学习参考</div>`;
  }

  /* ---------------- 页面挂载 ---------------- */
  function mount(active) {
    // 1. 往 #nav 里填充侧边栏导航
    const navHolder = document.getElementById('nav');
    if (navHolder) navHolder.innerHTML = sidebarHtml(active);

    // 2. 注入移动端导航（body 最前面）
    const mobileHolder = document.createElement('div');
    mobileHolder.id = 'mobileNavHolder';
    mobileHolder.innerHTML = mobileNavHtml(active);
    document.body.insertBefore(mobileHolder, document.body.firstChild);

    // 3. 给 body 加 class，控制内容区左边距
    document.body.classList.add('has-sidebar');

    // 4. 页脚
    const footerEl = document.getElementById('footer');
    if (footerEl) { footerEl.className = 'site-footer'; footerEl.innerHTML = footerHtml(); }

    // 5. 移动端抽屉事件
    const drawerToggle = document.getElementById('drawerToggle');
    const drawer = document.getElementById('mobileDrawer');
    if (drawerToggle && drawer) {
      drawerToggle.addEventListener('click', () => drawer.classList.add('open'));
      drawer.addEventListener('click', e => { if (e.target === drawer) drawer.classList.remove('open'); });
    }
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