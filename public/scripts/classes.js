//Instead of game.js, change the file to where you have your canvas,
import { c } from './game.js';

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
    this.objectsWithRender = [];
  }

  addSceneObject(
    name = '',
    position = { x: 0, y: 0 },
    angle = 0,
    scale = { x: 0, y: 0 },
    parent = ''
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
        transform: new Transform(position, angle, scale),
        children: {},
      };
    } else {
      path.push(parent);
      this.getObjectPointer(path).children[name] = {
        transform: new Transform(position, angle, scale),
        children: {},
      };
      //Add object with *name* to *parent* with compulsory Transform class to parent
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
        c.strokeStyle = sceneObject.spriteRenderer.color;
        c.stroke();
      } else if (sceneObject.spriteRenderer.sprite == 'triangle') {
      } else if (sceneObject.spriteRenderer.sprite == 'circle') {
      }

      c.closePath();
    }
  }
}
