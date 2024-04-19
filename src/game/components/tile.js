import BaseShape from "./shared/base-shape";
import shapeTile1 from "../shapes/tile1.json";
import { GRID_SIZE } from "../utils/variables";
import { addVectors } from "../utils/math";

export default class Tile extends BaseShape {
  /**
   * @param eventEmitter {Observable}
   * @param x {number}
   * @param y {number}
   * @param width
   * @param height
   */
  constructor(eventEmitter, x = 0, y = 0, width = 0, height = 0) {
    super(eventEmitter, x, y, width, height);

    this.tileShape = { shapes: [] };
    this.positionCorrection = { x: 0, y: 0 };
    this.setupTile();
  }

  /**
   * Setting up the tile shape. This method calculate the correction needed to center the tile in the grid
   */
  setupTile() {
    let minPosition = { ...shapeTile1.shapes[0].points[0] };
    let maxPosition = { ...shapeTile1.shapes[0].points[0] };
    for (let s of shapeTile1.shapes) {
      for (let p of s.points) {
        if (p.x < minPosition.x) {
          minPosition.x = p.x;
        }
        if (p.y < minPosition.y) {
          minPosition.y = p.y;
        }
        if (p.x > maxPosition.x) {
          maxPosition.x = p.x;
        }
        if (p.y > maxPosition.y) {
          maxPosition.y = p.y;
        }
      }
    }

    const tileFactor = {
      x: (GRID_SIZE * 2) / ((maxPosition.x - minPosition.x) * this.scaleShape),
      y: (GRID_SIZE * 2) / ((maxPosition.y - minPosition.y) * this.scaleShape)
    };

    const errorPixel = 1;
    this.positionCorrection = {
      x: Math.abs(minPosition.x * this.scaleShape) + errorPixel,
      y: Math.abs(minPosition.y * this.scaleShape) + errorPixel
    };

    // make size correction base on the grid size
    this.tileShape.shapes = shapeTile1.shapes.map(s => ({
      ...s,
      points: s.points.map(p => ({
        x: p.x * tileFactor.x,
        y: p.y * tileFactor.y
      }))
    }));
  }

  /**
   * Calculate the tile position correction
   * @returns {{x: number, y: number}}
   */
  getPosition() {
    return addVectors(super.getPosition(), this.positionCorrection);
  }

  currentShape() {
    return this.tileShape;
  }

  animate() {
    // toDo (gonzalezext)[19.04.24]: maybe we can animate the leafs
  }
}
