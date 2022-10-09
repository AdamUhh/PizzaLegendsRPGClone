class PlayerState {
  // ? keeps track of player stats and battle lineup
  constructor() {
    // ? these are essentially your "pokemon", in this case, your "pizzas"
    this.pizzas = {
      p1: {
        pizzaId: "s001",
        hp: 30,
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
    };

    // ? your current lineup of pizzas when you battle an enemy
    this.lineup = ["p1", "p2"];

    // ? items you have in your inventory when in battle
    this.items = [
      { actionId: "item_recoverStatus", instanceId: "item1" },
      { actionId: "item_recoverStatus", instanceId: "item2" },
      { actionId: "item_recoverStatus", instanceId: "item3" },
    ];
  }

  update() {}
}
window.playerState = new PlayerState();
