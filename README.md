# jUnity

jUnity is a lightweight, flexible game engine designed to simplify 2D game development. With jUnity, you can create scenes, manage object hierarchies, and easily add components like rigid bodies, colliders, and sprite renderers to bring your game to life.

## Features

- **Scene Management**: Create and manage scenes seamlessly.
- **Object Hierarchy**: Add children to scene objects for intuitive organization.
- **Rigid Bodies**: Add physics to your objects with ease.
- **Colliders**: Support for collision detection.
- **Sprite Rendering**: Render sprites effortlessly for 2D visuals.

## Getting Started

### Installation

```bash
git clone https://github.com/rarescovei5/jUnity.git
```

### Usage

#### Creating a Scene

```javascript
const myScene = new GameEngine();
```

#### Adding Objects

```javascript
gameEngine.addSceneObject(`${name}`, posX, posY, rotation: in degrees, width, height);
const object = gameEngine.objects[`${name}`];
```

#### Adding Components

- **Rigid Body**:

  ```javascript
  object.addRigidBody(type: "static" || "dynamic", mass, gravity: FlatVector, density, elasticity);
  ```

- **Collider**:

  ```javascript
  object.addColider();
  ```

- **Sprite Renderer**:
  ```javascript
  object.addSpriteRenderer(shape, color);
  ```

#### Using Object Hierarchy

```javascript
gameEngine.addSceneObject(
  `${name}`,
  posX,
  posY,
  rotation,
  width,
  height,
  `${parent}`
);
const child = gameEngine.objects[`${name}`];
```

#### Drawing Elements With Canvas

```javascript
let canvas = document.getElementById('canvas');
export let c = canvas.getContext('2d'); // import the canvas in the GameEngine.js file

let windowW = window.innerWidth;
let windowH = window.innerHeight;

canvas.width = windowW;
canvas.height = windowH;

// Only works with a filped canvas, decided to flip the y-axis so it's more like actual game engines
c.transform(1, 0, 0, -1, 0, canvas.height);

//And finally:
gameEngine.drawObjects();
```

#### Simulating the 2D Rigid Bodies

```javascript
let previousT;
function update(time) {
  if (previousT == null) {
    previousT = time;
    window.requestAnimationFrame(update);
    return;
  }

  const deltaT = time - previousT;

  /*The inputs are 
  a number from 1 to 100 that determines how accurate the simulation is
  and the time between frames*/
  gameEngine.simulateObjectPhysics(100, deltaT);

  previousT = time;
  window.requestAnimationFrame(update);
}
window.requestAnimationFrame(update);
```
