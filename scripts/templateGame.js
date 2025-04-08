import { FlatVector, GameEngine } from './GameEngine.js';

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
  createObject(e.clientX, window.innerHeight - e.clientY, 0, 25, 25, 'dynamic');
});
let shape = 'box';
createObject(window.innerWidth / 2, 100, 0, 1000, 50, 'static');
createObject(window.innerWidth / 2 - 500, 100, 0, 100, 1000, 'static');
createObject(window.innerWidth / 2 + 500, 100, 0, 100, 1000, 'static');
createObject(window.innerWidth / 2 + 200, 500, 15, 500, 50, 'static');
createObject(window.innerWidth / 2 - 200, 300, -15, 500, 50, 'static');

setInterval(() => {
  avgTime.textContent = `${deltaT.toFixed(2)}ms ${(1000 / deltaT).toFixed(
    2
  )}fps ${id} objects`;
}, 100);

let previousT, deltaT;

let avgTime = document.getElementById('avgTime');

function update(time) {
  if (previousT == null) {
    previousT = time;
    window.requestAnimationFrame(update);
    return;
  }

  deltaT = time - previousT;

  console.time('Physics');
  gameEngine.simulateObjectPhysics(100, deltaT);
  console.timeEnd('Physics');
  console.time('Rendering');
  gameEngine.drawObjects();
  console.timeEnd('Rendering');

  previousT = time;
  window.requestAnimationFrame(update);
}
window.requestAnimationFrame(update);
