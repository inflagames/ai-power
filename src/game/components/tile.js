import BaseShape from "./shared/base-shape";
import shapeTile1 from "../shapes/tile1.json";
import shapeTile2 from "../shapes/tile2.json";
import floorTile from "../shapes/floor.tile.json";
import { GRID_SIZE } from "../utils/variables";
import { addVectors, randomNumber } from "../utils/math";

export const TILE_1X1 = 1;
export const TILE_2X2 = 2;
export const TILE_FLOOR = 3;

const colors = ["#b85c54", "#c56057", "#be7063", "#c55f56"];

export default class Tile extends BaseShape {
  /**
   * @param eventEmitter {Observable}
   * @param x {number}
   * @param y {number}
   * @param type {number}
   */
  constructor(eventEmitter, x = 0, y = 0, type) {
    super(eventEmitter, x, y, type * GRID_SIZE, type * GRID_SIZE);

    this.directionVector = this.getRotation();

    this.type = type;
    this.tileShape = { ...this.getShape(type) };
    this.positionCorrection = { x: 0, y: 0 };

    this.setupTile();
  }

  getShape(type) {
    switch (type) {
    case TILE_1X1:
      return shapeTile2;
    case TILE_2X2:
      return shapeTile1;
    case TILE_FLOOR:
    default:
      return floorTile;
    }
  }

  getRotation() {
    const currentDirection = randomNumber(4);
    switch (currentDirection) {
    case 0:
      return { x: 1, y: 0 };
    case 1:
      return { x: 0, y: 1 };
    case 2:
      return { x: -1, y: 0 };
    case 3:
      return { x: 0, y: -1 };
    }
  }

  /**
   * Setting up the tile shape. This method calculate the correction needed to center the tile in the grid
   */
  setupTile() {
    let minPosition = { ...this.tileShape.shapes[0].points[0] };
    let maxPosition = { ...this.tileShape.shapes[0].points[0] };
    for (let s of this.tileShape.shapes) {
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
      x: (GRID_SIZE * this.getGridSize()) / ((maxPosition.x - minPosition.x) * this.scaleShape),
      y: (GRID_SIZE * this.getGridSize()) / ((maxPosition.y - minPosition.y) * this.scaleShape)
    };

    this.positionCorrection = {
      x: (GRID_SIZE * this.getGridSize()) * 0.5,
      y: (GRID_SIZE * this.getGridSize()) * 0.5
    };

    // make size correction base on the grid size
    this.tileShape.shapes = this.tileShape.shapes.map(s => ({
      ...s,
      background: colors[randomNumber(colors.length)],
      points: s.points.map(p => ({
        x: p.x * tileFactor.x,
        y: p.y * tileFactor.y
      }))
    }));
  }

  getGridSize() {
    switch (this.type) {
    case TILE_1X1:
    case TILE_FLOOR:
      return 1;
    case TILE_2X2:
      return 2;
    }
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
