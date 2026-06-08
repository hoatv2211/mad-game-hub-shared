function setControls() {
    $('#world').bind('mousemove', function(event) {
        Game.mouseMove(event.clientX, event.clientY);
    });

    $('#world').bind('mousedown', function(event) {
        event.preventDefault();
        if (event.button === 0) {
            Game.mouseClick(event.clientX, event.clientY);
        }

    });

    $('#world').bind('mouseup', function(event) {
        event.preventDefault();
        if (event.button === 0) {
            Game.mouseUp(event.clientX, event.clientY);
        }

    });

    var obj = document.getElementById('world');
    obj.addEventListener('touchstart', function(event) {
        Game.mouseClick(event.changedTouches[0].clientX, event.changedTouches[0].clientY);
    }, false);

    obj.addEventListener('touchend', function(event) {
        //console.log(event);
        Game.mouseUp(event.changedTouches[0].clientX, event.changedTouches[0].clientY);
    }, false);

    obj.addEventListener('touchmove', function(event) {
        //console.log(event);
        event.preventDefault();
        event.stopImmediatePropagation();
        Game.mouseMove(event.changedTouches[0].clientX, event.changedTouches[0].clientY);
    }, { passive: false });
}
