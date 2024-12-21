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
gameEngine.addSpriteRenderer('Player', 'box', '#ff0000');
gameEngine.addBoxColider('Player');
gameEngine.addRigidBody2D('Player', 'static', 1, 0.098, 1);
// Add *Box1* object
gameEngine.addSceneObject(
  'Box1',
  { x: Math.round(Math.random() * 1400), y: Math.round(Math.random() * 800) },
  0,
  {
    x: 100,
    y: 100,
  }
);
gameEngine.addSpriteRenderer('Box1', 'box', '#fff');
gameEngine.addBoxColider('Box1');
gameEngine.addRigidBody2D('Box1', 'static', 1, 0.098, 1);
// Add *Box2* object
gameEngine.addSceneObject(
  'Box2',
  { x: Math.round(Math.random() * 1400), y: Math.round(Math.random() * 800) },
  0,
  {
    x: 100,
    y: 100,
  }
);

gameEngine.addSpriteRenderer('Box2', 'box', '#fff');
gameEngine.addBoxColider('Box2');
gameEngine.addRigidBody2D('Box2', 'static', 1, 0.098, 1);
// Add *Box3* object
gameEngine.addSceneObject(
  'Box3',
  { x: Math.round(Math.random() * 1400), y: Math.round(Math.random() * 800) },
  0,
  {
    x: 100,
    y: 100,
  }
);
gameEngine.addSpriteRenderer('Box3', 'Box', '#b2b2b2');
gameEngine.addBoxColider('Box3');

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
