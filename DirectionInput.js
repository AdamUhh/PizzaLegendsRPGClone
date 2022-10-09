class DirectionInput {
  constructor() {
    this.heldDirections = []; // ? Used as a stack

    this.keyCodeMap = {
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
      const dir = this.keyCodeMap[e.code];

      // ? if the direction/input does not exist in the heldDirections array/stack
      // ? LIFO - Last In, First Out
      if (dir && this.heldDirections.indexOf(dir) === -1) {
        // ? put it at beginning of the heldDirections array/stack
        this.heldDirections.unshift(dir);
      }
    });
    document.addEventListener("keyup", (e) => {
      const dir = this.keyCodeMap[e.code];

      const index = this.heldDirections.indexOf(dir);

      // ? if the direction/input is in heldDirections array/stack
      if (index > -1) this.heldDirections.splice(index, 1);
    });
  }
}
