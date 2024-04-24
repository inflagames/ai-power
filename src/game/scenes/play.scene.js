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
import GameLogic, { GAME_RUNNING } from "./shared/game.logic";
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

    this.createSettingsButton();
    this.createHelpButton();

    this.listenerEvent(EVENT_KEYDOWN, this.keyDown.bind(this));
    this.listenerEvent(EVENT_KEYUP, this.keyUp.bind(this));

    this.initGame();
  }

  createSettingsButton() {
    this.buttonPause = new Button(
      this.eventEmitter,
      SCORE_MARGIN,
      SCORE_MARGIN,
      100,
      30,
      "SETTINGS"
    );
    this.buttonPause.backgroundColor = "#00000000";
    this.buttonPause.textSize = 20;
    this.buttonPause.listenerEvent(EVENT_CLICK, () => {
      if (this.currentGame.canPauseGame()) {
        this.currentGame.pause();
        this.showModal(Data.getInstance().getScore(), false);
      }
    });
  }

  createHelpButton() {
    this.buttonHelp = new Button(
      this.eventEmitter,
      SCORE_MARGIN + this.buttonPause.width,
      SCORE_MARGIN,
      100,
      30,
      "HELP"
    );
    this.buttonHelp.backgroundColor = "#00000000";
    this.buttonHelp.textSize = 20;
    this.buttonHelp.listenerEvent(EVENT_CLICK, () => {
      // toDo (gonzalezext)[24.04.24]: show help
    });
  }

  initGame() {
    this.isModalShow = false;

    // game logic
    if (this.currentGame) {
      this.currentGame.destroy();
    }

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
    score.backgroundColor = "#00000000";

    // player component
    this.player = new Player(
      this.eventEmitter,
      this.level.playerInitialPosition.x,
      this.level.playerInitialPosition.y,
      this.level.gridSize,
      this.level.gridSize
    );
    this.currentGame = new GameLogic(this.level, score);
    this.currentGame.player.component = this.player;

    // add components to the element array
    this.elements = [this.player, this.buttonPause, this.buttonHelp];
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
      const modalHeight = 300;
      const modal = new Modal(
        this.eventEmitter,
        SCREEN_WIDTH / 2 - modalWidth / 2,
        SCREEN_HEIGHT / 2 - modalHeight / 2,
        modalWidth,
        modalHeight
      );
      Data.getInstance().saveScore(
        Math.max(Data.getInstance().getScore(), score)
      );
      modal.score = score;
      modal.currentGame = this.currentGame;
      modal.buttonPlay.listenerEvent(EVENT_MOUSEUP, () => {
        this.hideModal(modal);
        if (restartGame) {
          this.initGame();
        }
      });
      modal.buttonRestart.listenerEvent(EVENT_CLICK, () => {
        this.hideModal(modal);
        this.currentGame.loadFirstLevel();
      });
      this.elements.push(modal);
    }
  }

  hideModal(modal) {
    modal.buttonPlay.destroy.emit();
    modal.buttonShareRecord.destroy.emit();
    modal.buttonCredits.destroy.emit();
    modal.buttonRestart.destroy.emit();
    this.currentGame.unpause();
    this.elements.pop();
    this.isModalShow = false;
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
