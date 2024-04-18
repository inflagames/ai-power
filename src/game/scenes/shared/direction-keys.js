import { normalizeVector } from "../../utils/math";

export const UP_DIRECTION = 1;
export const DOWN_DIRECTION = 2;
export const LEFT_DIRECTION = 4;
export const RIGHT_DIRECTION = 8;

export default class DirectionKeys {
  constructor() {
    /** @member {string[]} */
    this.presedKeys = [];
  }

  clear() {
    this.presedKeys = [];
  }

  /**
   * @param key {string}
   */
  addKey(key) {
    if (this.isDirectionKey(key) && !this.presedKeys.includes(key)) {
      this.presedKeys.push(key);
    }
  }

  /**
   * @param key {string}
   */
  removeKey(key) {
    this.presedKeys = this.presedKeys.filter((k) => k !== key);
  }

  /**
   * @param key {string}
   * @return {boolean}
   */
  isDirectionKey(key) {
    return key === "a" || key === "w" || key === "s" || key === "d";
  }

  /**
   * Current state of the keys
   * @returns {boolean}
   */
  hasPressedKeys() {
    return this.presedKeys.length > 0;
  }

  /**
   * @returns {{x: number, y: number}}
   */
  directionVector() {
    let directionVec = { x: 0, y: 0 };

    /** @type {number} */
    const direction = this.direction();

    if ((direction & UP_DIRECTION) !== 0) {
      directionVec.y = -1;
    } else if ((direction & DOWN_DIRECTION) !== 0) {
      directionVec.y = 1;
    }

    if ((direction & LEFT_DIRECTION) !== 0) {
      directionVec.x = -1;
    } else if ((direction & RIGHT_DIRECTION) !== 0) {
      directionVec.x = 1;
    }

    // console.log(normalizeVector(directionVec));

    return normalizeVector(directionVec);
  }

  direction() {
    let dir = 0;

    if (this.presedKeys.length > 0) {
      dir = this.directionMap(this.presedKeys[0]);
      let position = 1;
      while (position < this.presedKeys.length) {
        let n = this.consumeNextDirection(
          UP_DIRECTION,
          LEFT_DIRECTION,
          RIGHT_DIRECTION,
          dir,
          this.directionMap(this.presedKeys[position])
        );
        n |= this.consumeNextDirection(
          DOWN_DIRECTION,
          LEFT_DIRECTION,
          RIGHT_DIRECTION,
          dir,
          this.directionMap(this.presedKeys[position])
        );
        n |= this.consumeNextDirection(
          LEFT_DIRECTION,
          UP_DIRECTION,
          DOWN_DIRECTION,
          dir,
          this.directionMap(this.presedKeys[position])
        );
        n |= this.consumeNextDirection(
          RIGHT_DIRECTION,
          UP_DIRECTION,
          DOWN_DIRECTION,
          dir,
          this.directionMap(this.presedKeys[position])
        );

        if (n) {
          dir |= n;
          break;
        }

        position++;
      }
    }

    return dir;
  }

  consumeNextDirection(dir, acDir1, acDir2, currentDir, nextDir) {
    if (dir === currentDir && (nextDir === acDir1 || nextDir === acDir2)) {
      return nextDir;
    }
    return 0;
  }

  /**
   * @param key {string}
   * @returns {number}
   */
  directionMap(key) {
    if (key === "w") {
      return UP_DIRECTION;
    }
    if (key === "s") {
      return DOWN_DIRECTION;
    }
    if (key === "a") {
      return LEFT_DIRECTION;
    }
    if (key === "d") {
      return RIGHT_DIRECTION;
    }
    return 0;
  }
}
