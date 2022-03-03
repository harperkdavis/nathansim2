const LOCAL_STORAGE_KEY = 'nathanSimulator2';
const VERSION = '0.1.0';

const JUMP_HEIGHT = 8;
const GRAVITY = 0.3;
const MOVE_SMOOTH = 0.2;
const AIR_FRICTION = 0.2;
const FLOOR_FRICTION = 0.4;
const PLAYER_SPEED = 8;

let keys = {};

const guns = {
  rifle: {
    shots: 1,
    speed: 6,
    accuracy: 0.1,
    recoil: 8,
  }
}

let game = {
  inMenu: true,
  controllable: true,
  randomSeed: 0,

  playerX: 1000,
  playerY: 0,

  velX: 0,
  velY: 0,

  nathanHeight: 1,
  grounded: false,

  floor: 0,
  floorAnim: 0,

  transitionAnim: -1,

  cameraX: 0,
  cameraY: 0,

  aimAngle: 2,
  aimTarget: {x: 0, y: 0},
  aimLen: 0,
  aim: 2,

  accuracy: 0.1,
  lastShot: 0,

  bullets: [],
  currentGun: 'rifle',
};

let particles = [];

let nathanImage;

function setup() {
  createCanvas(windowWidth, windowHeight);

  nathanImage = loadImage("https://i.imgur.com/qNRBIvl.png");

  localStorage.clear(); // remove

  if (localStorage.getItem(LOCAL_STORAGE_KEY) != undefined) {
    loadGame();
  } else {
    reset();
    saveGame();
  }
}


function reset() {
  game.inMenu = true;
}

function saveGame() {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(game));
}

function loadGame() {
  game = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY));
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function keyPressed() {
  keys[keyCode] = 0;
}

function keyReleased() {
  keys[keyCode] = -1;
}

function shoot() {
  for (let i = 0; i < guns[game.currentGun].shots; i++) {
    let rdm = map(noise(frameCount, 1000 + i * 200), 0, 1, -game.accuracy, game.accuracy);
    game.bullets.push({
      x: game.playerX,
      y: game.playerY - 16,
      xv: sin(game.aim + rdm) * 40,
      yv: cos(game.aim + rdm) * 40,
      t: 30,
    });
    addParticle(2, game.playerX + sin(game.aim + rdm) * 30, game.playerY + cos(game.aim + rdm) * 30 - 16, sin(game.aim + rdm) * 8, sin(game.aim + rdm) * 16, cos(game.aim + rdm) * 8, cos(game.aim + rdm) * 16, 0.1, 4, -0.2);
  }
  addParticle(1, game.playerX + sin(game.aim) * 30, game.playerY + cos(game.aim) * 30 - 16, -8, 8, -8, 8, 1, 4, -0.2);
  game.velX -= sin(game.aim) * guns[game.currentGun].recoil;
  game.velY -= cos(game.aim) * guns[game.currentGun].recoil * 0.5;
  game.lastShot = frameCount;
  game.accuracy += guns[game.currentGun].accuracy;
}

function addParticle(c, x, y, xv, xvm, yv, yvm, g, s, sv) {
  for (let i = 0; i < c; i++) {
    particles.push({
      x: x,
      y: y,
      xv: random(xv, xvm),
      yv: random(yv, yvm),
      g: g,
      s: s,
      sv: sv,
    });
  }
}

