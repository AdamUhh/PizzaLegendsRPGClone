class OverworldMap {
  constructor(config) {
    this.overworld = null; // ? backreference back to overworld (used for PauseMenu in OverworldEvent.js)
    this.gameObjects = {}; // ? Live objects are in here
    this.configObjects = config.configObjects; // Configuration Content (player, npcs and pizzaStones

    this.walls = config.walls || {};
    this.cutsceneSpaces = config.cutsceneSpaces || {};

    this.lowerImage = new Image();
    this.lowerImage.src = config.lowerSrc;
    this.upperImage = new Image();
    this.upperImage.src = config.upperSrc;

    this.isCutscenePlaying = false;
    this.isPaused = false;
  }

  drawLowerImage(ctx, cameraPerson) {
    // ? utils.withGrid(10.5) - cameraPerson.x is the MapXOffset
    ctx.drawImage(
      this.lowerImage,
      utils.withGrid(10.5) - cameraPerson.x,
      utils.withGrid(6) - cameraPerson.y
    );
  }
  drawUpperImage(ctx, cameraPerson) {
    ctx.drawImage(
      this.upperImage,
      utils.withGrid(10.5) - cameraPerson.x,
      utils.withGrid(6) - cameraPerson.y
    );
  }

  isSpaceTaken(currentX, currentY, direction) {
    const { x, y } = utils.nextPosition(currentX, currentY, direction);

    // ? if there is a wall infront of object (i.e. player)
    if (this.walls[`${x},${y}`]) {
      return true;
    }

    // ? Check if there are any gameObjects (i.e. player, npc) at this position
    return Object.values(this.gameObjects).find((obj) => {
      // ? obj are the live object (ex: npcs) on the screen with their current x,y data
      if (obj.x === x && obj.y === y) return true;

      // ? prevents movement while in movement transition - (prevents player from glitching through npc while npc is moving)
      // ? this is basically saying to put a fake 'wall' infront of where the object wants to go, as long as it was empty
      // ? when the request went through
      if (obj.intentPosition && obj.intentPosition[0] === x && obj.intentPosition[1] === y)
        return true;
    });
  }
  mountObjects() {
    // ? i.e. for each player, npc, pizzaStone
    Object.keys(this.configObjects).forEach((key) => {
      let object = this.configObjects[key]; // ? ex: npcA.values
      object.id = key; // ? ex: npcA

      // ? creating game object instance
      let instance;
      if (object.type === "Person") {
        instance = new Person(object); // ? ex: object = hero.values
      }
      if (object.type === "PizzaStone") {
        instance = new PizzaStone(object);
      }

      // ? mount game instance to the scene
      this.gameObjects[key] = instance;
      this.gameObjects[key].id = key;
      instance.mount(this); // ? this is basically Person.mount(OverworldMap) -> GameObject.mount(OverworldMap)
    });
  }

  async startCutscene(events) {
    // ? cutscene starts when player walks into a cutscene space or talks to an npc
    this.isCutscenePlaying = true;

    // ? Start a loop of async events
    // ? await each event
    for (let i = 0; i < events.length; i++) {
      const eventHandler = new OverworldEvent({
        event: events[i], // ? ex: event could be a dialogue, battle, walk or stand
        map: this,
      });

      const result = await eventHandler.init(); // ? basically await OverworldEvent.init()

      if (result === "LOSE_BATTLE") {
        // ? if player lost, stop here and dont progress the story
        // ? basically, if the player WON instead, this if statement wont be run
        // ? and a storyFlag would be set to true (a storyFlag that says you defeated an NPC)
        break;
      }
    }

    // ? after all events are finished, cutscene is no longer active
    this.isCutscenePlaying = false;
  }

  checkForActionCutscene() {
    // ? basically checks if the player triggered a cutscene (not by walking ontop of a cutscene space)
    const hero = this.gameObjects["hero"]; // ? get current data of hero
    // ? get x and y coords of the spot infront of the hero's current direction
    const nextCoords = utils.nextPosition(hero.x, hero.y, hero.direction);
    // ? iterate through game objects and check if there is an object (i.e. npcA) infront of the hero
    const match = Object.values(this.gameObjects).find((object) => {
      return `${object.x},${object.y}` === `${nextCoords.x},${nextCoords.y}`;
    });
    // ? make sure that we dont have a cutscene playing already
    // ? and that there is an object infront of hero
    // ? and that the object (i.e. npcA) has a talking option
    if (!this.isCutscenePlaying && match && match.talking.length) {
      const relevantScenario = match.talking.find((scenario) => {
        return (scenario.required || []).every((sf) => {
          return playerState.storyFlags[sf];
        });
      });

      relevantScenario && this.startCutscene(relevantScenario.events); // ? start a cutscene using npcA 'talking -> events' data
    }
  }

  checkForFootstepCutscene() {
    // ? basically checks if player is ontop of a cutscene space and starts a cutscene
    const hero = this.gameObjects["hero"]; // ? get current data of hero
    const match = this.cutsceneSpaces[`${hero.x},${hero.y}`]; // ? is hero ontop of a cutscene space
    if (!this.isCutscenePlaying && match) {
      this.startCutscene(match[0].events); // ? start a cutscene
    }
  }
}
