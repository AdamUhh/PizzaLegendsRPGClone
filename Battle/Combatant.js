class Combatant {
  // ? will basically control and display
  // ? the pizzas hud on the screen
  constructor(config, battle) {
    this.battle = battle;
    // ? for each key in config
    // ? example of the object is given inside Battle.js (addCombatant())
    Object.keys(config).forEach((key) => {
      // ? create a (class) variable
      this[key] = config[key];
    });
    // ? if no hp is defined, use maxHp
    this.hp = typeof this.hp === "undefined" ? this.maxHp : this.hp;
  }

  get hpPercent() {
    const percent = (this.hp / this.maxHp) * 100;
    return percent > 0 ? percent : 0; // ? always return positive
  }
  get xpPercent() {
    return (this.xp / this.maxXp) * 100;
  }
  get isActive() {
    return this.battle?.activeCombatants[this.team] === this.id;
  }
  get givesXp() {
    // ? returns a value to be used later in TurnCycle.js
    // ? when the enemy dies, a new event called giveXp (not givesXp)
    // ? is used inside TurnCycle.js -> BattleEvent.js,
    // ? using this value (from givesXp)

    // ? note: this is not a very good leveling system ;p
    // ? if level: 1, returns 20
    // ? if level: 2, returns 40
    return this.level * 20;

    // ? a different leveling system could be where it takes into account
    // ? the enemy level, player level, and does some calculations
  }

  createElement() {
    this.hudElement = document.createElement("div");
    this.hudElement.classList.add("Combatant");
    this.hudElement.setAttribute("data-combatant", this.id);
    this.hudElement.setAttribute("data-team", this.team);

    this.hudElement.innerHTML = `
    <p class="Combatant_name">${this.name}</p>
    <p class="Combatant_level"></p>
    <div class="Combatant_character_crop">
      <img class="Combatant_character" alt="${this.name}" src="${this.src}" />
    </div>
    <img class="Combatant_type" src="${this.icon}" alt="${this.type}" />
    <svg viewBox="0 0 26 3" class="Combatant_life-container">
      <rect x=0 y=0 width="0%" height=1 fill="#82ff71" />
      <rect x=0 y=1 width="0%" height=2 fill="#3ef126" />
    </svg>
    <svg viewBox="0 0 26 2" class="Combatant_xp-container">
      <rect x=0 y=0 width="0%" height=1 fill="#ffd76a" />
      <rect x=0 y=1 width="0%" height=1 fill="#ffc934" />
    </svg>
    <p class="Combatant_status"></p>
  `;
    this.pizzaElement = document.createElement("img");
    this.pizzaElement.classList.add("Pizza");
    this.pizzaElement.setAttribute("src", this.src);
    this.pizzaElement.setAttribute("alt", this.name);
    this.pizzaElement.setAttribute("data-team", this.team);

    this.hpFills = this.hudElement.querySelectorAll(".Combatant_life-container > rect");
    this.xpFills = this.hudElement.querySelectorAll(".Combatant_xp-container > rect");
  }

  update(changes = {}) {
    // ? Update anything incoming
    Object.keys(changes).forEach((key) => {
      this[key] = changes[key];
    });

    // ? Update active flag to show the correct pizza & hud
    this.hudElement.setAttribute("data-active", this.isActive);
    this.pizzaElement.setAttribute("data-active", this.isActive);

    // ? Update HP & XP percent fills
    this.hpFills.forEach((rect) => (rect.style.width = `${this.hpPercent}%`));
    this.xpFills.forEach((rect) => (rect.style.width = `${this.xpPercent}%`));

    // ? Update level on screen
    this.hudElement.querySelector(".Combatant_level").innerText = this.level;

    // ? Update status
    const statusElement = this.hudElement.querySelector(".Combatant_status");
    if (this.status) {
      statusElement.innerText = this.status.type;
      statusElement.style.display = "block";
    } else {
      statusElement.innerText = "";
      statusElement.style.display = "none";
    }
  }

  getReplacedEvents(originalEvents) {
    // ? this overrides the action that the player took
    // ? so for "clumsy", this will prevent the user from attacking
    if (this.status?.type === "clumsy" && utils.randomFromArray([true, false, false, false])) {
      return [{ type: "textMessage", text: `${this.name} flops over! Attack Failed!` }];
    }
    return originalEvents;
  }

  getPostEvents() {
    // ? Do events after the original turn submission
    // ? so if the player used "saucy" attack, it will add the events below
    if (this.status?.type === "saucy") {
      return [
        {
          type: "textMessage",
          text: "Feelin' saucy! Gain +5 health",
        },
        {
          type: "stateChange",
          recover: 5,
          onCaster: true,
        },
      ];
    }

    return [];
  }

  decrementStatus() {
    if (this.status?.expiresIn > 0) {
      this.status.expiresIn -= 1;
      if (this.status.expiresIn === 0) {
        this.update({ status: null });
        return {
          type: "textMessage",
          text: "Status expired!",
        };
      }
    }

    return null;
  }

  init(container) {
    this.createElement();
    container.appendChild(this.hudElement);
    container.appendChild(this.pizzaElement);

    this.update();
  }
}
