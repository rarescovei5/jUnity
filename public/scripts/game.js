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
  x: 75,
  y: 75,
});
gameEngine.addSpriteRenderer('Player', 'box', '#ff0000');
gameEngine.addBoxColider('Player');
gameEngine.addRigidBody2D(
  'Player',
  'dyanmic',
  10,
  new FlatVector(0, -0.001),
  0.5,
  1
);

//Create bodies
for (let i = 0; i < 10; i++) {
  let color;
  let shape;

  if (i % 4 == 0) {
    color = 'red';
    shape = 'triangle';
  } else if (i % 4 == 1) {
    color = 'blue';
    shape = 'box';
  } else if (i % 4 == 2) {
    color = 'yellow';
    shape = 'circle';
  } else if (i % 4 == 3) {
    color = 'purple';
    shape = 'box';
  }

  gameEngine.addSceneObject(
    `${i}`,
    {
      x: 700,
      y: 600 + i * 50,
    },
    0,
    {
      x: 75,
      y: 75,
    }
  );
  gameEngine.addSpriteRenderer(`${i}`, shape, color);
  if (shape == 'box') {
    gameEngine.addBoxColider(`${i}`);
  } else if (shape == 'triangle') {
    gameEngine.addTriangleColider(`${i}`);
  } else {
    gameEngine.addCircleColider(`${i}`);
  }
  gameEngine.addRigidBody2D(
    `${i}`,
    'dyanmic',
    10,
    new FlatVector(0, -0.001),
    0.5,
    1
  );
}
// Add *Box1* object
gameEngine.addSceneObject(
  'Terrain',
  {
    x: windowW / 2,
    y: 150,
  },
  0,
  { x: 1000, y: 100 }
);
gameEngine.addSpriteRenderer('Terrain', 'box', 'green');
gameEngine.addBoxColider('Terrain');
gameEngine.addRigidBody2D(
  'Terrain',
  'static',
  1,
  new FlatVector(0, -0.098),
  0.5,
  1
);
// Add *Box1* object
gameEngine.addSceneObject(
  'Terrain2',
  {
    x: 500,
    y: 500,
  },
  0,
  { x: 100, y: 1000 }
);
gameEngine.addSpriteRenderer('Terrain2', 'box', 'green');
gameEngine.addBoxColider('Terrain2');
gameEngine.addRigidBody2D(
  'Terrain2',
  'static',
  1,
  new FlatVector(0, -0.098),
  0.5,
  1
);
// Add *Box1* object
gameEngine.addSceneObject(
  'Terrain3',
  {
    x: 1500,
    y: 500,
  },
  0,
  { x: 100, y: 1000 }
);
gameEngine.addSpriteRenderer('Terrain3', 'box', 'green');
gameEngine.addBoxColider('Terrain3');
gameEngine.addRigidBody2D(
  'Terrain3',
  'static',
  1,
  new FlatVector(0, -0.098),
  0.5,
  1
);
// Draw objects
gameEngine.drawObjects();

//----------------------------------Using the game engine to make a game----------------------------------
let wDown, aDown, dDown, qDown, eDown;

window.addEventListener('keydown', (e) => {
  switch (e.key) {
    case ' ':
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
    case ' ':
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

let pPath = gameEngine.findObjectParent('Player', gameEngine.objects);

pPath.push('Player');
let tPath = gameEngine.findObjectParent('Terrain', gameEngine.objects);
tPath.push('Terrain');
let playerObj = gameEngine.getObjectPointer(pPath);
let terrainObj = gameEngine.getObjectPointer(tPath);

let previousT;
let forceMagnitude = 1;

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

  let dx = 0;
  let dy = 0;

  if (wDown) {
    dy += 10;
  }
  if (aDown) {
    dx--;
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

  if (dx !== 0) {
    let forceDirection = FlatMath.normalize(new FlatVector(dx, dy));
    let force = forceDirection.multiplyScalar(forceMagnitude);
    gameEngine.addForce('Player', force);
  }

  if (dy !== 0) {
    let forceDirection = FlatMath.normalize(new FlatVector(dx, dy));
    let force = forceDirection.multiplyScalar(1.5);
    gameEngine.addForce('Player', force);
  }

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
