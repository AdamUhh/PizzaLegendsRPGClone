class OverworldEvent {
  constructor({ map, event }) {
    this.map = map;
    this.event = event;
  }

  stand(resolve) {
    const who = this.map.gameObjects[this.event.who]; // ? ex: npcA
    // ? this is basically Person (npcA).startBehaviour
    who.startBehaviour(
      { map: this.map },
      {
        type: "stand",
        direction: this.event.direction,
        time: this.event.time,
      }
      // ? basically, stand facing left direction for 300ms before next behaviour goes through
      // ? ex: {type: "stand", direction: "left", time: 300}
    );

    // ? Set up a handler to complete when correct person is done standing
    // ? which will resolve event
    const completeHandler = (e) => {
      if (e.detail.whoId === this.event.who) {
        document.removeEventListener("PersonStandComplete", completeHandler);
        resolve();
      }
    };

    document.addEventListener("PersonStandComplete", completeHandler);
  }

  walk(resolve) {
    const who = this.map.gameObjects[this.event.who]; // ? ex: npcA
    who.startBehaviour(
      { map: this.map },
      {
        type: "walk",
        direction: this.event.direction,
        retry: true,
      }
    );

    // ? Set up a handler to complete when correct person is done walking
    // ? which will resolve event
    const completeHandler = (e) => {
      if (e.detail.whoId === this.event.who) {
        document.removeEventListener("PersonWalkingComplete", completeHandler);
        resolve();
      }
    };

    document.addEventListener("PersonWalkingComplete", completeHandler);
  }

  textMessage(resolve) {
    if (this.event.faceHero) {
      const obj = this.map.gameObjects[this.event.faceHero];
      // ? used to get an npc to face the player when talking to them (npcA)
      obj.direction = utils.oppositeDirection(this.map.gameObjects["hero"].direction);
    }

    const message = new TextMessage({
      text: this.event.text,
      onComplete: () => resolve(),
    });
    message.init(document.querySelector(".game-container"));
  }

  changeMap(resolve) {
    // ? Deactivate old objects
    Object.values(this.map.gameObjects).forEach((obj) => {
      obj.isMounted = false;
    });

    const sceneTransition = new SceneTransition();
    sceneTransition.init(document.querySelector(".game-container"), () => {
      // ? Change map
      this.map.overworld.startMap(window.OverworldMaps[this.event.map]);
      resolve();

      sceneTransition.fadeOut();
    });
  }

  pause(resolve) {
    this.map.isPaused = true;
    const menu = new PauseMenu({
      onComplete: () => {
        resolve();
        this.map.isPaused = false;
        this.map.overworld.startGameLoop();
      },
    });
    menu.init(document.querySelector(".game-container"));
  }

  battle(resolve) {
    const sceneTransition = new SceneTransition();

    const battle = new Battle({
      // ? Enemies is from window.Enemies inside /Content/enemies.js
      // ? this.event.enemyId is from the player interaction with an npc,
      // ? from OverworldMap.js (startCutscene())
      enemy: Enemies[this.event.enemyId],
      onComplete: (element, didWin) => {
        sceneTransition.init(document.querySelector(".game-container"), () => {
          // ? resolve will be in OverworldMap.js
          resolve(didWin ? "WON_BATTLE" : "LOSE_BATTLE");

          sceneTransition.fadeOut(element);
        });
      },
    });

    sceneTransition.init(document.querySelector(".game-container"), () => {
      battle.init(document.querySelector(".game-container"));

      sceneTransition.fadeOut();
    });
  }

  addStoryFlag(resolve) {
    window.playerState.storyFlags[this.event.flag] = true;
    resolve();
}

  craftingMenu(resolve) {
    const menu = new CraftingMenu({
      pizzas: this.event.pizzas,
      onComplete: () => {
        resolve();
      },
    });
    menu.init(document.querySelector(".game-container"));
  }

  init() {
    return new Promise((resolve) => {
      this[this.event.type](resolve);
    });
  }
}
