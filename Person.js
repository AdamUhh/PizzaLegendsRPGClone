class Person extends GameObject {
  constructor(config) {
    super(config);
    this.isPlayerControlled = config.isPlayerControlled || false;
    this.movingProgressRemaining = 0;
    this.directionUpdate = {
      up: ["y", -1],
      down: ["y", 1],
      left: ["x", -1],
      right: ["x", 1],
    };
  }

  update(state) {
    if (this.movingProgressRemaining > 0) {
      this.updatePosition();
    } else {
      // ? More cases for starting to walk

      // ? is the person a player, is he supposed to be moving, and is a direction pressed
      // ? Case: We're Keyboard Ready and have an arrow pressed
      if (this.isPlayerControlled && state.arrow) {
        this.startBehaviour(state, {
          type: "walk",
          direction: state.arrow,
        });
      }
      this.updateSprite(state);
    }
  }

  startBehaviour(state, behaviour) {
    // ? set character direction to whatever behaviour has
    this.direction = behaviour.direction;
    // ? this is to allow firing a walk command without having to press any keys (for npc)
    if (behaviour.type === "walk") {
      // ? stop if space is not free
      if (state.map.isSpaceTaken(this.x, this.y, this.direction)) return;
      // ? ready to walk
      state.map.moveWall(this.x, this.y, this.direction);
      this.movingProgressRemaining = 16;
    }
  }

  updatePosition() {
    const [property, change] = this.directionUpdate[this.direction];
    this[property] += change;
    this.movingProgressRemaining -= 1;
  }

  updateSprite() {
    if (this.movingProgressRemaining > 0) {
      this.sprite.setAnimation("walk-" + this.direction);
      return;
    }
    this.sprite.setAnimation("idle-" + this.direction);
  }
}
