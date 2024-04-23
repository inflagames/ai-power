import { addVectors, detectCollision, lerpVector, multiplyVector, normalizeVector } from "../../utils/math";
import DirectionKeys from "./direction-keys";
import { ANIMATE_WALK } from "../../components/player";
import Level from "../../components/level";

export const GAME_RUNNING = 1;
export const GAME_STOP = 3;
export const GAME_OVER = 5;
export const GAME_PAUSE = 7;

export default class GameLogic {
  /**
   *
   * @param level {Level}
   * @param score {Score}
   */
  constructor(level, score) {
    /** @member {DirectionKeys} */
    this.directionKeys = new DirectionKeys();

    /** @member {Level} */
    this.level = level;

    /** @member {Score} */
    this.score = score;

    this.player = {};
    this.restartLevel();
  }

  destroy() {
    this.objects.forEach((obj) => obj.component.destroy.emit());
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
      const prevPosition = this.player.position;
      this.player.position = addVectors(this.player.directionVector, this.player.position);
      if (this.checkCollisionWithMap()) {
        this.player.position = prevPosition;
      }

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
  checkCollisionWithMap() {
    const playerProjection = this.player.component.getProjection();
    for (const component of this.level.tiles) {
      if (this.checkCollisionInProjections(playerProjection, component.getProjection())) {
        return true;
      }
    }
    return false;
  }

  checkCollisionWithRelevantElements() {
    const playerProjection = this.player.component.getProjection();
    for (const camera of this.level.cameras) {
      if (camera.seeAnyPoint(playerProjection)) {
        camera.sawPlayer = true;
        // this.level.gameOver();
        // return true;
      } else {
        // toDo (gonzalezext)[23.04.24]: remove this
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

  canPauseGame() {
    // toDo (gonzalezext)[18.04.24]:
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

  updateSpaces() {
    // toDo (gonzalezext)[18.04.24]:
  }

  updateScore() {
    // toDo (gonzalezext)[18.04.24]:
  }

  /**
   * @return {number}
   */
  getScore() {
    // toDo (gonzalezext)[18.04.24]:
  }

  checkCollision() {
    // toDo (gonzalezext)[18.04.24]:
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

  levelComplete() {
    console.log("Level complete");
    this.level.loadNextLevel();

    this.restartLevel();
  }

  restartLevel() {
    this.player = {
      ...this.player,
      position: this.level.playerInitialPosition,
      rotation: Math.PI / 2, // todo: eliminate this property
      directionVector: { x: 0, y: 1 },
      expectedRotation: 0,
      velocity: 0,
      minVelocity: 10,
      acceleration: 20,
      deceleration: -1.5,
      status: GAME_RUNNING
    };
    this.objects = [];
    this.score.level = this.level.levelIndex + 1;
  }
}
