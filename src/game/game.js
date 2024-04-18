import Navigator from "./navigator";
import Observable from "./utils/observable";
import { unscale } from "./utils/helpers";
import {
  SCREEN_WIDTH,
  SCREEN_RATIO,
  SCENE_GAME,
  STOP,
  EVENT_CLICK,
  EVENT_MOUSEDOWN,
  EVENT_MOUSEUP,
  EVENT_MOUSEOUT,
  EVENT_MOUSELEAVE,
  EVENT_MOUSEMOVE,
  EVENT_TOUCHDOWN,
  EVENT_TOUCHUP,
  EVENT_TOUCHCANCEL,
  EVENT_TOUCHMOVE,
  EVENT_RESIZE,
  RUNNING,
  FPS,
  EVENT_KEYDOWN,
  EVENT_KEYPRESS,
  EVENT_KEYUP,
} from "./utils/variables";

const intervalPerSecond = 1000 / FPS;

let gameInstance = null;

export default class Game {
  constructor() {
    window.addEventListener("resize", this.resizeScreen.bind(this));

    /** @member {HTMLCanvasElement} */
    this.canvas = document.getElementById("game");

    this.registerEvents();

    /** @member {Observable} */
    this.eventEmitter = new Observable();

    /** @member {CanvasRenderingContext2D} */
    this.context = this.canvas.getContext("2d");

    /** @member {Navigator} */
    this.navigatorRoot = new Navigator(SCENE_GAME, this.eventEmitter);

    this.loopStatus = STOP;
    this.lastTime = 0;
    this.width = this.canvas.width;
    this.height = this.canvas.height;

    this.resizeScreen();
  }

  registerEvents() {
    // keyboard events
    this.registerKeyboardEvent("keydown", EVENT_KEYDOWN);
    this.registerKeyboardEvent("keyup", EVENT_KEYUP);
    this.registerKeyboardEvent("keypress", EVENT_KEYPRESS);

    // mouse events
    this.registerClickEvent("click", EVENT_CLICK);
    this.registerClickEvent("mousedown", EVENT_MOUSEDOWN);
    this.registerClickEvent("mouseup", EVENT_MOUSEUP);
    this.registerClickEvent("mouseout", EVENT_MOUSEOUT);
    this.registerClickEvent("mouseleave", EVENT_MOUSELEAVE);
    this.registerClickEvent("mousemove", EVENT_MOUSEMOVE);

    // touch events
    this.registerTouchEvent("touchstart", EVENT_TOUCHDOWN, false);
    this.registerTouchEvent("touchend", EVENT_TOUCHUP, false);
    this.registerTouchEvent("touchcancel", EVENT_TOUCHCANCEL, false);
    this.registerTouchEvent("touchmove", EVENT_TOUCHMOVE, false);
  }

  /**
   * @param type {string}
   * @param eventType {string}
   * @param option {boolean}
   */
  registerClickEvent(type, eventType, option = undefined) {
    this.canvas.addEventListener(
      type,
      (e) => this.clickEvent(e, eventType),
      option,
    );
  }

  /**
   * @param type {string}
   * @param eventType {string}
   * @param option {boolean}
   */
  registerTouchEvent(type, eventType, option = undefined) {
    this.canvas.addEventListener(
      type,
      (e) => this.touchEvent(e, eventType),
      option,
    );
  }

  /**
   * @param type {string}
   * @param eventType {string}
   * @param option {boolean}
   */
  registerKeyboardEvent(type, eventType, option = undefined) {
    document.addEventListener(
      type,
      (e) => this.keyboardEvent(e, eventType),
      option,
    );
  }

  resizeScreen() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    let calculatedWidth = Math.min(SCREEN_WIDTH, width);
    let calculatedHeight = calculatedWidth * SCREEN_RATIO;

    if (calculatedHeight > height) {
      calculatedHeight = height;
      calculatedWidth = height / SCREEN_RATIO;
    }

    this.canvas.width = calculatedWidth;
    this.canvas.height = calculatedHeight;

    window.currentWidth = calculatedWidth;
    this.eventEmitter.emit({
      event: EVENT_RESIZE,
      dimension: { w: calculatedWidth, h: calculatedHeight },
    });
  }

  /**
   * @param event {TouchEvent}
   * @param type {string}
   */
  touchEvent(event, type) {
    this.emitPositionEvent(
      {
        x: event?.targetTouches[0]?.pageX,
        y: event?.targetTouches[0]?.pageY,
      },
      type,
    );
  }

  /**
   * @param event {MouseEvent}
   * @param type {string}
   */
  clickEvent(event, type) {
    this.emitPositionEvent({ x: event?.clientX, y: event?.clientY }, type);
  }

  /**
   * @param event {KeyboardEvent}
   * @param type {string}
   */
  keyboardEvent(event, type) {
    this.eventEmitter.emit({
      event: type,
      key: event.key,
    });
  }

  /**
   * @param position {{x: number, y: number}}
   * @param type {string}
   */
  emitPositionEvent(position, type) {
    const rect = this.canvas.getBoundingClientRect();
    this.eventEmitter.emit({
      event: type,
      position: {
        x: unscale(position.x - rect.left),
        y: unscale(position.y - rect.top),
      },
    });
  }

  /**
   * Get game instance
   * @returns {Game}
   */
  static getInstance() {
    if (!gameInstance) {
      gameInstance = new Game();
    }
    return gameInstance;
  }

  /**
   * Initialize game
   */
  init() {
    this.loopStatus = RUNNING;
    requestAnimationFrame(this.loop.bind(this));
  }

  /**
   * Application loop
   * @param currentTime {number}
   */
  loop(currentTime) {
    if (this.loopStatus === RUNNING) {
      if (
        this.loopStatus === RUNNING &&
        intervalPerSecond <= currentTime - this.lastTime
      ) {
        this.lastTime = currentTime;

        this.navigatorRoot.currentScene.render(this.context);
      }

      requestAnimationFrame(this.loop.bind(this));
    }
    // the else here will end the loop
  }
}
