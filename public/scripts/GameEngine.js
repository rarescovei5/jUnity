//Instead of game.js, change the file to where you have your canvas,
import { c } from './game.js';

//-----------------------==----------- Utility Classes ----------------------------------
export class FlatVector {
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
    let sin = Math.sin((transform.angle * Math.PI) / 180);
    let cos = Math.cos((transform.angle * Math.PI) / 180);
    return new FlatVector(
      cos * this.x - sin * this.y + transform.x,
      sin * this.x + cos * this.y + transform.y
    );
  }
  equals(v) {
    return this.x === v.x && this.y === v.y;
  }
  opositeVector() {
    return new FlatVector(-this.x, -this.y);
  }
}
let nullVector = new FlatVector(0, 0);

export const FlatMath = {
  clamp: function (value, min, max) {
    return Math.max(min, Math.min(max, value));
  },
  length: function (v) {
    return Math.sqrt(v.x ** 2 + v.y ** 2);
  },
  distance: function (a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
  },
  lengthSquared: function (v) {
    return v.x ** 2 + v.y ** 2;
  },
  distanceSquared: function (a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return dx * dx + dy * dy;
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
  aproximatelyEqual(a, b) {
    return Math.abs(a - b) < 0.001;
  },
  vAproximatelyEqual(a, b) {
    return this.distanceSquared(a, b) < 0.001;
  },
};
const Collision = {
  pointSegmentDistance(p, a, b) {
    let ab = b.subtractVector(a);
    let ap = p.subtractVector(a);

    let proj = FlatMath.dot(ap, ab);
    let abLenSq = FlatMath.lengthSquared(ab);
    let d = proj / abLenSq;

    let cp, distanceSquared;

    if (d <= 0) {
      cp = a;
    } else if (d >= 1) {
      cp = b;
    } else {
      cp = a.addVector(ab.multiplyScalar(d));
    }

    distanceSquared = FlatMath.distanceSquared(p, cp);

    return {
      cp,
      distanceSquared,
    };
  },
  projectVertices: function (vertices = [], axis = new FlatVector()) {
    let min = Infinity;
    let max = -Infinity;

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
  projectCircle: function (center, radius, axis = new FlatVector()) {
    let direction = FlatMath.normalize(axis);
    let directionAndRadius = direction.multiplyScalar(radius);

    let p1 = center.addVector(directionAndRadius);
    let p2 = center.subtractVector(directionAndRadius);

    let min = FlatMath.dot(p1, axis);
    let max = FlatMath.dot(p2, axis);

    if (min > max) {
      let tempMin = min;
      min = max;
      max = tempMin;
    }

    return [min, max];
  },
  findClosestPointOnPolygon: function (circleCenter, vertices) {
    let result = -1;
    let minDistance = Infinity;

    for (let i = 0; i < vertices.length; i++) {
      let v = vertices[i];
      let distance = FlatMath.distance(v, circleCenter);

      if (distance < minDistance) {
        minDistance = distance;
        result = i;
      }
    }
    return result;
  },
  //Collision stuff
  IntersectCirclePolygon: function (
    circleCenter,
    circleRadius,
    polygonCenter,
    vertices
  ) {
    let normal = nullVector;
    let depth = 10000000;

    let axis = nullVector;
    let axisDepth = 0;

    let minA, maxA, minB, maxB;

    for (let i = 0; i < vertices.length; i++) {
      let va = vertices[i];
      let vb = vertices[(i + 1) % vertices.length];

      let edge = vb.subtractVector(va);
      axis = new FlatVector(-edge.y, edge.x);
      axis = FlatMath.normalize(axis);

      [minA, maxA] = this.projectVertices(vertices, axis);
      [minB, maxB] = this.projectCircle(circleCenter, circleRadius, axis);

      if (minA >= maxB || minB >= maxA) {
        return false;
      }

      axisDepth = Math.min(maxB - minA, maxA - minB);

      if (axisDepth < depth) {
        depth = axisDepth;
        normal = axis;
      }
    }
    //If it gets to here it means that the polygon intersected the square formed by the circle

    let cpIndex = this.findClosestPointOnPolygon(circleCenter, vertices);

    let cp = vertices[cpIndex];

    axis = cp.subtractVector(circleCenter);
    axis = FlatMath.normalize(axis);

    [minA, maxA] = this.projectVertices(vertices, axis);
    [minB, maxB] = this.projectCircle(circleCenter, circleRadius, axis);

    if (minA >= maxB || minB >= maxA) {
      return false;
    }

    axisDepth = Math.min(maxB - minA, maxA - minB);

    if (axisDepth < depth) {
      depth = axisDepth;
      normal = axis;
    }

    if (!polygonCenter) {
      polygonCenter = this.arithmeticMean(vertices);
    }

    let direction = polygonCenter.subtractVector(circleCenter);

    if (FlatMath.dot(direction, normal) < 0) {
      normal = normal.opositeVector();
    }

    return { normal, depth };
  },
  IntersectPolygons: function (centerA, verticesA, centerB, verticesB) {
    let normal = nullVector;
    let depth = Infinity;

    for (let i = 0; i < verticesA.length; i++) {
      let va = verticesA[i];
      let vb = verticesA[(i + 1) % verticesA.length];

      let edge = vb.subtractVector(va);
      let axis = new FlatVector(-edge.y, edge.x);
      axis = FlatMath.normalize(axis);

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
      axis = FlatMath.normalize(axis);

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
    if (!centerA) centerA = this.arithmeticMean(verticesA);
    if (!centerB) centerB = this.arithmeticMean(verticesB);
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
  doObjectsCollide: function (objectA, objectB) {
    if (
      (objectA.shape === 'box' || objectA.shape === 'triangle') &&
      (objectB.shape === 'box' || objectB.shape === 'triangle')
    ) {
      return this.IntersectPolygons(
        objectA.position,
        objectA.vertices,
        objectB.position,
        objectB.vertices
      );
    } else if (objectA.shape === 'circle' && objectB.shape === 'circle') {
      return this.IntersectCircles(
        objectA.position,
        objectA.radius,
        objectB.position,
        objectB.radius
      );
    } else {
      if (objectA.shape === 'box' || objectA.shape === 'triangle') {
        let special = this.IntersectCirclePolygon(
          objectB.position,
          objectB.radius,
          objectA.position,
          objectA.vertices
        );

        if (!special) return;

        special.normal = special.normal.opositeVector();
        return special;
      } else {
        return this.IntersectCirclePolygon(
          objectA.position,
          objectA.radius,
          objectB.position,
          objectB.vertices
        );
      }
    }
  },
  intersectAABBs: function (a, b) {
    if (
      a.max.x <= b.min.x ||
      b.max.x <= a.min.x ||
      a.max.y <= b.min.y ||
      b.max.y <= a.min.y
    ) {
      return false;
    } else {
      return true;
    }
  },
  //Point of Collision stuff
  findContactPoints: function (objectA, objectB) {
    let contact1 = nullVector;
    let contact2 = nullVector;
    let contactCount = 0;

    if (
      (objectA.shape === 'box' || objectA.shape === 'triangle') &&
      (objectB.shape === 'box' || objectB.shape === 'triangle')
    ) {
      //Both polygons
      let result = this.findCPpp(objectA.vertices, objectB.vertices);
      contact1 = result.contact1;
      contact2 = result.contact2;

      contactCount = result.contactCount;
    } else if (objectA.shape === 'circle' && objectB.shape === 'circle') {
      //Both Circles
      contact1 = this.findCPcc(
        objectA.position,
        objectA.radius,
        objectB.position
      );
      contactCount = 1;
    } else {
      if (objectA.shape === 'box' || objectA.shape === 'triangle') {
        //objectA polygon objectB circle
        contact1 = this.findCPcp(objectB.position, objectA.vertices);
        contactCount = 1;
      } else {
        //objectB polygon objectA circle
        contact1 = this.findCPcp(objectA.position, objectB.vertices);
        contactCount = 1;
      }
    }

    return { contact1, contact2, contactCount };
  },
  findCPcc: function (centerA, radiusA, centerB) {
    let ab = centerB.subtractVector(centerA);
    let dir = FlatMath.normalize(ab);
    let cp = centerA.addVector(dir.multiplyScalar(radiusA));
    return cp;
  },
  findCPcp: function (circleCenter, polygonVertices) {
    let minDistSq = Infinity;
    let cp = nullVector;

    for (let i = 0; i < polygonVertices.length; i++) {
      let va = polygonVertices[i];
      let vb = polygonVertices[(i + 1) % polygonVertices.length];

      let psd = this.pointSegmentDistance(circleCenter, va, vb);

      if (psd.distanceSquared < minDistSq) {
        minDistSq = psd.distanceSquared;
        cp = psd.cp;
      }
    }

    return cp;
  },
  findCPpp: function (verticesA, verticesB) {
    let contact1 = nullVector;
    let contact2 = nullVector;
    let contactCount = 0;

    let minDistSq = Infinity;

    for (let i = 0; i < verticesA.length; i++) {
      let p = verticesA[i];

      for (let j = 0; j < verticesB.length; j++) {
        let va = verticesB[j];
        let vb = verticesB[(j + 1) % verticesB.length];

        let psd = this.pointSegmentDistance(p, va, vb);

        if (psd.distanceSquared === minDistSq) {
          if (FlatMath.vAproximatelyEqual(psd.cp, contact1)) continue;

          contact2 = psd.cp;
          contactCount = 2;
        } else if (psd.distanceSquared < minDistSq) {
          minDistSq = psd.distanceSquared;
          contactCount = 1;
          contact1 = psd.cp;
        }
      }
    }

    for (let i = 0; i < verticesB.length; i++) {
      let p = verticesB[i];

      for (let j = 0; j < verticesA.length; j++) {
        let va = verticesA[j];
        let vb = verticesA[(j + 1) % verticesA.length];

        let psd = this.pointSegmentDistance(p, va, vb);

        if (psd.distanceSquared === minDistSq) {
          if (FlatMath.vAproximatelyEqual(psd.cp, contact1)) continue;

          contact2 = psd.cp;
          contactCount = 2;
        } else if (psd.distanceSquared < minDistSq) {
          minDistSq = psd.distanceSquared;
          contactCount = 1;
          contact1 = psd.cp;
        }
      }
    }

    return { contact1, contact2, contactCount };
  },
};
class FlatManifold {
  constructor(bodyA, bodyB, normal, depth, contact1, contact2, contactCount) {
    this.bodyA = bodyA;
    this.bodyB = bodyB;
    this.normal = normal;
    this.depth = depth;
    this.contact1 = contact1;
    this.contact2 = contact2;
    this.contactCount = contactCount;
  }
}

//---------------------------------- Scene Object Class ----------------------------------

class SceneObject {
  constructor(name, position, rotation, width, height) {
    //Transform Properties
    this.position = new FlatVector(position.x, position.y);
    this.rotation = rotation;

    this.width = width;
    this.height = height;
    this.radius;

    this.vertices = [];
    this.AABB = { min: nullVector, max: nullVector };

    //Sprite Renderer Properties
    this.shape;
    this.color;

    //Colider Properties
    this.colider = false;

    //Rigid Body 2D Properties
    this.type;

    this.mass;
    this.invMass;

    this.gravity;
    this.density;

    this.elasticity;

    this.staticFriction = 0.6;
    this.dynamicFriction = 0.4;

    this.linearVelocity = nullVector;
    this.rotationalVelocity = 0;

    this.force = nullVector;

    this.inertia = 0;
    this.invInertia = 0;

    //Customisation Properties
    this.tag = 'Untagged';
    this.name = name;
  }
  //------------------------------------ Add Property ----------------------------------------
  addSpriteRenderer(shape, color) {
    this.shape = shape;
    this.color = color;

    this.#recalculateHitbox();
  }
  addColider() {
    this.colider = true;
  }
  addRigidBody(type, mass, gravity, density, elasticity) {
    //Type of the rigid body, Dynamic or Static
    this.type = type;

    //Mass of the object
    this.gravity = gravity.divideScalar(100);
    this.density = density;

    //Elasticity
    this.elasticity = FlatMath.clamp(elasticity, 0, 1);

    //Mass of the object
    this.mass = mass;

    //Inertia
    this.inertia = this.calculateRotationalInertia();

    //Inverses
    if (this.type !== 'static') {
      this.invMass = 1 / mass;
      this.invInertia = 1 / this.inertia;
    } else {
      this.invMass = 0;
      this.invInertia = 0;
    }
  }
  //------------------------------------ Transform Methods ------------------------------------
  #calculateBoxVertices() {
    //Initialize directions
    let left = -this.width / 2;
    let right = -left;
    let bottom = -this.height / 2;
    let top = -bottom;

    //Calculate vertices
    let transform, v0, v1, v2, v3;

    transform = {
      angle: this.rotation,
      x: this.position.x,
      y: this.position.y,
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
  }
  #calculateTriangleVertices() {
    //Initialize directions
    let left = -this.width / 2;
    let right = -left;
    let bottom = -this.height * (1 / 3);
    let top = this.height * (2 / 3);

    //Calculate vertices
    let transform, v0, v1, v2;

    transform = {
      angle: this.rotation,
      x: this.position.x,
      y: this.position.y,
    };

    v0 = new FlatVector(0, top).transform(transform);
    v1 = new FlatVector(right, bottom).transform(transform);
    v2 = new FlatVector(left, bottom).transform(transform);

    //Add vertices
    this.vertices[0] = v0;
    this.vertices[1] = v1;
    this.vertices[2] = v2;
  }
  #calculateAABB() {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    if (this.shape === 'box' || this.shape === 'triangle') {
      for (let i = 0; i < this.vertices.length; i++) {
        let v = this.vertices[i];

        if (v.x < minX) minX = v.x;
        if (v.y < minY) minY = v.y;
        if (v.x > maxX) maxX = v.x;
        if (v.y > maxY) maxY = v.y;
      }
    } else if (this.shape === 'circle') {
      minX = this.position.x - this.radius;
      minY = this.position.y - this.radius;
      maxX = this.position.x + this.radius;
      maxY = this.position.y + this.radius;
    }

    this.AABB.min = new FlatVector(minX, minY);
    this.AABB.max = new FlatVector(maxX, maxY);
  }
  #recalculateHitbox() {
    if (this.shape === 'box') {
      this.#calculateBoxVertices();
    } else if (this.shape === 'triangle') {
      this.#calculateTriangleVertices();
    } else if (this.shape === 'circle') {
      this.radius = this.width / 2;
    }
    this.#calculateAABB();
  }
  rotateObject(name, angle) {
    this.rotation += angle;

    //Recalculate Hitbox
    this.#recalculateHitbox();
  }
  move(amount) {
    //Increment Position
    this.position = this.position.addVector(amount);

    //Recalculate Vertices
    this.#recalculateHitbox();
  }
  moveTo(newPosition) {
    this.position = newPosition;

    //Recalculate Vertices
    this.#recalculateHitbox();
  }

  //------------------------------------ Sprite Renderer Methods ------------------------------------

  //------------------------------------ Colider  Methods ------------------------------------

  //------------------------------------ RigidBody 2d Methods ------------------------------------
  calculateRotationalInertia() {
    let adjustment = 100;
    if (this.shape === 'circle') {
      return ((1 / 12) * this.mass * this.radius ** 2) / adjustment;
    } else if (this.shape === 'box' || this.shape === 'triangle') {
      return (
        ((1 / 12) * this.mass * (this.width ** 2 + this.height ** 2)) /
        adjustment
      );
    }
  }
  addForce(amount) {
    if (this.type === 'static') return;
    this.force = amount;
  }
  step(time, precision) {
    if (this.type === 'static') return;

    time /= precision;

    //Calculate Acceleration
    let acceleration = this.force
      .addVector(this.gravity.multiplyScalar(time))
      .divideScalar(this.mass)
      .multiplyScalar(time);

    //Apply a portion of the acceleration to the linearVelocity
    this.linearVelocity = this.linearVelocity.addVector(acceleration);

    //Add the linearVelocity to the the object position
    this.position = this.position.addVector(
      this.linearVelocity.multiplyScalar(time)
    );

    //Add the rotationalVelocity to the the object position
    this.rotation += this.rotationalVelocity;

    //Set the object force to 0
    this.force = nullVector;

    //Recalculate Hitbox
    this.#recalculateHitbox();
  }
}

