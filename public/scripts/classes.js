class Transform {
  constructor({ position, angle, scale }) {
    this.position.x = position.x;
    this.position.y = position.y;
    this.rotation = rotation;
    this.scale.x = scale.x;
    this.scale.y = scale.y;
  }
}
class SpriteRenderer {
  constructor({ sprite, color }) {
    this.sprite = sprite;
    this.color = color;
  }
}

class GameEngine {
  constructor(canvas) {
    let objects = {};
  }
}
