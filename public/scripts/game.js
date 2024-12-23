import { FlatVector, FlatMath, GameEngine } from './GameEngine.js';

//Javascript Canvas
let canvas = document.getElementById('canvas');
export let c = canvas.getContext('2d');

let windowW = window.innerWidth;
let windowH = window.innerHeight;

canvas.width = windowW;
canvas.height = windowH;
canvas.style.background = '#0f0f0f';

c.transform(1, 0, 0, -1, 0, canvas.height);

//"We have Unity at home" ahh
let gameEngine = new GameEngine();

// Add *Player* object
gameEngine.addSceneObject('Player', { x: 600, y: 600 }, 0, {
  x: 25,
  y: 25,
});
gameEngine.addSpriteRenderer('Player', 'circle', '#ff0000');
gameEngine.addCircleColider('Player');
gameEngine.addRigidBody2D(
  'Player',
  'dyanmic',
  1,
  new FlatVector(0, -0.098),
  0.5,
  1
);

// Add *Box1* object
gameEngine.addSceneObject(
  'Box1',
  {
    x: windowW / 2,
    y: 50,
  },
  0,
  { x: 1000, y: 200 }
);
gameEngine.addSpriteRenderer('Box1', 'box', 'green');
gameEngine.addBoxColider('Box1');
gameEngine.addRigidBody2D(
  'Box1',
  'static',
  1,
  new FlatVector(0, -0.098),
  0.5,
  1
);

// Draw objects
gameEngine.drawObjects();

//----------------------------------Using the game engine to make a game----------------------------------
let wDown, sDown, aDown, dDown, qDown, eDown;
window.addEventListener('keydown', (e) => {
  switch (e.key) {
    case 'w':
      wDown = true;
      break;
    case 'a':
      aDown = true;
      break;
    case 's':
      sDown = true;
      break;
    case 'd':
      dDown = true;
      break;
    case 'q':
      qDown = true;
      break;
    case 'e':
      eDown = true;
      break;
  }
});
window.addEventListener('keyup', (e) => {
  switch (e.key) {
    case 'w':
      wDown = false;
      break;
    case 'a':
      aDown = false;
      break;
    case 's':
      sDown = false;
      break;
    case 'd':
      dDown = false;
      break;
    case 'q':
      qDown = false;
      break;
    case 'e':
      eDown = false;
      break;
  }
});

let forceMagnitude = 0.01;
function update(time) {
  c.fillStyle = '#0f0f0f';
  c.fillRect(0, 0, canvas.width, canvas.height);

  let dx = 0;
  let dy = 0;

  if (wDown) {
    dy++;
  }
  if (aDown) {
    dx--;
  }
  if (sDown) {
    dy--;
  }
  if (dDown) {
    dx++;
  }
  if (qDown) {
    gameEngine.rotateObject('Player', 1);
  }
  if (eDown) {
    gameEngine.rotateObject('Player', -1);
  }

  if (dx !== 0 || dy !== 0) {
    let forceDirection = FlatMath.normalize(new FlatVector(dx, dy));
    let force = forceDirection.multiplyScalar(forceMagnitude);
    gameEngine.addForce('Player', force);
  }

  gameEngine.simulateObjectPhysics();
  gameEngine.drawObjects();

  window.requestAnimationFrame(update);
}

window.requestAnimationFrame(update);

console.log(gameEngine);
