const LOCAL_STORAGE_KEY = 'nathanSimulator2';
const VERSION = '0.1.0';

const JUMP_HEIGHT = 8;
const GRAVITY = 0.3;
const MOVE_SMOOTH = 0.2;
const AIR_FRICTION = 0.2;
const FLOOR_FRICTION = 0.4;
const PLAYER_SPEED = 8;

let keys = {};

let game = {
  inMenu: true,
  randomSeed: 0,

  playerX: 1000,
  playerY: 0,

  velX: 0,
  velY: 0,

  nathanHeight: 1,
  grounded: false,

  floor: 0,
  cameraX: 0,
  cameraY: 0,
};

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

function update() {

  Object.keys(keys).forEach(key => {
    if (keys[key] >= 0) {
      keys[key] += 1;
    }
  });

  if (!game.grounded) {
    game.velY += GRAVITY;
  } else {
    game.velY = 0;
    game.playerY = 0;
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


  if (game.playerY > 0) {
    game.playerY = 0;
    game.velY = 0;
    game.grounded = true;
  }

  game.cameraX = lerp(game.cameraX, game.playerX, 0.2);
  game.cameraY = lerp(game.cameraY, game.playerY, 0.2);
}

function drawCity(offX, offY) {
  randomSeed(13);

  const BUILDING_COUNT = 32;
  const ONE_MINUS_BC = BUILDING_COUNT - 1;
  for (let l = 0; l < BUILDING_COUNT; l++) {
    let x = floor(pow(random(-1, 1), 3) * 120);
    let w = floor(random(5, 8) * ((l / ONE_MINUS_BC) * 0.25 + 0.75));
    let h = floor(random(10, 50) * ((l / ONE_MINUS_BC) * 0.75 + 0.25));

    fill(25 + pow(l / ONE_MINUS_BC, 2) * 100);
    stroke(0);
    rect(width / 2 + x * 20 - w * 50 + offX * ((l / ONE_MINUS_BC) * 0.75 + 0.25), height - h * 25 + offY * ((l / ONE_MINUS_BC) * 0.75 + 0.25), w * 50, height * 40);
    
  }
}

function drawFloor(n, x, y) {
  fill(250);
  noStroke();
  rect(x - 1000, y - 200, 2000, 200);

  fill(200);
  rect(x - 1000, y - 200, 2000, 20);
  rect(x - 1000, y - 200, 20, 200);
  rect(x + 980, y - 200, 20, 200);

  stroke(0);
  noFill();
  rect(x - 1000, y - 200, 2000, 200);
  rect(x - 980, y - 180, 1960, 180);
}

function draw() {
  update();
  background(20);
  
  drawCity(-game.cameraX * 0.2, -game.cameraY * 0.2 - 200);
  
  push();
  translate(-game.cameraX + width / 2, -game.cameraY + height / 2);

  fill(200);
  rect(-10000, 0, 20000, 10000);

  drawFloor(0, 0, 0);

  // Player
  image(nathanImage, game.playerX - 16 * (1 / game.nathanHeight), game.playerY - 32 * game.nathanHeight, 32 * (1 / game.nathanHeight), 32 * game.nathanHeight);
  
  noFill();
  stroke(0);
  rect(game.playerX - 16 * (1 / game.nathanHeight), game.playerY - 32 * game.nathanHeight, 32 * (1 / game.nathanHeight), 32 * game.nathanHeight);

  

  pop();
}