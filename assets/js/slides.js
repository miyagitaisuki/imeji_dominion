// Bộ điều khiển deck slide bài giảng (dùng với assets/css/slides.css). Không phụ thuộc thư viện.
// Trang deck chỉ cần: <body class="deck" data-lesson="22" data-title="..." data-game="../../minna/22.html"> chứa các <section class="slide">.
// Phím: → Space Enter PageDown = tiếp (hiện dần ý .s-reveal trước), ← Backspace PageUp = lùi, Home/End, F = toàn màn hình.
// Cảm ứng: vuốt trái/phải. Địa chỉ #3 mở thẳng slide 3. Quy ước: docs/quy-uoc-slide-bai-giang.md
(function () {
  var body = document.body;
  var slides = Array.prototype.slice.call(document.querySelectorAll('.slide'));
  if (!slides.length) return;

  var EMBEDDED = (function () { try { return window.self !== window.top; } catch (e) { return true; } })();
  var title = body.dataset.title || document.title;
  document.title = title + ' | Slide IMEJI日本語教室';

  // {漢字|よみ} -> ruby (cùng quy ước furigana với data/minna/NN.json)
  var FURI = /\{([^|{}]+)\|([^{}]+)\}/g;
  var HAS_FURI = /\{[^|{}]+\|[^{}]+\}/; // không dùng cờ g: .test() với g nhớ vị trí và bỏ sót
  function esc(t) { return t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  slides.forEach(function (s) {
    var walker = document.createTreeWalker(s, NodeFilter.SHOW_TEXT, null);
    var nodes = [], n;
    while ((n = walker.nextNode())) if (HAS_FURI.test(n.data)) nodes.push(n);
    nodes.forEach(function (node) {
      var span = document.createElement('span');
      span.innerHTML = esc(node.data).replace(FURI, '<ruby>$1<rt>$2</rt></ruby>');
      node.parentNode.replaceChild(span, node);
    });
  });

  // Khung điều khiển
  var gameHref = body.dataset.game;
  var top = document.createElement('div');
  top.className = 'deck-top';
  top.innerHTML =
    '<a class="deck-brand" href="' + (EMBEDDED ? '#' : '../../index.html') + '" aria-label="Về danh sách bài">' +
      '<img src="../../assets/img/logo.png" alt="" width="36" height="36">' +
      '<span><b>IMEJI日本語教室</b><small></small></span></a>' +
    '<div class="deck-actions">' +
      (gameHref ? '<a class="deck-btn deck-btn--primary" href="' + gameHref + '"><i data-icon="gamepad-2" class="w-4 h-4"></i><span class="deck-btn__text">Game học tập</span></a>' : '') +
      '<button type="button" class="deck-btn" id="deckFs" aria-label="Toàn màn hình"><i data-icon="maximize" class="w-4 h-4"></i></button>' +
    '</div>';
  top.querySelector('small').textContent = title;
  var bottom = document.createElement('div');
  bottom.className = 'deck-bottom';
  bottom.innerHTML =
    '<button type="button" class="deck-btn" id="deckPrev" aria-label="Slide trước"><i data-icon="chevron-left" class="w-5 h-5"></i></button>' +
    '<div class="deck-progress" aria-hidden="true"><i></i></div>' +
    '<span class="deck-count" id="deckCount" aria-live="polite"></span>' +
    '<button type="button" class="deck-btn deck-btn--primary" id="deckNext" aria-label="Slide tiếp"><i data-icon="chevron-right" class="w-5 h-5"></i></button>';
  var stage = document.createElement('div');
  stage.className = 'deck-stage';
  slides.forEach(function (s, i) {
    s.hidden = true;
    s.setAttribute('role', 'group');
    s.setAttribute('aria-roledescription', 'slide');
    s.setAttribute('aria-label', (i + 1) + ' / ' + slides.length);
    stage.appendChild(s);
  });
  body.appendChild(top); body.appendChild(stage); body.appendChild(bottom);

  var prevBtn = document.getElementById('deckPrev');
  var nextBtn = document.getElementById('deckNext');
  var count = document.getElementById('deckCount');
  var bar = bottom.querySelector('.deck-progress i');
  var cur = -1;

  function reveals(s) { return s.querySelectorAll('.s-reveal'); }
  function setShown(s, all) { reveals(s).forEach(function (el) { el.classList.toggle('is-shown', all); }); }
  function pending(s) { return s.querySelector('.s-reveal:not(.is-shown)'); }

  function show(i, revealAll) {
    i = Math.max(0, Math.min(slides.length - 1, i));
    if (i === cur) return;
    if (cur >= 0) { slides[cur].hidden = true; slides[cur].classList.remove('is-active'); }
    cur = i;
    var s = slides[cur];
    setShown(s, !!revealAll);
    s.hidden = false; s.scrollTop = 0; s.classList.add('is-active');
    var dark = s.classList.contains('slide--title') || s.classList.contains('slide--end');
    body.classList.toggle('is-dark', dark);
    slides.forEach(function (x) { x.classList.toggle('is-dark-slide', dark && x === s); });
    count.textContent = (cur + 1) + ' / ' + slides.length;
    bar.style.width = ((cur + 1) / slides.length * 100) + '%';
    prevBtn.disabled = cur === 0;
    nextBtn.disabled = cur === slides.length - 1 && !pending(s);
    try { history.replaceState(null, '', '#' + (cur + 1)); } catch (e) {}
  }
  function next() {
    var p = pending(slides[cur]);
    if (p) { p.classList.add('is-shown'); nextBtn.disabled = cur === slides.length - 1 && !pending(slides[cur]); return; }
    show(cur + 1);
  }
  function prev() { show(cur - 1, true); }

  prevBtn.addEventListener('click', prev);
  nextBtn.addEventListener('click', next);
  document.addEventListener('keydown', function (e) {
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    var onControl = e.target && e.target.closest && e.target.closest('a,button');
    var k = e.key;
    if (k === 'ArrowRight' || k === 'PageDown' || ((k === ' ' || k === 'Enter') && !onControl)) { e.preventDefault(); next(); }
    else if (k === 'ArrowLeft' || k === 'PageUp' || k === 'Backspace') { e.preventDefault(); prev(); }
    else if (k === 'Home') { e.preventDefault(); show(0); }
    else if (k === 'End') { e.preventDefault(); show(slides.length - 1, true); }
    else if (k === 'f' || k === 'F') toggleFs();
  });
  var sx = null, sy = null;
  stage.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
  stage.addEventListener('touchend', function (e) {
    if (sx == null) return;
    var dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
    sx = sy = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) (dx < 0 ? next : prev)();
  }, { passive: true });
  function toggleFs() {
    var d = document;
    if (d.fullscreenElement) d.exitFullscreen(); else if (d.documentElement.requestFullscreen) d.documentElement.requestFullscreen();
  }
  document.getElementById('deckFs').addEventListener('click', toggleFs);
  window.addEventListener('hashchange', function () { var n = parseInt(location.hash.slice(1), 10); if (n) show(n - 1, true); });
  window.addEventListener('beforeprint', function () { slides.forEach(function (s) { s.hidden = false; setShown(s, true); }); });
  window.addEventListener('afterprint', function () { slides.forEach(function (s, i) { s.hidden = i !== cur; }); });

  var start = parseInt(location.hash.slice(1), 10);
  show(start ? start - 1 : 0, !!start);
})();
