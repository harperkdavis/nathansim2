const LOCAL_STORAGE_KEY = 'nathanSimulator2';
const VERSION = '0.1.0';

let keys = {};

let game = {
  test: 1
};

function setup() {
  createCanvas(windowWidth, windowHeight);

  if (localStorage.getItem(LOCAL_STORAGE_KEY) != undefined) {
    loadGame();
  } else {
    reset();
    saveGame();
  }
}


function reset() {
  game.test = 0;
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

function draw() {
  update();
  background(250);
  fill(0);
  text('Nathan Simulator 2' + VERSION, 40, 40);
  text(JSON.stringify(keys), 40, 80);
  text(localStorage.getItem(LOCAL_STORAGE_KEY), 40, 120);
}