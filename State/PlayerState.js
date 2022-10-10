class PlayerState {
  // ? keeps track of player stats and battle lineup
  constructor() {
    // ? these are essentially your "pokemon", in this case, your "pizzas"
    this.pizzas = {
      p1: {
        pizzaId: "s001",
        hp: 1,
        maxHp: 50,
        xp: 90,
        maxXp: 100,
        level: 1,
        status: null,
      },
      p2: {
        pizzaId: "v001",
        hp: 50,
        maxHp: 50,
        xp: 75,
        maxXp: 100,
        level: 1,
        status: null,
      },
      p3: {
        pizzaId: "f001",
        hp: 50,
        maxHp: 50,
        xp: 75,
        maxXp: 100,
        level: 1,
        status: null,
      },
    };

    // ? your current lineup of pizzas when you battle an enemy
    this.lineup = ["p1"];

    // ? items you have in your inventory when in battle
    this.items = [
      { actionId: "item_recoverStatus", instanceId: "item1" },
      { actionId: "item_recoverStatus", instanceId: "item2" },
      { actionId: "item_recoverStatus", instanceId: "item3" },
    ];
    this.storyFlags = {};
  }

  addPizza(pizzaId) {
    const newId = `p${Date.now()}` + Math.floor(Math.random() * 9999);
    this.pizzas[newId] = {
      pizzaId,
      hp: 50,
      maxHp: 50,
      xp: 75,
      maxXp: 100,
      level: 1,
      status: null,
    };
    if (this.lineup.length < 3) {
      this.lineup.push(newId);
    }
    utils.emitEvent("LineupChanged");
  }

  swapLineup(oldId, incomingId) {
    // ? get the index of the old pizza location in lineup
    const oldIndex = this.lineup.indexOf(oldId);
    // ? replace it with the new pizza (id)
    this.lineup[oldIndex] = incomingId;
    utils.emitEvent("LineupChanged");
  }

  moveToFront(futureFrontId) {
    // ? remove pizza from lineup
    this.lineup = this.lineup.filter((id) => id !== futureFrontId);
    // ? add the pizza again, but this time to the front of the lineup
    this.lineup.unshift(futureFrontId);
    utils.emitEvent("LineupChanged");
  }

  update() {}
}
window.playerState = new PlayerState();
