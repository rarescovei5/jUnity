//Instead of game.js, change the file to where you have your canvas,
import { c } from './game.js';

//---------------------------------- Utility Classes ----------------------------------
class FlatVector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  addVector(v) {
    let x = this.x + v.x;
    let y = this.y + v.y;
    return new FlatVector(x, y);
  }
  subtractVector(v) {
    let x = this.x - v.x;
    let y = this.y - v.y;
    return new FlatVector(x, y);
  }
  multiplyScalar(scalar) {
    let x = this.x * scalar;
    let y = this.y * scalar;
    return new FlatVector(x, y);
  }
  divideScalar(scalar) {
    let x = this.x / scalar;
    let y = this.y / scalar;
    return new FlatVector(x, y);
  }
  transform(transform = { angle: 0, x: 0, y: 0 }) {
    return new FlatVector(
      Math.round(Math.cos((transform.angle * Math.PI) / 180) * this.x) -
        Math.round(Math.sin((transform.angle * Math.PI) / 180) * this.y) +
        transform.x,
      Math.round(Math.sin((transform.angle * Math.PI) / 180) * this.x) +
        Math.round(Math.cos((transform.angle * Math.PI) / 180) * this.y) +
        transform.y
    );
  }
  equals(v) {
    return this.x == v.x && this.y == v.y;
  }
  opositeVector() {
    return new FlatVector(-this.x, -this.y);
  }
}
const FlatMath = {
  clamp: function (value, min, max) {
    if (value < min) {
      return min;
    }
    if (value > max) {
      return max;
    }

    return value;
  },
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
const Collision = {
  projectVertices: function (vertices = [], axis = new FlatVector()) {
    let min = 1000000000000000;
    let max = -min;

    for (let i = 0; i < vertices.length; i++) {
      let v = vertices[i];
      let proj = FlatMath.dot(v, axis);

      if (proj < min) {
        min = proj;
      }
      if (proj > max) {
        max = proj;
      }
    }

    return [min, max];
  },
  arithmeticMean: function (vertices) {
    let sumX = 0;
    let sumY = 0;
    for (let i = 0; i < vertices.length; i++) {
      let v = vertices[i];
      sumX += v.x;
      sumY += v.y;
    }

    return new FlatVector(sumX / vertices.length, sumY / vertices.length);
  },
  IntersectPoligons: function (verticesA, verticesB) {
    let normal = nullVector;
    let depth = 1000000000;

    for (let i = 0; i < verticesA.length; i++) {
      let va = verticesA[i];
      let vb = verticesA[(i + 1) % verticesA.length];

      let edge = vb.subtractVector(va);
      let axis = new FlatVector(-edge.y, edge.x);

      let [minA, maxA] = this.projectVertices(verticesA, axis);
      let [minB, maxB] = this.projectVertices(verticesB, axis);

      if (minA >= maxB || minB >= maxA) {
        return false;
      }

      let axisDepth = Math.min(maxB - minA, maxA - minB);

      if (axisDepth < depth) {
        depth = axisDepth;
        normal = axis;
      }
    }

    for (let i = 0; i < verticesB.length; i++) {
      let va = verticesB[i];
      let vb = verticesB[(i + 1) % verticesB.length];

      let edge = vb.subtractVector(va);
      let axis = new FlatVector(-edge.y, edge.x);

      let [minA, maxA] = this.projectVertices(verticesA, axis);
      let [minB, maxB] = this.projectVertices(verticesB, axis);

      if (minA >= maxB || minB >= maxA) {
        return false;
      }

      let axisDepth = Math.min(maxB - minA, maxA - minB);

      if (axisDepth < depth) {
        depth = axisDepth;
        normal = axis;
      }
    }

    depth /= FlatMath.length(normal);
    normal = FlatMath.normalize(normal);

    let centerA = this.arithmeticMean(verticesA);
    let centerB = this.arithmeticMean(verticesB);
    let direction = centerB.subtractVector(centerA);

    if (FlatMath.dot(direction, normal) < 0) {
      normal = normal.opositeVector();
    }

    return { normal, depth };
  },
  IntersectCircles: function (c1, rad1, c2, rad2) {
    let normal = nullVector;
    let depth = 0;

    let distance = FlatMath.distance(c1, c2);
    let radii = rad1 + rad2;

    //If the distance between the circles is bigger than their radii added together than return since they are not intersecting
    if (distance >= radii) {
      return false;
    }

    c2 = c2.subtractVector(c1);

    normal = FlatMath.normalize(c2);
    depth = radii - distance;

    return { normal, depth };
  },
};

let nullVector = new FlatVector(0, 0);

//---------------------------------- Game Engine Property Classes ----------------------------------
class Transform {
  constructor(position, rotation = 0, scale) {
    this.position = { x: position.x, y: position.y };
    this.rotation = rotation;
    this.scale = { x: scale.x, y: scale.y };

    this.vertices = [];
    this.triangles = [];
  }

  calculateBoxVertices() {
    //Initialize directions
    let left = -this.scale.x / 2;
    let right = -left;
    let bottom = -this.scale.y / 2;
    let top = -bottom;

    //Calculate vertices
    let transform, v0, v1, v2, v3;

    transform = {
      angle: this.rotation,
      ...new FlatVector(this.position.x, this.position.y),
    };
    v0 = new FlatVector(left, top).transform(transform);
    v1 = new FlatVector(right, top).transform(transform);
    v2 = new FlatVector(right, bottom).transform(transform);
    v3 = new FlatVector(left, bottom).transform(transform);

    //Add vertices
    this.vertices[0] = v0;
    this.vertices[1] = v1;
    this.vertices[2] = v2;
    this.vertices[3] = v3;

    this.createBoxTriangles();
  }

  createBoxTriangles() {
    this.triangles[0] = 0;
    this.triangles[1] = 1;
    this.triangles[2] = 2;
    this.triangles[3] = 0;
    this.triangles[4] = 2;
    this.triangles[5] = 3;
  }

  calculateTriangleVertices() {
    //Reset Previous Vertices
    this.vertices = [];
    // find FlatVectors for that looks a each point
    let th, phi, v0, v1, v2;
    let b2 = this.scale.x / 2;
    let h1 = this.scale.y * (1 / 3);

    let h2 = this.scale.y * (2 / 3);
    let h3 = Math.sqrt(h1 ** 2 + b2 ** 2);

    phi = ((90 - this.rotation) * Math.PI) / 180;
    v0 = new FlatVector(
      Math.round(Math.cos(phi) * h2) + this.position.x,
      Math.round(Math.sin(phi) * h2) + this.position.y
    );

    th = Math.atan2(-h1, b2);
    phi = th - (this.rotation * Math.PI) / 180;
    v1 = new FlatVector(
      Math.round(Math.cos(phi) * h3) + this.position.x,
      Math.round(Math.sin(phi) * h3) + this.position.y
    );

    th = Math.atan2(-h1, -b2);
    phi = th - (this.rotation * Math.PI) / 180;
    v2 = new FlatVector(
      Math.round(Math.cos(phi) * h3) + this.position.x,
      Math.round(Math.sin(phi) * h3) + this.position.y
    );

    this.vertices.push(v0, v1, v2);
  }
}
class SpriteRenderer {
  constructor(shape, color) {
    this.sprite = shape;
    this.color = color;
  }
}
class BoxColider {}
class CircleColider {}
class TriangleColider {}
class RigidBody2D {
  constructor(type, mass, gravity, density) {
    this.type = type;
    this.mass = mass;
    this.gravity = gravity;
    this.density = density;
  }
}

//---------------------------------- Game Engine Main Class ----------------------------------
export class GameEngine {
  constructor() {
    this.objects = {};

    //Variables used for faster computing
    this.objectsWithRender = [];
    this.taggedObjects = {};
    this.objectsWithRigidBody2D = [];
    this.objectsWithColider = {};
  }

  //With this you can add objects to the scene
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
        this.changeObjectTag(name, tag);
      } else {
        this.changeObjectTag(name, 'Untagged');
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
        this.changeObjectTag(name, tag);
      } else {
        this.changeObjectTag(name, 'Untagged');
      }
    }
  }

  //Utility Methods for adding properties
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

    path.push(name);

    //Get the object with *name*
    let sceneObject = this.getObjectPointer(path);

    //Add SpriteRenderer class to object
    sceneObject.spriteRenderer = new SpriteRenderer(shape, color);
    if (shape == 'box') {
      sceneObject.transform.calculateBoxVertices();
    } else if (shape == 'triangle') {
      sceneObject.transform.calculateTriangleVertices();
    }

    this.objectsWithRender.push(path);
  }
  addBoxColider(name = '') {
    //If name doesnt exist return
    let path = this.findObjectParent(name, this.objects);
    if (!path) {
      throw console.error(`-=- Object Name doesn't exist -=-`);
    }

    //Get the object with *name*
    path.push(name);
    let sceneObject = this.getObjectPointer(path);

    //Add BoxColider class to object
    sceneObject.colider = new BoxColider();

    //If tag exists, push the path to the current object
    if (this.objectsWithColider['BoxColider']) {
      this.objectsWithColider['BoxColider'].push(path);
    } //If tag doesnt exist, initialize it and set it to a list containing the path to the current object
    else {
      this.objectsWithColider['BoxColider'] = [path];
    }
  }
  addCircleColider(name = '') {
    //If name doesnt exist return
    let path = this.findObjectParent(name, this.objects);
    if (!path) {
      throw console.error(`-=- Object Name doesn't exist -=-`);
    }

    //Get the object with *name*
    path.push(name);
    let sceneObject = this.getObjectPointer(path);

    //Add BoxColider class to object
    sceneObject.colider = new CircleColider();

    //If tag exists, push the path to the current object
    if (this.objectsWithColider['CircleColider']) {
      this.objectsWithColider['CircleColider'].push(path);
    } //If tag doesnt exist, initialize it and set it to a list containing the path to the current object
    else {
      this.objectsWithColider['CircleColider'] = [path];
    }
  }
  addTriangleColider(name = '') {
    //If name doesnt exist return
    let path = this.findObjectParent(name, this.objects);
    if (!path) {
      throw console.error(`-=- Object Name doesn't exist -=-`);
    }

    //Get the object with *name*
    path.push(name);
    let sceneObject = this.getObjectPointer(path);

    //Add BoxColider class to object
    sceneObject.colider = new TriangleColider();

    //If tag exists, push the path to the current object
    if (this.objectsWithColider['TriangleColider']) {
      this.objectsWithColider['TriangleColider'].push(path);
    } //If tag doesnt exist, initialize it and set it to a list containing the path to the current object
    else {
      this.objectsWithColider['TriangleColider'] = [path];
    }
  }
  addRigidBody2D(name, type, mass, gravity, density = 1) {
    //If name doesnt exist return
    let path = this.findObjectParent(name, this.objects);
    if (!path) {
      throw console.error(`-=- Object Name doesn't exist -=-`);
    }

    //Get the object with *name*
    path.push(name);
    let sceneObject = this.getObjectPointer(path);

    //Add BoxColider class to object
    sceneObject.rigidBody2D = new RigidBody2D(type, mass, gravity, density);

    this.objectsWithRigidBody2D.push(path);
  }

  //RigidBody Functionalities
  simulateObjectForces() {
    //Have a cache so you don't double check
    let cache = new Set();

    //Loop Through every object with a rigidBody2D
    for (let i = 0; i < this.objectsWithRigidBody2D.length; i++) {
      //Get the Path to the objectA and then get the object
      let pathA = this.objectsWithRigidBody2D[i];
      let objectA = this.getObjectPointer(pathA);

      //If object has no colider than continue since it can t interact with others
      if (!objectA.colider) {
        continue;
      }

      //Loop through every *shape*Colider list
      for (const shape in this.objectsWithColider) {
        let currentColiderObjects = this.objectsWithColider[shape];

        //Loop through objects that have the *shape*Colider
        for (let j = 0; j < currentColiderObjects.length; j++) {
          let pathB = this.objectsWithColider[shape][j];

          /*If the path to both objects are the same it means we are checking the same object
          or if the pair is in the cache then we have already checked it*/

          if (
            pathA[pathA.length - 1] == pathB[pathB.length - 1] ||
            cache.has(pathB[pathB.length - 1] + pathA[pathA.length - 1])
          ) {
            continue;
          } else {
            cache.add(pathA[pathA.length - 1] + pathB[pathB.length - 1]);
          }

          //Get the objectB
          let objectB = this.getObjectPointer(pathB);

          //Find out if the polygons intersect
          let polygonIntersection = Collision.IntersectPoligons(
            objectA.transform.vertices,
            objectB.transform.vertices
          );
          this.resolveIntersction(polygonIntersection, objectB, pathA, pathB);
          //Find out if the circles intersect ( returns either *false* or *{new FlatVector(), depth}*)
          // let intersection = Collision.IntersectCircles(
          //   new FlatVector(
          //     objectA.transform.position.x,
          //     objectA.transform.position.y
          //   ),
          //   objectA.transform.scale.x / 2,
          //   new FlatVector(
          //     objectB.transform.position.x,
          //     objectB.transform.position.y
          //   ),
          //   objectB.transform.scale.x / 2
          // );

          // if (intersection) {
          //   intersection.normal = intersection.normal.multiplyScalar(
          //     intersection.depth
          //   );
          //   if (!objectB.rigidBody2D) {
          //     this.moveObject(
          //       pathA[pathA.length - 1],
          //       intersection.normal.opositeVector()
          //     );
          //     continue;
          //   }
          //   intersection.normal = intersection.normal.divideScalar(2);

          //   this.moveObject(
          //     pathA[pathA.length - 1],
          //     intersection.normal.opositeVector()
          //   );
          //   this.moveObject(pathB[pathB.length - 1], intersection.normal);
          // }
        }
      }
    }
  }
  resolveIntersction(intersection, objectB, pathA, pathB) {
    if (intersection) {
      intersection.normal = intersection.normal.multiplyScalar(
        intersection.depth
      );

      //If objectB doesn t have a rigid body then resolve all the depth to objectA
      if (!objectB.rigidBody2D) {
        this.moveObject(
          pathA[pathA.length - 1],
          intersection.normal.opositeVector()
        );
      } else {
        //If objectB has have a rigid body then resolve depth to  both of them
        intersection.normal = intersection.normal.divideScalar(2);

        this.moveObject(
          pathA[pathA.length - 1],
          intersection.normal.opositeVector()
        );
        this.moveObject(pathB[pathB.length - 1], intersection.normal);
      }
    }
  }

  //Methods for changing things
  changeObjectTag(name, tag) {
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
  changeObjectColor(name, tag) {
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

  //Methods for changing transform properties
  moveObject(name, increment = { x, y }) {
    let path = this.findObjectParent(name, this.objects);
    if (!path) {
      throw console.error(
        `-=- Invalid Name -=- \n Can't increment object because ${name} doesn't exist`
      );
    }
    path.push(name);

    //Get the scene Object
    let sceneObject = this.getObjectPointer(path);

    //Increment Position
    sceneObject.transform.position.x += increment.x;
    sceneObject.transform.position.y += increment.y;

    //Recalculate Vertices
    if (sceneObject.spriteRenderer.sprite == 'box') {
      sceneObject.transform.calculateBoxVertices();
    }
    if (sceneObject.spriteRenderer.sprite == 'triangle') {
      sceneObject.transform.calculateTriangleVertices();
    }
  }
  moveObjectTo(name, newPosition = { x, y }) {
    let path = this.findObjectParent(name, this.objects);
    if (!path) {
      throw console.error(
        `-=- Invalid Object Name -=- \n Can't change object position because ${name} doesn't exist`
      );
    }
    path.push(name);

    //Get the scene Object
    let sceneObject = this.getObjectPointer(path);

    //Change Position
    sceneObject.transform.position.x = newPosition.x;
    sceneObject.transform.position.y = newPosition.y;

    //Recalculate Vertices
    if (sceneObject.spriteRenderer.sprite == 'box') {
      sceneObject.transform.calculateBoxVertices();
    }
    if (sceneObject.spriteRenderer.sprite == 'triangle') {
      sceneObject.transform.calculateTriangleVertices();
    }
  }
  rotateObject(name, angle) {
    let path = this.findObjectParent(name);
    if (!path) {
      throw console.error(
        `-=- Invalid Name -=- \n Can't increment object because ${name} doesn't exist`
      );
    }
    path.push(name);
    let sceneObject = this.getObjectPointer(path, this.objects);

    sceneObject.transform.rotation += angle;

    if (sceneObject.spriteRenderer.sprite == 'box') {
      sceneObject.transform.calculateBoxVertices();
      console.log(sceneObject.transform.vertices);
    } else if (sceneObject.spriteRenderer.sprite == 'triangle') {
      sceneObject.transform.calculateTriangleVertices();
    }
  }

  //Utility Methods for finding stuff
  findObjectParent(name, object = this.objects, path = []) {
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

  //Looks at this.objectWithRenderers and draws everything in there
  drawObjects() {
    for (let i = 0; i < this.objectsWithRender.length; i++) {
      let sceneObject = this.getObjectPointer(this.objectsWithRender[i]);

      c.beginPath();
      c.fillStyle = sceneObject.spriteRenderer.color;

      if (sceneObject.spriteRenderer.sprite == 'box') {
        c.moveTo(
          sceneObject.transform.vertices[0].x,
          sceneObject.transform.vertices[0].y
        );
        c.lineTo(
          sceneObject.transform.vertices[1].x,
          sceneObject.transform.vertices[1].y
        );
        c.lineTo(
          sceneObject.transform.vertices[2].x,
          sceneObject.transform.vertices[2].y
        );
        c.lineTo(
          sceneObject.transform.vertices[3].x,
          sceneObject.transform.vertices[3].y
        );
        c.lineTo(
          sceneObject.transform.vertices[0].x,
          sceneObject.transform.vertices[0].y
        );
      } else if (sceneObject.spriteRenderer.sprite == 'triangle') {
        c.moveTo(
          sceneObject.transform.vertices[0].x,
          sceneObject.transform.vertices[0].y
        );
        c.lineTo(
          sceneObject.transform.vertices[1].x,
          sceneObject.transform.vertices[1].y
        );
        c.lineTo(
          sceneObject.transform.vertices[2].x,
          sceneObject.transform.vertices[2].y
        );
        c.lineTo(
          sceneObject.transform.vertices[0].x,
          sceneObject.transform.vertices[0].y
        );
      } else if (sceneObject.spriteRenderer.sprite == 'circle') {
        c.arc(
          sceneObject.transform.position.x,
          sceneObject.transform.position.y,
          sceneObject.transform.scale.x / 2,
          sceneObject.transform.rotation,
          2 * Math.PI + sceneObject.transform.rotation
        );
      }

      c.fill();
      c.closePath();
    }
  }
}
