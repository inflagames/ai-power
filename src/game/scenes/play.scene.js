import Scene from "./shared/scene";
import {
  EVENT_CLICK,
  EVENT_KEYDOWN,
  EVENT_KEYUP,
  EVENT_MOUSEUP,
  SCREEN_HEIGHT,
  SCREEN_WIDTH
} from "../utils/variables";
import Player from "../components/player";
import Score from "../components/score";
import Modal from "../components/modal";
import Button from "../components/button";
import Data from "../utils/data";
import { isMobileMethod } from "../utils/mobile-device";
import GameLogic from "./shared/game.logic";
import Level from "../components/level";

export const isMobile = isMobileMethod.any();

const SCORE_MARGIN = 10;

export default class ScenePlay extends Scene {
  /**
   * @param navigator {Navigator}
   * @param eventEmitter {Observable}
   */
  constructor(navigator, eventEmitter) {
    super(navigator, eventEmitter);

    this.buttonPause = new Button(
      this.eventEmitter,
      SCORE_MARGIN,
      SCORE_MARGIN,
      60,
      30,
      "PAUSE"
    );
    this.buttonPause.textSize = 20;
    this.buttonPause.listenerEvent(EVENT_CLICK, () => {
      if (this.currentGame.canPauseGame()) {
        this.currentGame.pause();
        this.showModal(Data.getInstance().getScore(), false);
      }
    });

    this.listenerEvent(EVENT_KEYDOWN, this.keyDown.bind(this));
    this.listenerEvent(EVENT_KEYUP, this.keyUp.bind(this));

    this.initGame();
  }

  initGame() {
    this.isModalShow = false;

    // game logic
    if (this.currentGame) {
      this.currentGame.destroy();
    }
    this.currentGame = new GameLogic();

    // player component
    this.player = new Player(
      this.eventEmitter,
      SCREEN_WIDTH / 2,
      SCREEN_HEIGHT / 2,
      30,
      35
    );
    this.currentGame.player.component = this.player;

    // create level
    this.level = new Level(
      this.eventEmitter,
      0,
      0,
      SCREEN_WIDTH,
      SCREEN_HEIGHT,
      "#000"
    );

    // score component
    const score = new Score(
      this.eventEmitter,
      SCREEN_WIDTH - SCORE_MARGIN,
      SCORE_MARGIN
    );
    this.currentGame.score = score;

    // add components to the element array
    this.elements = [this.player, this.buttonPause];
    this.elements.push(score);

    // elements of the game
    this.playableElements = [this.player];
  }

  /**
   * @param context {CanvasRenderingContext2D}
   */
  render(context) {
    // execute game logic
    this.currentGame.play();

    // render background
    this.cleanCanvas(context);

    this.renderOrRemovePlayableElements(context);

    // render scene elements
    for (const element of this.elements) {
      element.render(context);
    }
  }

  keyDown(event) {
    this.currentGame.directionKeys.addKey(event.key);
  }

  keyUp(event) {
    this.currentGame.directionKeys.removeKey(event.key);
  }

  showModal(score, restartGame = true) {
    if (!this.isModalShow) {
      this.isModalShow = true;
      const modalWidth = 300;
      const modalHeight = 200;
      const modal = new Modal(
        this.eventEmitter,
        SCREEN_WIDTH / 2 - modalWidth / 2,
        SCREEN_HEIGHT / 2 - modalWidth / 2,
        modalWidth,
        modalHeight
      );
      Data.getInstance().saveScore(
        Math.max(Data.getInstance().getScore(), score)
      );
      modal.score = score;
      modal.buttonPlay.listenerEvent(EVENT_MOUSEUP, () => {
        modal.buttonPlay.destroy.emit();
        modal.buttonShareRecord.destroy.emit();
        modal.buttonCredits.destroy.emit();
        this.currentGame.unpause();
        this.elements.pop();
        this.isModalShow = false;
        if (restartGame) {
          this.initGame();
        }
      });
      this.elements.push(modal);
    }
  }

  renderOrRemovePlayableElements(context) {
    const toRemove = new Set();
    for (const element of this.playableElements) {
      if (this.isElementVisible(element)) {
        element.render(context);
      } else {
        toRemove.add(element.id);
      }
    }
    this.playableElements = this.playableElements.filter(
      (ele) => !toRemove.has(ele.id)
    );
  }

  isElementVisible(element) {
    return element.y - element.height * 2 < SCREEN_HEIGHT;
  }

  cleanCanvas(context) {
    this.level.render(context);
  }
}
