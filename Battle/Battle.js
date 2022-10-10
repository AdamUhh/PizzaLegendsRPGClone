class Battle {
  constructor({ enemy, arena, onComplete }) {
    this.enemy = enemy;
    this.arena = arena;
    this.onComplete = onComplete;

    this.combatants = {};

    this.activeCombatants = {
      player: null,
      enemy: null,
    };

    // ? Dynamically add player team from playerState
    window.playerState.lineup.forEach((id) => {
      this.addCombatant(id, "player", window.playerState.pizzas[id]);
    });

    // ? Dynamically add the pizzas that the enemy has from the data
    // ? inside window.Enemies inside /Content/enemies.js
    Object.keys(this.enemy.pizzas).forEach((key) => {
      this.addCombatant("e_" + key, "enemy", this.enemy.pizzas[key]);
    });

    // ? items player has
    this.items = [];

    // ? Add in player items from playerState
    window.playerState.items.forEach((item) => {
      //  ex: item: { actionId: "item_recoverStatus", instanceId: "p1", team: "player" },
      this.items.push({
        ...item,
        team: "player",
      });
    });

    // ? tracks the ids of the items that the player used
    // ? to later get rid of after the battle
    this.usedInstanceIds = {};
  }

  // ? ex: id: p1, team: player, config: window.playerState.pizzas[p1]
  // ? ex: id: e_a, team: ememy, config: window.Enemies.pizzas[a]
  addCombatant(id, team, config) {
    // ? example output ONLY THE FIRST parameter in new Combatant

    // p1: new Combatant(
    //   {
    //     "name": "Slice Samurai",
    //     "description": "PizzaDescHere",
    //     "type": "spicy",
    //     "src": "/images/characters/pizzas/s001.png",
    //     "icon": "/images/icons/spicy.png",
    //     "actions": [
    //        "saucyStatus",
    //        "clumsyStatus",
    //        "damage1"
    //     ],
    //     "pizzaId": "s001",
    //     "hp": 30,
    //     "maxHp": 50,
    //     "xp": 90,
    //     "maxXp": 100,
    //     "level": 1,
    //     "status": {
    //       "type": "saucy"
    //     }
    //     team: "player",
    //     isPlayerControlled: true,
    //   },
    //   this
    // ),

    // ? note, this does not include the items. npcs cannot use items (to heal)
    this.combatants[id] = new Combatant(
      {
        ...Pizzas[config.pizzaId],
        ...config,
        team,
        isPlayerControlled: team === "player",
      },
      this
    );

    // ? Populate first active pizza
    // ? if there is no activeCombatant for each team, put in the first pizza id
    this.activeCombatants[team] = this.activeCombatants[team] || id;
  }

  createElement() {
    this.element = document.createElement("div");
    this.element.classList.add("Battle");

    // If provided, add a CSS class for setting the arena background
    if (this.arena) {
      this.element.classList.add(this.arena);
    }

    this.element.innerHTML = `
    <div class="Battle_hero">
        <img src="${"/images/characters/people/hero.png"}" alt="Hero" />
    </div>
    <div class="Battle_enemy">
        <img src="${this.enemy.src}" alt=${this.enemy.name} />
    </div>
    `;
  }
  init(container) {
    this.createElement();
    container.appendChild(this.element);

    // ? this is basically the team hud (located at top)
    // ? to showcase pizzas that are active, alive and dead
    this.playerTeam = new Team("player", "Hero");
    this.enemyTeam = new Team("enemy", "Bully");

    // ? for each combatant, which is all the pizzas that the player and enemy have in total
    // ? does not need to be active
    // ? ex: combatants: [p1, p2, e_a, e_b]
    Object.keys(this.combatants).forEach((key) => {
      let combatant = this.combatants[key]; // ? get the combatants values
      combatant.id = key;
      // ? Combatant.init() will basically control and display
      // ? the pizzas hud on the screen
      combatant.init(this.element); // ? this is basically Combatant.init()

      // ? Add to correct team
      if (combatant.team === "player") {
        this.playerTeam.combatants.push(combatant);
      } else if (combatant.team === "enemy") {
        this.enemyTeam.combatants.push(combatant);
      }
    });

    this.playerTeam.init(this.element);
    this.enemyTeam.init(this.element);

    this.turnCycle = new TurnCycle({
      battle: this,
      onNewEvent: (event) => {
        return new Promise((resolve) => {
          const battleEvent = new BattleEvent(event, this);
          battleEvent.init(resolve);
        });
      },
      onWinner: (winner) => {
        // ? when the player wins the battle, save stats to playerState
        if (winner === "player") {
          const playerState = window.playerState;
          // ? for each pizza that the player has
          Object.keys(playerState.pizzas).forEach((id) => {
            const playerStatePizza = playerState.pizzas[id];
            // ? this is basically the new stats (data) after the battle
            const combatant = this.combatants[id];
            // ? only if you WIN the battle, will the lost hp, gained xp and level save
            // ? if you LOSE the battle, nothing is saved and you
            // ? go back to the previous state before the battle
            if (combatant) {
              // ? save new stats to playerState
              playerStatePizza.hp = combatant.hp;
              playerStatePizza.xp = combatant.xp;
              playerStatePizza.maxXp = combatant.maxXp;
              playerStatePizza.level = combatant.level;
            }
          });

          // ? Get rid of player used items
          playerState.items = playerState.items.filter((item) => {
            return !this.usedInstanceIds[item.instanceId];
          });

          // ? Send signal to update overworld hud
          utils.emitEvent("PlayerStateUpdated");
        }

        // ? Battle has been completed, go back to overworld map
        this.onComplete(this.element, winner === "player");
      },
    });

    this.turnCycle.init();
  }
}
