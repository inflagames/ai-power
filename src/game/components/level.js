import BaseObject from "./shared/base-object";
import { scale } from "../utils/math";
import { SCREEN_HEIGHT, SCREEN_WIDTH, GRID_SIZE } from "../utils/variables";
import Plant from "./plant";
import Tile from "./tile";

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

    // fist plant example
    const plant = new Plant(
      this.eventEmitter,
      SCREEN_WIDTH * 0.5,
      SCREEN_HEIGHT * 0.5,
      50,
      50
    );

    // first tile example
    const tile = new Tile(
      this.eventEmitter,
      0,
      0,
      50,
      50
    );

    this.components = [plant, tile];
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