//---------------------------------- Game Engine Main Class ----------------------------------
export class GameEngine {
  constructor() {
    this.objects = {};
    this.objectsHirearchy = {};

    this.minPrecision = 1;
    this.maxPrecision = 100;

    //Scene Data Lists
    this.objectsWithRender = [];
    this.objectsWithRigidBody2D = [];
    this.objectsWithColider = [];

    this.taggedObjects = {};

    //Used for resolving collisions realistically
    this.contactPairs = [];
  }

  //With this you can add objects to the scene
  addSceneObject(
    name = '',
    X = 0,
    Y = 0,
    rotation = 0,
    width,
    height,
    parent = ''
  ) {
    //---------------------------------Error Handling--------------------------------------

    //Check if name is valid
    if (name === '') {
      try {
        throw console.error(
          `origin: addSceneObject()\nerror: Name "${name}" can't be an empty string\nfix: Name can only be a non-empty string`
        );
      } catch (err) {}
    }
    if (!typeof name === typeof '') {
      try {
        throw console.error(
          `origin: addSceneObject()\nerror: Name "${name}" can't be a type of ${typeof name}\nfix: Name can only be a non-empty string`
        );
      } catch (err) {}
    }
    //Check if name already exists
    if (this.objects[name]) {
      try {
        throw console.error(
          `origin: addSceneObject()\nerror: Name "${name}" already exists`
        );
      } catch (err) {}
    }

    //---------------------------------Main--------------------------------------

    //Add object to object list
    this.objects[name] = new SceneObject(
      name,
      { x: X, y: Y },
      rotation,
      width,
      height
    );

    //Add object in the hirearchy
    if (parent === '') {
      this.objectsHirearchy[name] = {};
    } else {
      let parentPath = this.findObjectParent(parent);
      parentPath.push(parent);
      let parentObject = this.getObject(parentPath);

      parentObject[name] = {};
    }
  }
  removeSceneObject(name) {
    //Check if name doesn't exist
    if (this.objects[name]) {
      try {
        throw console.error(
          `origin: removeSceneObject()\nerror: Name "${name}" doesn't exist`
        );
      } catch (err) {}
    }
  }

