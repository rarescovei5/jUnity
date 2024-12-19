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
gameEngine.addSpriteRenderer('Ragdoll', 'square', '#fff5');

gameEngine.addSceneObject('Terrain', { x: windowW / 4, y: windowH - 100 }, 0, {
  x: windowW / 2,
  y: 100,
});
gameEngine.addSpriteRenderer('Terrain', 'square', '#fff');

console.log(gameEngine);
