// Game "Bắt chữ": các chữ kana chạy khắp bảng, bấm vào chữ để xem phiên âm.
// Dùng chung cho mọi bài có học hiragana/katakana. Nội dung lấy từ data/kana-sets.json (xem games/kana-hunter.html).
(function () {
  const TONES = ['kh-tile--1', 'kh-tile--2', 'kh-tile--3', 'kh-tile--4', 'kh-tile--5'];
  const REVEAL_MS = 900;
  const MOVE_MS = 420;

  function rand(min, max) { return Math.random() * (max - min) + min; }

  // Gắn game vào `board` với danh sách [chữ, phiên âm]. Trả về hàm điều khiển.
  function mount(board, pairs) {
    let timer = null;

    function place(el) {
      el.style.left = rand(2, 84) + '%';
      el.style.top = rand(2, 82) + '%';
    }

    function create() {
      stop();
      board.textContent = '';
      pairs.forEach(([kana, romaji], idx) => {
        const el = document.createElement('button');
        el.type = 'button';
        el.className = 'kh-tile ' + TONES[idx % TONES.length];
        el.textContent = kana;
        el.setAttribute('aria-label', kana + ' – bấm để xem phiên âm');
        place(el);
        el.style.transform = 'rotate(' + rand(-8, 8) + 'deg)';
        el.addEventListener('click', () => reveal(el, kana, romaji));
        board.appendChild(el);
      });
    }

    function reveal(el, kana, romaji) {
      if (el.dataset.showing === '1') return;
      el.dataset.showing = '1';
      el.textContent = romaji;
      el.classList.add('kh-tile--revealed');
      setTimeout(() => {
        el.textContent = kana;
        el.classList.remove('kh-tile--revealed');
        el.dataset.showing = '0';
      }, REVEAL_MS);
    }

    function shuffle() {
      for (const el of board.children) {
        place(el);
        el.style.transform = 'rotate(' + rand(-12, 12) + 'deg) scale(' + rand(0.9, 1.15) + ')';
      }
    }

    function start() {
      stop();
      timer = setInterval(shuffle, MOVE_MS);
      shuffle();
    }

    function stop() {
      if (timer) clearInterval(timer);
      timer = null;
    }

    create();
    return { start, stop, reset: create };
  }

  window.KanaHunter = { mount };
})();
