import { SCREEN_WIDTH } from "./variables";

/**
 * Vector to angle conversion
 * @param vector {{x: number, y: number}}
 * @returns {number}
 */
export function vectorToAngle(vector) {
  return Math.atan2(vector.y, vector.x);
}

/**
 * Multiply a vector by a scalar
 * @param vector {{x: number, y: number}}
 * @param scalar {number}
 * @returns {{x: number, y: number}}
 */
export function multiplyVector(vector, scalar) {
  return { x: vector.x * scalar, y: vector.y * scalar };
}

/**
 * Add two vectors
 * @param v1 {{x: number, y: number}}
 * @param v2 {{x: number, y: number}}
 * @returns {{x: number, y: number}}
 */
export function addVectors(v1, v2) {
  return { x: v1.x + v2.x, y: v1.y + v2.y };
}

/**
 * @param maxValue {number}
 * @param currentValue {number}
 */
export function linearFunction(maxValue, currentValue) {
  // toDo (gonzalezext)[20.04.24]: maybe it can be removed
  return Math.min(currentValue / maxValue, 1);
}

/**
 * @param maxValue {number}
 * @param currentValue {number}
 */
export function logFunction(maxValue, currentValue) {
  // toDo (gonzalezext)[20.04.24]: maybe it can be removed
  const x = (9 * currentValue) / maxValue + 1;
  return Math.min(Math.log10(x), 1);
}

/**
 * @param vector {{x: number, y: number}}
 * @param pivot {{x: number, y: number}}
 * @param phi {number}
 * @return {{x: number, y: number}}
 */
export function getPointByVectorRotation(vector, pivot, phi) {
  const result = rotateVector(vector, phi);
  return { x: pivot.x + result.x, y: pivot.y - result.y };
}

/**
 * @param vector {{x: number, y: number}}
 * @param phi {number}
 * @return {{x: number, y: number}}
 */
export function rotateVector(vector, phi) {
  return {
    x: vector.x * Math.cos(phi) - vector.y * Math.sin(phi),
    y: vector.x * Math.sin(phi) + vector.y * Math.cos(phi)
  };
}

export function getVector(p1, p2) {
  return { x: p2.x - p1.x, y: p2.y - p1.y };
}

export function distanceNoSqrt(p1, p2) {
  return square(p2.x - p1.x) + square(p2.y - p1.y);
}

export const square = (x) => x * x;

export function distance(p1, p2) {
  // toDo guille 31.08.21: maybe it can be improved (check it)
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

/**
 * @param value {number}
 * @return {number}
 */
export function scale(value) {
  return (value * window.currentWidth) / SCREEN_WIDTH;
}

export function unscale(value) {
  return (value * SCREEN_WIDTH) / window.currentWidth;
}

/**
 * @param limit {number}
 * @param start {number}
 * @returns {number}
 */
export function randomNumber(limit, start = 0) {
  return Math.floor(Math.random() * limit) + start;
}

/**
 * @param shape1 {{x: number, y: number}[]}
 * @param shape2 {{x: number, y: number}[]}
 * @return {boolean}
 */
export function detectCollision(shape1, shape2) {
  if (shape1.length < 3 || shape2.length < 3) {
    return false;
  }
  const axis = [...extractAxis(shape1), ...extractAxis(shape2)];

  for (const axi of axis) {
    const p1 = shapeProjection(shape1, axi);
    const p2 = shapeProjection(shape2, axi);
    if (
      !(
        (p1.min > p2.min && p1.min < p2.max) ||
        (p1.max > p2.min && p1.max < p2.max) ||
        (p2.min > p1.min && p2.min < p1.max) ||
        (p2.max > p1.min && p2.max < p1.max) ||
        (p1.min === p2.min && p1.max === p2.max)
      )
    ) {
      return false;
    }
  }

  return true;
}

/**
 * @param shape {{x: number, y: number}[]}
 * @param circle {{x: number, y: number, r: number}}
 * @returns {boolean}
 */
export function detectCollisionWithCircle(shape, circle) {
  for (const p of shape) {
    if (square(p.x - circle.x) + square(p.y - circle.y) <= square(circle.r)) {
      return true;
    }
  }
  return false;
}

/**
 * Normalize a vector
 * @param v {{x: number, y: number}}
 * @returns {{x: number, y: number}}
 */
export function normalizeVector(v) {
  if (v.x === 0 && v.y === 0) {
    return { x: 0, y: 0 };
  }
  const length = Math.sqrt(v.x * v.x + v.y * v.y);
  return { x: v.x / length, y: v.y / length };
}

/**
 * Linear interpolation between two vectors
 * @param v1 {{x: number, y: number}}
 * @param v2 {{x: number, y: number}}
 * @param t {number}
 * @returns {{x: number, y: number}}
 */
export function lerpVector(v1, v2, t) {
  return {
    x: v1.x + (v2.x - v1.x) * t,
    y: v1.y + (v2.y - v1.y) * t
  };
}

/**
 * @param shape {{x: number, y: number}[]}
 * @return {{x: number, y: number}[]}
 */
function extractAxis(shape) {
  if (shape.length <= 1) {
    return [];
  }
  const axis = [];
  for (let i = 1; i < shape.length; i++) {
    axis.push({
      x: shape[i].x - shape[i - 1].x,
      y: shape[i - 1].y - shape[i].y
    });
  }
  axis.push({
    x: shape[0].x - shape[shape.length - 1].x,
    y: shape[shape.length - 1].y - shape[0].y
  });
  return axis;
}

/**
 * @param shape {{x: number, y: number}[]}
 * @param v {{x: number, y: number}}
 * @return {{max: number, min: number}}
 */
function shapeProjection(shape, v) {
  let min = projection(v, shape[0]);
  let max = min;
  for (let i = 1; i < shape.length; i++) {
    const p = projection(v, shape[i]);
    min = Math.min(min, p);
    max = Math.max(max, p);
  }
  return { min, max };
}

/**
 * @param v {{x: number, y: number}}
 * @param u {{x: number, y: number}}
 * @return {number}
 */
function projection(v, u) {
  return (u.x * v.x + u.y * v.y) / (v.x * v.x + v.y * v.y);
}
