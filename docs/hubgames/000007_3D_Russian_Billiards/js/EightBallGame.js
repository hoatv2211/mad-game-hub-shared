var EightBallGame = function () {
  this.numbered_balls_on_table = [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
  ];
  this.turn = "player1";
  this.sides = {
    player1: "?",
    player2: "?",
  };

  this.penalty = {
    player1: false,
    player2: false,
  };

  this.respownList = [];

  this.hitCount = 0;
  this.timeouts = [];
  /*this.stripedDrop = [];
    this.solidDrop = [];
    this.escStriped = [];
    this.escSolid = [];*/

  this.p1balls = [];
  this.p2balls = [];

  this.endDelay = 0;
  //Game.updateBallsGui();

  this.pocketingOccurred = false;

  this.state = "notstarted";

  this.ticker = undefined;

  gui.setupGameHud();
  this.hols = [];
  this.hols.push(
    new THREE.Vector3(Table.LEN_X / 2 + 5.7, 0, -Table.LEN_Z / 2 - 5.4)
  );
  this.hols.push(
    new THREE.Vector3(-Table.LEN_X / 2 - 5.7, 0, -Table.LEN_Z / 2 - 5)
  );

  this.hols.push(new THREE.Vector3(0, 0, -Table.LEN_Z / 2 - 6.9));
  this.hols.push(new THREE.Vector3(0, 0, Table.LEN_Z / 2 + 6.9));

  this.hols.push(
    new THREE.Vector3(Table.LEN_X / 2 + 5.7, 0, Table.LEN_Z / 2 + 5.4)
  );
  this.hols.push(
    new THREE.Vector3(-Table.LEN_X / 2 - 5.7, 0, Table.LEN_Z / 2 + 5.4)
  );

  this.timeouts.push(setTimeout(this.startTurn, 2000));
};

EightBallGame.prototype.addRespown = function (n) {
  console.log("add to respown", n);
  this.respownList.push(n);
};

EightBallGame.prototype.setPenalty = function (n) {
  for (let i in this.penalty) {
    if (i != eightballgame.turn && this.penalty[i]) {
      this.penalty[i] = false;
      return;
    }
  }
  this.penalty[eightballgame.turn] = true;
  //console.log(this.penalty);
};

EightBallGame.prototype.startTurn = function () {
  if (!eightballgame || eightballgame.state == "gameover") {
    return;
  }
  // enable movement
  eightballgame.timer = 30;
  eightballgame.state = "turn";
  gui.updateTurn(eightballgame.turn);
  this.hitCount++;
  gui.updateBalls(
    eightballgame.numbered_balls_on_table,
    eightballgame.sides.player1,
    eightballgame.sides.player2
  );

  if (Game.curMode === 0 && eightballgame.turn == "player2") {
    Game.bot.turn();
  }
  eightballgame.tickTimer();
};

EightBallGame.prototype.whiteBallEnteredHole = function () {
  console.log("White ball pocketed by " + eightballgame.turn + "!");
  eightballgame.pocketingOccurred = false;
  Game.mainBall.fallen = false;
};

EightBallGame.prototype.checkGameEnd = function () { };

EightBallGame.prototype.getPlayerId = function () {
  if (this.turn == "player1") {
    return 1;
  } else {
    return 2;
  }
};

EightBallGame.prototype.getOpId = function () {
  if (this.turn == "player2") {
    return 1;
  } else {
    return 2;
  }
};

EightBallGame.prototype.coloredBallEnteredHole = function (name) {
  console.log(name, Game.balls[name].mesh.material.color);
  let ball;
  for (let i in Game.balls) {
    if (Game.balls[i].name == name) {
      ball = Game.balls[i];
      break;
    }
  }

  let color = new THREE.Color().copy(ball.mesh.material.color);
  if (this.turn == "player1") {
    this.p1balls.push({ color: color, name: name });
  } else {
    this.p2balls.push({ color: color, name: name });
  }

  console.log(this.p1balls, this.p2balls);
  console.log("update balls gui");
  Game.updateBallsGui();
  if (!this.penalty[eightballgame.turn]) {
    eightballgame.pocketingOccurred = true;
  }

  if (this.p1balls.length == 8 || this.p2balls.length == 8) {
    eightballgame.endGame();
  }
};

EightBallGame.prototype.tickTimer = function () {
  gui.UpdateTimer(eightballgame.timer);
  /*if (eightballgame.timer == 0) {
        gui.log(eightballgame.turn + " ran out of time");
        eightballgame.state = "outoftime";
        eightballgame.switchSides();
    } else {
        eightballgame.timer--;
        eightballgame.ticker = setTimeout(eightballgame.tickTimer, 1000);
    }*/
};

EightBallGame.prototype.switchSides = function () {
  eightballgame.turn = eightballgame.turn == "player1" ? "player2" : "player1";
  console.log("switch", eightballgame.turn);
  /*if (Game.mainBall.respown) {
        Game.cam_rot[this.getPlayerId()] = 180 + Math.random();
    }*/
  if (Game.curMode === 0 && eightballgame.turn == "player2") {
    Game.bot.aim();
  }
  this.timeouts.push(setTimeout(eightballgame.startTurn, 1000));
};

EightBallGame.prototype.endGame = function () {
  eightballgame.state = "gameover";
  var winner = eightballgame.turn == "player1" ? "Player 1" : "Player 2";
  clearTimeout(eightballgame.ticker);
  //gui.showEndGame(winner);
  Game.over(eightballgame.turn);
};

EightBallGame.prototype.hitButtonClicked = function (strength) {
  console.log(eightballgame.state);
  if (eightballgame.state == "turn") {
    //game.ballHit(strength);
    clearTimeout(eightballgame.ticker);
    eightballgame.state = "turnwaiting";
    eightballgame.endDelay = 1500;
    this.hitInt = setInterval(function () {
      //console.log('hitInt');
      var SLEEPING = true;
      for (let i in Game.balls) {
        if (
          Game.balls[i].mesh.visible &&
          Game.balls[i].rigidBody.sleepState != CANNON.Body.SLEEPING &&
          !Game.balls[i].droped
        ) {
          //console.log(i, Game.balls[i].rigidBody.sleepState, CANNON.Body.SLEEPING);
          SLEEPING = false;
          break;
        }
      }
      if (
        !SLEEPING ||
        (Game.mainBall.rigidBody.sleepState != CANNON.Body.SLEEPING &&
          !Game.mainBall.droped)
      )
        return;
      eightballgame.endDelay -= 30;
      if (eightballgame.endDelay > 0) return;
      /*for (var i = 1; i < Game.balls.length; i++) {
                if (Game.balls[i].rigidBody.sleepState != CANNON.Body.SLEEPING && eightballgame.numbered_balls_on_table.indexOf(Number(game.balls[i].name.split('ball')[0])) > -1) {
                    return;
                }
            }*/
      //console.log(eightballgame.pocketingOccurred);
      console.log("start respown balls", eightballgame.respownList.length);
      for (let i in eightballgame.respownList) {
        Game.respownBall(eightballgame.respownList[i]);
      }
      eightballgame.respownList = [];
      let player;
      if (eightballgame.turn == "player2") {
        player = "player1";
      } else {
        player = "player2";
      }

      let penalty;
      if (eightballgame.penalty[player]) {
        penalty = true;
        eightballgame.penalty[player] = false;
      }
      if (!Game.mainBall.hitBall) {
        console.log("no balls hited");
        eightballgame.setPenalty();
      }
      if (eightballgame.pocketingOccurred || penalty) {
        //console.log('startturn');
        if (Game.curMode === 0 && eightballgame.turn == "player2") {
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
