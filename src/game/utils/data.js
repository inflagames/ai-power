export const APPLICATION_PREFIX = "fearwater";
export const LAST_LEVEL_KEY = `${APPLICATION_PREFIX}_game_last_level`;
export const FIRST_TIME_KEY = `${APPLICATION_PREFIX}_game_first_time`;

/** @type Data */
let data = null;

export default class Data {
  static getInstance() {
    if (!data) {
      data = new Data();
    }
    return data;
  }

  /**
   * @param level {number}
   */
  saveLastLevel(level) {
    this.saveData(LAST_LEVEL_KEY, level);
  }

  /**
   * @returns {number}
   */
  getLastLevel() {
    return +(this.getData(LAST_LEVEL_KEY) || 0);
  }

  /**
   * @param key {string}
   * @param value {string|number}
   */
  saveData(key, value) {
    localStorage.setItem(key, value + "");
  }

  /**
   * @param key {string}
   * @returns {string}
   */
  getData(key) {
    return localStorage.getItem(key);
  }
}
