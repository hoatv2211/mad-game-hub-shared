var EightBallGame = function() {
    this.numbered_balls_on_table = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
    this.turn = 'player1';
    this.sides = {
        'player1': '?',
        'player2': '?'
    };
    this.hitCount = 0;
    this.timeouts = [];
    this.stripedDrop = [];
    this.solidDrop = [];
    this.escStriped = [];
    this.escSolid = [];
    //Game.updateBallsGui();

    this.pocketingOccurred = false;

    this.state = 'notstarted';

    this.ticker = undefined;

    gui.setupGameHud();
    this.hols = [];
    this.hols.push(new THREE.Vector3(Table.LEN_X / 2 + 5.7, 0, -Table.LEN_Z / 2 - 5.4));
    this.hols.push(new THREE.Vector3(-Table.LEN_X / 2 - 5.7, 0, -Table.LEN_Z / 2 - 5.));

    this.hols.push(new THREE.Vector3(0, 0, -Table.LEN_Z / 2 - 6.9));
    this.hols.push(new THREE.Vector3(0, 0, Table.LEN_Z / 2 + 6.9));

    this.hols.push(new THREE.Vector3(Table.LEN_X / 2 + 5.7, 0, Table.LEN_Z / 2 + 5.4));
    this.hols.push(new THREE.Vector3(-Table.LEN_X / 2 - 5.7, 0, Table.LEN_Z / 2 + 5.4));

    this.timeouts.push(setTimeout(this.startTurn, 2000));
}

EightBallGame.prototype.startTurn = function() {
    if (!eightballgame || eightballgame.state == 'gameover') {

        return;
    }
    // enable movement
    eightballgame.timer = 30;
    eightballgame.state = 'turn';
    gui.updateTurn(eightballgame.turn);
    this.hitCount++;
    gui.updateBalls(eightballgame.numbered_balls_on_table, eightballgame.sides.player1, eightballgame.sides.player2);
    if (Game.curMode === 0 && eightballgame.turn == 'player2') {
        Game.bot.turn();
    }
    eightballgame.tickTimer();
}

EightBallGame.prototype.whiteBallEnteredHole = function() {
    console.log("White ball pocketed by " + eightballgame.turn + "!");
    eightballgame.pocketingOccurred = false;
    Game.mainBall.fallen = false;
}

EightBallGame.prototype.getPlayerId = function() {
    if (this.turn == 'player1') {
        return 1;
    } else {
        return 2;
    }
}

EightBallGame.prototype.getOpId = function() {
    if (this.turn == 'player2') {
        return 1;
    } else {
        return 2;
    }
}


EightBallGame.prototype.coloredBallEnteredHole = function(name) {
    console.log('colored ball enter hole', name);
    if (typeof name === 'undefined') return;
    var ballno = 0;
    /*for (var i = 0; i < eightballgame.numbered_balls_on_table.length; i++) {
        if (name == eightballgame.numbered_balls_on_table[i] + 'ball') {
            ballno = eightballgame.numbered_balls_on_table[i];
           
            break;
        }
    }
    console.log(ballno);*/

    ballno = name;
    eightballgame.numbered_balls_on_table.splice(ballno - 1, 1);
    //console.log(eightballgame.numbered_balls_on_table);

    if (ballno == 'main') {
        return;
    }
    let ball = Game.balls[name];
    var near = false;
    var pos = new THREE.Vector3().copy(ball.mesh.position);
    pos.y = 0;
    for (var i in this.hols) {
        if (pos.distanceTo(this.hols[i]) < Ball.RADIUS * 4) {

            near = true;
            break;
        }
    }

    if (!near) {
        //console.log('!near');
        eightballgame.pocketingOccurred = false;
        if (ballno == 8) {
            eightballgame.turn = eightballgame.turn == 'player1' ? 'player2' : 'player1';
            eightballgame.endGame();
        } else {
            if (ballno < 8) {
                this.solidDrop.push(ballno);
                this.escSolid.push(ballno);
                console.log('esc solid');
            } else {
                this.stripedDrop.push(ballno);
                this.escStriped.push(ballno);
                console.log('esc striped');

            }
        }

        if (eightballgame.sides.player1 == '?') {

            eightballgame.sides[eightballgame.turn] = ballno < 8 ? 'solid' : 'striped';
            eightballgame.sides[eightballgame.turn == 'player1' ? 'player2' : 'player1'] = ballno > 8 ? 'solid' : 'striped';
        }
        Game.updateBallsGui();
        return;
    }

    if (ballno == 8) {
        //console.log(eightballgame.sides.player1, eightballgame.sides[eightballgame.turn], this.solidDrop.length, this.stripedDrop.length);
        if (eightballgame.sides.player1 == '?' || (eightballgame.sides[eightballgame.turn] == 'solid' && this.solidDrop.length < 7) || (eightballgame.sides[eightballgame.turn] == 'striped' && this.stripedDrop.length < 7)) {
            gui.log("Game over! 8 ball pocketed too early by " + this.turn);
            eightballgame.turn = eightballgame.turn == 'player1' ? 'player2' : 'player1';

            //return;
        }

        eightballgame.pocketingOccurred = true;

        // Win!
        eightballgame.endGame();
    } else {
        if (ballno < 8) {
            this.solidDrop.push(ballno);
        } else {
            this.stripedDrop.push(ballno);
        }


        if (eightballgame.sides.player1 == '?') {

            eightballgame.sides[eightballgame.turn] = ballno < 8 ? 'solid' : 'striped';
            eightballgame.sides[eightballgame.turn == 'player1' ? 'player2' : 'player1'] = ballno > 8 ? 'solid' : 'striped';

            eightballgame.pocketingOccurred = true;
        } else {
            if ((eightballgame.sides[eightballgame.turn] == 'solid' && ballno < 8) || (eightballgame.sides[eightballgame.turn] == 'striped' && ballno > 8)) {
                // another turn
                if (Game.mainBall.droped) {
                    eightballgame.pocketingOccurred = false;
                } else {
                    eightballgame.pocketingOccurred = true;
                }
            } else {
                eightballgame.pocketingOccurred = false;
                console.log(eightballgame.turn + " pocketed opponent's ball!");
            }
        }
        console.log('update balls gui');
        Game.updateBallsGui();
    }
}

