import { GameEngine } from './classes.js';

let canvas = document.getElementById('canvas');
export let c = canvas.getContext('2d');

let windowW = window.innerWidth;
let windowH = window.innerHeight;

canvas.width = windowW;
canvas.height = windowH;
canvas.style.background = '#0f0f0f';

let gameEngine = new GameEngine();

gameEngine.addSceneObject('Ragdoll', { x: windowW / 2, y: windowH / 2 }, 0, {
  x: 100,
  y: 100,
});
gameEngine.addSpriteRenderer('Ragdoll', 'box', '#fff');

gameEngine.addSceneObject('Terrain', { x: windowW / 4, y: windowH - 100 }, 0, {
  x: windowW / 2,
  y: 100,
});
gameEngine.addSpriteRenderer('Terrain', 'box', '#fff');

gameEngine.drawObjects();

console.log(gameEngine);
