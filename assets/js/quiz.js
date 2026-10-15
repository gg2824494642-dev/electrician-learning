/* =============================================================
   电工学堂 · 答题引擎（章节练习 / 随机刷题 / 模拟考试 / 错题重练）
   ============================================================= */
const Quiz = (function () {
  const TYPE = { single: '单选题', multi: '多选题', judge: '判断题' };
  const norm = a => String(a || '').toUpperCase().split('').filter(c => /[A-Z]/.test(c)).sort().join('');

  function mount(root, opt) {
    const qs = (opt.questions || []).slice();
    if (!qs.length) { root.innerHTML = `<div class="card empty">这里还没有题目。<br>请先在「题库系统」里选择要练习的内容。</div>`; return; }
    const st = {
      i: 0, answers: {}, marked: {}, revealed: {},
      exam: opt.mode === 'exam', minutes: opt.minutes || 60,
      left: (opt.minutes || 60) * 60, done: false, started: Date.now()
    };

    root.innerHTML = `
      <div style="display:flex;gap:26px;align-items:flex-start">
        <div style="flex:1;min-width:0">
          <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
            <span class="pill">${App.esc(opt.badge || '练习')}</span>
            <span class="mut small">${App.esc(opt.title || '')}</span>
            <span class="mut small" style="margin-left:auto" id="qCounter"></span>
            ${st.exam ? '<span class="pill y" id="qTimer">--:--</span>' : '<span class="pill k" id="qTimer">--:--</span>'}
          </div>
          <div class="progress" style="margin:14px 0 24px"><i id="qBar" style="width:0%"></i></div>
          <div class="card" style="padding:28px 32px" id="qCard"></div>
        </div>
        <div style="width:320px;flex:none">
          <div class="card pad">
            <div style="display:flex;align-items:center"><b style="font-size:15px">答题卡</b>
              <span class="mut small" style="margin-left:auto" id="qStat"></span></div>
            <div class="answer-grid" id="qGrid"></div>
            <div class="mut" style="font-size:11.5px;line-height:2;margin-top:14px">
              已答 / 当前 / 标记 ★ / 未答
            </div>
            <button class="btn p block" style="margin-top:14px" id="qSubmit">${st.exam ? '交卷并查看成绩' : '结束练习并查看结果'}</button>
            <div class="mut" style="font-size:12px;margin-top:10px;text-align:center" id="qFavInfo"></div>
          </div>
          ${st.exam ? '' : `<div class="sidebox" style="margin-top:16px">
            <h4>练习设置</h4>
            <div class="kv"><span>答错立即显示解析</span><span class="blue">开</span></div>
            <div class="kv"><span>错题自动进错题本</span><span class="blue">开</span></div>
            <div class="kv"><span>题目顺序</span><span>${opt.shuffle ? '随机' : '按章节'}</span></div>
          </div>`}
        </div>
      </div>`;

    const $ = s => root.querySelector(s);
    const card = $('#qCard'), grid = $('#qGrid');

    function fmtT(s) { const m = Math.floor(s / 60), x = s % 60; return `${String(m).padStart(2, '0')}:${String(x).padStart(2, '0')}`; }
    function tick() {
      if (st.done) return;
      const el = Date.now() - st.started;
      const spent = Math.floor(el / 1000);
      $('#qTimer').textContent = st.exam ? fmtT(Math.max(0, st.left - spent)) : fmtT(spent);
      if (st.exam && spent >= st.left) submit(true);
      requestAnimationFrame(() => setTimeout(tick, 1000));
    }
    tick();

    function drawGrid() {
      grid.innerHTML = qs.map((q, i) => {
        let cls = 'qno';
        if (st.marked[q.id]) cls += ' mk';
        if (st.answers[q.id]) cls += ' done';
        if (i === st.i) cls += ' cur';
        if (!st.exam && st.revealed[q.id]) cls = 'qno ' + (isRight(q) ? 'right' : 'wrong') + (i === st.i ? ' cur' : '');
        return `<div class="${cls}" data-go="${i}">${i + 1}</div>`;
      }).join('');
      const answered = Object.keys(st.answers).length;
      $('#qStat').textContent = `已答 ${answered} / ${qs.length}`;
      $('#qBar').style.width = (answered / qs.length * 100) + '%';
    }
    function isRight(q) { return norm(st.answers[q.id]) === norm(q.answer); }

    function draw() {
      const q = qs[st.i];
      const rev = !st.exam && st.revealed[q.id];
      const my = st.answers[q.id];
      const right = isRight(q);
      const opts = (q.options || []).map(o => {
        let cls = 'opt';
        if (my && norm(my).includes(o.k)) cls += ' on';
        if (rev) {
          if (norm(q.answer).includes(o.k)) cls = 'opt ok';
          else if (my && norm(my).includes(o.k)) cls = 'opt no';
          else cls = 'opt';
        }
        return `<div class="${cls}" data-k="${o.k}" data-locked="${rev ? 1 : 0}"><span class="k">${o.k}</span><span>${App.esc(o.t)}</span></div>`;
      }).join('');
      card.innerHTML = `
        <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
          <span class="pill">${TYPE[q.type] || '单选题'}</span>
          <span class="mut small">第 ${st.i + 1} / ${qs.length} 题</span>
          ${q.chapter ? `<span class="pill k">${App.esc(q.chapter)}</span>` : ''}
          <span class="mut small" style="margin-left:auto;cursor:pointer" data-mark="1">${st.marked[q.id] ? '★ 已标记' : '☆ 标记本题'}</span>
          <span class="mut small" style="cursor:pointer" data-fav="1">${App.fav.has(q.id) ? '♥ 已收藏' : '♡ 收藏'}</span>
        </div>
        <div style="font-size:18px;font-weight:700;line-height:1.75;margin:18px 0 22px">${App.esc(q.stem)}</div>
        <div id="qOpts">${opts}</div>
        <div id="qFeedback"></div>
        <div style="display:flex;gap:10px;margin-top:24px;align-items:center;flex-wrap:wrap">
          <button class="btn o" data-prev="1" ${st.i === 0 ? 'disabled' : ''}>上一题</button>
          <button class="btn o" data-next="1" ${st.i === qs.length - 1 ? 'disabled' : ''}>下一题</button>
          ${st.exam ? '' : `<button class="btn o" data-check="1" ${my ? '' : 'disabled'}>${rev ? '已显示解析' : '提交并看解析'}</button>`}
          <span class="mut small" style="margin-left:auto">${q.source ? '来源：' + App.esc(q.source) : ''}</span>
        </div>`;
      if (rev) feedback(q, right);
      drawGrid();
      $('#qFavInfo').textContent = `收藏题目 ${Object.keys(App.fav.all()).length} 道 · 错题本 ${App.wrong.ids().length} 道`;
    }

    function feedback(q, right) {
      const fb = $('#qFeedback'); if (!fb) return;
      fb.innerHTML = `
        <div class="callout ${right ? 'note' : 'warn'}" style="margin-top:6px">
          <span class="lb">${right ? '✅ 回答正确' : '❌ 回答错误'} ｜ 正确答案：${App.esc(q.answer)}${q.difficulty ? ' ｜ 难度：' + App.esc(q.difficulty) : ''}</span>
          ${q.analysis ? App.esc(q.analysis) : '（本题暂无解析）'}
        </div>`;
    }

    /* --------- 交互 --------- */
    root.addEventListener('click', e => {
      const t = e.target;
      const go = t.closest('[data-go]');
      if (go) { st.i = +go.dataset.go; draw(); return; }
      const op = t.closest('.opt');
      if (op) {
        const q = qs[st.i];
        if (!st.exam && st.revealed[q.id]) return;
        const k = op.dataset.k;
        if (!st.exam && (q.type === 'multi')) {
          const cur = norm(st.answers[q.id]) ? norm(st.answers[q.id]).split('') : [];
          const i = cur.indexOf(k); i >= 0 ? cur.splice(i, 1) : cur.push(k);
          st.answers[q.id] = cur.sort().join('');
          if (!st.answers[q.id]) delete st.answers[q.id];
        } else {
          st.answers[q.id] = k;
        }
        draw(); return;
      }
      if (t.closest('[data-prev]')) { if (st.i > 0) { st.i--; draw(); } return; }
      if (t.closest('[data-next]')) { if (st.i < qs.length - 1) { st.i++; draw(); } return; }
      if (t.closest('[data-mark]')) { const id = qs[st.i].id; st.marked[id] = !st.marked[id]; draw(); return; }
      if (t.closest('[data-fav]')) { const on = App.fav.toggle(qs[st.i].id); App.toast(on ? '已加入收藏' : '已取消收藏'); draw(); return; }
      if (t.closest('[data-check]')) {
        const q = qs[st.i];
        if (!st.answers[q.id]) { App.toast('先选一个答案'); return; }
        st.revealed[q.id] = 1;
        if (!isRight(q)) App.wrong.add(q.id, st.answers[q.id]);
        draw(); return;
      }
      if (t.closest('#qSubmit')) submit(false);
    });

    function submit(auto) {
      if (st.done) return;
      st.done = true;
      const detail = qs.map(q => ({ id: q.id, my: st.answers[q.id] || '', right: norm(st.answers[q.id]) === norm(q.answer), answer: q.answer, stem: q.stem, chapter: q.chapter }));
      const right = detail.filter(d => d.right).length;
      const score = Math.round(right / qs.length * 100);
      const rec = {
        id: 'e' + Date.now(), title: opt.title || '练习', exam: st.exam, score, right, total: qs.length,
        time: Date.now(), detail: detail.filter(d => !d.right).length ? detail : detail,
        wrongIds: detail.filter(d => !d.right).map(d => d.id)
      };
      detail.filter(d => !d.right).forEach(d => App.wrong.add(d.id, d.my));
      if (st.exam) { const id = App.exams.save(rec); location.href = 'result.html?id=' + id; return; }
      // 练习模式：页内结果
      const wrongList = detail.filter(d => !d.right);
      root.innerHTML = `<div class="card" style="padding:32px 36px">
        <div class="slash">/ practice result</div>
        <h2 class="display" style="font-size:30px;margin:10px 0 18px">本轮练习完成${auto ? '（超时自动交卷）' : ''}</h2>
        <div style="display:flex;gap:44px;flex-wrap:wrap">
          <div class="stat"><b>${right}/${qs.length}</b><span>答对题数</span></div>
          <div class="stat"><b>${score}%</b><span>正确率</span></div>
          <div class="stat"><b>${wrongList.length}</b><span>错题（已进错题本）</span></div>
        </div>
        <div style="display:flex;gap:12px;margin-top:26px;flex-wrap:wrap">
          <button class="btn p" id="againWrong" ${wrongList.length ? '' : 'disabled'}>重做本轮错题</button>
          <a class="btn o" href="wrong.html">查看错题本</a>
          <a class="btn o" href="quiz.html">返回题库</a>
        </div>
        ${wrongList.length ? `<div style="margin-top:30px"><b>错题清单</b>${wrongList.map((d, i) => `
          <div style="padding:14px 0;border-bottom:1px solid #F1F2F4">
            <div style="font-size:14.5px">${i + 1}. ${App.esc(d.stem)}</div>
            <div class="mut small" style="margin-top:6px">你的答案：<b style="color:#E5484D">${App.esc(d.my || '未作答')}</b>
            　正确答案：<b style="color:#16A34A">${App.esc(d.answer)}</b>　${d.chapter ? '｜ ' + App.esc(d.chapter) : ''}</div>
          </div>`).join('')}</div>` : ''}
      </div>`;
      const aw = root.querySelector('#againWrong');
      if (aw) aw.onclick = () => mount(root, Object.assign({}, opt, { questions: wrongList.map(d => App.questionById(d.id)).filter(Boolean) }));
    }

    draw();   // 首次渲染：没有这一句题目区会是空白
  }
  return { mount, norm, TYPE };
})();
