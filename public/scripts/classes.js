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
  }
  addSceneObject(name, position, angle, scale) {
    if (this.objects[name]) return; // If There is already an object with that name then return

    //Add object with *name* with compulsory Transform class
    this.objects[name] = {
      Transform: new Transform(position, angle, scale),
      Child: {},
    };
  }
}
