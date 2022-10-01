class DirectionInput {
  constructor(config) {
    this.heldDirections = [];

    this.map = {
      ArrowUp: "up",
      ArrowDown: "down",
      ArrowLeft: "left",
      ArrowRight: "right",
      KeyW: "up",
      KeyS: "down",
      KeyA: "left",
      KeyD: "right",
    };
  }

  get direction() {
    return this.heldDirections[0];
  }

  init() {
    document.addEventListener("keydown", (e) => {
      const dir = this.map[e.code];

      // ? if the direction/input does not exist yet
      if (dir && this.heldDirections.indexOf(dir) === -1) {
        // ? put it at beginning of the array
        this.heldDirections.unshift(dir);
      }
    });
    document.addEventListener("keyup", (e) => {
      const dir = this.map[e.code];

      const index = this.heldDirections.indexOf(dir);

      // ? if the direction/input is in heldDirections array
      if (index > -1) this.heldDirections.splice(index, 1);
    });
  }
}
