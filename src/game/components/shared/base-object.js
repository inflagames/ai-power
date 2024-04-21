import Observable, {
  filterObservable,
  takeUntil
} from "../../utils/observable";
import {
  EVENT_KEYDOWN,
  EVENT_KEYPRESS,
  EVENT_KEYUP,
  EVENT_MOUSELEAVE,
  EVENT_MOUSEOUT,
  EVENT_TOUCHCANCEL,
  EVENT_TOUCHUP
} from "../../utils/variables";

export default class BaseObject {
  /**
   * @param eventEmitter {Observable}
   * @param x {number}
   * @param y {number}
   * @param width {number}
   * @param height {number}
   */
  constructor(eventEmitter, x = 0, y = 0, width = 0, height = 0) {
    this.destroy = new Observable();
    /** @member {Observable} */
    this.eventEmitter = eventEmitter;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.lastMousePosition = null;
    this.isMouseHover = false;

    if (global['idCount'] === undefined) {
      global['idCount'] = 0;
    }
    this.id = global['idCount']++;
  }

  set eventEmitter(value) {
    this._eventEmitter = value ? value.pipe(takeUntil(this.destroy)) : value;
  }

  get eventEmitter() {
    return this._eventEmitter;
  }

  /**
   * @param context {CanvasRenderingContext2D}
   */
  render(context) {
  }

  /**
   * Event listener
   * @param event {string}
   * @param callback {function}
   */
  listenerEvent(event, callback) {
    this.eventEmitter
      .pipe(filterObservable((data) => data.event === event))
      .on((data) => {
        if (
          (data &&
            this.validateMouseEventPropagation(data.position, data.event)) ||
          this.validateKeyboardEventPropagation(data.event)
        ) {
          callback(data);
        }
      });
  }

  validateKeyboardEventPropagation(event) {
    return (
      event === EVENT_KEYDOWN ||
      event === EVENT_KEYUP ||
      event === EVENT_KEYPRESS
    );
  }

  /**
   * @param position {{x: number, y: number}}
   * @param event {string}
   * @return {boolean}
   */
  validateMouseEventPropagation(position, event) {
    if (
      event === EVENT_TOUCHUP ||
      event === EVENT_MOUSEOUT ||
      event === EVENT_TOUCHCANCEL ||
      event === EVENT_MOUSELEAVE
    ) {
      return true;
    }
    if (
      this.isPositionInside(this.lastMousePosition) &&
      !this.isPositionInside(position)
    ) {
      this.eventEmitter.emit({ event: EVENT_MOUSEOUT });
    }
    this.lastMousePosition = position;
    return (this.isMouseHover = this.isPositionInside(position));
  }

  isPositionInside(position) {
    return (
      position &&
      position.x >= this.x &&
      position.x <= this.x + this.width &&
      position.y >= this.y &&
      position.y <= this.y + this.height
    );
  }
}
