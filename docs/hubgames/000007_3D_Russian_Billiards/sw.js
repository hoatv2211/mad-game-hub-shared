const CACHE_NAME = 'rusbil-v0.0.0.4';
const cacheList = [
    'index.html',
    'config.js',
    'js/Arch.js',
    'js/cannon.min.js',
    'js/device.min.js',
    'js/Hole.js',
    'js/main.js',
    'js/Table.js',
    'js/Ball.js',
    'js/CannonUtils.js',
    'js/EightBallGame.js',
    'js/jquery-3.1.1.min.js',
    'js/OBJLoader.js',
    'js/three.min.js',
    'js/bot.js',
    'js/controls.js',
    'js/Gui.js',
    'js/LongWall.js',
    'js/ShortWall.js',
    'js/WhiteBall.js',
    'img/arrow2.png',
    'img/arrow.png',
    'img/bill_power_full.png',
    'img/bill_power.png',
    'img/bot.png',
    'img/change.png',
    'img/exit.png',
    'img/forballs2.png',
    'img/forballs.png',
    'img/fullscreen.png',
    'img/_hand.png',
    'img/hand.png',
    'img/hitline.png',
    'img/line.png',
    'img/logo_pool.png',
    'img/mode.png',
    'img/player.png',
    'img/Redx2.svg',
    'img/redx.png',
    'img/restart.png',
    'img/round2.png',
    'img/_round.png',
    'img/round.png',
    'img/rusbil_logo.png',
    'img/sound.png',
    'img/up-down.png',
    'img/vs.png',
    'img/Winner.png',
    'img/Zoom.png',
    'img/pool8.png',
    'data/ball.obj',
    'data/Bil_lights.png',
    'data/Cue.jpg',
    'data/cue.obj',
    'data/rusbill.obj',
    'Sounds/ball01s.mp3',
    'Sounds/ball03s.mp3',
    'Sounds/ball.mp3',
    'Sounds/board02.mp3',
    'Sounds/dropcue07.mp3',
    'Sounds/dropcue09.mp3',
    'Sounds/Ending_aplodisments.mp3',
    'Sounds/hitcue06.mp3',
    'Sounds/ball02s.mp3',
    'Sounds/ballball.mp3',
    'Sounds/board01.mp3',
    'Sounds/board03.mp3',
    'Sounds/dropcue08.mp3',
    'Sounds/dropcue10.mp3',
    'Sounds/hitcue05.mp3',
    'css/style.css',
    'css/DINPro.eot',
    'css/DINPro.otf',
    'css/DINPro.svg',
    'css/DINPro.ttf',
    'css/DINPro.woff',


];

this.addEventListener('install', function (event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(cacheList);
        })
    );
});

const CACHE_PREFIX = 'rusbil';

this.addEventListener('activate', function (event) {
    event.waitUntil(
        caches.keys().then(keyList => {
            return Promise.all(keyList.map(key => {
                if (key.indexOf(CACHE_PREFIX) === 0 && key !== CACHE_NAME) {
                    return caches.delete(key);
                }
            }));
        })
    );
});

this.addEventListener('fetch', function (event) {
    event.respondWith(
        caches.match(event.request).then(function (response) {
            return response || fetch(event.request);
        })
    );
});

this.addEventListener('fetch', function (event) {
    if (
        event.request.method !== 'GET' ||
        event.request.url.indexOf('http://') === 0
    ) {
        return;
    }

    event.respondWith(
        caches.match(event.request).then(function (response) {
            return response || fetch(event.request);
        })
    );
});