  //Update Game Engine Data Lists
  updateSceneData() {
    for (const name in this.objects) {
      let sceneObject = this.objects[name];

      //Goes through every list and removes the object if it is already there
      //For rigidbody list and render list check if it has a property exclusive to them and if so add them

      //Update rigid body list
      this.updateDataListRB(sceneObject);
      //Update render list
      this.updateDataListSR(sceneObject);
      //Update tag list
      this.updateDataListTG(sceneObject);
      //Update colider list
      this.updateDataListCL(sceneObject);
    }
  }
  updateDataListSR(sceneObject) {
    for (let i = 0; i < this.objectsWithRender.length; i++) {
      if (this.objectsWithRender[i] === sceneObject.name) {
        this.objectsWithRender.splice(i, 1);
      }
    }
    if (sceneObject.shape) {
      this.objectsWithRender.push(sceneObject.name);
    }
  }
  updateDataListCL(sceneObject) {
    for (let i = 0; i < this.objectsWithColider.length; i++) {
      if (this.objectsWithColider[i] === sceneObject.name) {
        this.objectsWithColider.splice(i, 1);
      }
    }
    if (sceneObject.colider) {
      this.objectsWithColider.push(sceneObject.name);
    }
  }
  updateDataListRB(sceneObject) {
    for (let i = 0; i < this.objectsWithRigidBody2D.length; i++) {
      if (this.objectsWithRigidBody2D[i] === sceneObject.name) {
        this.objectsWithRigidBody2D.splice(i, 1);
      }
    }
    if (sceneObject.type) {
      this.objectsWithRigidBody2D.push(sceneObject.name);
    }
  }
  updateDataListTG(sceneObject) {
    for (const tag in this.taggedObjects) {
      for (let i = 0; i < this.taggedObjects[tag].length; i++) {
        if (this.taggedObjects[tag][i] === sceneObject.name) {
          this.taggedObjects[tag].splice(i, 1);
        }
      }
    }
    if (this.taggedObjects[sceneObject.tag]) {
      this.taggedObjects[sceneObject.tag].push(sceneObject.name);
    } else {
      this.taggedObjects[sceneObject.tag] = [sceneObject.name];
    }
  }