function update() {

  game.floorAnim = lerp(game.floorAnim, game.floor, 0.04);
  const floorY = game.floorAnim * -300;

  Object.keys(keys).forEach(key => {
    if (keys[key] >= 0) {
      keys[key] += 1;
    }
  });

  if (keys[78] === 1) {
    game.controllable = !game.controllable;
  }
  if (game.controllable) {
    if (!game.grounded) {
      game.velY += GRAVITY;
    }

    if (game.grounded) {
      if (abs(game.velX) > FLOOR_FRICTION) {
        game.velX = lerp(game.velX, 0, FLOOR_FRICTION);
      } else {
        game.velX = 0;
      }
    } else {
      if (abs(game.velX) > AIR_FRICTION) {
        game.velX = lerp(game.velX, 0, AIR_FRICTION);
      } else {
        game.velX = 0;
      }
    }
    

    if (keys[UP_ARROW] >= 0 || keys[87] >= 0) {
      game.nathanHeight = lerp(game.nathanHeight, 1.1, 0.2);
    } else if (keys[DOWN_ARROW] >= 0 || keys[83] >= 0) {
      game.nathanHeight = lerp(game.nathanHeight, 0.9, 0.2);
    } else {
      game.nathanHeight = lerp(game.nathanHeight, 1.0, 0.2);
    }

    const SPEED = PLAYER_SPEED * (game.grounded ? 0.2 : 0.1);
    if (keys[LEFT_ARROW] >= 0 || keys[65] >= 0) {
      if (game.velX > -PLAYER_SPEED) {
        game.velX -= SPEED;
      }
    }

    if (keys[RIGHT_ARROW] >= 0 || keys[68] >= 0) {
      if (game.velX < PLAYER_SPEED) {
        game.velX += SPEED;
      }
    }

    if (game.grounded && (keys[32] >= 0 || keys[81] >= 0 || keys[90] >= 0)) {
      game.grounded = false;
      game.velY = -JUMP_HEIGHT;
      game.playerY -= 2;
    }

    game.playerX += game.velX;
    game.playerY += game.velY;

    if (game.playerY > floorY) {
      game.playerY = floorY;
      game.velY = 0;
    }
    if (game.playerX < -1000 + 16 + 20) {
      game.playerX = -1000 + 16 + 20;
      game.velX = 0;
    }
    if (game.playerX > 1000 - 16 - 20) {
      game.playerX = 1000 - 16 - 20;
      game.velX = 0;
    }
    if (game.playerY < floorY - 300 + 32 + 20) {
      game.playerY = floorY - 300 + 32 + 20;
      game.velY = -game.velY / 2;
    }

    game.grounded = game.playerY + 4 > floorY;

    if (keys[LEFT_ARROW] >= 0 || keys[65] >= 0) {
      if (keys[UP_ARROW] >= 0 || keys[87] >= 0) {
        game.aimAngle = 1;
      } else if (keys[DOWN_ARROW] >= 0 || keys[83] >= 0) {
        game.aimAngle = 3;
      } else {
        game.aimAngle = 2;
      }
    } else if (keys[RIGHT_ARROW] >= 0 || keys[68] >= 0) {
      if (keys[UP_ARROW] >= 0 || keys[87] >= 0) {
        game.aimAngle = 7;
      } else if (keys[DOWN_ARROW] >= 0 || keys[83] >= 0) {
        game.aimAngle = 5;
      } else {
        game.aimAngle = 6;
      }
    } else {
      if (keys[UP_ARROW] >= 0 || keys[87] >= 0) {
        game.aimAngle = 0;
      } else if (keys[DOWN_ARROW] >= 0 || keys[83] >= 0) {
        game.aimAngle = 4;
      }
    }

    game.aimTarget = {x: lerp(game.aimTarget.x, -sin(game.aimAngle * QUARTER_PI), 0.2), y: lerp(game.aimTarget.y, -cos(game.aimAngle * QUARTER_PI), 0.2)};

    

    if (keys[88] >= 0 || keys[69] >= 0) {
      if (game.lastShot + guns[game.currentGun].speed < frameCount) {
        shoot();
      }
    }

    game.accuracy = lerp(game.accuracy, guns[game.currentGun].accuracy * 0.5, 0.05);
  } else {
    game.aimTarget = {x: lerp(game.aimTarget.x, 0, 0.2), y: lerp(game.aimTarget.y, 0, 0.2)};
  }

  game.aimLen = dist(0, 0, game.aimTarget.x, game.aimTarget.y);
  game.aim = atan2(game.aimTarget.x, game.aimTarget.y);

  game.cameraX = lerp(game.cameraX, game.playerX, 0.1);
  game.cameraY = lerp(game.cameraY, game.playerY, 0.1);

  game.bullets.forEach(bullet => {
    bullet.x += bullet.xv;
    bullet.y += bullet.yv;
    bullet.t -= 1;
  });

  game.bullets = game.bullets.filter(bullet => {
    if (bullet.t < 0 || bullet.y > floorY || bullet.x < -1000 + 16 + 20 || bullet.x > 1000 - 16 - 20 || bullet.y < floorY - 300 + 32 + 20) {
      addParticle(4, bullet.x + bullet.xv, bullet.y + bullet.yv, -bullet.xv * 0.2 - 1, bullet.xv * 0.2 + 2, 0, -bullet.yv * 0.2, 0.5, 4, -0.2);
      return false;
    }
    return true;
  });

  particles.forEach(part => {
    part.yv += part.g;
    part.x += part.xv;
    part.y += part.yv;
    part.s += part.sv;
  });

  particles = particles.filter(part => {
    if (part.s < 0) {
      return false;
    }
    return true;
  });
}

