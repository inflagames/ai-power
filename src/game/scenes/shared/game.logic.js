import {
  addVectors,
  detectCollision,
  detectCollisionWithCircle,
  lerpVector,
  multiplyVector,
  normalizeVector
} from "../../utils/math";
import DirectionKeys from "./direction-keys";
import { ANIMATE_WALK } from "../../components/player";
import Level from "../../components/level";
import Data from "../../utils/data";

export const GAME_RUNNING = 1;
export const GAME_STOP = 3;
export const GAME_OVER = 5;
export const GAME_PAUSE = 7;

export default class GameLogic {
  /**
   *
   * @param level {Level}
   * @param score {Score}
   * @param deathsScore {Score}
   */
  constructor(level, score, deathsScore) {
    /** @member {DirectionKeys} */
    this.directionKeys = new DirectionKeys();

    /** @member {Level} */
    this.level = level;

    /** @member {Score} */
    this.score = score;

    /** @member {Score} */
    this.scoreDeaths = deathsScore;

    this.player = {};
    this.restartLevel();

    this.sideAnimation = 0;
  }

  destroy() {
    this.player.component.destroy.emit();
  }

  /**
   * run an iteration of the game logic
   */
  play() {
    if (this.player.status === GAME_RUNNING) {
      this.movePlayer();
      this.animateComponents();
      this.checkCollisionWithRelevantElements();
    } else if (this.player.status === GAME_OVER) {
      this.animateComponents();
      if (new Date().getTime() - this.sideAnimation > 3000) {
        this.restartLevel();
      }
    }
  }

  /**
   * Move the player base on the direction keys
   */
  movePlayer() {
    const VELOCITY = 10;

    if (this.directionKeys.hasPressedKeys()) {
      const rot = lerpVector(this.player.directionVector, this.directionKeys.directionVector(), 0.95);
      this.player.directionVector = multiplyVector(normalizeVector(rot), VELOCITY);

      // check collision
      this.checkCollisionAndSlide();

      this.player.component.animation |= ANIMATE_WALK;
    } else {
      this.player.component.animation = 0;
    }

    this.player.component.updateCoordinates(this.player.position);
    this.player.component.updateDirectionVector({ ...this.player.directionVector, y: -this.player.directionVector.y });
  }

  /**
   * @returns {boolean}
   */
  checkCollisionAndSlide() {
    const dirVectors = [
      { ...this.player.directionVector },
      { x: this.player.directionVector.x, y: 0 },
      { x: 0, y: this.player.directionVector.y }
    ];

    const prevPosition = { ...this.player.position };
    for (const vec of dirVectors) {
      this.player.position = addVectors(vec, prevPosition);

      const circle = this.player.component.getCollisionCircle();
      circle.x = this.player.position.x;
      circle.y = this.player.position.y;

      if (!this.checkCollisionWithMapRecursive(circle)) {
        return false;
      }
    }

    this.player.position = prevPosition;
    return true;
  }

  checkCollisionWithMapRecursive(circle) {
    for (const component of this.level.tiles) {
      const shapes = component.getProjection();
      for (const shape of shapes) {
        if (detectCollisionWithCircle(shape.points, circle)) {
          return true;
        }
      }
    }

    return false;
  }

  checkCollisionWithRelevantElements() {
    const playerProjection = this.player.component.getProjection();
    for (const camera of this.level.cameras) {
      if (camera.seeAnyPoint(playerProjection)) {
        camera.sawPlayer = true;
        this.gameOver();
        return true;
      } else {
        camera.sawPlayer = false;
      }
    }

    // validate end of the level
    for (const component of this.level.finishLevelItem) {
      if (this.checkCollisionInProjections(playerProjection, component.getProjection("center"))) {
        this.levelComplete();
        return false;
      }
    }
  }

  /**
   * @param shapes1 {{points: {x: number, y: number}[], background: string}[]}
   * @param shapes2 {{points: {x: number, y: number}[], background: string}[]}
   * @return {boolean}
   */
  checkCollisionInProjections(shapes1, shapes2) {
    for (const s1 of shapes1) {
      for (const s2 of shapes2) {
        if (detectCollision(s1.points, s2.points)) {
          return true;
        }
      }
    }
    return false;
  }

  gameOver() {
    // save deaths
    this.player.deaths++;
    Data.getInstance().saveDeaths(this.player.deaths);

    this.player.status = GAME_OVER;
    this.player.component.animation = 0;
    this.player.component.brakeShapes();
    this.sideAnimation = new Date().getTime();
  }

  canPauseGame() {
    return true;
  }

  animateComponents() {
    // animate player
    this.player.component.animate();

    // animate cameras
    this.level.cameras.forEach((obj) => obj.animate());
  }

  pause() {
    this.player.status = GAME_PAUSE;
    this.level.pauseGame();
  }

  unpause() {
    this.player.status = GAME_RUNNING;
    this.level.unPauseGame();
  }

  levelComplete() {
    if (this.level.hasMoreLevels()) {
      this.level.loadNextLevel();
      this.restartLevel();
    } else {
      Data.getInstance().saveBestDeaths(this.player.deaths);
      Data.getInstance().saveDeaths(0);

      this.loadFirstLevel();
    }
    this.updateDeathScore();
  }

  loadFirstLevel() {
    this.level.loadFirstLevel();
    Data.getInstance().saveDeaths(0);
    this.restartLevel();
  }

  restartLevel() {
    this.player = {
      ...this.player,
      position: this.level.playerInitialPosition,
      directionVector: { x: 0, y: 1 },
      expectedRotation: 0,
      velocity: 0,
      deaths: Data.getInstance().loadDeaths(),
      minVelocity: 10,
      acceleration: 20,
      deceleration: -1.5,
      status: GAME_RUNNING
    };
    if (this.player.component) {
      this.player.component.brakedShape = null;
      this.player.component.width = this.level.gridSize;
      this.player.component.calculateScale();
    }
    this.score.score = this.level.levelIndex + 1;

    this.updateDeathScore();
  }

  updateDeathScore() {
    this.scoreDeaths.score = this.player.deaths;
  }
}
