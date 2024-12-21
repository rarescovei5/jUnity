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
  { x: Math.random() * 1400, y: Math.random() * 800 },
  0,
  {
    x: 100,
    y: 100,
  }
);
gameEngine.addSpriteRenderer('circle1', 'circle', '#fff');
gameEngine.addCircleColider('circle1');

// Add *circle2* object
gameEngine.addSceneObject(
  'circle2',
  { x: Math.random() * 1400, y: Math.random() * 800 },
  0,
  {
    x: 100,
    y: 100,
  }
);
gameEngine.addSpriteRenderer('circle2', 'circle', '#fff');
gameEngine.addCircleColider('circle2');

// Add *circle3* object
gameEngine.addSceneObject(
  'circle3',
  { x: Math.random() * 1400, y: Math.random() * 800 + 100 },
  0,
  {
    x: 100,
    y: 100,
  }
);
gameEngine.addSpriteRenderer('circle3', 'circle', '#fff');
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

let playerSpeed = 2;
function update(time) {
  if (wDown) {
    c.fillStyle = '#0f0f0f';
    c.fillRect(0, 0, canvas.width, canvas.height);
    gameEngine.moveObject('Player', { x: 0, y: playerSpeed });
  }
  if (aDown) {
    c.fillStyle = '#0f0f0f';
    c.fillRect(0, 0, canvas.width, canvas.height);
    gameEngine.moveObject('Player', { x: -playerSpeed, y: 0 });
  }
  if (sDown) {
    c.fillStyle = '#0f0f0f';
    c.fillRect(0, 0, canvas.width, canvas.height);
    gameEngine.moveObject('Player', { x: 0, y: -playerSpeed });
  }
  if (dDown) {
    c.fillStyle = '#0f0f0f';
    c.fillRect(0, 0, canvas.width, canvas.height);
    gameEngine.moveObject('Player', { x: playerSpeed, y: 0 });
  }
  window.requestAnimationFrame(update);
}

window.requestAnimationFrame(update);

console.log(gameEngine);