function drawCity(offX, offY) {
  
  const BUILDING_COUNT = 16;
  const ONE_MINUS_BC = BUILDING_COUNT - 1;
  for (let l = 0; l < BUILDING_COUNT; l++) {
    let x = floor(map(noise(l, 0), 0, 1, -1, 1) * 120);
    let w = floor(map(noise(l, 100), 0, 1, 4, 8) * ((l / ONE_MINUS_BC) * 0.25 + 0.75));
    let h = floor(map(noise(l, 100), 0, 1, 10, 50) * ((l / ONE_MINUS_BC) * 0.75 + 0.25));

    fill(25 + pow(l / ONE_MINUS_BC, 2) * 100);
    stroke(0);
    rect(width / 2 + x * 20 - w * 50 + offX * ((l / ONE_MINUS_BC) * 0.75 + 0.25), height - h * 25 + offY * ((l / ONE_MINUS_BC) * 0.75 + 0.25), w * 50, height * 40);
    
  }
}

function drawFloor(n, x, y) {
  fill(250);
  noStroke();
  rect(x - 1000, y - 300, 2000, 300);

  fill(200);
  rect(x - 1000, y - 300, 2000, 20);
  rect(x - 1000, y - 300, 20, 300);
  rect(x + 980, y - 300, 20, 300);

  stroke(0);
  noFill();
  rect(x - 1000, y - 300, 2000, 300);
  rect(x - 980, y - 280, 1960, 280);

  stroke(0);
  fill(255);

  const isLeft = !(n % 2 == 0);

  fill(100, 100, 120);
  noStroke();
  textAlign(isLeft ? LEFT : RIGHT, TOP);
  textStyle(BOLD);
  textSize(200);
  text(n, x + (isLeft ? -960: 960), y - 280);

  stroke(0);
  fill(255);
  rect(x - 900, y - 100, 100, 100);
}

function draw() {
  update();
  background(20);
  
  drawCity(-game.cameraX * 0.5, -game.cameraY * 0.04 - 200);
  
  push();
  translate(-game.cameraX + width / 2, -game.cameraY + height / 2);

  fill(200);
  rect(-10000, 0, 20000, 10000);

  drawFloor(1, 0, 0);
  drawFloor(2, 0, -300);

  // Player
  image(nathanImage, game.playerX - 16 * (1 / game.nathanHeight), game.playerY - 32 * game.nathanHeight, 32 * (1 / game.nathanHeight), 32 * game.nathanHeight);
  
  noFill();
  stroke(0);
  rect(game.playerX - 16 * (1 / game.nathanHeight), game.playerY - 32 * game.nathanHeight, 32 * (1 / game.nathanHeight), 32 * game.nathanHeight);

  if (game.aimLen > 40 / 400) {
    stroke(0, 10);
    line(game.playerX, game.playerY - 16, game.playerX + sin(game.aim) * 2000 * game.aimLen, game.playerY + cos(game.aim) * 2000 * game.aimLen - 16);

    stroke(0, 10);
    line(game.playerX + sin(game.aim - game.accuracy) * 40, game.playerY + cos(game.aim - game.accuracy) * 40 - 16, game.playerX + sin(game.aim - game.accuracy) * 2000 * game.aimLen, game.playerY + cos(game.aim - game.accuracy) * 2000 * game.aimLen - 16);
    line(game.playerX + sin(game.aim + game.accuracy) * 40, game.playerY + cos(game.aim + game.accuracy) * 40 - 16, game.playerX + sin(game.aim + game.accuracy) * 2000 * game.aimLen, game.playerY + cos(game.aim + game.accuracy) * 2000 * game.aimLen - 16);

    stroke(0, 200);
    line(game.playerX + sin(game.aim - game.accuracy) * 40, game.playerY + cos(game.aim - game.accuracy) * 40 - 16, game.playerX + sin(game.aim - game.accuracy) * 400 * max(game.aimLen, 40 / 400), game.playerY + cos(game.aim - game.accuracy) * 400 * max(game.aimLen, 40 / 400) - 16);
    line(game.playerX + sin(game.aim + game.accuracy) * 40, game.playerY + cos(game.aim + game.accuracy) * 40 - 16, game.playerX + sin(game.aim + game.accuracy) * 400 * max(game.aimLen, 40 / 400), game.playerY + cos(game.aim + game.accuracy) * 400 * max(game.aimLen, 40 / 400) - 16);
  }
  game.bullets.forEach(bullet => {
    stroke(0);
    line(bullet.x, bullet.y, bullet.x + bullet.xv, bullet.y + bullet.yv);
  });

  particles.forEach(part => {
    fill(0);
    noStroke();
    ellipse(part.x, part.y, part.s, part.s);
  });

  pop();

  fill(255);
  noStroke();
  textSize(32);
  textAlign(LEFT, TOP);
  textStyle(NORMAL);
  text("Floor " + floor((-game.playerY / 200) + 1), 4, 4);
}