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

//Add *Ragdoll* object
gameEngine.addSceneObject('Ragdoll', { x: windowW / 2, y: 300 }, 0, {
  x: 100,
  y: 100,
});
gameEngine.addSpriteRenderer('Ragdoll', 'box', '#fff');
gameEngine.changeTag('Ragdoll', 'player');

//Add *Terrain* object
gameEngine.addSceneObject(
  'Terrain',
  { x: windowW / 4, y: 0 },
  0,
  {
    x: windowW / 2,
    y: 100,
  },
  undefined,
  'terrain'
);
gameEngine.addSpriteRenderer('Terrain', 'box', '#fff');

//Add *circle* object

gameEngine.addSceneObject('circle', { x: windowW / 8, y: windowH - 500 }, 0, {
  x: 100,
  y: 100,
});
gameEngine.addSpriteRenderer('circle', 'circle', '#fff');

//Add *triangle* object
gameEngine.addSceneObject(
  'triangle',
  { x: 400, y: 200 },
  0,
  {
    x: 100,
    y: 100,
  },
  'Terrain',
  'triangle'
);
gameEngine.addSpriteRenderer('triangle', 'triangle', '#fff');

gameEngine.drawObjects();

console.log(gameEngine);
