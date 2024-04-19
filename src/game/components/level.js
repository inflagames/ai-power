import BaseObject from "./shared/base-object";
import { scale } from "../utils/math";
import { SCREEN_HEIGHT, SCREEN_WIDTH, GRID_SIZE } from "../utils/variables";
import Plant from "./plant";
import Tile from "./tile";
import level1 from "./levels/level.001.json";

const ROW_TILE = 1; //     001
const ROW_TILE_FREE = 2; //    010
const ROW_TILE_TREE_V1 = 4; // 100


export default class Level extends BaseObject {
  /**
   * @param eventEmitter {Observable}
   * @param x {number}
   * @param y {number}
   * @param width {number}
   * @param height {number}
   * @param background {string}
   */
  constructor(
    eventEmitter,
    x = 0,
    y = 0,
    width = 0,
    height = 0,
    background = ""
  ) {
    super(eventEmitter, x, y, width, height);
    this.backgroundColor = background;

    // // fist plant example
    // const plant = new Plant(
    //   this.eventEmitter,
    //   SCREEN_WIDTH * 0.5,
    //   SCREEN_HEIGHT * 0.5,
    //   50,
    //   50
    // );
    //
    // // first tile example
    // const tile = new Tile(
    //   this.eventEmitter,
    //   GRID_SIZE,
    //   GRID_SIZE,
    //   50,
    //   50
    // );
    // this.components = [plant, tile];

    this.components = [];

    this.loadLevel(level1.map);
  }

  loadLevel(level) {
    const flags = new Array(level.length).fill(1).map(() => new Array(level[0].length).fill(true));
    for (let row = 0; row < level.length; row++) {
      for (let col = 0; col < level[row].length; col++) {
        const tile = level[row][col];
        if (flags[row][col] && (tile & ROW_TILE !== 0)) {

          let size = 1;

          // check if 2x2 tile fit
          if (row + 1 < level.length && col + 1 < level[row].length &&
            (level[row][col + 1] & ROW_TILE) &&
            (level[row + 1][col] & ROW_TILE) &&
            (level[row + 1][col + 1] & ROW_TILE)
          ) {
            flags[row][col] = false;
            flags[row][col + 1] = false;
            flags[row + 1][col] = false;
            flags[row + 1][col + 1] = false;

            size = 2;
          }

          const tile = new Tile(
            this.eventEmitter,
            col * GRID_SIZE,
            row * GRID_SIZE,
            size
          );
          this.components.push(tile);
        }
      }
    }
  }

  render(context) {
    this.cleanScreen(context);

    this.paintGrid(context);

    this.components.forEach((component) => component.render(context));
  }

  cleanScreen(context) {
    if (this.backgroundColor) {
      context.beginPath();
      context.fillStyle = this.backgroundColor;
      context.rect(0, 0, scale(this.width), scale(this.height));
      context.fill();
    } else {
      context.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    }
  }

  paintGrid(context) {
    context.strokeStyle = "#fff";
    context.lineWidth = 1;
    for (let i = 0; i < SCREEN_WIDTH; i += GRID_SIZE) {
      context.beginPath();
      context.moveTo(i, 0);
      context.lineTo(i, SCREEN_HEIGHT);
      context.stroke();
    }
    for (let i = 0; i < SCREEN_HEIGHT; i += GRID_SIZE) {
      context.beginPath();
      context.moveTo(0, i);
      context.lineTo(SCREEN_WIDTH, i);
      context.stroke();
    }
  }
}
