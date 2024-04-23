import BaseShape from "./shared/base-shape";
import shape from "../shapes/character.json";
import { MAX_LIFE_TIME, newBubble } from "./bubble";

// shape.shapes = shape.shapes.filter((shape) => shape.id.startsWith("hand") || shape.id.startsWith("foot"));

export const ANIMATE_WALK = 1;

export default class Player extends BaseShape {
  /**
   * @param eventEmitter {Observable}
   * @param x {number}
   * @param y {number}
   * @param width {number}
   * @param height {number}
   */
  constructor(eventEmitter, x = 0, y = 0, width = 0, height = 0) {
    super(eventEmitter, x, y, width, height);
    /** @member {number} */
    this.rotation = Math.PI / 2;
    this.directionVector = { x: 0, y: 1 };

    const scaleConst = 0.015578125;
    this.scaleShape = this.width * scaleConst;

    this.shape = { ...shape };

    this.time = new Date().getTime();

    this.animation = 0;
    this.animationIsOn = false;

    this.bubblesIntervalToShow = 3;
    this.bubblesCount = 0;
    this.bubbles = [];

    this.updateCoordinates();
  }

  render(context) {
    //clean bubbles
    this.bubbles = this.bubbles.filter((bubble) => !bubble.bubbleDead());

    // render bubbles
    this.bubbles.forEach((bubble) => bubble.render(context));

    super.render(context);
  }

  /**
   * Update the coordinates of the player
   * @param x {number}
   * @param y {number}
   */
  updateCoordinates({ x, y } = {}) {
    this.x = x || this.x;
    this.y = y || this.y;
  }

  /**
   * Update the direction vector of the player
   * @param v
   */
  updateDirectionVector(v) {
    this.directionVector = v;
  }

  animate() {
    if ((this.animation & ANIMATE_WALK) !== 0) {
      if (!this.animationIsOn) {
        this.time = new Date().getTime();
      }
      this.animationIsOn = true;
      this.animateWalk();
    } else if (this.animationIsOn) {
      this.animationIsOn = false;

      this.shape = { ...shape };
    }
  }

  animateWalk() {
    const maxMovement = -20;
    const footMovement = this.stepAnimationFunction() * maxMovement;
    const handMovement = this.handAnimationFunction();

    let minPoint = { x: 1000, y: 1000 };
    let maxPoint = { x: -1000, y: -1000 };
    // toDo (gonzalezext)[23.04.24]: this can be calculated at the begining
    this.shape.shapes.forEach((shape) => shape.points.forEach((point) => {
      minPoint.y = Math.min(minPoint.y, point.y);
      minPoint.x = Math.min(minPoint.x, point.x);
      maxPoint.y = Math.max(maxPoint.y, point.y);
      maxPoint.x = Math.max(maxPoint.x, point.x);
    }));
    const middleHandPivot = -2;

    // toDo (gonzalezext)[23.04.24]: this can be optimized by using a map
    this.shape.shapes = shape.shapes.map((shape) => {
      // foot animation
      if (shape.id.startsWith("foot")) {
        const footMov = shape.id.endsWith("-l") ? footMovement : -footMovement;
        return {
          ...shape,
          points: shape.points.map((point) => {
            return { ...point, y: point.y + footMov };
          })
        };
      }
      // hand animation
      if (shape.id.startsWith("hand")) {
        const dir = shape.id.endsWith("-l") ? 1 : -1;
        return {
          ...shape,
          points: shape.points.map((point) => {
            return {
              ...point,
              y: (point.y - middleHandPivot) * handMovement * dir + middleHandPivot
            };
          })
        };
      }
      return { ...shape };
    });

    // create walk bubbles
    if (this.bubblesCount === 0) {
      this.newBubble();
    }
    this.bubblesCount++;
    if (this.bubblesCount >= this.bubblesIntervalToShow) {
      this.bubblesCount = 0;
    }
  }

  newBubble() {
    const bubble = newBubble(this.eventEmitter, this.x, this.y, 50, 50);
    bubble.lifeTime = MAX_LIFE_TIME / 4;
    this.bubbles.push(bubble);
  }

  stepAnimationFunction() {
    const time = (new Date().getTime() - this.time) / 500;
    return Math.sin(time * Math.PI);
  }

  handAnimationFunction() {
    const time = (new Date().getTime() - this.time) / 500;
    return Math.cos(time * Math.PI);
  }

  currentShape() {
    return this.brakedShape || this.shape;
  }
}
