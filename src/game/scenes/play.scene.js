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
import Settings from "../components/settings";
import Button from "../components/button";
import { isMobileMethod } from "../utils/mobile-device";
import GameLogic from "./shared/game.logic";
import Level from "../components/level";
import Help from "../components/help";

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
        this.showSettings(false);
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
      this.showHelp();
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
      SCORE_MARGIN,
      "LEVEL"
    );
    score.backgroundColor = "#00000000";

    // deaths indicator
    const deathsScore = new Score(
      this.eventEmitter,
      SCREEN_WIDTH * 0.5 + 40,
      SCORE_MARGIN,
      "DEATHS"
    );
    deathsScore.backgroundColor = "#00000000";

    // player component
    this.player = new Player(
      this.eventEmitter,
      this.level.playerInitialPosition.x,
      this.level.playerInitialPosition.y,
      this.level.gridSize
    );
    this.currentGame = new GameLogic(this.level, score, deathsScore);
    this.currentGame.player.component = this.player;

    // add components to the element array
    this.elements = [this.player, this.buttonPause, this.buttonHelp, score, deathsScore];

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

  showSettings(restartGame = true) {
    if (!this.isModalShow) {
      this.isModalShow = true;
      const modalWidth = 300;
      const modalHeight = 300;
      const modal = new Settings(
        this.eventEmitter,
        SCREEN_WIDTH / 2 - modalWidth / 2,
        SCREEN_HEIGHT / 2 - modalHeight / 2,
        modalWidth,
        modalHeight
      );
      modal.currentGame = this.currentGame;
      modal.buttonPlay.listenerEvent(EVENT_MOUSEUP, () => {
        this.hideModal(modal);
        if (restartGame) {
          this.currentGame.restartLevel();
        }
      });
      modal.buttonRestart.listenerEvent(EVENT_CLICK, () => {
        this.hideModal(modal);
        this.currentGame.loadFirstLevel();
      });
      this.elements.push(modal);
    }
  }

  showHelp() {
    if (!this.isModalShow) {
      this.isModalShow = true;
      const modalWidth = SCREEN_WIDTH * 0.8;
      const modalHeight = SCREEN_HEIGHT * 0.5;
      const modal = new Help(
        this.eventEmitter,
        SCREEN_WIDTH / 2 - modalWidth / 2,
        SCREEN_HEIGHT / 2 - modalHeight / 2,
        modalWidth,
        modalHeight
      );

      modal.closeHelpButton.listenerEvent(EVENT_MOUSEUP, () => {
        this.hideModal(modal);
      });

      this.elements.push(modal);
    }
  }

  hideModal(modal) {
    modal.destroyComponents();
    modal.destroy.emit();
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
