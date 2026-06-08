function setControls() {
    document.addEventListener('mousemove', function (event) {
        Game.mouseMove(event.clientX, event.clientY);
    });

    document.addEventListener('mousedown', function (event) {
        event.preventDefault();
        if (event.button === 0) {
            Game.mouseClick(event.clientX, event.clientY);
        }

    });

    document.addEventListener('mouseup', function (event) {
        event.preventDefault();
        if (event.button === 0) {
            Game.mouseUp(event.clientX, event.clientY);
        }

    });

    var pinch = false;

    var obj = document.getElementById('world');
    document.addEventListener('touchstart', function (event) {
        Game.mouseClick(event.changedTouches[0].clientX, event.changedTouches[0].clientY);
        if (Game.touchCount) {
            Game.touchStart2(event.changedTouches[0].clientX, event.changedTouches[0].clientY);
        } else {
            Game.touchStart(event.changedTouches[0].clientX, event.changedTouches[0].clientY);
        }

        Game.touchCount++;
        if (Game.touchCount > 1) {
            pinch = true;
        }

    }, false);

    document.addEventListener('touchend', function (event) {
        //console.log(event);
        Game.mouseUp(event.changedTouches[0].clientX, event.changedTouches[0].clientY);
        //Game.touchCount = 0;
        Game.touchCount--;
        Game.touchCount = Math.max(0, Game.touchCount);
        if (Game.touchCount == 0) {
            pinch = false;
        }
        console.log(Game.touchCount, pinch);

    }, false);

    document.addEventListener('touchmove', function (event) {
        //console.log(event);
        event.preventDefault();
        event.stopImmediatePropagation();
        let x = event.changedTouches[0].clientX;
        let y = event.changedTouches[0].clientY;
        Game.mouseMove(x, y);
        console.log(event.changedTouches.length, Game.touchCount);
        console.log(pinch);
        if (Game.touchCount === 1 && !pinch) {
            Game.toucheMove(x, y);
        } else {

            if (event.changedTouches.length == 2) {
                Game.onPinch(x, y, event.changedTouches[1].clientX, event.changedTouches[1].clientY);
            }
        }
        /*else {
                   if (event.changedTouches.length > 1) {
                       Game.touchStart(x, y);
                       Game.toucheMove2(event.changedTouches[1].clientX, event.changedTouches[1].clientY);
                   }

               }*/
        //console.log(event.changedTouches.length);
    }, { passive: false });


}