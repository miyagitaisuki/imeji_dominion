// Loads a lesson's data JSON, then starts the shared engine (engine.js).
// Usage: <script src="../assets/js/loader.js" data-lesson="../data/minna/21.json"></script>
(function () {
    const self = document.currentScript;
    const dataUrl = self.dataset.lesson;

    function showLoadError(err) {
        console.error('[lesson] Không tải được dữ liệu:', err);
        const banner = document.createElement('div');
        banner.className = 'fixed top-0 inset-x-0 z-50 bg-danger-600 text-white text-sm font-bold px-4 py-3 text-center';
        banner.textContent = 'Không tải được dữ liệu bài học. Hãy mở trang qua máy chủ local (xem README).';
        document.body.prepend(banner);
    }

    fetch(dataUrl)
        .then(function (res) {
            if (!res.ok) throw new Error('HTTP ' + res.status + ' ' + dataUrl);
            return res.json();
        })
        .then(function (data) {
            window.LESSON_CONFIG = data.config;
            window.GAME1_DATA = data.game1;
            window.GAME2_DATA = data.game2;
            window.GAME3_DATA = data.game3;
            window.GAME4_DATA = data.game4;

            const engine = document.createElement('script');
            engine.src = new URL('engine.js', self.src).href;
            document.body.appendChild(engine);
        })
        .catch(showLoadError);
})();