  //Physics
  simulateObjectPhysics(precision, time = 1) {
    precision = FlatMath.clamp(precision, this.minPrecision, this.maxPrecision);

    for (let it = 0; it < precision; it++) {
      this.contactPairs = [];
      this.#stepBodies(time, precision);
      this.#broadPhase();
      this.#narrowPhase(time, precision);
    }
  }
  #broadPhase() {
    let cache = new Set();

    for (let i = 0; i < this.objectsWithRigidBody2D.length; i++) {
      //Get objectA
      let objectA = this.objects[this.objectsWithRigidBody2D[i]];

      //If objectA has no colider then continue (since it can't interact with others)
      if (!objectA.colider) {
        continue;
      }

      //Loop through every object with a colider
      for (let j = 0; j < this.objectsWithColider.length; j++) {
        /* Check if we've looked at this before */
        if (
          this.objectsWithRigidBody2D[i] === this.objectsWithColider[j] ||
          cache.has(this.objectsWithColider[j] + this.objectsWithRigidBody2D[i])
        ) {
          continue;
        } else {
          cache.add(
            this.objectsWithRigidBody2D[i] + this.objectsWithColider[j]
          );
        }

        // Get ObjectB
        let objectB = this.objects[this.objectsWithColider[j]];

        //If they are both static continute since they can t interact with eachother
        if (objectA.type === 'static' && objectB.type === 'static') {
          continue;
        }

        //Simpler test than the collision, we are checking if their axis aligned hitboxes collide
        if (!Collision.intersectAABBs(objectA.AABB, objectB.AABB)) {
          continue;
        }

        this.contactPairs.push([objectA.name, objectB.name]);
      }
    }
  }
  #narrowPhase(time, precision) {
    for (let i = 0; i < this.contactPairs.length; i++) {
      let pair = this.contactPairs[i];
      let objectA = this.objects[pair[0]];
      let objectB = this.objects[pair[1]];

      let collision = Collision.doObjectsCollide(objectA, objectB);

      if (collision) {
        this.separateBodies(
          objectA,
          objectB,
          collision.normal,
          collision.depth
        );

        //Add this contact to the contact list
        let collisionContact = Collision.findContactPoints(objectA, objectB);

        let manifold = new FlatManifold(
          objectA,
          objectB,
          collision.normal,
          collision.depth,
          collisionContact.contact1,
          collisionContact.contact2,
          collisionContact.contactCount
        );

        //Resolve the collision
        this.resolveCollisionWithRotationAndFriction(manifold, time, precision);
      }
    }
  }
  #stepBodies(time, precision) {
    for (let i = 0; i < this.objectsWithRigidBody2D.length; i++) {
      let object = this.objects[this.objectsWithRigidBody2D[i]];
      object.step(time, precision);
    }
  }
  separateBodies(objectA, objectB, normal, depth) {
    //Move them outside of each other so they don t collide anymore

    let amount;

    if (objectA.type === 'dynamic') {
      if (objectB.type === 'dynamic') {
        //Move them both out of the collision
        amount = normal.multiplyScalar(depth).divideScalar(2);
        objectA.move(amount.opositeVector());
        objectB.move(amount);
      } else if (objectB.type === 'static') {
        //Move objectA out of the collision
        amount = normal.multiplyScalar(depth).opositeVector();
        objectA.move(amount);
      }
    } else if (objectA.type === 'static') {
      //Move objectB out of the collision
      amount = normal.divideScalar(2).multiplyScalar(depth);
      objectB.move(amount);
    }
  }
  calculateIntersectionImpulse(contact) {
    let bodyA = contact.bodyA;
    let bodyB = contact.bodyB;
    let normal = contact.normal;

    let relativeVelocity = bodyB.linearVelocity.subtractVector(
      bodyA.linearVelocity
    );

    if (FlatMath.dot(relativeVelocity, normal) > 0) {
      return;
    }

    let e = Math.min(bodyA.elasticity, bodyB.elasticity);

    let j = -(1 + e) * FlatMath.dot(relativeVelocity, normal);

    j /= bodyA.invMass + bodyB.invMass;

    let impulse = normal.multiplyScalar(j);

    bodyA.linearVelocity = bodyA.linearVelocity.addVector(
      impulse.multiplyScalar(bodyA.invMass).opositeVector()
    );
    bodyB.linearVelocity = bodyB.linearVelocity.addVector(
      impulse.multiplyScalar(bodyB.invMass)
    );
  }
  calculateIntersectionImpulseRotation(contact, time, precision) {
    let bodyA = contact.bodyA;
    let bodyB = contact.bodyB;
    let normal = contact.normal;
    let contact1 = contact.contact1;
    let contact2 = contact.contact2;
    let contactCount = contact.contactCount;

    let e = Math.min(bodyA.elasticity, bodyB.elasticity);

    let contactList = [contact1, contact2];
    let impulseList = [nullVector, nullVector];
    let raList = [nullVector, nullVector];
    let rbList = [nullVector, nullVector];

    for (let i = 0; i < contactCount; i++) {
      let ra = contactList[i].subtractVector(bodyA.position);
      let rb = contactList[i].subtractVector(bodyB.position);

      raList[i] = ra;
      rbList[i] = rb;

      let raPerp = new FlatVector(-ra.y, ra.x);
      let rbPerp = new FlatVector(-rb.y, rb.x);

      let angularLinearVelocityA = raPerp.multiplyScalar(
        bodyA.rotationalVelocity
      );
      let angularLinearVelocityB = rbPerp.multiplyScalar(
        bodyB.rotationalVelocity
      );

      let relativeVelocity = bodyB.linearVelocity
        .addVector(angularLinearVelocityB)
        .subtractVector(bodyA.linearVelocity.addVector(angularLinearVelocityA));

      let contactVelocityMag = FlatMath.dot(relativeVelocity, normal);

      if (contactVelocityMag > 0) {
        continue;
      }

      let raPerpDotN = FlatMath.dot(raPerp, normal);
      let rbPerpDotN = FlatMath.dot(rbPerp, normal);

      let j = -(1 + e) * contactVelocityMag;

      let den =
        bodyA.invMass +
        bodyB.invMass +
        raPerpDotN * raPerpDotN * bodyA.invInertia +
        rbPerpDotN * rbPerpDotN * bodyB.invInertia;

      j /= den;
      j /= contactCount;

      let impulse = normal.multiplyScalar(j);

      impulseList[i] = impulse;
    }

    for (let i = 0; i < impulseList.length; i++) {
      let impulse = impulseList[i];

      let ra = raList[i];
      let rb = rbList[i];

      //Adjust the linear Velocity and rotational Velocity for bodyA
      bodyA.linearVelocity = bodyA.linearVelocity.addVector(
        impulse.multiplyScalar(bodyA.invMass).opositeVector()
      );
      bodyA.rotationalVelocity +=
        (-FlatMath.cross(ra, impulse) * bodyA.invInertia * time) / precision;
      //Adjust the linear Velocity and rotational Velocity for bodyB
      bodyB.linearVelocity = bodyB.linearVelocity.addVector(
        impulse.multiplyScalar(bodyB.invMass)
      );
      bodyB.rotationalVelocity +=
        (FlatMath.cross(rb, impulse) * bodyB.invInertia * time) / precision;
    }
  }
  resolveCollisionWithRotationAndFriction(contact, time, precision) {
    let bodyA = contact.bodyA;
    let bodyB = contact.bodyB;
    let normal = contact.normal;
    let contact1 = contact.contact1;
    let contact2 = contact.contact2;
    let contactCount = contact.contactCount;

    let e = Math.min(bodyA.elasticity, bodyB.elasticity);

    let sf = bodyA.staticFriction + bodyB.staticFriction * 0.5;
    let df = bodyA.dynamicFriction + bodyB.dynamicFriction * 0.5;

    let contactList = [contact1, contact2];

    let impulseList = [nullVector, nullVector];
    let frictionImpulseList = [nullVector, nullVector];

    let jList = new Float32Array(2);

    let raList = [nullVector, nullVector];
    let rbList = [nullVector, nullVector];

    for (let i = 0; i < contactCount; i++) {
      let ra = contactList[i].subtractVector(bodyA.position);
      let rb = contactList[i].subtractVector(bodyB.position);

      raList[i] = ra;
      rbList[i] = rb;

      let raPerp = new FlatVector(-ra.y, ra.x);
      let rbPerp = new FlatVector(-rb.y, rb.x);

      let angularLinearVelocityA = raPerp.multiplyScalar(
        bodyA.rotationalVelocity
      );
      let angularLinearVelocityB = rbPerp.multiplyScalar(
        bodyB.rotationalVelocity
      );

      let relativeVelocity = bodyB.linearVelocity
        .addVector(angularLinearVelocityB)
        .subtractVector(bodyA.linearVelocity.addVector(angularLinearVelocityA));

      let contactVelocityMag = FlatMath.dot(relativeVelocity, normal);

      if (contactVelocityMag > 0) {
        continue;
      }

      let raPerpDotN = FlatMath.dot(raPerp, normal);
      let rbPerpDotN = FlatMath.dot(rbPerp, normal);

      let j = -(1 + e) * contactVelocityMag;

      let den =
        bodyA.invMass +
        bodyB.invMass +
        raPerpDotN * raPerpDotN * bodyA.invInertia +
        rbPerpDotN * rbPerpDotN * bodyB.invInertia;

      j /= den;
      j /= contactCount;

      jList[i] = j;

      let impulse = normal.multiplyScalar(j);

      impulseList[i] = impulse;
    }

    for (let i = 0; i < impulseList.length; i++) {
      let impulse = impulseList[i];

      let ra = raList[i];
      let rb = rbList[i];

      //Adjust the linear Velocity and rotational Velocity for bodyA
      bodyA.linearVelocity = bodyA.linearVelocity.addVector(
        impulse.multiplyScalar(bodyA.invMass).opositeVector()
      );
      bodyA.rotationalVelocity +=
        (-FlatMath.cross(ra, impulse) * bodyA.invInertia * time) / precision;
      //Adjust the linear Velocity and rotational Velocity for bodyB
      bodyB.linearVelocity = bodyB.linearVelocity.addVector(
        impulse.multiplyScalar(bodyB.invMass)
      );
      bodyB.rotationalVelocity +=
        (FlatMath.cross(rb, impulse) * bodyB.invInertia * time) / precision;
    }

    for (let i = 0; i < contactCount; i++) {
      let ra = contactList[i].subtractVector(bodyA.position);
      let rb = contactList[i].subtractVector(bodyB.position);

      raList[i] = ra;
      rbList[i] = rb;

      let raPerp = new FlatVector(-ra.y, ra.x);
      let rbPerp = new FlatVector(-rb.y, rb.x);

      let angularLinearVelocityA = raPerp.multiplyScalar(
        bodyA.rotationalVelocity
      );
      let angularLinearVelocityB = rbPerp.multiplyScalar(
        bodyB.rotationalVelocity
      );

      let relativeVelocity = bodyB.linearVelocity
        .addVector(angularLinearVelocityB)
        .subtractVector(bodyA.linearVelocity.addVector(angularLinearVelocityA));

      let tangent = relativeVelocity.subtractVector(
        normal.multiplyScalar(FlatMath.dot(relativeVelocity, normal))
      );

      if (FlatMath.aproximatelyEqual(tangent, nullVector)) {
        continue;
      } else {
        tangent = FlatMath.normalize(tangent);
      }

      let raPerpDotT = FlatMath.dot(raPerp, tangent);
      let rbPerpDotT = FlatMath.dot(rbPerp, tangent);

      let den =
        bodyA.invMass +
        bodyB.invMass +
        raPerpDotT * raPerpDotT * bodyA.invInertia +
        rbPerpDotT * rbPerpDotT * bodyB.invInertia;

      let jt = -FlatMath.dot(relativeVelocity, tangent);
      jt /= den;
      jt /= contactCount;

      let frictionImpulse;
      if (Math.abs(jt) <= jList[i] * sf) {
        frictionImpulse = tangent.multiplyScalar(jt);
      } else {
        frictionImpulse = tangent.multiplyScalar(jList[i] * -df);
      }
      frictionImpulseList[i] = frictionImpulse;
    }

    for (let i = 0; i < frictionImpulseList.length; i++) {
      let frictionImpulse = frictionImpulseList[i];

      let ra = raList[i];
      let rb = rbList[i];

      //Adjust the linear Velocity and rotational Velocity for bodyA
      bodyA.linearVelocity = bodyA.linearVelocity.addVector(
        frictionImpulse.multiplyScalar(bodyA.invMass).opositeVector()
      );
      bodyA.rotationalVelocity +=
        (-FlatMath.cross(ra, frictionImpulse) * bodyA.invInertia * time) /
        precision;
      //Adjust the linear Velocity and rotational Velocity for bodyB
      bodyB.linearVelocity = bodyB.linearVelocity.addVector(
        frictionImpulse.multiplyScalar(bodyB.invMass)
      );
      bodyB.rotationalVelocity +=
        (FlatMath.cross(rb, frictionImpulse) * bodyB.invInertia * time) /
        precision;
    }
  }

  //Utility Methods for finding stuff
  findObjectParent(name, object = this.objectsHirearchy, path = []) {
    for (const id in object) {
      const children = object[id];

      // Add the current object's name to the path
      path.push(id);

      if (id === name) {
        // If found, remove the current name and return the path to the parent
        path.pop();
        return [...path]; // Return a copy of the path
      }

      // Recur into children if they exist
      if (children) {
        const result = this.findObjectParent(name, children, path);
        if (result) return result; // Return the path if found
      }

      // Remove the current object name if not found in this branch
      path.pop();
    }

    // Return null if the object is not found
    return null;
  }
  getObject(path) {
    let schema = this.objectsHirearchy;
    for (let i = 0; i < path.length; i++) {
      schema = schema[path[i]];
    }

    return schema;
  }

  //Looks at this.objectWithRenderers and draws everything in there
  drawObjects() {
    for (const id in this.objectsWithRender) {
      let sceneObject = this.objects[this.objectsWithRender[id]];

      c.beginPath();
      c.fillStyle = sceneObject.color;

      if (sceneObject.shape === 'box') {
        c.moveTo(sceneObject.vertices[0].x, sceneObject.vertices[0].y);
        c.lineTo(sceneObject.vertices[1].x, sceneObject.vertices[1].y);
        c.lineTo(sceneObject.vertices[2].x, sceneObject.vertices[2].y);
        c.lineTo(sceneObject.vertices[3].x, sceneObject.vertices[3].y);
        c.lineTo(sceneObject.vertices[0].x, sceneObject.vertices[0].y);
      } else if (sceneObject.shape === 'triangle') {
        c.moveTo(sceneObject.vertices[0].x, sceneObject.vertices[0].y);
        c.lineTo(sceneObject.vertices[1].x, sceneObject.vertices[1].y);
        c.lineTo(sceneObject.vertices[2].x, sceneObject.vertices[2].y);
        c.lineTo(sceneObject.vertices[0].x, sceneObject.vertices[0].y);
      } else if (sceneObject.shape === 'circle') {
        c.arc(
          sceneObject.position.x,
          sceneObject.position.y,
          sceneObject.radius,
          sceneObject.rotation,
          2 * Math.PI + sceneObject.rotation
        );
      }

      c.fill();
      c.closePath();
    }
  }
}
