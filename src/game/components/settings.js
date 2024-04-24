import BaseObject from "./shared/base-object";
import { EVENT_CLICK, SCREEN_HEIGHT, SCREEN_WIDTH } from "../utils/variables";
import { scale, unscale } from "../utils/math";
import Button from "./button";
import Data from "../utils/data";

export default class Settings extends BaseObject {
  /**
   * @param x {number}
   * @param y {number}
   * @param width {number}
   * @param height {number}
   * @param eventEmitter {Observable}
   */
  constructor(eventEmitter, x, y, width, height) {
    super(eventEmitter, x, y, width, height);
    this.backgroundColor = "#fff";
    this.textSize = 90;
    this.text2Size = 30;
    this.text = "FEAR THE WATER";
    this.score = 1000;
    this.bestScore = Data.getInstance().loadBestDeaths();

    const buttonHeight = 30;
    const button1Width = 120;
    const button2Width = 120;
    const buttonMargin = 20;

    this.components = [];

    this.createCredits(
      this.x,
      this.y,
      button1Width,
      buttonHeight
    );
    this.createPlayButton(
      this.x + (this.width - button1Width) / 2,
      this.y + this.height - (buttonHeight + buttonMargin) * 3,
      button1Width,
      buttonHeight
    );
    this.createRestartButton(
      this.x + (this.width - button2Width) / 2,
      this.y + this.height - (buttonHeight + buttonMargin) * 2,
      button2Width,
      buttonHeight
    );
    this.createShareButton(
      this.x +
      (this.width - button2Width - buttonMargin * 2) / 2 +
      buttonMargin,
      this.y + this.height - buttonHeight - buttonMargin,
      button2Width,
      buttonHeight
    );
  }

  destroyComponents() {
    this.components.forEach((component) => component.destroy.emit());
  }

  createPlayButton(x, y, w, h) {
    this.buttonPlay = new Button(this.eventEmitter, x, y, w, h, "CONTINUE");
    this.components.push(this.buttonPlay);
  }

  createRestartButton(x, y, w, h) {
    this.buttonRestart = new Button(this.eventEmitter, x, y, w, h, "RESTART");
    this.components.push(this.buttonRestart);
  }

  createCredits(x, y, w, h) {
    this.buttonCredits = new Button(this.eventEmitter, x, y, w, h, "@ggjnez92");
    this.buttonCredits.backgroundColor = "#00000000";
    this.buttonCredits.textColor = "#000";
    this.buttonCredits.textColorHover = "#0048ff";
    this.buttonCredits.listenerEvent(EVENT_CLICK, () =>
      window.open("https://twitter.com/ggjnez92", "_blank").focus()
    );
    this.components.push(this.buttonCredits);
  }

  createShareButton(x, y, w, h) {
    this.buttonShareRecord = new Button(
      this.eventEmitter,
      x,
      y,
      w,
      h,
      "SHARE ON TWITTER"
    );
    this.buttonShareRecord.listenerEvent(EVENT_CLICK, () => {
      const message = `I'm%20currently%20playing%20the%20game%20FEAR%20THE%20WATER%20developed%20for%20the%20%23gamedevjs%20jam.%0A%0A%23gamedev%0A%0AIf%20you%20want%20to%20check%20it%20out%2C%20here%20is%20the%20link%20to%20the%20%23github%20repository%0Ahttps%3A%2F%2Finflagames.github.io%2Ffear-the-water%2F`;
      const url = `https://twitter.com/intent/tweet?text=${message}`;
      window.open(url, "_blank").focus();
    });
    this.components.push(this.buttonShareRecord);
  }

  /**
   * @param context {CanvasRenderingContext2D}
   */
  render(context) {
    this.renderDialogBox(context);

    this.components.forEach((component) => component.render(context));

    this.renderTitle(context);
    this.renderScore(context);
  }

  renderDialogBox(context) {
    context.beginPath();
    context.rect(0, 0, scale(SCREEN_WIDTH), scale(SCREEN_HEIGHT));
    context.fillStyle = "rgba(0,0,0,0.82)";
    context.fill();

    context.beginPath();
    context.rect(
      scale(this.x),
      scale(this.y),
      scale(this.width),
      scale(this.height)
    );
    context.fillStyle = this.backgroundColor;
    context.fill();
  }

  renderScore(context) {
    if (this.bestScore !== undefined && this.bestScore !== null) {
      context.beginPath();
      context.font = `${scale(20)}px Arial`;
      const text = `Best score: ${this.bestScore} deaths`;
      const metrics = context.measureText(text);
      const textWidth = unscale(metrics.width);
      context.fillStyle = "#000";
      context.fillText(
        text,
        scale(this.x + this.width / 2 - textWidth / 2),
        scale(this.y + 110)
      );
    }
  }

  /**
   * @param context {CanvasRenderingContext2D}
   */
  renderTitle(context) {
    context.beginPath();
    context.font = `${scale(this.text2Size)}px Arial`;
    const metrics2 = context.measureText(this.text);
    const text2Width = unscale(metrics2.width);
    context.fillStyle = "#000";
    context.fillText(
      this.text,
      scale(this.x + this.width / 2 - text2Width / 2),
      scale(this.y + 70)
    );
  }
}
