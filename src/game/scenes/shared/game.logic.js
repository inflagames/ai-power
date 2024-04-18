import { addVectors, detectCollision, multiplyVector } from "../../utils/math";
import { SCREEN_HEIGHT, SCREEN_WIDTH } from "../../utils/variables";
import DirectionKeys from "./direction-keys";

const GAME_STOP = "3";
const GAME_OVER = "5";
const GAME_PAUSE = "7";

export default class GameLogic {
  constructor() {
    /** @member {Score} */
    this.score = null;

    this.time = 0;

    /** @member {DirectionKeys} */
    this.directionKeys = new DirectionKeys();

    this.player = {
      position: {
        x: SCREEN_WIDTH / 2,
        y: SCREEN_HEIGHT / 2
      },
      rotation: Math.PI / 2,
      expectedRotation: 0,
      velocity: 0,
      minVelocity: 10,
      acceleration: 20,
      deceleration: -1.5,
      status: [GAME_STOP],
      component: undefined
    };
    this.enemies = [];
    this.objects = [];

    this.configs = {};
  }

  destroy() {
    this.enemies.forEach((enemy) => enemy.component.destroy.emit());
    this.objects.forEach((obj) => obj.component.destroy.emit());
    this.player.component.destroy.emit();
  }

  /**
   * run an iteration of the game logic
   */
  play() {
    this.movePlayer();
    this.animateComponents();
  }

  /**
   * Move the player base on the direction keys
   */
  movePlayer() {
    const VELOCITY = 10;

    const movement = multiplyVector(this.directionKeys.directionVector(), VELOCITY);
    this.player.position = addVectors(movement, this.player.position);

    this.player.component.updateCoordinates(this.player.position);
    // toDo (gonzalezext)[18.04.24]: validate collision
  }

  canPauseGame() {
    // toDo (gonzalezext)[18.04.24]:
    return true;
  }

  animateComponents() {
    // toDo (gonzalezext)[18.04.24]:
    // animation in general
    // this.ship.component.animate();
  }

  pause() {
    // toDo (gonzalezext)[18.04.24]:
  }

  unpause() {
    // toDo (gonzalezext)[18.04.24]:
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
}
