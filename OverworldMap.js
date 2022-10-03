class OverworldMap {
  constructor(config) {
    this.overworld = null; // ? backreference back to overworld
    this.gameObjects = config.gameObjects;
    this.walls = config.walls || {};
    this.cutsceneSpaces = config.cutsceneSpaces || {};

    this.lowerImage = new Image();
    this.lowerImage.src = config.lowerSrc;
    this.upperImage = new Image();
    this.upperImage.src = config.upperSrc;

    this.isCutscenePlaying = false;
  }

  drawLowerImage(ctx, cameraPerson) {
    // ? utils.withGrid(10.5) - cameraPerson.x is the MapXOffset
    ctx.drawImage(this.lowerImage, utils.withGrid(10.5) - cameraPerson.x, utils.withGrid(6) - cameraPerson.y);
  }
  drawUpperImage(ctx, cameraPerson) {
    ctx.drawImage(this.upperImage, utils.withGrid(10.5) - cameraPerson.x, utils.withGrid(6) - cameraPerson.y);
  }

  isSpaceTaken(currentX, currentY, direction) {
    const { x, y } = utils.nextPosition(currentX, currentY, direction);
    return this.walls[`${x},${y}`] || false;
  }
  mountObjects() {
    Object.keys(this.gameObjects).forEach((key) => {
      // ? TODO: determine if object (e.g. a pizza slice?) should actually mount
      let object = this.gameObjects[key];
      object.id = key;

      // ? Add collision box to object
      object.mount(this);
    });
  }

  async startCutscene(events) {
    this.isCutscenePlaying = true;

    // ? Start a loop of async events
    // ? await each event
    for (let i = 0; i < events.length; i++) {
      const eventHandler = new OverworldEvent({
        event: events[i],
        map: this,
      });
      await eventHandler.init();
    }

    this.isCutscenePlaying = false;

    // ? Reset NPC to idle behaviour
    Object.values(this.gameObjects).forEach((object) => object.doBehaviourEvent(this));
  }

  checkForActionCutscene() {
    const hero = this.gameObjects["hero"];
    const nextCoords = utils.nextPosition(hero.x, hero.y, hero.direction);
    // ? iterate through game objects and check if there is one infront of the hero
    const match = Object.values(this.gameObjects).find((object) => {
      return `${object.x},${object.y}` === `${nextCoords.x},${nextCoords.y}`;
    });
    // ? make sure that we dont have a cutscene playing already
    // ? and that there is an object infront of hero
    if (!this.isCutscenePlaying && match && match.talking.length) {
      this.startCutscene(match.talking[0].events);
    }
  }

  checkForFootstepCutscene() {
    const hero = this.gameObjects["hero"];
    const match = this.cutsceneSpaces[`${hero.x},${hero.y}`];
    if (!this.isCutscenePlaying && match) {
      this.startCutscene(match[0].events);
    }
  }

  addWall(x, y) {
    this.walls[`${x},${y}`] = true;
  }

  removeWall(x, y) {
    delete this.walls[`${x},${y}`];
  }

  moveWall(wasX, wasY, direction) {
    this.removeWall(wasX, wasY);
    const { x, y } = utils.nextPosition(wasX, wasY, direction);
    this.addWall(x, y);
  }
}

