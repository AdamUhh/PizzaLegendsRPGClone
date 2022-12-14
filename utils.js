const utils = {
  withGrid(n) {
    return n * 16;
  },

  asGridCoord(x, y) {
    return `${x * 16},${y * 16}`;
  },
  nextPosition(initialX, initialY, direction) {
    let x = initialX;
    let y = initialY;
    const size = 16;
    if (direction === "left") x -= size;
    if (direction === "right") x += size;
    if (direction === "up") y -= size;
    if (direction === "down") y += size;
    return { x, y };
  },
  oppositeDirection(direction) {
    if (direction === "left") return "right";
    if (direction === "right") return "left";
    if (direction === "up") return "down";
    return "up";
  },
  emitEvent(name, detail) {
    // ? CustomEvent is built in JS function - its basically an eventListener
    // ? ex: name:"PersonStandComplete", detail: "whoId: npcA" 
    const event = new CustomEvent(name, {
      detail,
    });
    // ? then, the "PersonStandComplete" is dispatched, which is then caught by the handler
    // ? inside OverworldEvent.js, which then resolves the "PersonStandComplete" event
    document.dispatchEvent(event);
  },
  wait(ms) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, ms);
    });
  },
  randomFromArray(array) {
    return array[Math.floor(Math.random() * array.length)];
  },
};
