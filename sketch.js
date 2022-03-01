const LOCAL_STORAGE_KEY = 'nathanSimulator2';
const VERSION = '0.1.0';

let keys = {};

let game = {
  inMenu: true,
  randomSeed: 0,
  playerX: 0,
  playerY: 0,
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

function draw() {
  update();
  background(20);
  
  drawCity(- mouseX +  width / 2, -mouseY * 2 + height);
}