window.OverworldMaps = {
  DemoRoom: {
    lowerSrc: "/images/maps/DemoLower.png",
    upperSrc: "/images/maps/DemoUpper.png",
    gameObjects: {
      hero: new Person({
        x: utils.withGrid(5),
        y: utils.withGrid(6),
        isPlayerControlled: true,
      }),
      npcA: new Person({
        x: utils.withGrid(7),
        y: utils.withGrid(9),
        src: "/images/characters/people/npc1.png",
        behaviourLoop: [
          { type: "stand", direction: "up", time: 800 },
          { type: "stand", direction: "left", time: 800 },
          { type: "stand", direction: "right", time: 1200 },
          { type: "stand", direction: "up", time: 300 },
        ],
        talking: [
          {
            events: [
              { type: "textMessage", text: "I'm busy...", faceHero: "npcA" },
              { type: "textMessage", text: "Go away!" },
              { who: "hero", type: "walk", direction: "up" },
            ],
          },
        ],
      }),
      npcB: new Person({
        x: utils.withGrid(8),
        y: utils.withGrid(5),
        src: "/images/characters/people/npc2.png",
        behaviourLoop: [{ type: "stand", direction: "left" }],
        talking: [
          {
            events: [
              { type: "textMessage", text: "If I catch you trying to enter...", faceHero: "npcB" },
              { type: "textMessage", text: "Well, you better hope I don't!" },
            ],
          },
        ],
      }),
    },
    walls: {
      // "16,16": true,
      [utils.asGridCoord(7, 6)]: true,
      [utils.asGridCoord(8, 6)]: true,
      [utils.asGridCoord(7, 7)]: true,
      [utils.asGridCoord(8, 7)]: true,

      [utils.asGridCoord(1, 3)]: true,
      [utils.asGridCoord(2, 3)]: true,
      [utils.asGridCoord(3, 3)]: true,
      [utils.asGridCoord(4, 3)]: true,
      [utils.asGridCoord(5, 3)]: true,
      [utils.asGridCoord(6, 4)]: true,
      [utils.asGridCoord(8, 4)]: true,
      [utils.asGridCoord(9, 3)]: true,
      [utils.asGridCoord(10, 3)]: true,

      [utils.asGridCoord(5, 11)]: true,

      [utils.asGridCoord(0, 4)]: true,
      [utils.asGridCoord(0, 5)]: true,
      [utils.asGridCoord(0, 6)]: true,
      [utils.asGridCoord(0, 7)]: true,
      [utils.asGridCoord(0, 8)]: true,
      [utils.asGridCoord(0, 9)]: true,
      [utils.asGridCoord(1, 10)]: true,
      [utils.asGridCoord(2, 10)]: true,
      [utils.asGridCoord(3, 10)]: true,
      [utils.asGridCoord(4, 10)]: true,
      [utils.asGridCoord(6, 10)]: true,
      [utils.asGridCoord(7, 10)]: true,
      [utils.asGridCoord(8, 10)]: true,
      [utils.asGridCoord(9, 10)]: true,
      [utils.asGridCoord(10, 10)]: true,
      [utils.asGridCoord(11, 9)]: true,
      [utils.asGridCoord(11, 8)]: true,
      [utils.asGridCoord(11, 7)]: true,
      [utils.asGridCoord(11, 6)]: true,
      [utils.asGridCoord(11, 5)]: true,
      [utils.asGridCoord(11, 4)]: true,
    },
    cutsceneSpaces: {
      [utils.asGridCoord(7, 4)]: [
        {
          events: [
            { who: "npcB", type: "walk", direction: "left" },
            { who: "npcB", type: "stand", direction: "up", time: 200 },
            { type: "textMessage", text: "You can't be in there!" },
            { who: "npcB", type: "walk", direction: "right" },
            { who: "hero", type: "walk", direction: "down" },
            { who: "hero", type: "walk", direction: "left" },
          ],
        },
      ],
      [utils.asGridCoord(5, 10)]: [
        {
          events: [{ type: "changeMap", map: "Kitchen" }],
        },
      ],
    },
  },
  Kitchen: {
    lowerSrc: "/images/maps/KitchenLower.png",
    upperSrc: "/images/maps/KitchenUpper.png",
    gameObjects: {
      hero: new Person({
        x: utils.withGrid(3),
        y: utils.withGrid(5),
        isPlayerControlled: true,
      }),
      npcA: new Person({
        x: utils.withGrid(6),
        y: utils.withGrid(4),
        src: "/images/characters/people/npc4.png",
        behaviourLoop: [
          { type: "stand", direction: "up", time: 1200 },
          { type: "walk", direction: "left" },
          { type: "stand", direction: "up", time: 800 },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "right" },
          { type: "stand", direction: "up", time: 1000 },
          { type: "walk", direction: "left" },
          { type: "walk", direction: "left" },
        ],
        talking: [
          {
            events: [
              { type: "textMessage", text: "Sorry, busy right now!", faceHero: "npcA" },
              { who: "hero", type: "walk", direction: "down" },
            ],
          },
        ],
      }),
      npcB: new Person({
        x: utils.withGrid(10),
        y: utils.withGrid(8),
        src: "/images/characters/people/npc5.png",
        behaviourLoop: [
          { type: "walk", direction: "left" },
          { type: "stand", direction: "up", time: 1200 },
          { type: "walk", direction: "right" },
          { type: "stand", direction: "up", time: 800 },
          { type: "walk", direction: "right" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "up" },
          { type: "stand", direction: "up", time: 1500 },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "walk", direction: "down" },
          { type: "stand", direction: "left", time: 400 },
          { type: "walk", direction: "up" },
          { type: "walk", direction: "left" },
          { type: "stand", direction: "up", time: 700 },
        ],
        talking: [
          {
            events: [{ type: "textMessage", text: "You made it!", faceHero: "npcB" }],
          },
        ],
      }),
    },
    walls: {
      // "16,16": true,
      [utils.asGridCoord(1, 3)]: true,
      [utils.asGridCoord(2, 3)]: true,
      [utils.asGridCoord(3, 3)]: true,
      [utils.asGridCoord(4, 3)]: true,
      [utils.asGridCoord(5, 3)]: true,
      [utils.asGridCoord(6, 3)]: true,
      [utils.asGridCoord(7, 3)]: true,
      [utils.asGridCoord(8, 3)]: true,
      [utils.asGridCoord(9, 3)]: true,
      [utils.asGridCoord(10, 3)]: true,
      [utils.asGridCoord(11, 4)]: true,
      [utils.asGridCoord(13, 5)]: true,
      [utils.asGridCoord(13, 6)]: true,
      [utils.asGridCoord(13, 7)]: true,
      [utils.asGridCoord(13, 8)]: true,
      [utils.asGridCoord(13, 9)]: true,
      [utils.asGridCoord(13, 10)]: true,
      [utils.asGridCoord(12, 10)]: true,
      [utils.asGridCoord(9, 9)]: true,
      [utils.asGridCoord(8, 10)]: true,
      [utils.asGridCoord(7, 10)]: true,
      [utils.asGridCoord(6, 10)]: true,
      [utils.asGridCoord(5, 11)]: true,
      [utils.asGridCoord(4, 10)]: true,
      [utils.asGridCoord(3, 10)]: true,
      [utils.asGridCoord(0, 8)]: true,
      [utils.asGridCoord(0, 4)]: true,

      [utils.asGridCoord(11, 10)]: true,
      [utils.asGridCoord(10, 9)]: true,
      [utils.asGridCoord(2, 9)]: true,
      [utils.asGridCoord(1, 9)]: true,
      [utils.asGridCoord(1, 7)]: true,
      [utils.asGridCoord(1, 6)]: true,
      [utils.asGridCoord(1, 5)]: true,
      [utils.asGridCoord(6, 7)]: true,
      [utils.asGridCoord(7, 7)]: true,
      [utils.asGridCoord(9, 7)]: true,
      [utils.asGridCoord(10, 7)]: true,
    },
    cutsceneSpaces: {
      [utils.asGridCoord(5, 10)]: [
        {
          events: [{ type: "changeMap", map: "DemoRoom" }],
        },
      ],
    },
  },
};
