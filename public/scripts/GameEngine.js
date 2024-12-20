//Instead of game.js, change the file to where you have your canvas,
import { c } from './game.js';

//---------------------------------- Utility Classes ----------------------------------
export class FlatVector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  addVector(v) {
    this.x = this.x + v.x;
    this.y = this.y + v.y;
  }
  subtractVector(v) {
    this.x = this.x - v.x;
    this.y = this.y - v.y;
  }
  multiplyScalar(scalar) {
    this.x = this.x * scalar;
    this.y = this.y * scalar;
  }
  divideScalar(scalar) {
    this.x = this.x / scalar;
    this.y = this.y / scalar;
  }
  equal(v) {
    return this.x == v.x && this.y == v.y;
  }
  opositeVector(v) {
    return new FlatVector(-v.x, -v.y);
  }
}
export const FlatMath = {
  length: function (v) {
    return Math.sqrt(v.x ** 2 + v.y ** 2);
  },
  distance: function (a, b) {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
  },
  normalize: function (v) {
    let len = this.length(v);
    return new FlatVector(v.x / len, v.y / len);
  },
  dot: function (a, b) {
    return a.x * b.x + a.y * b.y;
  },
  cross: function (a, b) {
    return a.x * b.y - a.y * b.x;
  },
};
let zero = new FlatVector(0, 0);

//---------------------------------- Game Engine Property Classes ----------------------------------
class Transform {
  constructor(position, rotation = 0, scale) {
    this.position = { x: position.x, y: position.y };
    this.rotation = rotation;
    this.scale = { x: scale.x, y: scale.y };

    this.vertices = [];
  }

  calculateBoxVertices() {
    let th, phi, v0, v1, v2, v3;
    let sY2 = this.scale.y / 2;
    let sX2 = this.scale.x / 2;
    let diagonal = Math.sqrt(sX2 ** 2 + sY2 ** 2);

    th = Math.atan2(sY2, sX2);
    phi = th - (this.rotation * Math.PI) / 180;
    v1 = new FlatVector(Math.cos(phi) * diagonal, Math.sin(phi) * diagonal);

    v3 = v1.opositeVector();

    th = Math.atan2(-sY2, sX2);
    phi = th - (this.rotation * Math.PI) / 180;
    v2 = new FlatVector(Math.cos(phi) * diagonal, Math.sin(phi) * diagonal);

    v0 = v2.opositeVector();
  }

  calculateTriangleVertices() {}
}
class SpriteRenderer {
  constructor(shape, color) {
    this.sprite = shape;
    this.color = color;
  }
}

//---------------------------------- Game Engine Main Class ----------------------------------
export class GameEngine {
  constructor() {
    this.objects = {};

    //Variables used for faster computing
    this.objectsWithRender = [];
    this.taggedObjects = {};
  }

  addSceneObject(
    name = '',
    position = { x: 0, y: 0 },
    rotation = 0,
    scale = { x: 0, y: 0 },
    parent = '',
    tag = ''
  ) {
    // If name is invalid return
    if (typeof name !== typeof '') {
      throw console.error(
        `-=- Invalid Object Name -=- \n Name can not be a ${typeof name}`
      );
    } else if (name === '') {
      throw console.error(
        `-=- Invalid Object Name -=- \n Name Can not be an empty string`
      );
    }
    // If Tag is invalid return
    if (typeof tag !== typeof '') {
      throw console.error(
        `-=- Invalid Object Tag -=- \n Tag can not be a ${typeof tag}`
      );
    }

    // If There is already an object with that name then return
    let path = this.findObjectParent(name, this.objects);
    if (path) {
      throw console.error('-=- Object Name already exists -=-');
    }

    //Add object with *name* to *parent* with compulsory Transform class to parent
    path = this.findObjectParent(parent, this.objects);
    if (!path && parent !== '') {
      throw console.error(
        `-=- Invalid Parent Name -=- \n Parent doesn't exist`
      );
    } else if (typeof parent !== typeof '') {
      throw console.error(
        `-=- Invalid Parent Name -=- \n Parent can not be a ${typeof parent}`
      );
    } else if (parent == '') {
      //Add object with *name* with compulsory Transform class to parent
      //If parent is '' that just means the parent is this.objects

      this.objects[name] = {
        transform: new Transform(position, rotation, scale),
        children: {},
      };

      //Add a tag if it exists else mark it as Untagged
      if (tag !== '') {
        this.changeTag(name, tag);
      } else {
        this.changeTag(name, 'Untagged');
      }
    } else {
      //Add object with *name* to *parent* with compulsory Transform class to parent
      path.push(parent);
      this.getObjectPointer(path).children[name] = {
        transform: new Transform(position, rotation, scale),
        children: {},
      };

      //Add a tag if it exists else mark it as Untagged
      if (tag !== '') {
        this.changeTag(name, tag);
      } else {
        this.changeTag(name, 'Untagged');
      }
    }
  }

