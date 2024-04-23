import BaseObject from "./shared/base-object";
import { EVENT_CLICK, SCREEN_HEIGHT, SCREEN_WIDTH } from "../utils/variables";
import { scale, unscale } from "../utils/math";
import Button from "./button";

export default class Modal extends BaseObject {
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

    const buttonHeight = 30;
    const button1Width = 70;
    const button2Width = 120;
    const buttonMargin = 15;

    this.createCredits(
      this.x + buttonMargin,
      this.y,
      button1Width,
      buttonHeight,
    );
    this.createPlayButton(
      this.x + (this.width - button1Width - button2Width - buttonMargin) / 2,
      this.y + this.height - buttonHeight - buttonMargin,
      button1Width,
      buttonHeight,
    );
    this.createShareButton(
      this.x +
        (this.width - button1Width - button2Width - buttonMargin) / 2 +
        button1Width +
        buttonMargin,
      this.y + this.height - buttonHeight - buttonMargin,
      button2Width,
      buttonHeight,
    );
  }

  createPlayButton(x, y, w, h) {
    this.buttonPlay = new Button(this.eventEmitter, x, y, w, h, "CONTINUE");
  }

  createCredits(x, y, w, h) {
    this.buttonCredits = new Button(this.eventEmitter, x, y, w, h, "@ggjnez92");
    this.buttonCredits.backgroundColor = "#00000000";
    this.buttonCredits.textColor = "#000";
    this.buttonCredits.textColorHover = "#0048ff";
    this.buttonCredits.listenerEvent(EVENT_CLICK, () =>
      window.open("https://twitter.com/ggjnez92", "_blank").focus(),
    );
  }

  createShareButton(x, y, w, h) {
    this.buttonShareRecord = new Button(
      this.eventEmitter,
      x,
      y,
      w,
      h,
      "SHARE ON TWITTER",
    );
    this.buttonShareRecord.listenerEvent(EVENT_CLICK, () => {
      const message = `I'm%20currently%20playing%20the%20game%20FEAR%20THE%20WATER%20developed%20for%20the%20%23gamedevjs%20jam.%0A%0A%23gamedev%0A%0AIf%20you%20want%20to%20check%20it%20out%2C%20here%20is%20the%20link%20to%20the%20%23github%20repository%0Ahttps%3A%2F%2Finflagames.github.io%2Ffear-the-water%2F`;
      const url = `https://twitter.com/intent/tweet?text=${message}`;
      window.open(url, "_blank").focus();
    });
  }

  /**
   * @param context {CanvasRenderingContext2D}
   */
  render(context) {
    context.beginPath();
    context.rect(0, 0, scale(SCREEN_WIDTH), scale(SCREEN_HEIGHT));
    context.fillStyle = "rgba(0,0,0,0.82)";
    context.fill();

    context.beginPath();
    context.rect(
      scale(this.x),
      scale(this.y),
      scale(this.width),
      scale(this.height),
    );
    context.fillStyle = this.backgroundColor;
    context.fill();

    this.buttonPlay.render(context);
    this.buttonCredits.render(context);
    this.buttonShareRecord.render(context);

    this.renderScore(context);
  }

  /**
   * @param context {CanvasRenderingContext2D}
   */
  renderScore(context) {
    context.beginPath();
    context.font = `${scale(this.text2Size)}px Arial`;
    const metrics2 = context.measureText(this.text);
    const text2Width = unscale(metrics2.width);
    const text2Height = unscale(
      metrics2.actualBoundingBoxAscent + metrics2.actualBoundingBoxDescent,
    );
    context.fillStyle = "#000";
    context.fillText(
      this.text,
      scale(this.x + this.width / 2 - text2Width / 2),
      scale(
        this.y +
          this.height / 2
      ),
    );
  }
}
