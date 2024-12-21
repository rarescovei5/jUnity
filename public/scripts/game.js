import { GameEngine } from './GameEngine.js';

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
gameEngine.addSceneObject('terrain', { x: 110, y: 110 }, 0, {
  x: 100,
  y: 100,
});
gameEngine.addSpriteRenderer('terrain', 'box', '#fff');

// Add *Player* object
gameEngine.addSceneObject('Player', { x: 600, y: windowH - 500 }, 0, {
  x: 100,
  y: 100,
});
gameEngine.addSpriteRenderer('Player', 'circle', '#ff0000');
gameEngine.addCircleColider('Player');
gameEngine.addRigidBody2D('Player', 'static', 1, 0.098, 1);
// Add *circle1* object
gameEngine.addSceneObject(
  'circle1',
  { x: Math.round(Math.random() * 1400), y: Math.round(Math.random() * 800) },
  0,
  {
    x: 100,
    y: 100,
  }
);
gameEngine.addSpriteRenderer('circle1', 'circle', '#fff');
gameEngine.addCircleColider('circle1');
gameEngine.addRigidBody2D('circle1', 'static', 1, 0.098, 1);
// Add *circle2* object
gameEngine.addSceneObject(
  'circle2',
  { x: Math.round(Math.random() * 1400), y: Math.round(Math.random() * 800) },
  0,
  {
    x: 100,
    y: 100,
  }
);
gameEngine.addSpriteRenderer('circle2', 'circle', '#fff');
gameEngine.addCircleColider('circle2');
gameEngine.addRigidBody2D('circle2', 'static', 1, 0.098, 1);
// Add *circle3* object
gameEngine.addSceneObject(
  'circle3',
  { x: Math.round(Math.random() * 1400), y: Math.round(Math.random() * 800) },
  0,
  {
    x: 100,
    y: 100,
  }
);
gameEngine.addSpriteRenderer('circle3', 'circle', '#b2b2b2');
gameEngine.addCircleColider('circle3');

// Draw objects
gameEngine.drawObjects();

//----------------------------------Using the game engine to make a game----------------------------------
let wDown, sDown, aDown, dDown;
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
  }
});

let playerSpeed = 5;
function update(time) {
  c.fillStyle = '#0f0f0f';
  c.fillRect(0, 0, canvas.width, canvas.height);
  if (wDown) {
    gameEngine.moveObject('Player', { x: 0, y: playerSpeed });
  }
  if (aDown) {
    gameEngine.moveObject('Player', { x: -playerSpeed, y: 0 });
  }
  if (sDown) {
    gameEngine.moveObject('Player', { x: 0, y: -playerSpeed });
  }
  if (dDown) {
    gameEngine.moveObject('Player', { x: playerSpeed, y: 0 });
  }

  gameEngine.simulateObjectForces();

  gameEngine.drawObjects();
  window.requestAnimationFrame(update);
}

window.requestAnimationFrame(update);

console.log(gameEngine);
