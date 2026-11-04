/* Từ vựng N2: danh sách bài, flashcard và trắc nghiệm.
   Route theo hash: #/ (danh sách) · #/3 (bài 3) · #/3/flash · #/3/quiz */
(function () {
  'use strict';
  var DATA = '../data/n2/';
  var MEDIA = '../assets/n2/media/';
  var app = document.getElementById('app');
  var cache = {};
  var index = null;

  /* ---------- tiện ích ---------- */
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function ruby(s) {
    return esc(s).replace(/\{([^|}]*)\|([^}]*)\}/g, '<ruby>$1<rt>$2</rt></ruby>');
  }
  function plain(s) { return String(s || '').replace(/\{([^|}]*)\|[^}]*\}/g, '$1'); }
  function hasKanji(s) { return /[㐀-鿿]/.test(plain(s)); }
  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function store(key, def) { try { var v = localStorage.getItem(key); return v ? JSON.parse(v) : def; } catch (e) { return def; } }
  function save(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* bỏ qua */ } }
  function getJSON(url) {
    if (cache[url]) return Promise.resolve(cache[url]);
    return fetch(url).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }).then(function (d) { cache[url] = d; return d; });
  }
  var known = store('n2_known', {});          // { id: true }
  function isKnown(id) { return !!known[id]; }
  function setKnown(id, v) { if (v) known[id] = true; else delete known[id]; save('n2_known', known); }

  /* ---------- âm thanh: file thật, lỗi thì dùng giọng đọc của trình duyệt ---------- */
  var current = null;
  function speak(text) {
    if (!('speechSynthesis' in window) || !text) return;
    window.speechSynthesis.cancel();
    var u = new SpeechSynthesisUtterance(text);
    u.lang = 'ja-JP'; u.rate = 0.9;
    window.speechSynthesis.speak(u);
  }
  function play(file, fallbackText) {
    if (current) { current.pause(); current = null; }
    if (!file) return speak(fallbackText);
    var a = new Audio(MEDIA + file);
    current = a;
    a.onerror = function () { speak(fallbackText); };
    a.play().catch(function () { speak(fallbackText); });
  }
  window.n2Play = function (id, kind) {
    var w = window.n2Words && window.n2Words[id];
    if (!w) return;
    if (kind === 'ex') play(w.exampleAudio, plain(w.example));
    else play(w.audio, w.reading || plain(w.word));
  };
  function remember(words) { window.n2Words = window.n2Words || {}; words.forEach(function (w) { window.n2Words[w.id] = w; }); }
  function spk(id, kind) { return '<button class="spk" type="button" title="Nghe" onclick="event.stopPropagation();n2Play(\'' + id + '\',\'' + (kind || 'w') + '\')">🔊</button>'; }

  /* ---------- trang: danh sách bài ---------- */
  function viewList() {
    document.title = 'Từ vựng N2 - IMEJI日本語教室';
    var html = '<div class="n2-top"><a class="n2-btn ghost" href="../index.html">🏠 Trang chủ</a><h1>📕 Từ vựng N2 <span class="n2-sub">(' + index.total + ' từ)</span></h1></div>' +
      '<div class="n2-grid">';
    index.lessons.forEach(function (l) {
      var best = store('n2_best_' + l.no, null);
      html += '<a class="n2-panel n2-lesson" href="#/' + l.no + '"><span><span class="n2-badge' + (best && best.pct === 100 ? ' done' : '') + '">Bài ' + l.no + '</span></span>' +
        '<b class="jp">' + esc(l.sample.slice(0, 3).join('・')) + '…</b>' +
        '<small>Từ ' + l.from + '–' + l.to + ' · ' + l.count + ' từ</small>' +
        '<small data-prog="' + l.no + '"></small>' +
        '<div class="n2-bar"><i style="width:0%" data-bar="' + l.no + '"></i></div></a>';
    });
    app.innerHTML = html + '</div>';
    // tiến độ "đã nhớ" tính từ id: n2_NNNN, bài k gồm id từ from..to
    index.lessons.forEach(function (l) {
      var n = 0;
      for (var i = l.from; i <= l.to; i++) if (known['n2_' + ('000' + i).slice(-4)]) n++;
      app.querySelector('[data-prog="' + l.no + '"]').textContent = 'Đã nhớ ' + n + '/' + l.count;
      app.querySelector('[data-bar="' + l.no + '"]').style.width = Math.round(n / l.count * 100) + '%';
    });
  }

  /* ---------- trang: menu một bài ---------- */
  function viewLesson(no) {
    return getJSON(DATA + ('0' + no).slice(-2) + '.json').then(function (d) {
      remember(d.words);
      document.title = 'Từ vựng N2 – Bài ' + no;
      var n = d.words.filter(function (w) { return isKnown(w.id); }).length;
      var best = store('n2_best_' + no, null);
      var html = '<div class="n2-top"><a class="n2-btn ghost" href="#/">← Danh sách</a><h1>Bài ' + no + ' <span class="n2-sub">· ' + d.words.length + ' từ</span></h1></div>' +
        '<div class="n2-panel" style="margin-bottom:14px"><div class="n2-sub">Đã nhớ ' + n + '/' + d.words.length + (best ? ' · Điểm trắc nghiệm cao nhất: ' + best.score + '/' + best.total : '') + '</div>' +
        '<div class="n2-bar" style="margin:8px 0 14px"><i style="width:' + Math.round(n / d.words.length * 100) + '%"></i></div>' +
        '<div class="n2-row"><a class="n2-btn" href="#/' + no + '/flash">🃏 Flashcard</a><a class="n2-btn" href="#/' + no + '/quiz">📝 Trắc nghiệm</a></div></div>' +
        '<div class="n2-panel"><b>Danh sách từ</b><div style="margin-top:8px">';
      d.words.forEach(function (w) {
        html += '<div style="display:flex;gap:10px;align-items:center;padding:8px 0;border-top:1px solid var(--line)">' +
          '<span class="jp" style="font-size:20px;min-width:0;flex:1.2">' + ruby(w.word) + '</span>' +
          '<span style="flex:1.4;min-width:0">' + esc(w.meaning) + '</span>' + spk(w.id) +
          (isKnown(w.id) ? '<span title="Đã nhớ">✅</span>' : '') + '</div>';
      });
      app.innerHTML = html + '</div></div>';
    });
  }

  /* ---------- flashcard ---------- */
  function viewFlash(no) {
    return getJSON(DATA + ('0' + no).slice(-2) + '.json').then(function (d) {
      remember(d.words);
      document.title = 'Flashcard N2 – Bài ' + no;
      var st = { deck: d.words.slice(), i: 0, flip: false, onlyNew: false, rev: false, shuffled: false };

      function rebuild() {
        var base = d.words.slice();
        if (st.shuffled) base = shuffle(base);
        st.deck = st.onlyNew ? base.filter(function (w) { return !isKnown(w.id); }) : base;
        st.i = 0; st.flip = false;
      }
      function render() {
        var n = st.deck.length;
        var head = '<div class="n2-top"><a class="n2-btn ghost" href="#/' + no + '">← Bài ' + no + '</a><h1>🃏 Flashcard</h1></div>' +
          '<div class="n2-row" style="margin-bottom:12px">' +
          '<button class="n2-btn ghost" data-a="new">' + (st.onlyNew ? '✔ Chỉ thẻ chưa nhớ' : 'Chỉ thẻ chưa nhớ') + '</button>' +
          '<button class="n2-btn ghost" data-a="rev">' + (st.rev ? '↔ Việt → Nhật' : '↔ Nhật → Việt') + '</button>' +
          '<button class="n2-btn ghost" data-a="shuf">' + (st.shuffled ? '🔀 Đang xáo' : '🔀 Xáo thẻ') + '</button></div>';
        if (!n) {
          app.innerHTML = head + '<div class="n2-panel" style="text-align:center"><div style="font-size:48px">🎉</div><b>Bạn đã nhớ hết các từ trong bài này!</b><div class="n2-row" style="margin-top:14px"><button class="n2-btn" data-a="all">Học lại cả bài</button><a class="n2-btn ghost" href="#/' + no + '/quiz">Làm trắc nghiệm</a></div></div>';
          return bind();
        }
        var w = st.deck[st.i];
        var front, back;
        var backInfo = '<div class="fc-mean">' + esc(w.meaning) + '</div><div class="fc-read jp">' + esc(w.reading) + '</div>' +
          (w.pos ? '<span class="n2-badge">' + esc(w.pos) + '</span>' : '') +
          (w.image ? '<img class="fc-img" src="' + MEDIA + esc(w.image) + '" alt="" onerror="this.style.display=\'none\'">' : '') +
          (w.example ? '<div class="fc-ex jp"><div style="display:flex;gap:8px;align-items:center;justify-content:center"><span>' + ruby(w.example) + '</span>' + spk(w.id, 'ex') + '</div><div class="n2-sub" style="margin-top:2px">' + esc(w.exampleMeaning) + '</div></div>' : '') +
          (w.note ? '<div class="fc-note">' + esc(w.note) + '</div>' : '');
        if (!st.rev) {
          front = '<div class="fc-big jp">' + ruby(w.word) + '</div>' + spk(w.id) + '<div class="fc-hint">Chạm để lật thẻ</div>';
          back = '<div class="fc-big jp" style="font-size:30px">' + ruby(w.word) + '</div>' + backInfo;
        } else {
          front = '<div class="fc-mean" style="font-size:28px">' + esc(w.meaning) + '</div>' + (w.pos ? '<span class="n2-badge">' + esc(w.pos) + '</span>' : '') + '<div class="fc-hint">Chạm để lật thẻ</div>';
          back = '<div class="fc-big jp">' + ruby(w.word) + '</div><div style="display:flex;gap:8px;align-items:center"><span class="fc-read jp">' + esc(w.reading) + '</span>' + spk(w.id) + '</div>' +
            (w.image ? '<img class="fc-img" src="' + MEDIA + esc(w.image) + '" alt="" onerror="this.style.display=\'none\'">' : '') +
            (w.example ? '<div class="fc-ex jp">' + ruby(w.example) + ' ' + spk(w.id, 'ex') + '<div class="n2-sub">' + esc(w.exampleMeaning) + '</div></div>' : '') +
            (w.note ? '<div class="fc-note">' + esc(w.note) + '</div>' : '');
        }
        app.innerHTML = head +
          '<div class="n2-row" style="margin-bottom:8px"><span class="n2-sub" style="flex:none">Thẻ ' + (st.i + 1) + '/' + n + (isKnown(w.id) ? ' · ✅ đã nhớ' : '') + '</span>' +
          '<div class="n2-bar" style="align-self:center"><i style="width:' + Math.round((st.i + 1) / n * 100) + '%"></i></div></div>' +
          '<div class="fc-scene"><div class="fc-card' + (st.flip ? ' flip' : '') + '" id="fc"><div class="fc-face">' + front + '</div><div class="fc-face fc-back">' + back + '</div></div></div>' +
          '<div class="n2-row" style="margin-top:14px"><button class="n2-btn ghost" data-a="prev"' + (st.i === 0 ? ' disabled' : '') + '>← Trước</button>' +
          '<button class="n2-btn bad" data-a="no">✗ Chưa nhớ</button><button class="n2-btn ok" data-a="yes">✓ Đã nhớ</button>' +
          '<button class="n2-btn ghost" data-a="next"' + (st.i >= n - 1 ? ' disabled' : '') + '>Sau →</button></div>' +
          '<div class="n2-sub" style="text-align:center;margin-top:10px">Phím tắt: Space lật · ← → chuyển · 1 chưa nhớ · 2 đã nhớ · S phát âm</div>';
        bind();
        if (!st.flip && !st.rev && window.__n2auto) play(w.audio, w.reading);
      }
      function advance() { if (st.i < st.deck.length - 1) { st.i++; st.flip = false; render(); } else { st.i = st.deck.length; finish(); } }
      function finish() {
        var left = d.words.filter(function (w) { return !isKnown(w.id); }).length;
        app.innerHTML = '<div class="n2-top"><a class="n2-btn ghost" href="#/' + no + '">← Bài ' + no + '</a><h1>🃏 Flashcard</h1></div>' +
          '<div class="n2-panel" style="text-align:center"><div style="font-size:48px">' + (left ? '💪' : '🎉') + '</div><b>Hết lượt!</b><p class="n2-sub">Còn ' + left + ' từ chưa nhớ.</p>' +
          '<div class="n2-row">' + (left ? '<button class="n2-btn" data-a="again">Ôn các thẻ chưa nhớ</button>' : '') + '<button class="n2-btn ghost" data-a="all">Học lại cả bài</button><a class="n2-btn ghost" href="#/' + no + '/quiz">📝 Trắc nghiệm</a></div></div>';
        bind();
      }
      function act(a) {
        var w = st.deck[st.i];
        if (a === 'flip') { st.flip = !st.flip; var el = document.getElementById('fc'); if (el) el.classList.toggle('flip', st.flip); return; }
        if (a === 'next') { if (st.i < st.deck.length - 1) { st.i++; st.flip = false; render(); } }
        else if (a === 'prev') { if (st.i > 0) { st.i--; st.flip = false; render(); } }
        else if (a === 'yes') { setKnown(w.id, true); advance(); }
        else if (a === 'no') { setKnown(w.id, false); advance(); }
        else if (a === 'new') { st.onlyNew = !st.onlyNew; rebuild(); render(); }
        else if (a === 'rev') { st.rev = !st.rev; st.flip = false; render(); }
        else if (a === 'shuf') { st.shuffled = !st.shuffled; rebuild(); render(); }
        else if (a === 'again') { st.onlyNew = true; rebuild(); render(); }
        else if (a === 'all') { st.onlyNew = false; rebuild(); render(); }
        else if (a === 'speak') { play(w.audio, w.reading); }
      }
      function bind() {
        app.querySelectorAll('[data-a]').forEach(function (b) { b.onclick = function () { act(b.getAttribute('data-a')); }; });
        var fc = document.getElementById('fc');
        if (fc) fc.onclick = function () { act('flip'); };
      }
      window.n2Key = function (e) {
        var k = e.key;
        if (k === ' ') { e.preventDefault(); act('flip'); }
        else if (k === 'ArrowRight') act('next');
        else if (k === 'ArrowLeft') act('prev');
        else if (k === '1') act('no');
        else if (k === '2') act('yes');
        else if (k === 's' || k === 'S') act('speak');
      };
      rebuild(); render();
    });
  }

  /* ---------- trắc nghiệm ---------- */
  function buildQuestions(words) {
    function distractors(w, texts, keyFn, n) {
      var same = shuffle(words.filter(function (o) { return o.id !== w.id && o.pos === w.pos; }));
      var rest = shuffle(words.filter(function (o) { return o.id !== w.id && o.pos !== w.pos; }));
      var seen = {}; seen[keyFn(w)] = 1;
      var out = [];
      same.concat(rest).forEach(function (o) {
        var k = keyFn(o);
        if (out.length < n && !seen[k]) { seen[k] = 1; out.push(o); }
      });
      return out;
    }
    return shuffle(words).map(function (w) {
      var types = ['jp2vi', 'vi2jp'];
      if (hasKanji(w.word) && w.reading) types.push('reading');
      var t = types[Math.floor(Math.random() * types.length)];
      var q = { w: w, type: t };
      var opts;
      if (t === 'jp2vi') {
        q.prompt = '<div class="qz-q jp">' + ruby(w.word) + ' ' + spk(w.id) + '</div><div class="n2-sub" style="text-align:center">Chọn nghĩa đúng</div>';
        opts = [{ html: esc(w.meaning), ok: true }].concat(distractors(w, null, function (o) { return o.meaning; }, 3).map(function (o) { return { html: esc(o.meaning) }; }));
      } else if (t === 'vi2jp') {
        q.prompt = '<div class="qz-q small">' + esc(w.meaning) + '</div><div class="n2-sub" style="text-align:center">Chọn từ tiếng Nhật đúng</div>';
        opts = [{ html: '<span class="jp">' + ruby(w.word) + '</span>', ok: true }].concat(distractors(w, null, function (o) { return plain(o.word); }, 3).map(function (o) { return { html: '<span class="jp">' + ruby(o.word) + '</span>' }; }));
      } else {
        q.prompt = '<div class="qz-q jp">' + esc(plain(w.word)) + ' ' + spk(w.id) + '</div><div class="n2-sub" style="text-align:center">Chọn cách đọc đúng</div>';
        opts = [{ html: '<span class="jp">' + esc(w.reading) + '</span>', ok: true }].concat(
          distractors(w, null, function (o) { return o.reading; }, 3).filter(function (o) { return o.reading; }).map(function (o) { return { html: '<span class="jp">' + esc(o.reading) + '</span>' }; }));
      }
      q.opts = shuffle(opts);
      return q;
    });
  }

  function viewQuiz(no) {
    return getJSON(DATA + ('0' + no).slice(-2) + '.json').then(function (d) {
      remember(d.words);
      document.title = 'Trắc nghiệm N2 – Bài ' + no;
      var qs, i, score, wrong, answered;

      function start(words) { qs = buildQuestions(words); i = 0; score = 0; wrong = []; answered = false; ask(); }
      function ask() {
        var q = qs[i];
        var html = '<div class="n2-top"><a class="n2-btn ghost" href="#/' + no + '">✕</a><h1>📝 Trắc nghiệm · Bài ' + no + '</h1><span class="n2-badge">⭐ ' + score + '</span></div>' +
          '<div class="n2-row" style="margin-bottom:10px"><span class="n2-sub" style="flex:none">Câu ' + (i + 1) + '/' + qs.length + '</span><div class="n2-bar" style="align-self:center"><i style="width:' + Math.round(i / qs.length * 100) + '%"></i></div></div>' +
          '<div class="n2-panel">' + q.prompt + '<div class="qz-opts">';
        q.opts.forEach(function (o, k) { html += '<button class="qz-opt" data-k="' + k + '">' + o.html + '</button>'; });
        html += '</div><div id="fb"></div></div>';
        app.innerHTML = html;
        answered = false;
        app.querySelectorAll('.qz-opt').forEach(function (b) { b.onclick = function () { pick(+b.getAttribute('data-k')); }; });
      }
      function pick(k) {
        if (answered) return;
        answered = true;
        var q = qs[i], good = !!q.opts[k].ok, w = q.w;
        app.querySelectorAll('.qz-opt').forEach(function (b, j) {
          b.disabled = true;
          if (q.opts[j].ok) b.classList.add('right');
          else if (j === k) b.classList.add('wrong');
        });
        if (good) score++; else wrong.push(w);
        document.getElementById('fb').innerHTML = '<div class="qz-fb ' + (good ? 'ok' : 'no') + ' jp">' + (good ? '✅ <b>Chính xác!</b>' : '❌ <b>Chưa đúng.</b>') +
          '<div><b>' + ruby(w.word) + '</b> (' + esc(w.reading) + ') — ' + esc(w.meaning) + '</div>' +
          (w.example ? '<div>' + ruby(w.example) + '<div class="n2-sub">' + esc(w.exampleMeaning) + '</div></div>' : '') + '</div>' +
          '<div class="n2-row" style="margin-top:12px"><button class="n2-btn" id="nx">' + (i < qs.length - 1 ? 'Câu tiếp →' : 'Xem kết quả') + '</button></div>';
        document.getElementById('nx').onclick = next;
        document.getElementById('nx').focus();
      }
      function next() { if (i < qs.length - 1) { i++; ask(); } else result(); }
      function result() {
        var total = qs.length, pct = Math.round(score / total * 100);
        if (total === d.words.length) {
          var b = store('n2_best_' + no, null);
          if (!b || score > b.score) save('n2_best_' + no, { score: score, total: total, pct: pct });
        }
        var html = '<div class="n2-top"><a class="n2-btn ghost" href="#/' + no + '">← Bài ' + no + '</a><h1>Kết quả</h1></div><div class="n2-panel">' +
          '<div class="res-score">' + score + '/' + total + '</div><p class="n2-sub" style="text-align:center">' + pct + '% · ' + (pct >= 90 ? 'Xuất sắc! 🎉' : pct >= 70 ? 'Khá tốt, cố thêm chút nữa 💪' : 'Cần ôn thêm, bạn làm được mà! 📚') + '</p>';
        if (wrong.length) {
          html += '<b>Các từ cần ôn (' + wrong.length + ')</b><ul class="res-list jp">';
          wrong.forEach(function (w) { html += '<li><b>' + ruby(w.word) + '</b> (' + esc(w.reading) + ') — ' + esc(w.meaning) + '</li>'; });
          html += '</ul>';
        }
        html += '<div class="n2-row" style="margin-top:16px">' + (wrong.length ? '<button class="n2-btn" id="rw">🎯 Ôn lại câu sai</button>' : '') +
          '<button class="n2-btn ghost" id="ra">🔄 Làm lại cả bài</button><a class="n2-btn ghost" href="#/' + no + '/flash">🃏 Flashcard</a></div></div>';
        app.innerHTML = html;
        var rw = document.getElementById('rw'), ra = document.getElementById('ra');
        var wr = wrong.slice();
        if (rw) rw.onclick = function () { start(wr.length >= 2 ? wr : d.words); };
        ra.onclick = function () { start(d.words); };
      }
      start(d.words);
    });
  }

  /* ---------- router ---------- */
  function route() {
    window.n2Key = null;
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    var m = (location.hash || '#/').replace(/^#\/?/, '').split('/').filter(Boolean);
    var p;
    if (!m.length) p = Promise.resolve(viewList());
    else if (m[1] === 'flash') p = viewFlash(+m[0]);
    else if (m[1] === 'quiz') p = viewQuiz(+m[0]);
    else p = viewLesson(+m[0]);
    p.then(function () { window.scrollTo(0, 0); }).catch(function (e) {
      app.innerHTML = '<div class="n2-panel"><b>Không tải được dữ liệu.</b><p class="n2-sub">Trang cần mở qua máy chủ HTTP (không mở trực tiếp bằng file://). Chi tiết: ' + esc(e.message) + '</p><a class="n2-btn" href="#/">Về danh sách</a></div>';
    });
  }
  document.addEventListener('keydown', function (e) { if (window.n2Key && !e.ctrlKey && !e.metaKey && !e.altKey) window.n2Key(e); });
  window.addEventListener('hashchange', route);
  getJSON(DATA + 'index.json').then(function (d) { index = d; route(); }).catch(function (e) {
    app.innerHTML = '<div class="n2-panel"><b>Không tải được data/n2/index.json.</b><p class="n2-sub">Hãy mở trang qua máy chủ HTTP. ' + esc(e.message) + '</p></div>';
  });
})();