EightBallGame.prototype.tickTimer = function() {
    gui.UpdateTimer(eightballgame.timer);
    /*if (eightballgame.timer == 0) {
        gui.log(eightballgame.turn + " ran out of time");
        eightballgame.state = "outoftime";
        eightballgame.switchSides();
    } else {
        eightballgame.timer--;
        eightballgame.ticker = setTimeout(eightballgame.tickTimer, 1000);
    }*/
}

EightBallGame.prototype.switchSides = function() {

    eightballgame.turn = eightballgame.turn == 'player1' ? 'player2' : 'player1';
    console.log('switch', eightballgame.turn);
    if (Game.mainBall.respown) {
        Game.cam_rot[this.getPlayerId()] = 180 + Math.random();
    }
    if (Game.curMode === 0 && eightballgame.turn == 'player2') {
        Game.bot.aim();
    }
    this.timeouts.push(setTimeout(eightballgame.startTurn, 1000));
}

EightBallGame.prototype.endGame = function() {
    eightballgame.state = 'gameover';
    var winner = eightballgame.turn == 'player1' ? 'Player 1' : 'Player 2';
    clearTimeout(eightballgame.ticker);
    //gui.showEndGame(winner);
    Game.over(eightballgame.turn);
}

EightBallGame.prototype.hitButtonClicked = function(strength) {
    console.log(eightballgame.state);
    if (eightballgame.state == 'turn') {
        //game.ballHit(strength);
        clearTimeout(eightballgame.ticker);
        eightballgame.state = 'turnwaiting';
        this.hitInt = setInterval(function() {
            //console.log('hitInt');
            var SLEEPING = true;
            for (var i in Game.balls) {
                if (Game.balls[i].mesh.visible && Game.balls[i].rigidBody.sleepState != CANNON.Body.SLEEPING) {
                    //console.log(i, Game.balls[i].rigidBody.sleepState, CANNON.Body.SLEEPING);
                    SLEEPING = false;
                    break;
                }
            }
            if (!SLEEPING || Game.mainBall.rigidBody.sleepState != CANNON.Body.SLEEPING) return;
            /*for (var i = 1; i < Game.balls.length; i++) {
                if (Game.balls[i].rigidBody.sleepState != CANNON.Body.SLEEPING && eightballgame.numbered_balls_on_table.indexOf(Number(game.balls[i].name.split('ball')[0])) > -1) {
                    return;
                }
            }*/
            //console.log(eightballgame.pocketingOccurred);
            if (eightballgame.pocketingOccurred) {
                //console.log('startturn');
                if (Game.curMode === 0 && eightballgame.turn == 'player2') {
                    Game.bot.aim();
                }
                eightballgame.timeouts.push(setTimeout(eightballgame.startTurn, 1000));
            } else {

                eightballgame.switchSides();
            }

            eightballgame.pocketingOccurred = false;

            clearInterval(eightballgame.hitInt);
        }, 30);
    }
};