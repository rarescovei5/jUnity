class Transform {
  constructor(position, angle = 0, scale) {
    this.position = { x: position.x, y: position.y };
    this.rotation = angle;
    this.scale = { x: scale.x, y: scale.y };
  }
}
class SpriteRenderer {
  constructor(shape, color) {
    this.sprite = shape;
    this.color = color;
  }
}

export class GameEngine {
  constructor() {
    this.objects = {};

    //Used only internally
    this.objectFound = false;
  }
  addSceneObject(name, position, angle, scale) {
    // If There is already an object with that name then return
    this.objectExists(name, this.objects);
    if (this.objectFound) {
      console.log('item found');
      this.objectFound = false;
      return;
    }

    //Add object with *name* with compulsory Transform class
    this.objects[name] = {
      transform: new Transform(position, angle, scale),
      children: {},
    };
  }
  objectExists(name, object) {
    if (this.objectFound == true) return;

    if (!object.children) {
      for (const id in object) {
        let sceneObject = object.id;

        if (id == name) {
          this.objectFound = true;
          return;
        } else if (sceneObject.children) {
          sceneObject(name, sceneObject.children);
        }
      }
    } else {
      this.objectExists(name, object.children);
    }
  }
}
