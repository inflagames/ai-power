import BaseObject from "./shared/base-object";
import { randomNumber, scale } from "../utils/math";
import { SCREEN_HEIGHT, SCREEN_WIDTH, GRID_SIZE } from "../utils/variables";
import Tile, { TILE_1X1, TILE_2X2, TILE_FLOOR } from "./tile";
import level1 from "./levels/level.001.json";
import level2 from "./levels/level.002.json";
import { newBubble } from "./bubble";
import Hole from "./hole";
import Camera from "./camera";
import Plant from "./plant";
import Data from "../utils/data";

const ROW_TILE = 1;
const ROW_HOLE = 2;
const ROW_CAMERA = 4;
const ROW_PLAYER_START = 8;
const ROW_TREE = 16;

const MAX_NUMBER_OF_BUBBLES = 20;

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

    /** @member {BaseObject[]} */
    this.components = [];

    this.tiles = [];
    this.floor = [];
    this.bubbles = [];
    this.finishLevelItem = [];
    this.cameras = [];

    this.levels = [level1, level2];

    this.playerInitialPosition = { x: 0, y: 0 };
    this.pause = false;

    this.gridSize = GRID_SIZE;

    this.loadLastLevel();
  }

  hasMoreLevels() {
    return this.levelIndex + 1 < this.levels.length;
  }

  loadLastLevel() {
    this.levelIndex = Data.getInstance().getLastLevel();
    this.loadLevel();
  }

  loadFirstLevel() {
    this.levelIndex = 0;
    this.loadLevel();
  }

  /**
   * Load the next level if exists and return true, otherwise return false
   * @returns {boolean}
   */
  loadNextLevel() {
    this.levelIndex++;
    if (this.levelIndex >= this.levels.length) {
      return false;
    }

    this.loadLevel();
    return true;
  }

  loadLevel() {
    this.currentLevel = { ...this.levels[this.levelIndex] };

    // clear previous level
    // toDo (gonzalezext)[24.04.24]: destroy all components
    this.components = [];
    this.decorations = [];
    this.tiles = [];
    this.floor = [];
    this.bubbles = [];
    this.finishLevelItem = [];
    this.cameras = [];

    // load level background
    this.backgroundColor = this.currentLevel.background;
    this.gridSize = SCREEN_HEIGHT / this.currentLevel.map.length;

    const map = this.currentLevel.map;
    let cameraCount = 0;
    const flags = new Array(map.length).fill(1).map(() => new Array(map[0].length).fill(true));
    for (let row = 0; row < map.length; row++) {
      for (let col = 0; col < map[row].length; col++) {
        const tile = map[row][col];
        if (flags[row][col] && ((tile & ROW_TILE) !== 0)) {

          let type = TILE_1X1;

          // check if 2x2 tile fit
          if (row + 1 < map.length && col + 1 < map[row].length &&
            (map[row][col + 1] & ROW_TILE) &&
            (map[row + 1][col] & ROW_TILE) &&
            (map[row + 1][col + 1] & ROW_TILE)
          ) {
            flags[row][col] = false;
            flags[row][col + 1] = false;
            flags[row + 1][col] = false;
            flags[row + 1][col + 1] = false;

            type = TILE_2X2;
          }

          const tile = new Tile(
            this.eventEmitter,
            col * this.gridSize,
            row * this.gridSize,
            type,
            this.gridSize
          );
          this.tiles.push(tile);
          this.components.push(tile);
        } else if ((tile & ROW_TILE) === 0) {
          const tile = new Tile(
            this.eventEmitter,
            col * this.gridSize,
            row * this.gridSize,
            TILE_FLOOR,
            this.gridSize
          );
          this.floor.push(tile);
        }

        if (tile & ROW_CAMERA) {
          const camera = new Camera(
            this.eventEmitter,
            col * this.gridSize + this.gridSize * .5,
            row * this.gridSize + this.gridSize * .5,
            this.gridSize,
            this.currentLevel.cameras[cameraCount]["viewDistance"],
            this.currentLevel.cameras[cameraCount]["viewAngle"],
            this.currentLevel.cameras[cameraCount]["initialRotation"],
            this.currentLevel.cameras[cameraCount]["maxRotation"]
          );
          cameraCount++;
          this.cameras.push(camera);
        }

        if (tile & ROW_HOLE) {
          const hole = new Hole(
            this.eventEmitter,
            col * this.gridSize + this.gridSize * .5,
            row * this.gridSize + this.gridSize * .5,
            this.gridSize
          );
          this.finishLevelItem.push(hole);
          this.components.push(hole);
        }

        if (tile & ROW_TREE) {
          const plant = new Plant(
            this.eventEmitter,
            col * this.gridSize + this.gridSize * .5,
            row * this.gridSize + this.gridSize * .5
          );
          this.decorations.push(plant);
        }

        if (tile & ROW_PLAYER_START) {
          this.playerInitialPosition = {
            x: col * this.gridSize + this.gridSize * .5,
            y: row * this.gridSize + this.gridSize * .5
          };
        }
      }
    }

    // save last level loaded
    Data.getInstance().saveLastLevel(this.levelIndex);
  }

  pauseGame() {
    this.pause = true;
  }

  unPauseGame() {
    this.pause = false;
  }

  render(context) {
    this.cleanScreen(context);

    this.floor.forEach((component) => component.render(context));
    this.renderWatterColor(context);

    if (!this.pause) {
      this.updateBubbles();
    }

    this.components.forEach((component) => component.render(context));
    this.decorations.forEach((component) => component.render(context));
    this.cameras.forEach((component) => component.render(context));
  }

  updateBubbles() {
    const toRemove = new Set();
    for (const b of this.bubbles) {
      if (b.bubbleDead()) {
        toRemove.add(b.id);
      }
    }

    this.bubbles = this.bubbles.filter((b) => !toRemove.has(b.id));
    this.components = this.components.filter((c) => !toRemove.has(c.id));

    if (this.bubbles.length < MAX_NUMBER_OF_BUBBLES) {
      if (randomNumber(2) === 1) {
        const bubble = newBubble(this.eventEmitter);
        this.components.unshift(bubble);
        this.bubbles.push(bubble);
      }
    }
  }

  renderWatterColor(context) {
    if (this.backgroundColor) {
      context.beginPath();
      context.fillStyle = this.backgroundColor;
      context.rect(0, 0, scale(this.width), scale(this.height));
      context.fill();
    }
  }

  cleanScreen(context) {
    context.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
  }
}
