class Person extends GameObject {
  constructor(config) {
    super(config);
    this.isPlayerControlled = config.isPlayerControlled || false;
    this.movingProgressRemaining = 0; // ? how many moves/pixels left for object to move
    this.isStanding = false;
    this.intentPosition = null; // ? [x,y]
    this.directionUpdate = {
      up: ["y", -1],
      down: ["y", 1],
      left: ["x", -1],
      right: ["x", 1],
    };
  }

  // ? called inside Overworld.js (startGameLoop())
  // ? state contains inputDirection (arrow) and the map
  update(state) {
    // ? is object still in movement
    if (this.movingProgressRemaining > 0) {
      this.updatePosition();
    } else {
      // ? is a cutscene NOT playing, is the person a player, is he supposed to be moving/is a direction pressed
      // ? Case: We're Keyboard Ready and have an arrow pressed
      if (!state.map.isCutscenePlaying && this.isPlayerControlled && state.arrow) {
        // ? this allows the player to actually move! very important
        this.startBehaviour(state, {
          type: "walk",
          direction: state.arrow,
        });
      }
      // ? update its animation frame to standing once movement has completed
      this.updateSprite();
    }
  }
  // ? state contains inputDirection (arrow) and the map
  startBehaviour(state, behaviour) {
    if (!this.isMounted) return; // ? is object mounted/displayed on screen

    // ? set character direction to whatever behaviour has
    this.direction = behaviour.direction;
    // ? this is to allow firing a walk command without having to press any keys (for npc)
    if (behaviour.type === "walk") {
      // ? stop if the space infront of object (i.e. player, npc) is taken
      if (state.map.isSpaceTaken(this.x, this.y, this.direction)) {
        behaviour.retry &&
          setTimeout(() => {
            this.startBehaviour(state, behaviour);
          }, 10);

        return;
      }
      // ? ready to walk
      this.movingProgressRemaining = 16; // ? distance (pixels) to walk
      // ? Add next position intent - get data of next position
      const intentPosition = utils.nextPosition(this.x, this.y, this.direction);
      this.intentPosition = [intentPosition.x, intentPosition.y];

      // ? update its animation frame to walking
      this.updateSprite();
    }

    if (behaviour.type === "stand") {
      this.isStanding = true;
      setTimeout(() => {
        // ? basically creates an event for an eventListener to listen to and handle (inside OverworldEvent.js)
        utils.emitEvent("PersonStandComplete", {
          whoId: this.id, // ? ex: npcA
        });
        this.isStanding = false;
      }, behaviour.time);
    }
  }

  updatePosition() {
    const [property, change] = this.directionUpdate[this.direction];
    // ? You can change the SPEED by multiplying 'change' and '-= 1' by
    // ? 1, 2, 4, 8
    const speed = 1;
    this[property] += change * speed;
    this.movingProgressRemaining -= 1 * speed;

    if (this.movingProgressRemaining === 0) {
      this.intentPosition = null;
      // ? Finished walking/movement
      utils.emitEvent("PersonWalkingComplete", { whoId: this.id });
    }
  }

  updateSprite() {
    if (this.movingProgressRemaining > 0) {
      this.sprite.setAnimation("walk-" + this.direction);
      return;
    }
    this.sprite.setAnimation("idle-" + this.direction);
  }
}
