import DirectionKeys, {
  DOWN_DIRECTION,
  LEFT_DIRECTION,
  RIGHT_DIRECTION,
  UP_DIRECTION,
} from "../../../../src/game/scenes/shared/direction-keys";

describe("BaseShape", () => {
  it("should add and remove keys from the class", () => {
    const directionKeys = new DirectionKeys();

    directionKeys.addKey("a");
    expect(directionKeys.presedKeys).toEqual(["a"]);
    directionKeys.addKey("l");
    expect(directionKeys.presedKeys).toEqual(["a"]);
    directionKeys.addKey("w");
    expect(directionKeys.presedKeys).toEqual(["a", "w"]);
  });

  it("should not add the same key multiple times", () => {
    const directionKeys = new DirectionKeys();

    directionKeys.addKey("a");
    expect(directionKeys.presedKeys).toEqual(["a"]);
    directionKeys.addKey("a");
    expect(directionKeys.presedKeys).toEqual(["a"]);
  });

  it("should clear the pressed keys", () => {
    const directionKeys = new DirectionKeys();

    directionKeys.addKey("a");
    directionKeys.addKey("w");
    directionKeys.clear();
    expect(directionKeys.presedKeys).toEqual([]);
  });

  it("should validate direction method", () => {
    const directionKeys = new DirectionKeys();

    directionKeys.addKey("w");
    directionKeys.addKey("d");
    expect(directionKeys.direction()).toEqual(UP_DIRECTION | RIGHT_DIRECTION);

    directionKeys.clear();
    directionKeys.addKey("a");
    directionKeys.addKey("d");
    directionKeys.addKey("w");
    expect(directionKeys.direction()).toEqual(UP_DIRECTION | LEFT_DIRECTION);

    directionKeys.clear();
    directionKeys.addKey("s");
    directionKeys.addKey("a");
    expect(directionKeys.direction()).toEqual(DOWN_DIRECTION | LEFT_DIRECTION);

    directionKeys.clear();
    directionKeys.addKey("s");
    directionKeys.addKey("w");
    directionKeys.addKey("d");
    expect(directionKeys.direction()).toEqual(DOWN_DIRECTION | RIGHT_DIRECTION);

    directionKeys.clear();
    directionKeys.addKey("a");
    expect(directionKeys.direction()).toEqual(LEFT_DIRECTION);

    directionKeys.clear();
    directionKeys.addKey("w");
    expect(directionKeys.direction()).toEqual(UP_DIRECTION);

    directionKeys.clear();
    directionKeys.addKey("d");
    expect(directionKeys.direction()).toEqual(RIGHT_DIRECTION);

    directionKeys.clear();
    directionKeys.addKey("s");
    expect(directionKeys.direction()).toEqual(DOWN_DIRECTION);

    directionKeys.clear();
    directionKeys.addKey("w");
    directionKeys.addKey("s");
    expect(directionKeys.direction()).toEqual(UP_DIRECTION);

    directionKeys.clear();
    directionKeys.addKey("a");
    directionKeys.addKey("d");
    expect(directionKeys.direction()).toEqual(LEFT_DIRECTION);

    directionKeys.clear();
    directionKeys.addKey("d");
    directionKeys.addKey("a");
    expect(directionKeys.direction()).toEqual(RIGHT_DIRECTION);
  });
});
