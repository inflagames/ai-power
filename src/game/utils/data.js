export const APPLICATION_PREFIX = "fearwater";
export const LAST_LEVEL_KEY = `${APPLICATION_PREFIX}_game_last_level`;
export const CURRENT_DEATHS_KEY = `${APPLICATION_PREFIX}_game_current_deaths`;
export const FIRST_TIME_KEY = `${APPLICATION_PREFIX}_game_first_time`;
export const BEST_DEATHS_KEY = `${APPLICATION_PREFIX}_game_best_deaths`;

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
   * @param deaths {number}
   */
  saveBestDeaths(deaths) {
    const bestDeaths = +(this.loadBestDeaths() || 999999);
    if (deaths < bestDeaths) {
      this.saveData(BEST_DEATHS_KEY, deaths);
    }
  }

  /**
   * @returns {string|undefined}
   */
  loadBestDeaths() {
    return this.getData(BEST_DEATHS_KEY);
  }

  isFirstTime() {
    const firstTime = !this.getData(FIRST_TIME_KEY);
    this.saveData(FIRST_TIME_KEY, "false");
    return firstTime;
  }

  /**
   * @param deaths {number}
   */
  saveDeaths(deaths) {
    this.saveData(CURRENT_DEATHS_KEY, deaths);
  }

  /**
   * @returns {number}
   */
  loadDeaths() {
    return +(this.getData(CURRENT_DEATHS_KEY) || 0);
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
