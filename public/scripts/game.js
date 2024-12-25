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

//----------------------------------Using the game engine to make a game----------------------------------

//"We have Unity at home" ahh
let gameEngine = new GameEngine();

let gravity = new FlatVector(0, -1);

let id = 0;
function createObject(posX, posY, angle, width, height, type) {
  gameEngine.addSceneObject(`${id}`, posX, posY, angle, width, height);
  let object = gameEngine.objects[`${id}`];

  object.addColider();
  object.addSpriteRenderer(shape, `hsl(${Math.random() * 360}deg,100%,50%)`);
  object.addRigidBody(type, 1, gravity, 1, 0.5);

  gameEngine.updateDataListSR(object);
  gameEngine.updateDataListCL(object);
  gameEngine.updateDataListRB(object);

  id += 1;
}

window.addEventListener('keydown', (e) => {
  switch (e.key) {
    case 'z':
      shape = 'circle';
      break;
    case 'x':
      shape = 'box';
      break;
    case 'c':
      shape = 'triangle';
      break;
  }
});
window.addEventListener('mousedown', (e) => {
  createObject(e.clientX, windowH - e.clientY, 0, 25, 25, 'dynamic');
});
let shape = 'box';
createObject(windowW / 2, 100, 0, 1000, 50, 'static');
createObject(windowW / 2 - 500, 100, 0, 100, 1000, 'static');
createObject(windowW / 2 + 500, 100, 0, 100, 1000, 'static');
createObject(windowW / 2 + 200, 500, 15, 500, 50, 'static');
createObject(windowW / 2 - 200, 300, -15, 500, 50, 'static');
let previousT;

let mean = 0;
let i = 1;

let avgTime = document.getElementById('avgTime');

gameEngine.updateSceneData();
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