  changeTag(name, tag) {
    //Get the objects with specified *name*
    let path = this.findObjectParent(name, this.objects);
    path.push(name);
    this.getObjectPointer(path).tag = tag;

    //Delete other tag
    for (const t in this.taggedObjects) {
      let objectsWithT = this.taggedObjects[t];
      let tLen = t.length;
      for (let i = 0; i < tLen; i++) {
        if (objectsWithT[i] == name) {
          this.taggedObjects[t].splice(i, 1);
        }
      }
    }

    //If tag exists, push the path to the current object
    if (this.taggedObjects[tag]) {
      this.taggedObjects[tag].push(path);
    } //If tag doesnt exist, initialize it and set it to a list containing the path to the current object
    else {
      this.taggedObjects[tag] = [path];
    }
  }

  findObjectParent(name, object, path = []) {
    for (const id in object) {
      let sceneObject = object[id];

      // Add the current object's name to the path
      path.push(id);

      if (id === name) {
        // If found, remove the current name and return the path
        path.pop();
        return path;
      }

      // Recur into children if they exist
      if (sceneObject.children) {
        const result = this.findObjectParent(name, sceneObject.children, path);
        if (result) return result; // Return the path if found
      }

      // Remove the current object name if not found in this branch
      path.pop();
    }

    // Return null if the object is not found
    return null;
  }

  getObjectPointer(path) {
    let schema = this.objects;
    for (let i = 0; i < path.length; i++) {
      if (i == 0) {
        schema = schema[path[i]];
      } else {
        schema = schema.children[path[i]];
      }
    }

    return schema;
  }

  addSpriteRenderer(name = '', shape = '', color = '') {
    shape = shape.toLowerCase();

    // If shape is invalid return
    if (typeof shape !== typeof '') {
      throw console.error(
        `-=- Invalid Object Shape -=- \n Shape can not be a ${typeof name}`
      );
    } else if (shape === '') {
      throw console.error(
        `-=- Invalid Object Shape -=- \n Shape can not be an empty string`
      );
    }
    // If color is invalid return
    if (typeof color !== typeof '') {
      throw console.error(
        `-=- Invalid Object Color -=- \n Color can not be a ${typeof name}`
      );
    } else if (color === '') {
      throw console.error(
        `-=- Invalid Object Color -=- \n Color can not be an empty string`
      );
    }

    //If name doesnt exist return
    let path = this.findObjectParent(name, this.objects);
    if (!path) {
      throw console.error(`-=- Object Name doesn't exist -=-`);
    }

    //Add SpriteRenderer class to object
    path.push(name);
    this.getObjectPointer(path).spriteRenderer = new SpriteRenderer(
      shape,
      color
    );

    this.objectsWithRender.push(path);
  }

  drawObjects() {
    for (let i = 0; i < this.objectsWithRender.length; i++) {
      let sceneObject = this.getObjectPointer(this.objectsWithRender[i]);

      c.beginPath();
      c.fillStyle = sceneObject.spriteRenderer.color;
      c.strokeStyle = sceneObject.spriteRenderer.color;

      if (sceneObject.spriteRenderer.sprite == 'box') {
        c.moveTo(
          sceneObject.transform.position.x,
          sceneObject.transform.position.y
        );
        c.lineTo(
          sceneObject.transform.position.x + sceneObject.transform.scale.x,
          sceneObject.transform.position.y
        );
        c.lineTo(
          sceneObject.transform.position.x + sceneObject.transform.scale.x,
          sceneObject.transform.position.y + sceneObject.transform.scale.y
        );
        c.lineTo(
          sceneObject.transform.position.x,
          sceneObject.transform.position.y + sceneObject.transform.scale.y
        );
        c.lineTo(
          sceneObject.transform.position.x,
          sceneObject.transform.position.y
        );
      } else if (sceneObject.spriteRenderer.sprite == 'triangle') {
        c.moveTo(
          sceneObject.transform.position.x,
          sceneObject.transform.position.y
        );
        c.lineTo(
          sceneObject.transform.position.x + sceneObject.transform.scale.x,
          sceneObject.transform.position.y
        );
        c.lineTo(
          (2 * sceneObject.transform.position.x +
            sceneObject.transform.scale.x) /
            2,
          sceneObject.transform.position.y + sceneObject.transform.scale.y
        );
        c.lineTo(
          sceneObject.transform.position.x,
          sceneObject.transform.position.y
        );
      } else if (sceneObject.spriteRenderer.sprite == 'circle') {
        c.arc(
          sceneObject.transform.position.x,
          sceneObject.transform.position.y,
          sceneObject.transform.scale.x / 2,
          0,
          2 * Math.PI
        );
      }

      c.stroke();
      c.fill();
      c.closePath();
    }
  }
}
