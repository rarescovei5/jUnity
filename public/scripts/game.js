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

let elasticity = 0.5;
gameEngine.addSceneObject('t1', { x: windowW / 2, y: 100 }, 0, {
  x: 1000,
  y: 50,
});
gameEngine.addSpriteRenderer('t1', 'box', 'green');
gameEngine.addColider('t1', 'box');
gameEngine.addRigidBody2D(
  't1',
  'static',
  10,
  new FlatVector(0, -0.001),
  elasticity,
  1
);

gameEngine.addSceneObject('t2', { x: 700, y: 500 }, -15, {
  x: 600,
  y: 50,
});
gameEngine.addSpriteRenderer('t2', 'box', 'green');
gameEngine.addColider('t2', 'box');
gameEngine.addRigidBody2D(
  't2',
  'static',
  10,
  new FlatVector(0, -0.001),
  elasticity,
  1
);

gameEngine.addSceneObject('t3', { x: 1200, y: 700 }, 15, {
  x: 600,
  y: 50,
});
gameEngine.addSpriteRenderer('t3', 'box', 'green');
gameEngine.addColider('t3', 'box');
gameEngine.addRigidBody2D(
  't3',
  'static',
  10,
  new FlatVector(0, -0.001),
  elasticity,
  1
);

gameEngine.addSceneObject('t4', { x: 500, y: 600 }, 0, {
  x: 50,
  y: 1000,
});
gameEngine.addSpriteRenderer('t4', 'box', 'green');
gameEngine.addColider('t4', 'box');
gameEngine.addRigidBody2D(
  't4',
  'static',
  10,
  new FlatVector(0, -0.001),
  elasticity,
  1
);

gameEngine.addSceneObject('t5', { x: 1450, y: 600 }, 0, {
  x: 50,
  y: 1000,
});
gameEngine.addSpriteRenderer('t5', 'box', 'green');
gameEngine.addColider('t5', 'box');
gameEngine.addRigidBody2D('t5', 'static', 10, new FlatVector(0, -0.001), 0, 1);

// Draw objects
gameEngine.drawObjects();

let id = 0;
function drawNewObject(x, y, width, height, shape, color) {
  gameEngine.addSceneObject(`${id}`, { x: x, y: y }, 0, {
    x: width,
    y: height,
  });
  gameEngine.addSpriteRenderer(`${id}`, shape, color);
  gameEngine.addColider(`${id}`, shape);
  gameEngine.addRigidBody2D(
    `${id}`,
    'dynamic',
    1,
    new FlatVector(0, -0.05),
    0.1,
    1
  );

  id++;
}

let shape = 0;
window.addEventListener('keydown', (e) => {
  switch (e.key) {
    case 'z':
      shape = 0;
      break;
    case 'x':
      shape = 1;
      break;
    case 'c':
      shape = 2;
      break;
  }
});
window.addEventListener('mousedown', (e) => {
  switch (shape) {
    case 0:
      shape = 'circle';
      break;
    case 1:
      shape = 'box';
      break;
    case 2:
      shape = 'triangle';
      break;
  }
  drawNewObject(
    e.clientX,
    windowH - e.clientY,
    50,
    50,
    shape,
    `hsl(${Math.random() * 360}deg,100%,50%)`
  );
});

//----------------------------------Using the game engine to make a game----------------------------------

let previousT;

let mean = 0;
let i = 1;

let avgTime = document.getElementById('avgTime');

function update(time) {
  if (previousT == null) {
    previousT = time;
    window.requestAnimationFrame(update);
    return;
  }

  const deltaT = time - previousT;

  c.fillStyle = '#0f0f0f';
  c.fillRect(0, 0, canvas.width, canvas.height);

  gameEngine.simulateObjectPhysics(100, deltaT);
  gameEngine.drawObjects();

  mean += deltaT;
  avgTime.textContent = (mean / i).toFixed(2);
  i++;

  previousT = time;
  window.requestAnimationFrame(update);
}

window.requestAnimationFrame(update);

console.log(gameEngine);
