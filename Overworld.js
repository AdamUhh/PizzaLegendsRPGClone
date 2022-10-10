class Overworld {
  constructor({ element }) {
    this.element = element;
    this.canvas = this.element.querySelector(".game-canvas");
    this.ctx = this.canvas.getContext("2d");
    this.map = null; // ? map data to be used
  }

  startGameLoop() {
    const step = () => {
      // ? Clear off the canvas
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      // ? Establish Camera Person
      const cameraPerson = this.map.gameObjects.hero; // ? mounted in init()

      // ? Update all objects (GameObjects/Person)
      Object.values(this.map.gameObjects).forEach((object) => {
        object.update({
          arrow: this.directionInput.direction,
          map: this.map,
        });
      });

      // ? Draw Lower Layer
      this.map.drawLowerImage(this.ctx, cameraPerson);

      // ? Draw Game Objects
      Object.values(this.map.gameObjects)
        .sort((a, b) => {
          // ? returns the lower y value
          // ? draws the northern characters are drawn
          // ? before the southern characters
          return a.y - b.y;
        })
        .forEach((object) => {
          object.sprite.draw(this.ctx, cameraPerson);
        });

      // ? Draw Upper Layer
      this.map.drawUpperImage(this.ctx, cameraPerson);

      if (!this.map.isPaused) {
        requestAnimationFrame(() => {
          step();
        });
      }
    };
    step();
  }

  bindActionInput() {
    new KeyPressListener("Enter", () => {
      // ? Is there an npc for the player to talk to?
      this.map.checkForActionCutscene();
    });

    new KeyPressListener("Escape", () => {
      if (!this.map.isCutscenePlaying) {
        this.map.startCutscene([
          {
            type: "pause",
          },
        ]);
      }
    });
  }

  bindHeroPositionCheck() {
    document.addEventListener("PersonWalkingComplete", (e) => {
      if (e.detail.whoId === "hero") {
        // ? Hero's position has changed
        this.map.checkForFootstepCutscene();
      }
    });
  }

  startMap(mapConfig, heroInitialState = null) {
    this.map = new OverworldMap(mapConfig); // ? Create Map
    this.map.overworld = this; // ? used as backreference. kinda useless tbh
    this.map.mountObjects(); // ? used to create/mount player, npc and pizzaStone to screen

    const { hero } = this.map.gameObjects;
    if (heroInitialState) {
      hero.x = heroInitialState.x;
      hero.y = heroInitialState.y;
      hero.direction = heroInitialState.direction;
    }

    this.progress.mapId = mapConfig.id;
    this.progress.startingHeroX = hero.x;
    this.progress.startingHeroY = hero.y;
    this.progress.startingHeroDirection = hero.direction;
  }

  async init() {
    const container = document.querySelector(".game-container");

    // ? Create a new progress tracker
    this.progress = new Progress();

    // ? Show the title screen
    this.titleScreen = new TitleScreen({
      progress: this.progress,
    });
    const useSaveFile = await this.titleScreen.init(container);

    // ? Potentially load saved data
    let initialHeroState = null;
    if (useSaveFile) {
      this.progress.load();
      initialHeroState = {
        x: this.progress.startingHeroX,
        y: this.progress.startingHeroY,
        direction: this.progress.startingHeroDirection,
      };
    }

    // ? Load the HUD
    this.hud = new Hud();
    this.hud.init(container);

    // ? Start the first map
    this.startMap(window.OverworldMaps[this.progress.mapId], initialHeroState); // ? data located in OverworldMap.js

    // ? Create controls
    this.bindActionInput(); // ? event listener for keypress:"Enter", used for interactions with NPCs
    this.bindHeroPositionCheck();

    this.directionInput = new DirectionInput(); // ? Player movement
    this.directionInput.init();

    // ? Start game
    this.startGameLoop();

    // this.map.startCutscene([
    //   { type: "battle", enemyId: "beth" },
    // ]);
  }
}
